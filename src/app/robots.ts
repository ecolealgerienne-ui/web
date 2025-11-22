import { MetadataRoute } from 'next'

/**
 * Robots.txt dynamique pour contrôler l'indexation des moteurs de recherche
 *
 * Accessible sur: https://votre-domaine.com/robots.txt
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/animals/',
          '/lots/',
          '/vaccinations/',
          '/treatments/',
          '/reports/',
          '/settings/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
