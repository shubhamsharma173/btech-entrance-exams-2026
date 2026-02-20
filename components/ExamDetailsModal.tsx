'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Exam } from '@/types/exam'

interface ExamDetailsModalProps {
  exam: Exam
  isOpen: boolean
  onClose: () => void
}

export default function ExamDetailsModal({ exam, isOpen, onClose }: ExamDetailsModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4" style={{ isolation: 'isolate' }}>
      {/* Backdrop - Lighter background */}
      <div
        className="fixed inset-0 bg-slate-900 bg-opacity-40 backdrop-blur-sm transition-opacity"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-hidden="true"
      />

      {/* Modal - Smaller size and better scrolling */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-lg sm:text-xl font-bold truncate">{exam.name}</h2>
            <p className="text-xs text-blue-100 mt-1 line-clamp-2">{exam.fullName}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition flex-shrink-0"
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
                  <div className="text-sm font-semibold text-slate-900">{exam.examPattern.totalQuestions}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1">Total Marks</div>
                  <div className="text-sm font-semibold text-slate-900">{exam.examPattern.totalMarks}</div>
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
                    <div className="text-lg font-bold text-orange-600">{exam.applicationFee}</div>
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

          </div>
        </div>

        {/* Footer Actions - Fixed at bottom */}
        <div className="flex-shrink-0 bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row gap-2 sm:gap-3 rounded-b-2xl">
          <a
            href={exam.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 sm:py-2.5 px-4 rounded-lg text-center text-sm transition touch-manipulation"
          >
            🔗 Apply Now
          </a>
          <a
            href={exam.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white hover:bg-slate-100 active:bg-slate-200 border-2 border-slate-300 text-slate-700 font-semibold py-3 sm:py-2.5 px-4 rounded-lg text-center text-sm transition touch-manipulation"
          >
            🌐 Official Website
          </a>
        </div>
      </div>
    </div>
  )

  // Use portal to render modal at document root
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}
