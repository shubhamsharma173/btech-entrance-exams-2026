'use client'

import { useEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import type { Exam } from '@/types/exam'
import { examAction, safeHttpUrl, fieldAgeDays, VERIFICATION_MAX_AGE_DAYS } from '@/lib/exam-utils'
import VerificationSummary from './VerificationSummary'

interface ExamDetailsModalProps {
  exam: Exam
  isOpen: boolean
  onClose: () => void
  now: number | null
}

export default function ExamDetailsModal({ exam, isOpen, onClose, now }: ExamDetailsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const action = examAction(exam, now)
  const evidence = Object.entries(exam.verification?.fields ?? {})
  const additionalSources = [...new Set(exam.sources)].filter(source => !evidence.some(([, field]) => field.sourceUrl === source))

  useEffect(() => {
    if (!isOpen) return
    const dialog = dialogRef.current
    if (!dialog) return
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const oldOverflow = document.body.style.overflow
    const modalRoot = dialog.parentElement
    const background = [...document.body.children].filter((element): element is HTMLElement => element instanceof HTMLElement && element !== modalRoot)
    const oldInert = background.map(element => [element, element.inert] as const)
    background.forEach(element => { element.inert = true })
    const focusable = () => [...dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(element => element.getClientRects().length > 0)
    const focusFirst = () => (focusable()[0] ?? dialog).focus()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'Tab') {
        const elements = focusable()
        const first = elements[0]
        const last = elements[elements.length - 1]
        if (!first) {
          e.preventDefault()
          dialog.focus()
        } else if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement) || document.activeElement === dialog)) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    const containFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) focusFirst()
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('focusin', containFocus)
    document.body.style.overflow = 'hidden'
    focusFirst()

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('focusin', containFocus)
      document.body.style.overflow = oldOverflow
      oldInert.forEach(([element, inert]) => { element.inert = inert })
      if (returnFocus?.isConnected) returnFocus.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4" style={{ isolation: 'isolate' }}>
      {/* Backdrop - Lighter background */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-hidden="true"
      />

      {/* Modal - Smaller size and better scrolling */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex-1 min-w-0 pr-2">
            <h2 id={titleId} className="text-lg sm:text-xl font-bold">{exam.name}</h2>
            <p id={descriptionId} className="text-xs text-blue-100 mt-1">{exam.fullName}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="text-white hover:bg-white/20 rounded-full p-2 transition flex-shrink-0"
            aria-label="Close modal"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable middle section */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6"  style={{ maxHeight: 'calc(90vh - 160px)' }}>
          <div className="space-y-6">
            <VerificationSummary exam={exam} now={now} />
            {exam.verification?.note && <p className="text-sm text-slate-700">{exam.verification.note}</p>}

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-xs text-slate-600 mb-1">Conducted By</div>
                <div className="font-semibold text-slate-900">{exam.conductedBy}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-xs text-slate-600 mb-1">Total Seats</div>
                <div className="font-semibold text-slate-900">{exam.totalSeats}</div>
              </div>
            </div>

            {/* Colleges List */}
            <div className="border border-slate-200 rounded-lg p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                🏛️ Participating Colleges
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {exam.colleges.map((college, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="text-blue-600 mr-2 leading-none">•</span>
                    <span className="text-sm text-slate-700 font-medium leading-relaxed">{college}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Dates */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                📅 Important Dates
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-start py-2 border-b border-slate-100 gap-2">
                  <span className="text-sm text-slate-600 flex-shrink-0">Registration Start</span>
                  <span className="text-sm font-semibold text-slate-900 text-right">{exam.registrationStart}</span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-slate-100 gap-2">
                  <span className="text-sm text-slate-600 flex-shrink-0">Registration End</span>
                  <span className="text-sm font-semibold text-red-600 text-right break-words">{exam.registrationEnd}</span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-slate-100 gap-2">
                  <span className="text-sm text-slate-600 flex-shrink-0">Exam Date</span>
                  <span className="text-sm font-semibold text-slate-900 text-right break-words">{exam.examDate}</span>
                </div>
                <div className="flex justify-between items-start py-2 gap-2">
                  <span className="text-sm text-slate-600 flex-shrink-0">Result Date</span>
                  <span className="text-sm font-semibold text-slate-900 text-right break-words">{exam.resultDate}</span>
                </div>
              </div>
            </div>

            {/* Eligibility */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                ✅ Eligibility Criteria
              </h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span className="text-sm text-slate-700"><strong>Education:</strong> {exam.eligibility.education}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span className="text-sm text-slate-700"><strong>Minimum Marks:</strong> {exam.eligibility.minimumMarks}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span className="text-sm text-slate-700"><strong>Age Limit:</strong> {exam.eligibility.ageLimit}</span>
                </div>
              </div>
            </div>

            {/* Exam Pattern */}
            <div className="border border-slate-200 rounded-lg p-5 bg-amber-50">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                📝 Exam Pattern
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-600 mb-1">Mode</div>
                  <div className="text-sm font-semibold text-slate-900">{exam.examPattern.mode}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1">Duration</div>
                  <div className="text-sm font-semibold text-slate-900">{exam.examPattern.duration}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1">Total Questions</div>
                  <div className="text-sm font-semibold text-slate-900">{exam.examPattern.totalQuestions ?? 'Not verified'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1">Total Marks</div>
                  <div className="text-sm font-semibold text-slate-900">{exam.examPattern.totalMarks ?? 'Not verified'}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-200">
                <div className="text-xs text-slate-600 mb-1">Marking Scheme</div>
                <div className="text-sm font-semibold text-slate-900">{exam.examPattern.markingScheme}</div>
              </div>
              <div className="mt-3">
                <div className="text-xs text-slate-600 mb-1">Sections</div>
                <div className="text-sm text-slate-700">{exam.examPattern.sections}</div>
              </div>
            </div>

            {/* Placements & Fees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-green-200 rounded-lg p-5 bg-green-50">
                <h3 className="text-lg font-bold text-slate-900 mb-3">💰 Placements</h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-slate-600">Average Package</div>
                    <div className="text-xl font-bold text-green-600">{exam.avgPlacement}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Highest Package</div>
                    <div className="text-lg font-semibold text-green-700">{exam.highestPlacement}</div>
                  </div>
                </div>
              </div>
              <div className="border border-orange-200 rounded-lg p-5 bg-orange-50">
                <h3 className="text-lg font-bold text-slate-900 mb-3">💵 Fees</h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-slate-600">Application Fee</div>
                    <div className="text-lg font-bold text-orange-800">{exam.applicationFee}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Course Fees</div>
                    <div className="text-lg font-semibold text-orange-700">{exam.approxFees}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Highlights */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                ⭐ Key Highlights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {exam.keyHighlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="text-blue-500 mr-2 leading-none">✓</span>
                    <span className="text-sm text-slate-700 leading-relaxed">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            <section className="border border-slate-200 rounded-lg p-5" aria-label="Sources and verification">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Sources and field checks</h3>
              <p className="text-sm text-slate-600 mb-3">Each link supports only its named field. Other details remain unverified unless explicitly listed. Dates and fees can change after a check.</p>
              {evidence.length ? (
                <ul className="space-y-3 text-sm">
                  {evidence.map(([field, details]) => {
                    const href = safeHttpUrl(details.sourceUrl)
                    const age = now === null ? null : fieldAgeDays(exam, field, now)
                    const label = field.replaceAll('.', ' / ').replace(/([a-z])([A-Z])/g, '$1 $2')
                    return <li key={field} className="break-words">
                      <p className="font-semibold capitalize">{label}</p>
                      <p className="text-slate-600">Checked: {details.checkedAt}{age !== null && age > VERIFICATION_MAX_AGE_DAYS ? ' · over 30 days old; recheck' : ''}</p>
                      {details.note && <p className="text-slate-600">{details.note}</p>}
                      {href ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline break-all">Source for {label}</a> : <p className="text-slate-600">Valid source link unavailable.</p>}
                    </li>
                  })}
                </ul>
              ) : <p className="text-sm text-slate-600">No individual fields have a recorded source check.</p>}
              {additionalSources.length > 0 && <>
                <h4 className="font-semibold text-slate-900 mt-5 mb-2">Additional references — not verification evidence</h4>
                <ul className="space-y-2 text-sm">
                  {additionalSources.map((source, index) => {
                    const href = safeHttpUrl(source)
                    return <li key={source}>{href ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline break-all">Reference {index + 1}: {new URL(href).hostname}</a> : <span className="text-slate-600">{source}</span>}</li>
                  })}
                </ul>
              </>}
            </section>
          </div>
        </div>

        {/* Footer Actions - Fixed at bottom */}
        <div className="flex-shrink-0 bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row gap-2 sm:gap-3 rounded-b-2xl">
          {action.href && <a
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 sm:py-2.5 px-4 rounded-lg text-center text-sm transition touch-manipulation"
          >
            {action.label}
          </a>}
          <button type="button" onClick={onClose} className="flex-1 bg-white hover:bg-slate-100 border-2 border-slate-300 text-slate-700 font-semibold py-3 px-4 rounded-lg text-sm">Close details</button>
        </div>
      </div>
    </div>
  )

  // Use portal to render modal at document root
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}
