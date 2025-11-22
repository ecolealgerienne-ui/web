import { Metadata } from 'next'

const SITE_NAME = 'AniTra'
const SITE_DESCRIPTION = 'Application de gestion complète pour éleveurs: suivi des animaux, vaccinations, traitements, rapports et bien plus.'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000'
const SITE_KEYWORDS = [
  'gestion élevage',
  'suivi animaux',
  'vaccination animaux',
  'traitement vétérinaire',
  'élevage bovin',
  'gestion cheptel',
  'traçabilité animale',
  'logiciel ferme',
  'agriculture',
  'Algérie'
]

export interface PageMetadataProps {
  title?: string
  description?: string
  keywords?: string[]
  path?: string
  image?: string
  noIndex?: boolean
}

export function createMetadata({
  title,
  description = SITE_DESCRIPTION,
  keywords = [],
  path = '',
  image = `${SITE_URL}/og-image.png`,
  noIndex = false,
}: PageMetadataProps = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const url = `${SITE_URL}${path}`
  const allKeywords = [...SITE_KEYWORDS, ...keywords]

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: 'École Algérienne' }],
    creator: 'École Algérienne',
    publisher: 'École Algérienne',
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',

    // Open Graph
    openGraph: {
      type: 'website',
      locale: 'fr_DZ',
      url,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },

    // Viewport
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
    },

    // Icons
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },

    // Manifest
    manifest: '/manifest.json',
  }
}

// Meta données par défaut pour le site
export const defaultMetadata = createMetadata()
