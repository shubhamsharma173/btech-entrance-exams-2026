export interface Exam {
  id: number
  name: string
  fullName: string
  category: 'engineering' | 'medical' | 'law' | 'management' | 'design'
  conductedBy: string
  tier: string
  priority: string
  registrationStart: string
  registrationEnd: string
  examDate: string
  resultDate: string
  applicationFee: string
  applyLink: string
  officialWebsite: string
  colleges: string[]
  totalSeats: string
  eligibility: {
    education: string
    minimumMarks: string
    ageLimit: string
  }
  examPattern: {
    mode: string
    duration: string
    sections: string
    totalQuestions: number | null
    totalMarks: number | null
    markingScheme: string
  }
  difficultyLevel: string
  preparationTip: string
  avgPlacement: string
  highestPlacement: string
  approxFees: string
  location: string
  topBranches: string[]
  keyHighlights: string[]
  colorCode: 'high' | 'medium' | 'low'
  sources: string[]
  cycleYear?: number
  status?: 'active' | 'discontinued' | 'merged' | 'needs-review'
  verification?: {
    reviewedAt: string
    status: 'partial' | 'verified' | 'unverified'
    fields: Record<string, { checkedAt: string; sourceUrl: string; note?: string }>
    note: string
  }
}

export interface ExamsData {
  lastUpdated: string
  totalExams: number
  note: string
  exams: Exam[]
  generalTips: string[]
  estimatedBudget: {
    allExamFees: string
    recommendedExams: string
    travelCosts: string
  }
  dataSourcesCredits: string[]
}
