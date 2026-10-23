const configuredUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://entrance-exams.vercel.app')

if (!['https:', 'http:'].includes(configuredUrl.protocol) || configuredUrl.username || configuredUrl.password) {
  throw new Error('NEXT_PUBLIC_SITE_URL must be an HTTP(S) site URL without credentials')
}

export const siteUrl = configuredUrl.origin
export const siteName = 'Entrance Exam Guide'
export const siteDescription = 'Explore Indian entrance exam profiles across engineering, medical, law, management and design. Check admission cycles, dates, fees and source-review notes.'
