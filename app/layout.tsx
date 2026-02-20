import type { Metadata } from 'next'
import './globals.css'

// SEO-optimized metadata
export const metadata: Metadata = {
  title: 'Entrance Exams 2026 | Engineering, Medical, Law, Management & Design Guide',
  description: 'Complete guide to entrance exams 2026 in India. Engineering (JEE, BITSAT), Medical (NEET), Law (CLAT), Management (CAT, XAT), Design (UCEED, NID). Compare dates, fees, eligibility.',
  keywords: [
    'entrance exams 2026',
    'engineering entrance exams',
    'medical entrance exams',
    'neet 2026',
    'jee main 2026',
    'bitsat 2026',
    'clat 2026',
    'cat 2026',
    'uceed 2026',
    'law entrance exams',
    'management entrance exams',
    'design entrance exams',
    'entrance exam deadlines',
    'admission guide 2026'
  ],
  authors: [{ name: 'Entrance Exams Guide' }],
  creator: 'Entrance Exams Guide',
  publisher: 'Entrance Exams Guide',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://entrance-exams.vercel.app',
    title: 'Entrance Exams 2026 | Engineering, Medical, Law, Management & Design',
    description: 'Complete guide to entrance exams 2026 in India across Engineering, Medical, Law, Management and Design streams.',
    siteName: 'Entrance Exams Guide 2026',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Entrance Exams 2026 Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Entrance Exams 2026 | Engineering, Medical, Law, Management & Design',
    description: 'Complete guide to entrance exams 2026 in India - NEET, JEE, CLAT, CAT, UCEED & more.',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'google-site-verification-code', // Will be added after Google Search Console setup
  },
  alternates: {
    canonical: 'https://entrance-exams.vercel.app',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'Entrance Exams Guide 2026',
              description: 'Comprehensive guide for entrance exam preparation and application across Engineering, Medical, Law, Management and Design streams',
              url: 'https://entrance-exams.vercel.app',
              educationalLevel: 'Higher Education',
              areaServed: 'IN',
              audience: {
                '@type': 'EducationalAudience',
                educationalRole: 'student',
              },
            }),
          }}
        />
      </head>
      <body className="antialiased bg-slate-50" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
