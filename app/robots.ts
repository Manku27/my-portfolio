import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://manku27.dev/sitemap.xml',
    host: 'https://manku27.dev',
  }
}
