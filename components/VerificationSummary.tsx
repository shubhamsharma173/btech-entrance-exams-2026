import type { Exam } from '@/types/exam'
import { fieldAgeDays, VERIFICATION_MAX_AGE_DAYS } from '@/lib/exam-utils'

export default function VerificationSummary({ exam, now }: { exam: Exam; now: number | null }) {
  const review = exam.verification
  const fields = Object.keys(review?.fields ?? {})
  const stale = now !== null && fields.some(field => {
    const age = fieldAgeDays(exam, field, now)
    return age !== null && age > VERIFICATION_MAX_AGE_DAYS
  })
  const status = exam.status === 'discontinued' ? 'Discontinued' : exam.status === 'merged' ? 'Merged route' : exam.status === 'active' ? 'Active route' : 'Needs review'
  return (
    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
      <p className="font-semibold">{exam.cycleYear ? `${exam.cycleYear} admission cycle` : 'Admission cycle unconfirmed'} · {status}</p>
      <p className="mt-1">{review?.status === 'verified' ? 'Profile marked verified; check each field’s evidence and date.' : review?.status === 'partial' ? 'Partially verified — only the cited fields have been checked.' : 'Unverified details — confirm with the official provider.'}</p>
      {review?.reviewedAt && <p className="mt-1">Review recorded: {review.reviewedAt}. This is not a verification date for every detail.</p>}
      {stale && <p className="mt-1 font-semibold">Some field checks are over 30 days old. Recheck current dates and fees.</p>}
    </div>
  )
}
