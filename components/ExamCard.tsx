'use client'

import { useState } from 'react'
import CountdownTimer from './CountdownTimer'
import ExamDetailsModal from './ExamDetailsModal'
import type { Exam } from '@/types/exam'

interface ExamCardProps {
  exam: Exam
  index: number
}

// Helper to format dates safely
function formatDateSafe(dateStr: string): string {
  if (!dateStr) return 'TBA'

  // If it contains "TBA" or "expected", return as is
  if (dateStr.includes('TBA') || dateStr.includes('expected')) {
    return dateStr.replace(/\(|\)/g, '').trim()
  }

  // Extract first date if multiple phases
  const firstDateMatch = dateStr.match(/(\d{4}-\d{2}-\d{2})/)
  if (firstDateMatch) {
    const date = new Date(firstDateMatch[1])
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }
  }

  // Handle "Month YYYY" format
  const monthYearMatch = dateStr.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/)
  if (monthYearMatch) {
    return monthYearMatch[0]
  }

  // Try standard parsing
  const date = new Date(dateStr)
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // If all else fails, return the original string cleaned up
  return dateStr.split('(')[0].trim()
}

export default function ExamCard({ exam, index }: ExamCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getPriorityClass = () => {
    if (exam.colorCode === 'high') return 'priority-high'
    if (exam.colorCode === 'medium') return 'priority-medium'
    return 'priority-low'
  }

  const getPriorityLabel = () => {
    if (exam.colorCode === 'high') return '🔥 HIGH'
    if (exam.colorCode === 'medium') return '🟠 MEDIUM'
    return '🟢 LOW'
  }

  const getDeadlineColor = () => {
    if (exam.colorCode === 'high') return 'bg-red-50 border-l-4 border-red-500'
    if (exam.colorCode === 'medium') return 'bg-orange-50 border-l-4 border-orange-500'
    return 'bg-green-50 border-l-4 border-green-500'
  }

  const getDeadlineTextColor = () => {
    if (exam.colorCode === 'high') return 'text-red-600'
    if (exam.colorCode === 'medium') return 'text-orange-600'
    return 'text-green-600'
  }

  return (
    <div className="exam-card bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-xl font-bold text-slate-900">{index + 1}. {exam.name}</h2>
          <span className={`${getPriorityClass()} text-white text-xs font-bold px-3 py-1 rounded-full`}>
            {getPriorityLabel()}
          </span>
        </div>
        <p className="text-xs text-slate-500">{exam.fullName}</p>
      </div>

      {/* Deadline */}
      <div className={`${getDeadlineColor()} px-4 py-3`}>
        <div className="flex flex-col gap-1">
          <span className={`${getDeadlineTextColor()} font-bold text-sm pulse-slow`}>
            <CountdownTimer targetDate={exam.registrationEnd} label="⏰" />
          </span>
          <div className="text-xs text-slate-600">
            📅 Apply: {formatDateSafe(exam.registrationStart)} - {formatDateSafe(exam.registrationEnd)}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">💰 Application Fee</span>
          <span className="font-semibold text-slate-900">{exam.applicationFee.split(' ')[0]}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">📅 Exam Date</span>
          <span className="font-semibold text-slate-900">{exam.examDate.split(' ')[0]}</span>
        </div>
        <div className="text-sm">
          <span className="text-slate-600">🏛️ Colleges</span>
          <p className="font-medium text-slate-900 mt-1">{exam.colleges.slice(0, 2).join(', ')}</p>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">📊 Avg Package</span>
          <span className="font-bold text-green-600">{exam.avgPlacement}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">💵 Course Fees</span>
          <span className="font-semibold text-slate-900">{exam.approxFees.split(' ')[0]}</span>
        </div>

        {/* Highlights */}
        <div className="pt-2 border-t border-slate-200">
          <div className="flex flex-wrap gap-2">
            {exam.keyHighlights.slice(0, 2).map((highlight, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                  idx === 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {idx === 0 ? '✅' : '⚡'} {highlight.substring(0, 25)}{highlight.length > 25 ? '...' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="grid grid-cols-2 gap-2">
          <a
            href={exam.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-center text-sm transition"
          >
            🔗 Apply Now
          </a>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm transition"
          >
            📄 Details
          </button>
        </div>
      </div>

      {/* Modal */}
      <ExamDetailsModal
        exam={exam}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
