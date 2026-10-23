import type { Metadata } from 'next'
import { siteUrl, siteName, siteDescription } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${siteName} | Engineering, Medical, Law, Management & Design`,
  description: siteDescription,
  keywords: ['Indian entrance exams', 'engineering admissions', 'medical admissions', 'law admissions', 'management admissions', 'design admissions'],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  icons: { icon: '/favicon.svg' },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: { type: 'website', locale: 'en_IN', url: '/', title: siteName, description: siteDescription, siteName },
  twitter: { card: 'summary_large_image', title: siteName, description: siteDescription },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-white focus:p-3 focus:text-blue-800">
          Skip to exam guide
        </a>
        {children}
      </body>
    </html>
  )
}
