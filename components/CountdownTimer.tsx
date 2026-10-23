'use client'

import type { Exam } from '@/types/exam'
import { registrationState } from '@/lib/exam-utils'

export default function CountdownTimer({ exam, now }: { exam: Exam; now: number | null }) {
  if (now === null) return <p className="text-xs text-slate-600">Checking registration dates…</p>
  const status = registrationState(exam, now)
  let countdown = ''
  if (status.deadline !== null && status.deadline >= now) {
    const hours = Math.floor((status.deadline - now) / 3_600_000)
    const days = Math.floor(hours / 24)
    countdown = days > 0 ? `${days} day${days === 1 ? '' : 's'} to the next listed deadline` : hours > 0 ? `${hours} hour${hours === 1 ? '' : 's'} to the next listed deadline` : 'Less than 1 hour to the next listed deadline'
  }
  return (
    <div className={`text-xs font-medium ${status.state === 'open' ? 'text-green-700' : 'text-slate-700'}`}>
      <p>{status.message}</p>
      {countdown && <p className="mt-1">{countdown}. Date-only deadlines use 23:59 IST; check the official cutoff time.</p>}
    </div>
  )
}
