'use client'

interface FilterBarProps {
  sortBy: string
  setSortBy: (value: string) => void
  filterPriority: string
  setFilterPriority: (value: string) => void
  filterDifficulty: string
  setFilterDifficulty: (value: string) => void
  difficultyOptions: string[]
  searchQuery: string
  setSearchQuery: (value: string) => void
  filterCategory: string
  setFilterCategory: (value: string) => void
}

const categories = [
  ['engineering', '🎓 Engineering'], ['medical', '🏥 Medical'], ['law', '⚖️ Law'],
  ['management', '💼 Management'], ['design', '🎨 Design'],
]

export default function FilterBar(props: FilterBarProps) {
  const controlClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  return (
    <div className="bg-white border-b border-slate-200 sm:sticky sm:top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2" role="group" aria-label="Exam category">
          {categories.map(([category, label]) => (
            <button
              key={category} type="button"
              aria-pressed={props.filterCategory === category}
              onClick={() => props.setFilterCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-blue-600 ${props.filterCategory === category ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >{label}</button>
          ))}
        </div>
        <label htmlFor="exam-search" className="block text-sm font-medium text-slate-700 mb-1">Search exams, colleges or locations</label>
        <input id="exam-search" type="search" placeholder="Exam name, college or location"
          value={props.searchQuery} onChange={e => props.setSearchQuery(e.target.value)}
          className={`${controlClass} mb-4`} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="text-sm font-medium text-slate-700">Priority
            <select value={props.filterPriority} onChange={e => props.setFilterPriority(e.target.value)} className={`${controlClass} mt-1`}>
              <option value="all">All priorities</option>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">Difficulty
            <select value={props.filterDifficulty} onChange={e => props.setFilterDifficulty(e.target.value)} className={`${controlClass} mt-1`}>
              <option value="all">All difficulty levels</option>
              {props.difficultyOptions.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">Sort exams
            <select value={props.sortBy} onChange={e => props.setSortBy(e.target.value)} className={`${controlClass} mt-1`}>
              <option value="priority">Priority</option>
              <option value="deadline">Next verified deadline</option>
              <option value="fee">First quoted fee: low to high</option>
            </select>
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-500">Priority and difficulty are guide assessments. Fee sorting uses the first quoted amount; category and session charges may differ. Unverified deadlines sort last.</p>
      </div>
    </div>
  )
}
