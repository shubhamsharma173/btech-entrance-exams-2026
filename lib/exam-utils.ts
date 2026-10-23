import type { Exam } from '../types/exam'

export const VERIFICATION_MAX_AGE_DAYS = 30
const DAY = 86_400_000
const IST_OFFSET = 330 * 60_000

/** Only explicit ISO calendar dates count; month-only/estimated dates stay unknown. */
export function exactDates(value: string): string[] {
  if (/\b(expected|estimated|tentative|provisional|advertised|unconfirmed|unverified|closed|cancelled|canceled|suspended|withdrawn|paused|postponed|TBA|TBD|unknown|N\/A)\b|to be announced|not (?:fully )?(?:verified|confirmed|checked|reviewed)/i.test(value)) return []
  // Ranges and explicit times need a richer model; do not turn them into midnight cutoffs.
  if (/\b(?:to|until|through|between)\b|\b\d{1,2}:\d{2}\b|\b\d{1,2}\s*(?:am|pm)\b|\b\d{3,4}\s*(?:hrs|hours)\b|\b(?:noon|midnight)\b/i.test(value)) return []
  const matches = [...value.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)]
  if (!matches.length) return []
  // Do not silently drop an abbreviated date from a range or second session.
  const remainder = value.replace(/\b\d{4}-\d{2}-\d{2}\b/g, '')
  if (/\b\d{1,2}[-/]\d{1,2}\b|[-–—]\s*\d{1,2}\b/.test(remainder)) return []
  for (const [, y, m, d] of matches) {
    const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)))
    if (date.getUTCFullYear() !== Number(y) || date.getUTCMonth() + 1 !== Number(m) || date.getUTCDate() !== Number(d)) return []
  }
  return [...new Set(matches.map(match => match[0]))].sort()
}

export function startOfIndiaDay(iso: string): number {
  return Date.parse(`${iso}T00:00:00+05:30`)
}

export function endOfIndiaDay(iso: string): number {
  return startOfIndiaDay(iso) + DAY - 1
}

export function safeHttpUrl(value: string | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null
  } catch {
    return null
  }
}

export function fieldAgeDays(exam: Exam, field: string, now: number): number | null {
  const evidence = exam.verification?.fields[field]
  if (!evidence || !safeHttpUrl(evidence.sourceUrl) || !/^\d{4}-\d{2}-\d{2}$/.test(evidence.checkedAt) || !exactDates(evidence.checkedAt).length) return null
  const checked = startOfIndiaDay(evidence.checkedAt)
  if (checked > now) return null
  return Math.floor((now - checked) / DAY)
}

export function isFieldFresh(exam: Exam, field: string, now: number): boolean {
  if (!exam.verification || exam.verification.status === 'unverified') return false
  const note = exam.verification.fields[field]?.note ?? ''
  if (/\b(unverified|tentative|expected|estimated|provisional|advertised|unconfirmed|closed|cancelled|canceled|suspended|withdrawn|paused|postponed)\b|not (?:fully )?(?:verified|confirmed|checked|reviewed)|no (?:verified|confirmed)|needs? (?:review|verification)/i.test(note)) return false
  const age = fieldAgeDays(exam, field, now)
  return age !== null && age <= VERIFICATION_MAX_AGE_DAYS
}

function isCurrentAdmissionCycle(exam: Exam, now: number): boolean {
  const year = new Date(now + IST_OFFSET).getUTCFullYear()
  // Admissions for next year's cycle may already be open this year.
  return exam.cycleYear === year || exam.cycleYear === year + 1
}

export interface RegistrationState {
  state: 'open' | 'upcoming' | 'closed' | 'unknown' | 'inactive'
  deadline: number | null
  message: string
}

function labelledDates(value: string): Map<string, string> | null {
  const sessions = new Map<string, string>()
  for (const segment of value.split(/[,;\n]/)) {
    const dates = exactDates(segment)
    const label = segment.match(/\b(phase|session)\s*[-:]?\s*(\d+|[a-z])\b/i)
    if (dates.length !== 1 || !label) return null
    const key = `${label[1].toLowerCase()}-${label[2].toLowerCase()}`
    if (sessions.has(key)) return null
    sessions.set(key, dates[0])
  }
  return sessions
}

function matchingStart(startText: string, endText: string, nextEnd: string): string | null {
  const starts = exactDates(startText)
  const ends = exactDates(endText)
  if (starts.length === 1 && ends.length === 1 && !/\b(?:phase|session)\b/i.test(startText + endText)) return starts[0]
  // Explicit labels, rather than independent chronological sorting, pair sessions.
  const startSessions = labelledDates(startText)
  const endSessions = labelledDates(endText)
  if (!startSessions || !endSessions || startSessions.size !== endSessions.size) return null
  for (const [label, end] of endSessions) {
    const start = startSessions.get(label)
    if (!start || startOfIndiaDay(start) > endOfIndiaDay(end)) return null
  }
  const next = [...endSessions].find(([, date]) => date === nextEnd)
  return next ? startSessions.get(next[0]) ?? null : null
}

export function registrationState(exam: Exam, now: number): RegistrationState {
  const unknown = (message: string): RegistrationState => ({ state: 'unknown', deadline: null, message })
  if (exam.status === 'discontinued' || exam.status === 'merged') {
    return { state: 'inactive', deadline: null, message: exam.status === 'merged' ? 'Merged admission route — see official website' : 'Discontinued route — see official website' }
  }
  if (!isCurrentAdmissionCycle(exam, now)) return unknown(exam.cycleYear ? 'Past or future cycle — check current admissions' : 'Admission cycle needs confirmation')
  if (exam.status !== 'active') return unknown('Application status needs review')
  const age = fieldAgeDays(exam, 'registrationEnd', now)
  if (age !== null && age > VERIFICATION_MAX_AGE_DAYS) return unknown('Deadline check is over 30 days old — recheck official website')
  if (!isFieldFresh(exam, 'registrationEnd', now)) return unknown('Deadline not recently verified — check official website')
  const ends = exactDates(exam.registrationEnd)
  if (!ends.length) return unknown('See the listed cutoff on the official website')
  const nextIndex = ends.findIndex(date => endOfIndiaDay(date) >= now)
  if (nextIndex === -1) return { state: 'closed', deadline: endOfIndiaDay(ends[ends.length - 1]), message: 'Listed registration deadlines have passed' }
  const deadline = endOfIndiaDay(ends[nextIndex])
  const startDate = matchingStart(exam.registrationStart, exam.registrationEnd, ends[nextIndex])
  if (!isFieldFresh(exam, 'registrationStart', now) || !startDate) {
    return { state: 'unknown', deadline, message: 'Deadline checked; opening date or session pairing needs confirmation' }
  }
  const start = startOfIndiaDay(startDate)
  if (start > deadline) return unknown('Registration dates conflict — check official website')
  if (start > now) return { state: 'upcoming', deadline, message: `Registration is listed to open ${startDate} (IST)` }
  return { state: 'open', deadline, message: ends.length > 1 ? 'A verified registration session is open' : 'Verified registration dates are open' }
}

/** Fee order uses the first explicitly quoted rupee amount, never category/session digits. */
export function applicationFeeAmount(value: string): number | null {
  if (/^\s*(N\/A|TBA|TBD|unknown|not announced)\b/i.test(value)) return null
  if (/^\s*(free\b|no application fee)/i.test(value)) return 0
  const match = value.match(/(?:₹\s*|\bINR\s*|\bRs\.?\s*)(\d[\d,]*(?:\.\d+)?)/i)
  if (!match) return null
  const amount = Number(match[1].replaceAll(',', ''))
  return Number.isFinite(amount) ? amount : null
}

export function compareExams(a: Exam, b: Exam, sortBy: string, now: number | null): number {
  if (sortBy === 'fee') {
    const aFee = applicationFeeAmount(a.applicationFee)
    const bFee = applicationFeeAmount(b.applicationFee)
    if (aFee === null || bFee === null) return aFee === bFee ? 0 : aFee === null ? 1 : -1
    return aFee - bFee
  }
  if (sortBy === 'deadline') {
    if (now === null) return 0
    const aDate = registrationState(a, now).deadline
    const bDate = registrationState(b, now).deadline
    if (aDate === null || bDate === null) return aDate === bDate ? 0 : aDate === null ? 1 : -1
    // Upcoming deadlines first, followed by closed deadlines, then unknown dates.
    if ((aDate < now) !== (bDate < now)) return aDate < now ? 1 : -1
    return aDate - bDate
  }
  const order = { high: 0, medium: 1, low: 2 }
  return order[a.colorCode] - order[b.colorCode]
}

export function examAction(exam: Exam, now: number | null): { href: string | null; label: string } {
  const canApply = now !== null && registrationState(exam, now).state === 'open'
  const applyUrl = canApply ? safeHttpUrl(exam.applyLink) : null
  return applyUrl
    ? { href: applyUrl, label: 'Apply on official website' }
    : { href: safeHttpUrl(exam.officialWebsite), label: 'Official website' }
}
