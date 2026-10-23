import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'
import data from '@/data/exams-data.json'

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl, lastModified: new Date(`${data.lastUpdated}T00:00:00+05:30`), changeFrequency: 'weekly', priority: 1 }]
}
