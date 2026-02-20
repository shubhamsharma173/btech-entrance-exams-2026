'use client'

import { useState } from 'react'

interface FilterBarProps {
  sortBy: string
  setSortBy: (value: string) => void
  filterPriority: string
  setFilterPriority: (value: string) => void
  filterDifficulty: string
  setFilterDifficulty: (value: string) => void
  searchQuery: string
  setSearchQuery: (value: string) => void
}

export default function FilterBar({
  sortBy,
  setSortBy,
  filterPriority,
  setFilterPriority,
  searchQuery,
  setSearchQuery,
}: FilterBarProps) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Search by exam name, college, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:items-center">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">Filters:</span>

            <button
              onClick={() => setFilterPriority('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filterPriority === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Exams
            </button>

            <button
              onClick={() => setFilterPriority('high')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filterPriority === 'high'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Premium Private
            </button>

            <button
              onClick={() => setFilterPriority('medium')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filterPriority === 'medium'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              State Level
            </button>
          </div>

          <div className="sm:ml-auto w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="priority">Sort by: Priority</option>
              <option value="deadline">Sort by: Deadline</option>
              <option value="fee">Sort by: Fees</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
