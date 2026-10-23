import ExamList from '@/components/ExamList'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import examsDataJson from '@/data/exams-data.json'
import type { ExamsData } from '@/types/exam'
import { siteName, siteUrl, siteDescription } from '@/lib/site'

// The prebuild validator checks this JSON's structure. TypeScript's JSON
// inference widens enum strings and adds optional keys to sparse evidence maps.
const examsData = examsDataJson as unknown as ExamsData

export default function Home() {
  // Describe the guide, without presenting exams as credentials for sale or
  // claiming that every stored profile is visible in the initial category.
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: siteName,
    description: siteDescription,
    url: siteUrl,
    inLanguage: 'en-IN',
    dateModified: examsData.lastUpdated,
    about: ['Engineering entrance exams', 'Medical entrance exams', 'Law entrance exams', 'Management entrance exams', 'Design entrance exams'],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1">
          <aside aria-label="About the exam information" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
              <strong>{examsData.exams.length} exam profiles, with admission cycles and source-review notes.</strong>{' '}
              Some profiles are historical or only partially checked. A source check applies to the named fields, not the entire profile.
              Confirm current dates, eligibility and fees on the official website before applying.
            </div>
          </aside>
          <ExamList exams={examsData.exams} />
        </main>
        <Footer lastUpdated={examsData.lastUpdated} />
      </div>
    </>
  )
}
