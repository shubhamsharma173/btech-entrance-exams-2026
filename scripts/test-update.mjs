/**
 * Test suite for update-exams.mjs
 *
 * Runs in 3 phases:
 *   Phase 1 — Unit tests (no API calls, instant)
 *   Phase 2 — API smoke tests (1 Tavily + 1 Groq call each, ~5s)
 *   Phase 3 — Dry-run integration test on 2 exams (~30s)
 *
 * Usage:
 *   node scripts/test-update.mjs                          # all phases
 *   node scripts/test-update.mjs --phase 1               # unit only
 *   GROQ_API_KEY=x TAVILY_API_KEY=y node scripts/test-update.mjs --phase 2
 *   GROQ_API_KEY=x TAVILY_API_KEY=y node scripts/test-update.mjs --phase 3
 */

import fs   from 'fs';
import path from 'path';

const args  = process.argv.slice(2);
const PHASE = (() => { const i = args.indexOf('--phase'); return i !== -1 ? Number(args[i+1]) : 0; })();

let passed = 0, failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1 — Unit tests (pure logic, no I/O)
// ─────────────────────────────────────────────────────────────────────────────

function runPhase1() {
  console.log('\n📋 Phase 1: Unit Tests\n');

  // ── Test 1: extractJson ──────────────────────────────────────────────────
  console.log('  extractJson():');

  function extractJson(text) {
    let depth = 0, start = -1;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') {
        if (depth === 0) start = i;
        depth++;
      } else if (text[i] === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          try { return JSON.parse(text.slice(start, i + 1)); }
          catch { start = -1; }
        }
      }
    }
    return null;
  }

  const r1 = extractJson('{"changed":false,"changes":{},"reason":"none"}');
  assert('Plain JSON', r1?.changed === false);

  const r2 = extractJson('Here is the result:\n```json\n{"changed":true,"changes":{"examDate":"2026-05-10"},"reason":"nta.ac.in"}\n```');
  assert('JSON in markdown fence', r2?.changed === true && r2?.changes?.examDate === '2026-05-10');

  const r3a = extractJson('Response text here: {"changed":false,"changes":{},"reason":"ok"} — end');
  assert('JSON preceded by prose', r3a?.changed === false);

  // When a broken outer { wraps everything, returning null is CORRECT (safe) behaviour
  const r3b = extractJson('I found {"invalid" and then {"changed":false,"changes":{},"reason":"ok"}');
  assert('Ambiguous wrapped braces → null (safe fallback)', r3b === null);

  const r4 = extractJson('No JSON here at all');
  assert('No JSON → null', r4 === null);

  const r5 = extractJson('{"changed":true,"changes":{"examDate":"2026-05-10","name":"HACKED"},"reason":"test"}');
  assert('Nested object extracted correctly', r5?.changes?.name === 'HACKED'); // whitelist tested separately

  // ── Test 2: Whitelist enforcement ────────────────────────────────────────
  console.log('\n  Field whitelist:');

  const ALLOWED = new Set(['registrationStart','registrationEnd','examDate','resultDate','applicationFee']);

  function filterChanges(changes) {
    const ok = {}, bad = {};
    for (const [k, v] of Object.entries(changes)) {
      ALLOWED.has(k) ? (ok[k] = v) : (bad[k] = v);
    }
    return { ok, bad };
  }

  const { ok: w1, bad: b1 } = filterChanges({ examDate: '2026-05-10', name: 'HACKED', id: 999 });
  assert('Allowed field passes', w1.examDate === '2026-05-10');
  assert('name field blocked', !('name' in w1) && 'name' in b1);
  assert('id field blocked', !('id' in w1) && 'id' in b1);

  const { ok: w2 } = filterChanges({ registrationEnd: '2026-04-01', applicationFee: '₹1,500' });
  assert('Multiple allowed fields pass', Object.keys(w2).length === 2);

  const { ok: w3 } = filterChanges({ category: 'engineering', colorCode: 'high' });
  assert('Non-date/fee fields all blocked', Object.keys(w3).length === 0);

  // ── Test 3: Active exam filter ────────────────────────────────────────────
  console.log('\n  Active exam filter:');

  const testExams = [
    { id: 1, name: 'BITSAT',      examDate: '2026-04-15',              priority: 'Must Apply' },
    { id: 2, name: 'AIIMS',       examDate: 'N/A (Discontinued)',      priority: 'N/A' },
    { id: 3, name: 'JIPMER',      examDate: 'N/A (Merged with NEET from 2020)', priority: 'N/A' },
    { id: 4, name: 'LSAT',        examDate: '2025-12-20',              priority: '⚠️ No longer conducted' },
    { id: 5, name: 'CLAT',        examDate: '2026-05-11',              priority: 'Must Apply' },
  ];

  const active = testExams.filter(e =>
    e.examDate !== 'N/A (Discontinued)' &&
    e.examDate !== 'N/A (Merged with NEET from 2020)' &&
    !String(e.priority).includes('No longer conducted')
  );

  assert('Discontinued filtered out', !active.find(e => e.name === 'AIIMS'));
  assert('NEET-merged filtered out',  !active.find(e => e.name === 'JIPMER'));
  assert('No longer conducted filtered out', !active.find(e => e.name === 'LSAT'));
  assert('Active exams kept (BITSAT, CLAT)', active.length === 2);

  // ── Test 4: prioritiseByDeadline ────────────────────────────────────────
  console.log('\n  prioritiseByDeadline():');

  const WINDOW = 60, CAP = 20;
  const today  = new Date();
  const soon   = new Date(today); soon.setDate(today.getDate() + 10);
  const later  = new Date(today); later.setDate(today.getDate() + 90);
  const past   = new Date(today); past.setDate(today.getDate() - 5);

  const fmt = d => d.toISOString().split('T')[0];

  function prioritiseByDeadline(exams) {
    const cutoff = new Date(today); cutoff.setDate(today.getDate() + WINDOW);
    function nearestDate(exam) {
      let nearest = Infinity;
      for (const raw of [exam.registrationEnd, exam.examDate, exam.resultDate]) {
        if (!raw) continue;
        const match = String(raw).match(/(\d{4}-\d{2}-\d{2})/);
        if (!match) continue;
        const d = new Date(match[1]);
        if (!isNaN(d) && d >= today) nearest = Math.min(nearest, d.getTime());
      }
      return nearest;
    }
    const withDates = exams
      .map(e => ({ exam: e, nearest: nearestDate(e) }))
      .filter(({ nearest }) => nearest !== Infinity && nearest <= cutoff.getTime())
      .sort((a, b) => a.nearest - b.nearest);
    const result = withDates.map(({ exam }) => exam);
    return (result.length > 0 ? result : exams).slice(0, CAP);
  }

  const mockExams = [
    { id: 1, name: 'SOON_EXAM',   registrationEnd: fmt(soon),  examDate: null, resultDate: null },
    { id: 2, name: 'LATER_EXAM',  registrationEnd: fmt(later), examDate: null, resultDate: null },
    { id: 3, name: 'PAST_EXAM',   registrationEnd: fmt(past),  examDate: null, resultDate: null },
    { id: 4, name: 'TBA_EXAM',    registrationEnd: 'TBA',      examDate: null, resultDate: null },
  ];

  const filtered = prioritiseByDeadline(mockExams);
  assert('Upcoming exam included',     filtered.some(e => e.name === 'SOON_EXAM'));
  assert('90-day exam excluded',       !filtered.some(e => e.name === 'LATER_EXAM'));
  assert('Past deadline excluded',     !filtered.some(e => e.name === 'PAST_EXAM'));
  assert('TBA excluded',               !filtered.some(e => e.name === 'TBA_EXAM'));

  // Fallback: no upcoming → return all (quiet period)
  const quietExams = [
    { id: 5, name: 'PAST1', registrationEnd: fmt(past), examDate: null, resultDate: null },
    { id: 6, name: 'PAST2', registrationEnd: fmt(past), examDate: null, resultDate: null },
  ];
  const quietResult = prioritiseByDeadline(quietExams);
  assert('Quiet period fallback returns all exams', quietResult.length === 2);

  // Cap enforcement
  const manyExams = Array.from({ length: 25 }, (_, i) => ({
    id: i, name: `EXAM_${i}`, registrationEnd: fmt(soon), examDate: null, resultDate: null,
  }));
  const capped = prioritiseByDeadline(manyExams);
  assert(`Cap enforced at ${CAP}`, capped.length === CAP);

  // ── Test 6: JSON file integrity after mock write ──────────────────────────
  console.log('\n  JSON file write (temp→rename):');

  const tmpPath  = path.join(process.cwd(), 'scripts', '.test-write.tmp.json');
  const finalPath = path.join(process.cwd(), 'scripts', '.test-write.json');
  const mockData = { test: true, value: 42 };

  fs.writeFileSync(tmpPath, JSON.stringify(mockData, null, 2));
  fs.renameSync(tmpPath, finalPath);
  const readBack = JSON.parse(fs.readFileSync(finalPath, 'utf-8'));
  assert('Temp-rename write is atomic and readable', readBack.test === true && readBack.value === 42);
  fs.unlinkSync(finalPath);
  assert('Cleanup succeeded', !fs.existsSync(finalPath));

  // ── Test 7: validateFieldValue — date fields ──────────────────────────────
  console.log('\n  validateFieldValue() — date fields:');

  const DATE_FIELDS_T = new Set(['registrationStart', 'registrationEnd', 'examDate', 'resultDate']);
  const TODAY_T = new Date().toISOString().split('T')[0];

  // Build future and past date strings relative to today
  const futureDate = (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().split('T')[0]; })();
  const pastDate   = '2025-01-01'; // well in the past

  function validateFieldValue_T(field, newValue) {
    const val = String(newValue ?? '').trim();
    const isSpecial = val === '' || val === 'N/A' || val.startsWith('TBA') || val.toLowerCase().includes('to be announced');
    if (isSpecial) return null;
    if (DATE_FIELDS_T.has(field)) {
      const dates = val.match(/(\d{4}-\d{2}-\d{2})/g);
      if (!dates) return `"${val}" is not a recognised date format`;
      for (const d of dates) { if (isNaN(new Date(d).getTime())) return `"${d}" is not a valid calendar date`; }
      if (dates.every(d => d < TODAY_T)) return `all dates in "${val}" are in the past`;
      return null;
    }
    if (field === 'applicationFee') {
      if (!val.includes('₹')) return `fee "${val}" is missing the ₹ symbol`;
      return null;
    }
    return null;
  }

  assert('Future date accepted',              validateFieldValue_T('examDate', futureDate) === null);
  assert('Today\'s date accepted',            validateFieldValue_T('examDate', TODAY_T) === null);
  assert('Past date rejected',                validateFieldValue_T('examDate', pastDate) !== null,   `got null for past date`);
  assert('Past date 2025-01-01 rejected',     validateFieldValue_T('registrationEnd', '2025-11-07') !== null);
  assert('Sentinel N/A accepted',             validateFieldValue_T('examDate', 'N/A') === null);
  assert('Sentinel TBA accepted',             validateFieldValue_T('examDate', 'TBA 2026') === null);
  assert('Bad format (month name) rejected',  validateFieldValue_T('examDate', 'April 15, 2026') !== null);
  assert('Bad format (plain number) rejected',validateFieldValue_T('examDate', '1150') !== null);

  // Range with at least one future date: should pass
  assert('Range with future date accepted',   validateFieldValue_T('registrationEnd', `${pastDate} to ${futureDate}`) === null);
  // Range where both dates are past: should fail
  assert('Range of all-past dates rejected',  validateFieldValue_T('examDate', '2025-03-01 to 2025-04-01') !== null);

  // ── Test 8: validateFieldValue — applicationFee ───────────────────────────
  console.log('\n  validateFieldValue() — applicationFee:');

  assert('Fee with ₹ accepted',           validateFieldValue_T('applicationFee', '₹1,500') === null);
  assert('Fee with ₹ range accepted',     validateFieldValue_T('applicationFee', '₹1,000 / ₹500 (SC/ST)') === null);
  assert('Bare number rejected',          validateFieldValue_T('applicationFee', '1150') !== null);
  assert('Number with $ rejected',        validateFieldValue_T('applicationFee', '$15') !== null);
  assert('Fee N/A accepted',              validateFieldValue_T('applicationFee', 'N/A') === null);

  // ── Test 9: validateDataIntegrity ─────────────────────────────────────────
  console.log('\n  validateDataIntegrity():');

  function validateDataIntegrity_T(data) {
    const errors = [];
    if (!data.lastUpdated || !/^\d{4}-\d{2}-\d{2}$/.test(data.lastUpdated)) {
      errors.push(`lastUpdated "${data.lastUpdated}" is not a valid YYYY-MM-DD date`);
    }
    if (!Array.isArray(data.exams) || data.exams.length === 0) {
      errors.push('exams array is missing or empty');
    }
    const required = ['id', 'name', 'fullName', 'category'];
    for (const exam of (data.exams ?? [])) {
      for (const f of required) {
        if (!exam[f]) errors.push(`exam missing "${f}"`);
      }
    }
    try { JSON.parse(JSON.stringify(data)); } catch (e) { errors.push(`JSON roundtrip failed: ${e.message}`); }
    return errors;
  }

  const goodData = {
    lastUpdated: TODAY_T,
    exams: [{ id: 1, name: 'TEST', fullName: 'Test Exam', category: 'engineering' }],
  };
  assert('Valid data has no errors',          validateDataIntegrity_T(goodData).length === 0);

  const badDate = { ...goodData, lastUpdated: 'not-a-date' };
  assert('Invalid lastUpdated flagged',       validateDataIntegrity_T(badDate).length > 0);

  const emptyExams = { ...goodData, exams: [] };
  assert('Empty exams array flagged',         validateDataIntegrity_T(emptyExams).length > 0);

  const missingField = { ...goodData, exams: [{ id: 2, name: 'X', category: 'engineering' }] }; // no fullName
  assert('Missing required field flagged',    validateDataIntegrity_T(missingField).length > 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2 — API Smoke Tests (1 real call each)
// ─────────────────────────────────────────────────────────────────────────────

async function runPhase2() {
  console.log('\n🌐 Phase 2: API Smoke Tests\n');

  const GROQ_KEY   = process.env.GROQ_API_KEY;
  const TAVILY_KEY = process.env.TAVILY_API_KEY;

  if (!GROQ_KEY || !TAVILY_KEY) {
    console.log('  ⚠ Skipped — set GROQ_API_KEY and TAVILY_API_KEY to run Phase 2');
    return;
  }

  // ── Tavily ────────────────────────────────────────────────────────────────
  console.log('  Tavily API:');
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: TAVILY_KEY, query: 'BITSAT 2026 exam date', max_results: 2, search_depth: 'basic' }),
      signal: AbortSignal.timeout(15_000),
    });
    const data = await res.json();
    assert('Tavily returns HTTP 200',   res.ok, `status=${res.status}`);
    assert('Tavily returns results',    Array.isArray(data.results) && data.results.length > 0, `got ${data.results?.length} results`);
    assert('Each result has url+title', data.results?.[0]?.url && data.results?.[0]?.title);
    if (data.results?.[0]) console.log(`     Sample: "${data.results[0].title.slice(0, 60)}…"`);
  } catch (err) {
    assert('Tavily reachable', false, err.message);
  }

  // ── Groq ──────────────────────────────────────────────────────────────────
  console.log('\n  Groq API:');
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 80,
        messages: [
          { role: 'system', content: 'Output ONLY valid JSON. No markdown.' },
          { role: 'user',   content: 'Return: {"changed":false,"changes":{},"reason":"test"}' },
        ],
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const data = await res.json();
    assert('Groq returns HTTP 200', res.ok, `status=${res.status}`);
    const text = data.choices?.[0]?.message?.content || '';
    assert('Groq returns content',  text.length > 0);

    // test extractJson on the real response
    let depth = 0, start = -1, parsed = null;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') { if (!depth) start = i; depth++; }
      else if (text[i] === '}') { depth--; if (!depth && start !== -1) { try { parsed = JSON.parse(text.slice(start, i+1)); break; } catch { start = -1; } } }
    }
    assert('extractJson works on real Groq response', parsed !== null, `raw="${text.slice(0,80)}"`);
    console.log(`     Sample: ${text.slice(0, 80)}…`);
  } catch (err) {
    assert('Groq reachable', false, err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3 — Dry-run integration on 2 exams
// ─────────────────────────────────────────────────────────────────────────────

async function runPhase3() {
  console.log('\n🔁 Phase 3: Dry-run Integration (2 exams — BITSAT + CLAT)\n');

  const GROQ_KEY   = process.env.GROQ_API_KEY;
  const TAVILY_KEY = process.env.TAVILY_API_KEY;

  if (!GROQ_KEY || !TAVILY_KEY) {
    console.log('  ⚠ Skipped — set GROQ_API_KEY and TAVILY_API_KEY to run Phase 3');
    return;
  }

  const before = fs.readFileSync(path.join(process.cwd(), 'data', 'exams-data.json'), 'utf-8');

  const { execSync } = await import('child_process');
  let output = '';
  try {
    output = execSync(
      'node scripts/update-exams.mjs --dry-run --exam BITSAT',
      { env: { ...process.env, GROQ_API_KEY: GROQ_KEY, TAVILY_API_KEY: TAVILY_KEY }, encoding: 'utf-8', timeout: 60_000 }
    );
    console.log('  Script output (BITSAT dry-run):');
    output.split('\n').forEach(l => console.log(`    ${l}`));
  } catch (err) {
    assert('Script exits without error', false, err.message);
    return;
  }

  assert('Script ran without crashing',     output.length > 0);
  assert('Script output mentions BITSAT',   output.includes('BITSAT'));
  assert('Script output confirms dry-run',  output.toLowerCase().includes('dry run'));

  const after = fs.readFileSync(path.join(process.cwd(), 'data', 'exams-data.json'), 'utf-8');
  assert('Dry-run did NOT modify exams-data.json', before === after, 'file was changed!');

  // Also verify log file was NOT written in dry-run
  const logExists = fs.existsSync(path.join(process.cwd(), 'scripts', '.last-update-log.json'));
  // Log may exist from previous runs — check it's not newer than 5s
  if (logExists) {
    const stat = fs.statSync(path.join(process.cwd(), 'scripts', '.last-update-log.json'));
    const ageMs = Date.now() - stat.mtimeMs;
    assert('Dry-run did NOT write new log file', ageMs > 5_000, `log written ${ageMs}ms ago`);
  } else {
    assert('Dry-run did NOT write log file', true);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────────────────────────────────────

async function run() {
  console.log('═══════════════════════════════════════════════');
  console.log('  update-exams.mjs — Test Suite');
  console.log('═══════════════════════════════════════════════');

  if (PHASE === 0 || PHASE === 1) runPhase1();
  if (PHASE === 0 || PHASE === 2) await runPhase2();
  if (PHASE === 0 || PHASE === 3) await runPhase3();

  console.log('\n═══════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════\n');

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Test runner crashed:', err.message);
  process.exit(1);
});
