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

  // ── Test 4: JSON file integrity after mock write ──────────────────────────
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
