/** Review-only updater. Searches propose changes; only a human can publish them. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validateDataIntegrity, selectExams, validateProposal, validateCandidates,
  requestJson, parseModelJson, buildExamPrompt, buildDiscoveryPrompt,
} from './lib/updater-core.mjs';

export * from './lib/updater-core.mjs';

export function createApiClient({ groqKey, tavilyKey, fetchImpl = fetch, sleep, timeoutMs, maxAttempts } = {}) {
  if (!groqKey || !tavilyKey) throw new Error('Missing GROQ_API_KEY or TAVILY_API_KEY');
  const request = (url, options) => requestJson(url, options, { fetchImpl, sleep, timeoutMs, maxAttempts });
  return {
    async search(query) {
      const data = await request('https://api.tavily.com/search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: tavilyKey, query, search_depth: 'basic', max_results: 5 }),
      });
      if (!Array.isArray(data.results)) throw new Error('Tavily response has no results array');
      return data.results.map((result) => {
        if (!result || typeof result.url !== 'string' || typeof result.content !== 'string') {
          throw new Error('Malformed Tavily search result');
        }
        return { url: result.url, title: String(result.title ?? ''), content: result.content };
      });
    },
    async complete(prompt) {
      const data = await request('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST', headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', temperature: 0, max_tokens: 2500,
          messages: [{ role: 'system', content: prompt.system }, { role: 'user', content: prompt.user }] }),
      });
      return parseModelJson(data.choices?.[0]?.message?.content);
    },
  };
}

/** All side effects are supplied by the caller. Input data is never modified. */
export async function collectReview(data, client, { now = new Date(), examName, limit = 20, discovery = true } = {}) {
  const validation = validateDataIntegrity(data);
  if (validation.length) throw new Error(`Dataset validation failed:\n${validation.join('\n')}`);
  const report = { schemaVersion: 1, generatedAt: now.toISOString(), mode: 'proposal-only',
    status: 'complete', publishedDataChanged: false, verification: 'unverified',
    note: 'Search snippets and model suggestions are not verified facts. Review each official source before manually editing published data.',
    selectedExamIds: [], checks: [], proposals: [], newExamCandidates: [], errors: [] };
  const selected = selectExams(data.exams, { now, limit, examName });
  report.selectedExamIds = selected.map((exam) => exam.id);
  for (const exam of selected) {
    try {
      const results = await client.search(buildExamPrompt(exam).query);
      if (!results.length) {
        report.checks.push({ examId: exam.id, status: 'insufficient-evidence', resultCount: 0 });
        continue;
      }
      const proposal = await client.complete(buildExamPrompt(exam, results));
      const accepted = validateProposal(exam, proposal, results);
      report.checks.push({ examId: exam.id, status: accepted.changes.length ? 'proposed' : 'no-proposal', resultCount: results.length });
      if (accepted.changes.length) report.proposals.push(accepted);
    } catch (error) {
      report.errors.push({ examId: exam.id, stage: 'exam-check', message: error.message });
      report.checks.push({ examId: exam.id, status: 'error' });
    }
  }
  if (discovery && !examName) {
    try {
      const year = now.getUTCFullYear();
      const results = await client.search(buildDiscoveryPrompt(data.exams, year).query);
      if (results.length) {
        const response = await client.complete(buildDiscoveryPrompt(data.exams, year, results));
        report.newExamCandidates = validateCandidates(response, results, data.exams, year);
      }
      report.discovery = { status: results.length ? 'checked' : 'insufficient-evidence', resultCount: results.length };
    } catch (error) {
      report.errors.push({ stage: 'discovery', message: error.message });
      report.discovery = { status: 'error' };
    }
  }
  if (report.errors.length || report.checks.some((check) => check.status === 'insufficient-evidence') || report.discovery?.status === 'insufficient-evidence') report.status = 'incomplete';
  return report;
}

export async function writeReport(reportPath, report) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  const tempPath = `${reportPath}.${process.pid}.tmp`;
  try {
    await fs.writeFile(tempPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    await fs.rename(tempPath, reportPath);
  } finally { await fs.rm(tempPath, { force: true }); }
}

export function parseArgs(args) {
  const result = { dryRun: false, validateOnly: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') result.dryRun = true;
    else if (args[i] === '--validate-only') result.validateOnly = true;
    else if (['--exam', '--output'].includes(args[i])) {
      const flag = args[i];
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`${flag} requires a value`);
      result[flag === '--exam' ? 'examName' : 'output'] = args[++i];
    } else throw new Error(`Unknown argument: ${args[i]}`);
  }
  return result;
}

export async function main(args = process.argv.slice(2), {
  cwd = process.cwd(), env = process.env, client, now = new Date(), log = console.log, write = writeReport,
} = {}) {
  const options = parseArgs(args);
  const reportPath = path.resolve(cwd, options.output ?? 'scripts/.last-update-review.json');
  const allowedReport = path.resolve(cwd, 'scripts/.last-update-review.json');
  // A configurable destination must never turn review output into a data/source write.
  if (reportPath.toLowerCase() !== allowedReport.toLowerCase()) throw new Error('--output must be scripts/.last-update-review.json');
  let report;
  try {
    const data = JSON.parse(await fs.readFile(path.join(cwd, 'data/exams-data.json'), 'utf8'));
    const errors = validateDataIntegrity(data);
    if (errors.length) throw new Error(`Dataset validation failed:\n${errors.join('\n')}`);
    if (options.validateOnly) { log(`Validated ${data.exams.length} exam records; this does not verify their factual accuracy.`); return 0; }
    report = await collectReview(data, client ?? createApiClient({ groqKey: env.GROQ_API_KEY, tavilyKey: env.TAVILY_API_KEY }), { now, examName: options.examName });
  } catch (error) {
    report = { schemaVersion: 1, generatedAt: now.toISOString(), mode: 'proposal-only', status: 'failed',
      publishedDataChanged: false, proposals: [], newExamCandidates: [], errors: [{ stage: 'setup', message: error.message }] };
  }
  if (!options.dryRun && !options.validateOnly) await write(reportPath, report);
  log(JSON.stringify(report, null, 2));
  log(options.dryRun ? 'Dry run: no files written.' : 'Published data and verification metadata were not changed.');
  return report.status === 'complete' ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((code) => { process.exitCode = code; }).catch((error) => {
    console.error(error.message); process.exitCode = 1;
  });
}
