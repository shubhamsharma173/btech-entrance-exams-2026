'use client'

import { useState, useMemo } from 'react'
import ExamCard from './ExamCard'
import FilterBar from './FilterBar'
import type { Exam } from '@/types/exam'

interface ExamListProps {
  exams: Exam[]
}

export default function ExamList({ exams }: ExamListProps) {
  const [sortBy, setSortBy] = useState<string>('priority')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('engineering')

  const filteredAndSortedExams = useMemo(() => {
    let filtered = [...exams]

    // Apply category filter
    filtered = filtered.filter(exam => exam.category === filterCategory)

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(exam =>
        exam.name.toLowerCase().includes(query) ||
        exam.fullName.toLowerCase().includes(query) ||
        exam.colleges.some(college => college.toLowerCase().includes(query)) ||
        exam.location.toLowerCase().includes(query)
      )
    }

    // Apply priority filter (only for engineering)
    if (filterPriority !== 'all' && filterCategory === 'engineering') {
      filtered = filtered.filter(exam => exam.colorCode === filterPriority)
    }

    // Apply difficulty filter
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(exam =>
        exam.difficultyLevel.toLowerCase().includes(filterDifficulty.toLowerCase())
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.colorCode] - priorityOrder[b.colorCode]
      } else if (sortBy === 'deadline') {
        return new Date(a.registrationEnd).getTime() - new Date(b.registrationEnd).getTime()
      } else if (sortBy === 'fee') {
        // Extract first number from fee string for comparison
        const aFee = parseInt(a.applicationFee.replace(/[^0-9]/g, ''))
        const bFee = parseInt(b.applicationFee.replace(/[^0-9]/g, ''))
        return aFee - bFee
      }
      return 0
    })

    return filtered
  }, [exams, sortBy, filterPriority, filterDifficulty, searchQuery, filterCategory])

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
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Exam Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedExams.map((exam, index) => (
            <ExamCard key={exam.id} exam={exam} index={index} />
          ))}
        </div>

        {/* No Results */}
        {filteredAndSortedExams.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500 text-lg">No exams match your search. Try different keywords.</p>
          </div>
        )}
      </main>
    </>
  )
}
