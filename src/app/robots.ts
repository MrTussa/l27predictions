const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default function robots() {
  return {
    host: baseUrl,
    rules: [
      {
        userAgent: '*',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
