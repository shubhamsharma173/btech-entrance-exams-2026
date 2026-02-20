import type { Metadata } from 'next'
import './globals.css'

// SEO-optimized metadata
export const metadata: Metadata = {
  title: 'B.Tech Entrance Exams 2026 | Top 15 Engineering Exams Priority Guide',
  description: 'Complete guide to India\'s top 15 B.Tech entrance exams including BITSAT, VITEEE, SRMJEEE, and more. Compare deadlines, fees, placements, and make informed decisions for your engineering admission.',
  keywords: [
    'btech entrance exams 2026',
    'engineering entrance exams',
    'bitsat 2026',
    'viteee 2026',
    'srmjeee 2026',
    'comedk 2026',
    'manipal met 2026',
    'engineering admission',
    'entrance exam deadlines',
    'btech admission guide',
    'private engineering exams',
    'state engineering exams'
  ],
  authors: [{ name: 'B.Tech Exam Guide' }],
  creator: 'B.Tech Exam Guide',
  publisher: 'B.Tech Exam Guide',
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
    url: 'https://btech-entrance-exams.vercel.app',
    title: 'B.Tech Entrance Exams 2026 | Top 15 Engineering Exams Priority Guide',
    description: 'Complete guide to India\'s top 15 B.Tech entrance exams. Compare deadlines, fees, placements, and make informed decisions.',
    siteName: 'B.Tech Entrance Exams Guide',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'B.Tech Entrance Exams 2026 Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'B.Tech Entrance Exams 2026 | Top 15 Engineering Exams',
    description: 'Complete guide to India\'s top 15 B.Tech entrance exams with deadlines, fees, and placement data.',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'google-site-verification-code', // Will be added after Google Search Console setup
  },
  alternates: {
    canonical: 'https://btech-entrance-exams.vercel.app',
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
              name: 'B.Tech Entrance Exams Guide',
              description: 'Comprehensive guide for B.Tech entrance exam preparation and application',
              url: 'https://btech-entrance-exams.vercel.app',
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
