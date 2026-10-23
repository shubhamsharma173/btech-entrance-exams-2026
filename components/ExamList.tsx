'use client'

import { useState, useMemo, useEffect } from 'react'
import ExamCard from './ExamCard'
import FilterBar from './FilterBar'
import type { Exam } from '@/types/exam'
import { compareExams } from '@/lib/exam-utils'

interface ExamListProps {
  exams: Exam[]
}

export default function ExamList({ exams }: ExamListProps) {
  const [sortBy, setSortBy] = useState<string>('priority')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('engineering')
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    const update = () => setNow(Date.now())
    update()
    const timer = setInterval(update, 60_000)
    return () => clearInterval(timer)
  }, [])

  const difficultyOptions = useMemo(() => [...new Set(exams.map(exam => exam.difficultyLevel))].sort(), [exams])

  const filteredAndSortedExams = useMemo(() => {
    let filtered = [...exams]

    // Apply category filter
    filtered = filtered.filter(exam => exam.category === filterCategory)

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.trim().toLowerCase()
      filtered = filtered.filter(exam =>
        exam.name.toLowerCase().includes(query) ||
        exam.fullName.toLowerCase().includes(query) ||
        exam.colleges.some(college => college.toLowerCase().includes(query)) ||
        exam.location.toLowerCase().includes(query)
      )
    }

    // The same controls apply to every category.
    if (filterPriority !== 'all') {
      filtered = filtered.filter(exam => exam.colorCode === filterPriority)
    }

    // Apply difficulty filter
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(exam =>
        exam.difficultyLevel === filterDifficulty
      )
    }

    // Apply sorting
    filtered.sort((a, b) => compareExams(a, b, sortBy, now))

    return filtered
  }, [exams, sortBy, filterPriority, filterDifficulty, searchQuery, filterCategory, now])

  return (
    <>
      {/* Filter Bar */}
      <FilterBar
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        filterDifficulty={filterDifficulty}
        setFilterDifficulty={setFilterDifficulty}
        difficultyOptions={difficultyOptions}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
      />

      {/* Main Content */}
      <section aria-label="Exam results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p role="status" className="text-sm text-slate-600 mb-4">{filteredAndSortedExams.length} {filteredAndSortedExams.length === 1 ? 'exam matches' : 'exams match'} your filters.</p>
        {/* Exam Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedExams.map((exam, index) => (
            <ExamCard key={exam.id} exam={exam} index={index} now={now} />
          ))}
        </div>

        {/* No Results */}
        {filteredAndSortedExams.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500 text-lg">No exams match your search. Try different keywords.</p>
          </div>
        )}
      </section>
    </>
  )
}
