import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  isCalendarDate, extractDates, validateDataIntegrity, selectExams, safeUrl,
  parseModelJson, validateProposal, validateCandidates, buildExamPrompt, requestJson,
  collectReview, createApiClient, main, parseArgs,
} from '../scripts/update-exams.mjs';

const exam = (id = 1) => ({ id, name: `EXAM ${id}`, fullName: 'Example Admission Test', category: 'engineering',
  status: 'active', cycleYear: 2026, conductedBy: 'Example University', tier: 'State', priority: 'Consider',
  registrationStart: '2025-12-01', registrationEnd: '2026-03-01', examDate: '2026-04-01', resultDate: '2026-05-01',
  applicationFee: '₹1,000', applyLink: 'https://exam.example.edu/apply', officialWebsite: 'https://exam.example.edu/',
  colleges: ['Example College'], totalSeats: '100', eligibility: { education: 'Class 12', minimumMarks: '50%', ageLimit: 'None' },
  examPattern: { mode: 'CBT', duration: '2 hours', sections: 'Math', totalQuestions: 100, totalMarks: 100, markingScheme: '+1' },
  difficultyLevel: 'Moderate', preparationTip: 'Study', avgPlacement: 'Unknown', highestPlacement: 'Unknown', approxFees: 'Unknown',
  location: 'India', topBranches: ['CSE'], keyHighlights: ['Example'], colorCode: 'medium', sources: ['https://exam.example.edu/'],
  verification: { status: 'unverified', reviewedAt: '2026-10-23', fields: {}, note: 'Fixture' } });
const dataset = (exams = [exam()]) => ({ lastUpdated: '2026-02-01', totalExams: exams.length, exams,
  note: 'Test fixture', generalTips: [], dataSourcesCredits: [], estimatedBudget: { allExamFees: 'Unknown', recommendedExams: 'Unknown', travelCosts: 'Unknown' } });
const source = { url: 'https://exam.example.edu/notice', title: 'Official notice', content: 'Registration closes on 2026-03-10. This is the official notification.' };
const change = (overrides = {}) => ({ field: 'registrationEnd', value: '2026-03-10', sourceUrl: source.url, quote: 'Registration closes on 2026-03-10.', ...overrides });
const response = (changes = [change()]) => ({ changes, reason: 'Official notice has a different date.' });
const now = new Date('2026-10-23T12:00:00Z');
const ok = (value) => ({ ok: true, status: 200, json: async () => value });

test('core: real calendar dates reject normalized overflow', () => {
  assert.equal(isCalendarDate('2026-02-30'), false);
  assert.equal(isCalendarDate('2024-02-29'), true);
  assert.equal(isCalendarDate('2026-02-29'), false);
  assert.equal(isCalendarDate('2026-1-01'), false);
});

test('core: all sessions and shorthand endpoints survive extraction', () => {
  assert.deepEqual(extractDates('2026-04-16 to 04-20 (P1), 2026-06-04 to 06-08 (P2)'), ['2026-04-16', '2026-04-20', '2026-06-04', '2026-06-08']);
  assert.throws(() => extractDates('2026-02-30'), /calendar/);
  assert.throws(() => extractDates('04-20'), /preceding year/);
});

test('core: structural validation accepts historic cycles and explicit review status', () => {
  assert.deepEqual(validateDataIntegrity(dataset()), []);
  assert.deepEqual(validateDataIntegrity(dataset([{ ...exam(), examDate: '2026-04-01, 04-02, 04-03' }])), []);
  const reviewed = exam();
  reviewed.status = 'needs-review';
  reviewed.registrationEnd = '2026-06-01';
  assert.deepEqual(validateDataIntegrity(dataset([reviewed])), []);
});

test('core: schema checks duplicates, status, nested types, URLs and calendar values', () => {
  assert.match(validateDataIntegrity(dataset([exam(), exam()])).join(';'), /unique/);
  for (const patch of [{ status: undefined }, { officialWebsite: 'javascript:alert(1)' }, { registrationEnd: '2026-02-30' }, { examPattern: null }, { cycleYear: '2026' }]) {
    assert.ok(validateDataIntegrity(dataset([{ ...exam(), ...patch }])).length, JSON.stringify(patch));
  }
  assert.match(validateDataIntegrity({ ...dataset(), totalExams: 2 }).join(';'), /totalExams/);
});

test('core: unknown numeric values and valid nested provenance are supported', () => {
  const item = exam();
  item.examPattern.totalQuestions = null;
  item.examPattern.totalMarks = null;
  item.verification.fields['examPattern.totalQuestions'] = { checkedAt: '2026-10-23', sourceUrl: source.url, note: 'Not published' };
  assert.deepEqual(validateDataIntegrity(dataset([item])), []);
  item.verification.fields['unknown.value'] = { checkedAt: '2026-10-23', sourceUrl: source.url };
  assert.match(validateDataIntegrity(dataset([item])).join(';'), /unknown.value/);
});

test('core: chronology rejects contradictory active dates', () => {
  assert.match(validateDataIntegrity(dataset([{ ...exam(), registrationEnd: '2026-06-01' }])).join(';'), /after/);
  assert.match(validateDataIntegrity(dataset([{ ...exam(), resultDate: '2026-03-01' }])).join(';'), /after/);
  const multi = { ...exam(), registrationEnd: '2026-04-15 (P1), 2026-06-01 (P2)', examDate: '2026-04-10 (P1), 2026-06-10 (P2)' };
  assert.match(validateDataIntegrity(dataset([multi])).join(';'), /phase1 registration ends/);
  assert.match(validateDataIntegrity(dataset([{ ...exam(), examDate: '2026-04-20 to 2026-04-10' }])).join(';'), /reversed/);
  assert.match(validateDataIntegrity(dataset([{ ...exam(), examDate: '2026-04-01, 2026-06-01', resultDate: '2026-03-01' }])).join(';'), /All result dates/);
});

test('core: only public HTTPS source URLs are accepted', () => {
  for (const url of ['http://example.edu', 'https://user:pass@example.edu', 'https://127.0.0.1', 'https://10.0.0.1', 'https://x.local', 'javascript:alert(1)']) assert.equal(safeUrl(url), false, url);
  assert.equal(safeUrl(source.url), true);
});

test('core: deterministic daily rotation covers every active record without starvation', () => {
  const exams = Array.from({ length: 73 }, (_, i) => exam(i + 1));
  const ids = new Set();
  for (let day = 0; day < 4; day++) {
    const date = new Date(now.getTime() + day * 86400000);
    const selection = selectExams(exams, { now: date });
    assert.equal(selection.length, 20);
    assert.equal(new Set(selection.map((item) => item.id)).size, 20);
    selection.forEach((item) => ids.add(item.id));
    assert.deepEqual(selection, selectExams([...exams].reverse(), { now: date }));
  }
  assert.equal(ids.size, 73);
});

test('core: selection never infers active status and targeting cannot bypass it', () => {
  const records = [exam(1), { ...exam(2), status: 'merged' }, { ...exam(3), status: undefined }, { ...exam(4), status: 'needs-review' }];
  assert.deepEqual(selectExams(records, { now }).map((item) => item.id), [1]);
  assert.throws(() => selectExams(records, { examName: 'EXAM 2' }), /active/);
});

test('core: JSON parser handles quoted braces and rejects prose/malformed shapes', () => {
  assert.deepEqual(parseModelJson('{"reason":"literal } and {"}'), { reason: 'literal } and {' });
  assert.deepEqual(parseModelJson('```json\n{"changes":[]}\n```'), { changes: [] });
  for (const value of ['prefix {"changes":[]}', '{broken}', '[]', '', null]) assert.throws(() => parseModelJson(value));
});

test('core: prompts use each record cycle and preserve all session text', () => {
  const item = { ...exam(), cycleYear: 2028, examDate: '2028-04-01 (P1), 2028-06-01 (P2)' };
  const prompt = buildExamPrompt(item, [source]);
  assert.match(prompt.query, /2028/);
  assert.match(prompt.user, /2028-06-01/);
  assert.match(prompt.system, /unverified suggestions/);
});

test('core: official evidence produces an unverified proposal without changing data', () => {
  const item = exam();
  const before = structuredClone(item);
  const result = validateProposal(item, response(), [source]);
  assert.equal(result.changes[0].previousValue, '2026-03-01');
  assert.equal(result.reviewStatus, 'unverified');
  assert.deepEqual(item, before);
});

test('core: model cannot change status, verification or other noneditable fields', () => {
  for (const field of ['status', 'verification', 'id', 'officialWebsite', 'name', '__proto__']) assert.throws(() => validateProposal(exam(), response([change({ field })]), [source]), /Forbidden/);
  assert.throws(() => validateProposal(exam(), { ...response(), verified: true }, [source]), /schema/);
  assert.throws(() => validateProposal(exam(), response([change(), change()]), [source]), /duplicate/);
});

test('core: official URL must appear in actual search results with exact quote', () => {
  for (const patch of [{ sourceUrl: 'https://exam.example.edu.evil.com/notice' }, { sourceUrl: 'https://news.example.com/notice' }, { sourceUrl: 'https://exam.example.edu/imaginary' }, { quote: 'Invented unsupported statement' }]) {
    assert.throws(() => validateProposal(exam(), response([change(patch)]), [source]), /official-source/);
  }
});

test('core: proposals cannot erase dates or lose multi-session endpoints', () => {
  const item = { ...exam(), examDate: '2026-04-01 to 04-02 (P1), 2026-06-01 (P2)' };
  for (const value of ['', 'TBA', '2026-04-02', '2026-04-02, 06-01']) {
    assert.throws(() => validateProposal(item, response([change({ field: 'examDate', value })]), [source]));
  }
});

test('core: impossible, wrong-cycle and contradictory proposals are rejected', () => {
  for (const value of ['2026-02-30', '2029-03-01', '2026-06-01', '2026-03-10 and 2026-2-30']) assert.throws(() => validateProposal(exam(), response([change({ value })]), [source]));
});

test('core: new candidates require evidence and cannot duplicate existing names', () => {
  const candidate = { name: 'NEW TEST', officialWebsite: 'https://exam.example.edu/', sourceUrl: source.url, quote: source.content, cycleYear: 2026 };
  assert.equal(validateCandidates({ newExams: [candidate] }, [source], [exam()], 2026)[0].reviewStatus, 'unverified');
  assert.throws(() => validateCandidates({ newExams: [{ ...candidate, name: 'EXAM 1' }] }, [source], [exam()], 2026));
  assert.throws(() => validateCandidates({ newExams: [candidate] }, [], [], 2026));
});

test('transport: persistent 429 is bounded to three attempts and capped delays', async () => {
  let calls = 0; const delays = [];
  await assert.rejects(requestJson('https://api.example.edu', {}, { fetchImpl: async () => { calls++; return { ok: false, status: 429, headers: { get: () => '900' } }; }, sleep: async (ms) => delays.push(ms) }), /429/);
  assert.equal(calls, 3); assert.deepEqual(delays, [5000, 5000]);
});

test('transport: retryable server failures recover; auth failure is immediate', async () => {
  let calls = 0;
  const result = await requestJson('https://api.example.edu', {}, { fetchImpl: async () => ++calls === 1 ? { ok: false, status: 503 } : ok({ result: true }), sleep: async () => {} });
  assert.deepEqual(result, { result: true }); assert.equal(calls, 2);
  calls = 0;
  await assert.rejects(requestJson('https://api.example.edu', {}, { fetchImpl: async () => { calls++; return { ok: false, status: 401 }; } }), /401/);
  assert.equal(calls, 1);
});

test('transport: hanging fetch and body parsing have hard timeouts', async () => {
  for (const fetchImpl of [async () => new Promise(() => {}), async () => ({ ok: true, status: 200, json: () => new Promise(() => {}) })]) {
    await assert.rejects(requestJson('https://api.example.edu', {}, { fetchImpl, timeoutMs: 5, maxAttempts: 1 }), /failed after 1/);
  }
});

test('transport: malformed API JSON and model schema do not become no-change', async () => {
  let calls = 0;
  const client = createApiClient({ groqKey: 'test', tavilyKey: 'test', fetchImpl: async () => { calls++; return ok({ results: {} }); } });
  await assert.rejects(client.search('test'), /results array/); assert.equal(calls, 1);
  const model = createApiClient({ groqKey: 'test', tavilyKey: 'test', fetchImpl: async () => ok({ choices: [{ message: { content: '{bad}' } }] }) });
  await assert.rejects(model.complete({ system: '', user: '' }), /valid JSON/);
  calls = 0;
  await assert.rejects(requestJson('https://api.example.edu', {}, { fetchImpl: async () => { calls++; return { ok: true, status: 200, json: async () => { throw new Error('Unexpected JSON'); } }; }, sleep: async () => {} }), /failed after 3/);
  assert.equal(calls, 3);
});

test('integration: partial API failures preserve successful proposals and fail the report', async () => {
  let searches = 0;
  const input = dataset([exam(), exam(2)]); const before = structuredClone(input);
  const report = await collectReview(input, { search: async () => { if (++searches === 2) throw new Error('Search service failed'); return [source]; }, complete: async () => response() }, { now, discovery: false });
  assert.equal(report.status, 'incomplete'); assert.equal(report.errors.length, 1); assert.equal(report.proposals.length, 1);
  assert.ok(report.checks.some((check) => check.status === 'error')); assert.deepEqual(input, before);
});

test('integration: discovery-only candidates surface without a published dataset diff', async () => {
  let calls = 0;
  const report = await collectReview(dataset(), { search: async () => [source], complete: async () => ++calls === 1 ? response([]) : { newExams: [{ name: 'NEW TEST', officialWebsite: 'https://exam.example.edu/', sourceUrl: source.url, quote: source.content, cycleYear: 2026 }] } }, { now });
  assert.equal(report.proposals.length, 0); assert.equal(report.newExamCandidates.length, 1); assert.equal(report.publishedDataChanged, false);
});

test('integration: no search results are insufficient evidence, never verified freshness', async () => {
  const report = await collectReview(dataset(), { search: async () => [], complete: async () => { throw new Error('Should not call model'); } }, { now });
  assert.equal(report.checks[0].status, 'insufficient-evidence'); assert.equal(report.verification, 'unverified'); assert.equal(report.status, 'incomplete');
});

async function tempDataset(run) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'exam-updater-test-'));
  try {
    await fs.mkdir(path.join(dir, 'data')); await fs.mkdir(path.join(dir, 'scripts'));
    await fs.writeFile(path.join(dir, 'data/exams-data.json'), JSON.stringify(dataset()));
    await fs.writeFile(path.join(dir, 'scripts/.last-update-log.json'), 'old log');
    await fs.writeFile(path.join(dir, 'scripts/.last-update-review.json'), 'old review');
    return await run(dir);
  } finally {
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(dir).startsWith('exam-updater-test-'));
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test('integration: CLI dry-run writes nothing on success or API failure', async () => {
  await tempDataset(async (cwd) => {
    const files = ['data/exams-data.json', 'scripts/.last-update-log.json', 'scripts/.last-update-review.json'];
    const before = await Promise.all(files.map(async (file) => [await fs.readFile(path.join(cwd, file), 'utf8'), (await fs.stat(path.join(cwd, file))).mtimeMs]));
    for (const failing of [false, true]) {
      let writes = 0;
      const client = { search: async () => { if (failing) throw new Error('Offline failure'); return [source]; }, complete: async () => response() };
      const code = await main(['--dry-run', '--exam', 'EXAM 1'], { cwd, client, now, log: () => {}, write: async () => { writes++; } });
      assert.equal(code, failing ? 1 : 0); assert.equal(writes, 0);
    }
    const after = await Promise.all(files.map(async (file) => [await fs.readFile(path.join(cwd, file), 'utf8'), (await fs.stat(path.join(cwd, file))).mtimeMs]));
    assert.deepEqual(after, before);
  });
});

test('integration: normal CLI writes only review artifact, including errors', async () => {
  await tempDataset(async (cwd) => {
    const original = await fs.readFile(path.join(cwd, 'data/exams-data.json'), 'utf8');
    const code = await main(['--exam', 'EXAM 1'], { cwd, client: { search: async () => { throw new Error('Service unavailable'); } }, now, log: () => {} });
    assert.equal(code, 1);
    const report = JSON.parse(await fs.readFile(path.join(cwd, 'scripts/.last-update-review.json'), 'utf8'));
    assert.equal(report.errors.length, 1); assert.equal(report.status, 'incomplete');
    assert.equal(await fs.readFile(path.join(cwd, 'data/exams-data.json'), 'utf8'), original);
    assert.equal(await fs.readFile(path.join(cwd, 'scripts/.last-update-log.json'), 'utf8'), 'old log');
    assert.deepEqual((await fs.readdir(path.join(cwd, 'scripts'))).sort(), ['.last-update-log.json', '.last-update-review.json']);
  });
});

test('integration: offline validation needs no API keys and does not write a report', async () => {
  await tempDataset(async (cwd) => {
    let writes = 0;
    assert.equal(await main(['--validate-only'], { cwd, env: {}, log: () => {}, write: async () => { writes++; } }), 0);
    assert.equal(writes, 0);
  });
});

test('integration: missing API configuration produces a failed review artifact', async () => {
  await tempDataset(async (cwd) => {
    const code = await main([], { cwd, env: {}, now, log: () => {} });
    assert.equal(code, 1);
    const report = JSON.parse(await fs.readFile(path.join(cwd, 'scripts/.last-update-review.json'), 'utf8'));
    assert.equal(report.status, 'failed');
    assert.match(report.errors[0].message, /Missing GROQ_API_KEY/);
    assert.equal(report.publishedDataChanged, false);
  });
});

test('integration: output cannot overwrite dataset or source files', async () => {
  await tempDataset(async (cwd) => {
    const original = await fs.readFile(path.join(cwd, 'data/exams-data.json'), 'utf8');
    for (const destination of ['data/exams-data.json', 'scripts/update-exams.mjs', '../outside.json']) {
      await assert.rejects(main(['--output', destination], { cwd, env: {}, log: () => {} }), /--output must/);
    }
    assert.equal(await fs.readFile(path.join(cwd, 'data/exams-data.json'), 'utf8'), original);
  });
});

test('integration: importing production CLI has no execution side effects', () => {
  const moduleUrl = new URL('../scripts/update-exams.mjs', import.meta.url).href;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', `await import(${JSON.stringify(moduleUrl)})`], { cwd: path.dirname(fileURLToPath(import.meta.url)), encoding: 'utf8', timeout: 5000 });
  assert.equal(child.status, 0); assert.equal(child.stdout, ''); assert.equal(child.stderr, '');
});

test('core: CLI rejects unknown or incomplete options', () => {
  for (const args of [['--exam'], ['--output'], ['--auto-apply'], ['--exam', '--dry-run']]) assert.throws(() => parseArgs(args));
});
