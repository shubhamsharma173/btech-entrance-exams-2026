import ExamList from '@/components/ExamList'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import examsDataJson from '@/data/exams-data.json'
import type { ExamsData } from '@/types/exam'

const examsData = examsDataJson as ExamsData

export default function Home() {
  // Add JSON-LD structured data for individual exams
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'B.Tech Entrance Exams 2026',
    description: 'Top 15 B.Tech entrance exams in India',
    numberOfItems: examsData.totalExams,
    itemListElement: examsData.exams.map((exam, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'EducationalOccupationalCredential',
        name: exam.name,
        description: exam.fullName,
        credentialCategory: 'Entrance Exam',
        url: exam.applyLink,
        educationalLevel: 'Higher Education',
        offers: {
          '@type': 'Offer',
          price: exam.applicationFee,
          priceCurrency: 'INR',
        },
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <ExamList exams={examsData.exams} />
        </main>
        <Footer />
      </div>
    </>
  )
}
