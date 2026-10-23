'use client'

import { useCallback, useState } from 'react'
import CountdownTimer from './CountdownTimer'
import ExamDetailsModal from './ExamDetailsModal'
import VerificationSummary from './VerificationSummary'
import { examAction } from '@/lib/exam-utils'
import type { Exam } from '@/types/exam'

export default function ExamCard({ exam, index, now }: { exam: Exam; index: number; now: number | null }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const closeModal = useCallback(() => setIsModalOpen(false), [])
  const action = examAction(exam, now)
  const details = [
    ['Application fee', exam.applicationFee], ['Exam dates', exam.examDate],
    ['Colleges', exam.colleges.slice(0, 2).join(', ')], ['Average package (reported)', exam.avgPlacement],
    ['Course fees', exam.approxFees], ['Difficulty (guide assessment)', exam.difficultyLevel],
  ]
  return (
    <article id={`exam-${exam.id}`} className="exam-card flex flex-col bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-xl font-bold text-slate-900">{index + 1}. {exam.name}</h2>
          <span className={`priority-${exam.colorCode} text-white text-xs font-bold px-3 py-1 rounded-full capitalize`}>{exam.colorCode} priority</span>
        </div>
        <p className="text-xs text-slate-600">{exam.fullName}</p>
        <VerificationSummary exam={exam} now={now} />
      </div>
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <CountdownTimer exam={exam} now={now} />
        <dl className="mt-2 space-y-1 text-xs text-slate-700 break-words">
          <div><dt className="font-semibold">Registration starts</dt><dd>{exam.registrationStart}</dd></div>
          <div><dt className="font-semibold">Registration deadlines</dt><dd>{exam.registrationEnd}</dd></div>
        </dl>
      </div>
      <dl className="p-4 space-y-3 text-sm break-words">
        {details.map(([label, value]) => <div key={label}><dt className="text-slate-600">{label}</dt><dd className="font-medium text-slate-900 mt-1">{value}</dd></div>)}
      </dl>
      <div className="p-4 pt-0 text-xs text-slate-600">
        {exam.keyHighlights.slice(0, 2).map((highlight, i) => <p key={i} className="mt-1">• {highlight}</p>)}
      </div>
      <div className="mt-auto p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-2">
        {action.href ? <a href={action.href} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg text-center text-sm">{action.label}</a> : <span className="text-sm text-slate-500">Official link unavailable</span>}
        <button type="button" onClick={() => setIsModalOpen(true)} aria-haspopup="dialog" aria-label={`Details for ${exam.name}`} className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold py-2 px-3 rounded-lg text-sm">Details</button>
      </div>
      <ExamDetailsModal exam={exam} now={now} isOpen={isModalOpen} onClose={closeModal} />
    </article>
  )
}
