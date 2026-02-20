/**
 * Weekly Exam Data Updater
 *
 * Pipeline:
 *   For each active exam → Tavily web search → Groq LLM diff check → patch JSON if changed
 *   Then one extra pass to detect brand-new exams (flagged for manual review, never auto-added)
 *
 * Free APIs used:
 *   - Groq (Llama-3.3-70b-versatile) : 30 RPM / 14 400 req/day — free tier
 *   - Tavily Search API               : 1 000 searches/month    — free tier
 *
 * Usage:
 *   GROQ_API_KEY=xxx TAVILY_API_KEY=yyy node scripts/update-exams.mjs
 */

import fs   from 'fs';
import path from 'path';

const GROQ_API_KEY   = process.env.GROQ_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const DATA_PATH      = path.join(process.cwd(), 'data', 'exams-data.json');
const LOG_PATH       = path.join(process.cwd(), 'scripts', '.last-update-log.json');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Trusted domains for entrance-exam information */
const TRUSTED_DOMAINS = [
  'nta.ac.in', 'neet.nta.nic.in', 'jeemain.nta.nic.in',
  'careers360.com', 'shiksha.com', 'collegedunia.com',
  'admissions.bits-pilani.ac.in', 'viteee.vit.ac.in',
  'consortiumofnlus.ac.in', 'iimcat.ac.in', 'xatonline.in',
  'nift.ac.in', 'nid.edu', 'uceed.iitb.ac.in',
];

/** Sleep to stay inside free-tier rate limits (500 ms between calls) */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─── Tavily Web Search ────────────────────────────────────────────────────────

async function webSearch(query) {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query,
      search_depth: 'basic',
      max_results: 5,
      include_domains: TRUSTED_DOMAINS,
    }),
  });

  if (!res.ok) {
    console.warn(`  ⚠ Tavily error ${res.status} for: ${query}`);
    return '';
  }

  const data = await res.json();
  return (data.results || [])
    .map(r => `[${r.url}]\n${r.title}\n${r.content}`)
    .join('\n\n---\n\n');
}

// ─── Groq LLM Call ───────────────────────────────────────────────────────────

async function callGroq(systemPrompt, userPrompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 600,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
    }),
  });

  if (!res.ok) {
    console.warn(`  ⚠ Groq error ${res.status}`);
    return null;
  }

  const data  = await res.json();
  const text  = data.choices?.[0]?.message?.content || '';
  const match = text.match(/\{[\s\S]*\}/);

  try   { return match ? JSON.parse(match[0]) : null; }
  catch { return null; }
}

// ─── System Prompts ──────────────────────────────────────────────────────────

const CHANGE_DETECTOR_SYSTEM = `
You are a data-integrity validator for an Indian entrance-exam guide website.

Your ONLY job is to compare current exam data with web-search snippets and
identify factual changes that are CONFIRMED by official sources or widely
reported by trusted education portals.

Rules:
- Only flag changes to these fields: registrationStart, registrationEnd,
  examDate, resultDate, applicationFee
- Ignore speculative or unconfirmed reports
- Ignore minor wording differences; only flag real date/fee changes
- If the search results do not clearly confirm a change → return changed: false
- Output ONLY valid JSON — no markdown, no explanation outside the JSON block

Output schema:
{
  "changed": true | false,
  "changes": { "<fieldName>": "<new value as string>" },
  "reason": "<one-line explanation with source domain>"
}
`.trim();

const NEW_EXAM_DETECTOR_SYSTEM = `
You are a researcher identifying NEW Indian entrance exams for 2026 that are
not in the provided existing list.

Rules:
- Only flag exams that have an OFFICIAL 2026 notification released
- Ignore state-level exams with very low reach (< 10 000 seats)
- Output ONLY valid JSON

Output schema:
{ "newExams": ["<exam short name>", ...] }
If none found: { "newExams": [] }
`.trim();

// ─── Per-Exam Change Check ────────────────────────────────────────────────────

async function checkExam(exam) {
  const query = `${exam.name} ${exam.fullName} 2026 exam date registration deadline fee update`;
  const searchResults = await webSearch(query);

  if (!searchResults) return null;

  const userPrompt = `
Exam: ${exam.name} (${exam.fullName})

CURRENT DATA:
  registrationStart : ${exam.registrationStart}
  registrationEnd   : ${exam.registrationEnd}
  examDate          : ${exam.examDate}
  resultDate        : ${exam.resultDate}
  applicationFee    : ${exam.applicationFee}

WEB SEARCH RESULTS:
${searchResults}
`.trim();

  return callGroq(CHANGE_DETECTOR_SYSTEM, userPrompt);
}

// ─── New Exam Detector ───────────────────────────────────────────────────────

async function checkForNewExams(existingNames) {
  const query = `new Indian entrance exams 2026 engineering law management design medical official notification`;
  const searchResults = await webSearch(query);

  if (!searchResults) return { newExams: [] };

  const userPrompt = `
EXISTING EXAMS IN OUR DATABASE:
${existingNames.join(', ')}

WEB SEARCH RESULTS:
${searchResults}

List any significant new exams NOT in the existing list above.
`.trim();

  const result = await callGroq(NEW_EXAM_DETECTOR_SYSTEM, userPrompt);
  return result || { newExams: [] };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!GROQ_API_KEY || !TAVILY_API_KEY) {
    console.error('❌ Missing env vars: GROQ_API_KEY and/or TAVILY_API_KEY');
    process.exit(1);
  }

  console.log('🔄 Weekly Exam Data Update — started\n');

  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

  // Skip discontinued / merged exams
  const activeExams = data.exams.filter(e =>
    e.examDate !== 'N/A (Discontinued)' &&
    e.examDate !== 'N/A (Merged with NEET from 2020)' &&
    !String(e.priority).includes('No longer conducted')
  );

  console.log(`Checking ${activeExams.length} active exams…\n`);

  const changeLog   = [];
  let   totalChanged = 0;

  for (const exam of activeExams) {
    process.stdout.write(`  ${exam.name.padEnd(20)} → `);

    const result = await checkExam(exam);
    await sleep(500); // stay inside free-tier rate limits

    if (result?.changed && result.changes && Object.keys(result.changes).length > 0) {
      console.log(`✅ changed  (${result.reason})`);

      const idx = data.exams.findIndex(e => e.id === exam.id);
      Object.assign(data.exams[idx], result.changes);

      changeLog.push({ exam: exam.name, changes: result.changes, reason: result.reason });
      totalChanged++;
    } else {
      console.log('— no change');
    }
  }

  // ── New exam scan ────────────────────────────────────────────────────────
  console.log('\n🔍 Scanning for brand-new exams…');
  const newExamResult = await checkForNewExams(data.exams.map(e => e.name));

  if (newExamResult.newExams?.length > 0) {
    console.log(`  ⚠ Potential new exams detected (needs manual review): ${newExamResult.newExams.join(', ')}`);
    changeLog.push({
      exam   : '⚠ NEW EXAMS DETECTED — manual review required',
      changes: { candidates: newExamResult.newExams },
      reason : 'Auto-detected via web search. Do NOT add without manual verification.',
    });
  } else {
    console.log('  — none found');
  }

  // ── Persist if anything changed ──────────────────────────────────────────
  const runLog = {
    date        : new Date().toISOString().split('T')[0],
    totalChanged,
    changeLog,
  };

  fs.writeFileSync(LOG_PATH, JSON.stringify(runLog, null, 2));

  if (totalChanged > 0) {
    data.lastUpdated = runLog.date;
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    console.log(`\n✅ ${totalChanged} exam(s) updated. JSON saved.`);
  } else {
    console.log('\n✅ Everything is up to date — no changes needed.');
  }

  // ── Print summary for PR body ────────────────────────────────────────────
  if (changeLog.length > 0) {
    console.log('\n── Change Summary ──────────────────────────────');
    changeLog.forEach(c => {
      console.log(`\n  📋 ${c.exam}`);
      console.log(`     Changes : ${JSON.stringify(c.changes)}`);
      console.log(`     Reason  : ${c.reason}`);
    });
  }
}

main().catch(err => {
  console.error('❌ Update script failed:', err.message);
  process.exit(1);
});
