import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://btech-entrance-exams.vercel.app'

  return [
    {
      url: baseUrl,
      lastModified: new Date('2026-02-18'),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
}
