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
 *   GROQ_API_KEY=xxx TAVILY_API_KEY=yyy node scripts/update-exams.mjs --dry-run
 *   GROQ_API_KEY=xxx TAVILY_API_KEY=yyy node scripts/update-exams.mjs --exam BITSAT
 */

import fs   from 'fs';
import path from 'path';

const GROQ_API_KEY   = process.env.GROQ_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const DATA_PATH      = path.join(process.cwd(), 'data', 'exams-data.json');
const LOG_PATH       = path.join(process.cwd(), 'scripts', '.last-update-log.json');

// ─── CLI flags ────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');           // no file writes
const EXAM_FILTER = (() => {                           // --exam BITSAT
  const idx = args.indexOf('--exam');
  return idx !== -1 ? args[idx + 1]?.toUpperCase() : null;
})();

// ─── Daily run config ─────────────────────────────────────────────────────────
const DEADLINE_WINDOW_DAYS = 60;  // check exams with any deadline within 60 days
const MAX_EXAMS_PER_RUN    = 20;  // hard cap to stay inside Tavily free tier

// ─── Safety: only these fields may ever be patched by the LLM ────────────────
const ALLOWED_CHANGE_FIELDS = new Set([
  'registrationStart',
  'registrationEnd',
  'examDate',
  'resultDate',
  'applicationFee',
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/** Fetch with a hard timeout — prevents hanging in CI */
async function fetchWithTimeout(url, options, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Safely extract the FIRST balanced JSON object from an LLM response.
 * Handles cases where the model wraps output in markdown or adds prose.
 */
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
        catch { start = -1; } // malformed — keep searching
      }
    }
  }
  return null;
}

// ─── Deadline-aware exam prioritisation ──────────────────────────────────────

/**
 * From a list of active exams, return the ones with any date field that falls
 * within the next DEADLINE_WINDOW_DAYS days, sorted by nearest deadline first.
 * If none qualify (quiet period), fall back to all exams so we never skip a run.
 * Hard-caps at MAX_EXAMS_PER_RUN to protect Tavily free tier.
 */
function prioritiseByDeadline(exams) {
  const today  = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() + DEADLINE_WINDOW_DAYS);

  function nearestDate(exam) {
    const dateFields = [
      exam.registrationEnd,
      exam.examDate,
      exam.resultDate,
      exam.registrationStart,
    ];
    let nearest = Infinity;
    for (const raw of dateFields) {
      if (!raw || raw === 'N/A' || raw.startsWith('TBA')) continue;
      // Extract first ISO-ish date (YYYY-MM-DD) found in the string
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

  // Fallback: if nothing is upcoming (between exam cycles) check all
  const finalList = result.length > 0 ? result : exams;
  const capped    = finalList.slice(0, MAX_EXAMS_PER_RUN);

  const reason = result.length === 0
    ? `quiet period — checking all ${capped.length} exams`
    : `${result.length} exams with deadlines within ${DEADLINE_WINDOW_DAYS} days`;

  console.log(`📅 Smart filter: ${reason} (cap: ${MAX_EXAMS_PER_RUN})\n`);
  return capped;
}

// ─── Tavily Web Search ────────────────────────────────────────────────────────

async function webSearch(query) {
  let res;
  try {
    res = await fetchWithTimeout('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 5,
        // NOTE: include_domains not used — not supported on Tavily free tier.
        // Groq prompt + conservative rules handle source trustworthiness instead.
      }),
    });
  } catch (err) {
    console.warn(`  ⚠ Tavily timeout/network error: ${err.message}`);
    return '';
  }

  if (!res.ok) {
    console.warn(`  ⚠ Tavily HTTP ${res.status} for: ${query}`);
    return '';
  }

  const data = await res.json();
  if (!data.results?.length) return '';

  return data.results
    .map(r => `[${r.url}]\n${r.title}\n${r.content}`)
    .join('\n\n---\n\n');
}

// ─── Groq LLM Call ───────────────────────────────────────────────────────────

async function callGroq(systemPrompt, userPrompt) {
  let res;
  try {
    res = await fetchWithTimeout(
      'https://api.groq.com/openai/v1/chat/completions',
      {
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
      },
      20_000, // Groq is fast but give 20s for large prompts
    );
  } catch (err) {
    console.warn(`  ⚠ Groq timeout/network error: ${err.message}`);
    return null;
  }

  if (res.status === 429) {
    console.warn('  ⚠ Groq rate limit hit — waiting 60s…');
    await sleep(60_000);
    return callGroq(systemPrompt, userPrompt); // one retry
  }

  if (!res.ok) {
    console.warn(`  ⚠ Groq HTTP ${res.status}`);
    return null;
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  return extractJson(text); // ← uses balanced-brace extractor, not greedy regex
}

// ─── System Prompts ──────────────────────────────────────────────────────────

const CHANGE_DETECTOR_SYSTEM = `
You are a data-integrity validator for an Indian entrance-exam guide website.

Your ONLY job is to compare current exam data with web-search snippets and
identify factual changes CONFIRMED by official sources or widely reported by
trusted education portals (careers360, shiksha, nta.ac.in, official exam sites).

Allowed fields to change: registrationStart, registrationEnd, examDate, resultDate, applicationFee

Rules:
- Only flag changes to the allowed fields listed above — nothing else
- Ignore speculative or unconfirmed reports
- Ignore minor wording differences; only flag real date/fee changes
- If the search results do not clearly confirm a change → return changed: false
- Output ONLY valid JSON — no markdown fences, no text outside the JSON

Output schema (strict):
{
  "changed": true,
  "changes": { "registrationEnd": "2026-04-15" },
  "reason": "NTA extended NEET-UG registration to April 15 (source: nta.ac.in)"
}
OR if no change:
{
  "changed": false,
  "changes": {},
  "reason": "No confirmed changes found in search results"
}
`.trim();

const NEW_EXAM_DETECTOR_SYSTEM = `
You are a researcher identifying NEW Indian entrance exams for 2026 that are
not in the provided existing list.

Rules:
- Only flag exams with an OFFICIAL 2026 notification released
- Ignore state-level exams with very low reach (< 10 000 seats)
- Output ONLY valid JSON — no markdown, no explanation outside the JSON block

Output schema:
{ "newExams": ["EXAM_SHORT_NAME"] }
If none found:
{ "newExams": [] }
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

// ─── Safe JSON patch — whitelisted fields only ───────────────────────────────

function safeApplyChanges(examObj, changes) {
  const applied = {};
  const rejected = {};

  for (const [field, value] of Object.entries(changes)) {
    if (ALLOWED_CHANGE_FIELDS.has(field)) {
      applied[field] = value;
    } else {
      rejected[field] = value;
    }
  }

  if (Object.keys(rejected).length > 0) {
    console.warn(`  ⚠ Rejected non-whitelisted fields: ${JSON.stringify(rejected)}`);
  }

  if (Object.keys(applied).length > 0) {
    Object.assign(examObj, applied);
  }

  return applied;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!GROQ_API_KEY || !TAVILY_API_KEY) {
    console.error('❌ Missing env vars: GROQ_API_KEY and/or TAVILY_API_KEY');
    process.exit(1);
  }

  console.log(`🔄 Weekly Exam Data Update${DRY_RUN ? ' [DRY RUN — no files will be written]' : ''}${EXAM_FILTER ? ` [exam filter: ${EXAM_FILTER}]` : ''}\n`);

  const raw  = fs.readFileSync(DATA_PATH, 'utf-8');
  const data = JSON.parse(raw);

  // Step 1: strip discontinued / merged
  const allActive = data.exams.filter(e =>
    e.examDate !== 'N/A (Discontinued)' &&
    e.examDate !== 'N/A (Merged with NEET from 2020)' &&
    !String(e.priority).includes('No longer conducted')
  );

  // Step 2: --exam flag for targeted testing overrides everything
  let activeExams;
  if (EXAM_FILTER) {
    activeExams = allActive.filter(e => e.name.toUpperCase() === EXAM_FILTER);
    if (!activeExams.length) {
      console.error(`❌ No active exam found with name "${EXAM_FILTER}"`);
      process.exit(1);
    }
    console.log(`Checking 1 exam (filter: ${EXAM_FILTER})…\n`);
  } else {
    // Step 3: smart daily filter — nearest deadline first, capped
    activeExams = prioritiseByDeadline(allActive);
  }

  console.log(`Checking ${activeExams.length} exam(s)…\n`);

  const changeLog    = [];
  let   totalChanged = 0;

  for (const exam of activeExams) {
    process.stdout.write(`  ${exam.name.padEnd(20)} → `);

    const result = await checkExam(exam);
    await sleep(500); // stay inside free-tier RPM limits

    if (result?.changed && result.changes && Object.keys(result.changes).length > 0) {
      const idx     = data.exams.findIndex(e => e.id === exam.id);
      const applied = DRY_RUN
        ? (() => {
            // In dry-run: validate whitelist but don't mutate
            const ok = {}, bad = {};
            for (const [k, v] of Object.entries(result.changes)) {
              ALLOWED_CHANGE_FIELDS.has(k) ? (ok[k] = v) : (bad[k] = v);
            }
            if (Object.keys(bad).length) console.warn(`\n  ⚠ [DRY RUN] Would reject: ${JSON.stringify(bad)}`);
            return ok;
          })()
        : safeApplyChanges(data.exams[idx], result.changes);

      if (Object.keys(applied).length > 0) {
        console.log(`${DRY_RUN ? '[DRY RUN] would change' : '✅ changed'}  (${result.reason})`);
        changeLog.push({ exam: exam.name, changes: applied, reason: result.reason });
        if (!DRY_RUN) totalChanged++;
      } else {
        console.log('— rejected (non-whitelisted fields only)');
      }
    } else {
      console.log('— no change');
    }
  }

  // ── New exam scan (skip when targeting a single exam) ────────────────────
  if (!EXAM_FILTER) {
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
  }

  // ── Build run log ────────────────────────────────────────────────────────
  const runLog = {
    date        : new Date().toISOString().split('T')[0],
    dryRun      : DRY_RUN,
    examFilter  : EXAM_FILTER || null,
    totalChanged: DRY_RUN ? 0 : totalChanged,
    changeLog,
  };

  // ── Persist (skip in dry-run) ────────────────────────────────────────────
  if (!DRY_RUN) {
    fs.writeFileSync(LOG_PATH, JSON.stringify(runLog, null, 2));

    if (totalChanged > 0) {
      data.lastUpdated = runLog.date;
      // Write to temp file first, then rename — prevents corrupt JSON on crash
      const tmpPath = DATA_PATH + '.tmp';
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2));
      fs.renameSync(tmpPath, DATA_PATH);
      console.log(`\n✅ ${totalChanged} exam(s) updated. JSON saved.`);
    } else {
      console.log('\n✅ Everything is up to date — no changes needed.');
    }
  } else {
    console.log(`\n[DRY RUN] Would have changed ${changeLog.filter(c => !c.exam.includes('NEW')).length} exam(s). No files written.`);
  }

  // ── Print change summary ─────────────────────────────────────────────────
  if (changeLog.length > 0) {
    console.log('\n── Change Summary ──────────────────────────────');
    changeLog.forEach(c => {
      console.log(`\n  📋 ${c.exam}`);
      console.log(`     Changes : ${JSON.stringify(c.changes)}`);
      console.log(`     Reason  : ${c.reason}`);
    });
  }

  // Exit 0 always — let GitHub Actions check git diff to decide on PR
}

main().catch(err => {
  console.error('❌ Update script failed:', err.message);
  process.exit(1);
});
