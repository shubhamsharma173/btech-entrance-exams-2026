import test from 'node:test'
import assert from 'node:assert/strict'
import type { Exam } from '../types/exam'
import { applicationFeeAmount, compareExams, endOfIndiaDay, exactDates, examAction, fieldAgeDays, registrationState, safeHttpUrl, startOfIndiaDay } from '../lib/exam-utils'

const now = Date.parse('2026-10-23T12:00:00+05:30')
const evidence = { checkedAt: '2026-10-23', sourceUrl: 'https://exam.example/schedule' }
const base: Exam = {
  id: 1, name: 'Example exam', fullName: 'Example entrance exam', category: 'engineering',
  conductedBy: 'Example', tier: '', priority: '', registrationStart: '2026-10-01',
  registrationEnd: '2026-10-23', examDate: '2026-11-15', resultDate: 'TBA',
  applicationFee: '₹1,000', applyLink: 'https://exam.example/apply', officialWebsite: 'https://exam.example/',
  colleges: [], totalSeats: 'Not verified', eligibility: { education: '', minimumMarks: '', ageLimit: '' },
  examPattern: { mode: '', duration: '', sections: '', totalQuestions: null, totalMarks: null, markingScheme: '' },
  difficultyLevel: 'Moderate', preparationTip: '', avgPlacement: '', highestPlacement: '', approxFees: '',
  location: '', topBranches: [], keyHighlights: [], colorCode: 'high', sources: [], cycleYear: 2026, status: 'active',
  verification: { reviewedAt: '2026-10-23', status: 'partial', fields: { registrationStart: evidence, registrationEnd: evidence }, note: 'Only registration dates checked.' },
}

test('extracts every explicit ISO session date without inventing or accepting invalid dates', () => {
  assert.deepEqual(exactDates('2026-10-01 (Phase 1), 2026-11-02 (Phase 2)'), ['2026-10-01', '2026-11-02'])
  for (const value of ['October 2026', '2026-10-23 (expected)', '2026-10-23 (UNVERIFIED)', '2026-02-30', '2026-10-23 to 10-28', '2026-10-23 to 28', '2026-10-23–28', '2026-11-30 17:00 IST', '2026-11-30 (5 pm)', 'TBA', 'N/A']) assert.deepEqual(exactDates(value), [], value)
  assert.deepEqual(exactDates('2028-02-29'), ['2028-02-29'])
})

test('treats date-only deadlines as end of Asia/Kolkata day, inclusive', () => {
  const end = Date.parse('2026-10-23T23:59:59.999+05:30')
  assert.equal(endOfIndiaDay('2026-10-23'), end)
  assert.equal(startOfIndiaDay('2026-10-23'), Date.parse('2026-10-22T18:30:00Z'))
  assert.equal(registrationState(base, end).state, 'open')
  assert.equal(registrationState(base, end + 1).state, 'closed')
})

test('uses the next remaining session deadline and does not reopen during a session gap', () => {
  const exam = { ...base, registrationStart: '2026-10-01 (Phase 1), 2026-10-25 (Phase 2)', registrationEnd: '2026-10-10 (Phase 1), 2026-11-01 (Phase 2)' }
  const status = registrationState(exam, now)
  assert.equal(status.deadline, endOfIndiaDay('2026-11-01'))
  assert.equal(status.state, 'upcoming')
  assert.equal(examAction(exam, now).label, 'Official website')
  assert.equal(registrationState(exam, Date.parse('2026-10-25T00:00:00+05:30')).state, 'open')
})

test('does not guess a session opening when start/end lists cannot be paired', () => {
  const exam = { ...base, registrationEnd: '2026-10-10 (Phase 1), 2026-11-01 (Phase 2)' }
  assert.equal(registrationState(exam, now).state, 'unknown')
  assert.equal(examAction(exam, now).label, 'Official website')
  const mismatchedLabels = { ...base, registrationStart: '2026-10-01 (Phase 1), 2026-10-15 (Phase 3)', registrationEnd: '2026-10-10 (Phase 1), 2026-11-01 (Phase 2)' }
  assert.equal(examAction(mismatchedLabels, now).label, 'Official website')
  const unlabelled = { ...base, registrationStart: '2026-10-01, 2026-10-15', registrationEnd: '2026-10-10, 2026-11-01' }
  assert.equal(examAction(unlabelled, now).label, 'Official website')
})

test('qualified source notes cannot turn an advertised date into a verified open application', () => {
  for (const note of ['Advertised deadline; extension not verified', 'Date not confirmed', 'Tentative schedule', 'No verified extension', 'Final extension not checked', 'Registration suspended']) {
    const exam = { ...base, verification: { ...base.verification!, fields: { registrationStart: evidence, registrationEnd: { ...evidence, note } } } }
    assert.equal(examAction(exam, now).label, 'Official website', note)
  }
})

test('closure or cancellation qualifiers override future ISO dates', () => {
  for (const qualifier of ['registration closed early', 'cancelled', 'applications suspended', 'provisional date withdrawn']) {
    const exam = { ...base, registrationEnd: `2026-11-30 (${qualifier})` }
    assert.equal(examAction(exam, now).label, 'Official website', qualifier)
  }
})

test('extracts the first rupee amount without concatenating categories, ranges or session counts', () => {
  assert.equal(applicationFeeAmount('₹3,100 - ₹9,250 (varies by gender, center, session)'), 3100)
  assert.equal(applicationFeeAmount('₹500 (General), ₹250 (SC/ST), ₹750 (Outside Karnataka)'), 500)
  assert.equal(applicationFeeAmount('₹900 (General - 1 stream), ₹500 (SC/ST - 1 stream)'), 900)
  assert.equal(applicationFeeAmount('₹1,000 (General); free for reserved categories'), 1000)
  assert.equal(applicationFeeAmount('Rs. 1,250.50 per phase'), 1250.5)
  assert.equal(applicationFeeAmount('₹ 1,200'), 1200)
  assert.equal(applicationFeeAmount('FREE (₹0) - No application fee'), 0)
  assert.equal(applicationFeeAmount('N/A'), null)
  assert.equal(applicationFeeAmount('2 phases; fee not announced'), null)
})

test('fee sorting is numeric with unknown amounts after known and free fees', () => {
  const exams = [
    { ...base, applicationFee: 'N/A', id: 4 }, { ...base, applicationFee: '₹3,100 - ₹9,250', id: 3 },
    { ...base, applicationFee: '₹500 (1 session), ₹250 (reserved)', id: 2 }, { ...base, applicationFee: 'FREE', id: 1 },
  ]
  assert.deepEqual(exams.sort((a, b) => compareExams(a, b, 'fee', now)).map(exam => exam.id), [1, 2, 3, 4])
})

test('deadline sorting puts upcoming confirmed dates before closed and unknown dates', () => {
  const exams = [
    { ...base, id: 4, registrationEnd: 'October 2026' },
    { ...base, id: 3, registrationEnd: '2026-10-10' },
    { ...base, id: 2, registrationEnd: '2026-11-01' }, { ...base, id: 1 },
  ]
  assert.deepEqual(exams.sort((a, b) => compareExams(a, b, 'deadline', now)).map(exam => exam.id), [1, 2, 3, 4])
  assert.equal(compareExams(exams[0], exams[1], 'deadline', null), 0)
})

test('only individually checked registration boundaries can enable Apply wording', () => {
  assert.equal(examAction(base, now).label, 'Apply on official website')
  const noStartEvidence = { ...base, verification: { ...base.verification!, fields: { registrationEnd: evidence } } }
  assert.equal(examAction(noStartEvidence, now).label, 'Official website')
  assert.equal(examAction({ ...base, verification: undefined }, now).label, 'Official website')
  assert.equal(examAction({ ...base, verification: { ...base.verification!, status: 'unverified' } }, now).label, 'Official website')
  assert.equal(examAction({ ...base, registrationEnd: '2026-11-01 (expected)' }, now).label, 'Official website')
  assert.equal(examAction(base, null).label, 'Official website')
})

test('a recent overall review cannot refresh stale field evidence', () => {
  const staleEvidence = { ...evidence, checkedAt: '2026-09-01' }
  const stale = { ...base, verification: { ...base.verification!, fields: { registrationStart: staleEvidence, registrationEnd: staleEvidence } } }
  assert.ok(fieldAgeDays(stale, 'registrationEnd', now)! > 30)
  assert.match(registrationState(stale, now).message, /over 30 days old/)
  assert.equal(examAction(stale, now).label, 'Official website')
  const futureCheck = { ...base, verification: { ...base.verification!, fields: { registrationStart: evidence, registrationEnd: { ...evidence, checkedAt: '2026-10-24' } } } }
  assert.equal(examAction(futureCheck, now).label, 'Official website')
})

test('past cycles cannot appear open while next-year admissions may open this year', () => {
  assert.equal(examAction({ ...base, cycleYear: 2025 }, now).label, 'Official website')
  assert.equal(examAction({ ...base, cycleYear: undefined }, now).label, 'Official website')
  assert.equal(examAction({ ...base, cycleYear: 2027 }, now).label, 'Apply on official website')
  assert.equal(examAction({ ...base, cycleYear: 2028 }, now).label, 'Official website')
})

test('closed, discontinued, merged and unresolved routes retain informational links', () => {
  for (const status of ['discontinued', 'merged', 'needs-review'] as const) assert.equal(examAction({ ...base, status }, now).label, 'Official website')
  assert.equal(examAction({ ...base, registrationEnd: '2026-10-01' }, now).href, base.officialWebsite)
  assert.equal(examAction({ ...base, applyLink: '' }, now).label, 'Official website')
})

test('unsafe or credential-bearing URLs are never rendered as links', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,test', 'https://user:password@example.com', 'not a URL']) assert.equal(safeHttpUrl(value), null)
  assert.equal(safeHttpUrl('https://exam.example/schedule'), 'https://exam.example/schedule')
  assert.equal(examAction({ ...base, applyLink: 'javascript:alert(1)' }, now).href, base.officialWebsite)
})
