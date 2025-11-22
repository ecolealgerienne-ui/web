# Guide SEO & Performance

Ce document explique toutes les optimisations SEO et performance implémentées dans l'application.

## 🔍 SEO (Optimisation pour les moteurs de recherche)

### 1. Sitemap.xml

**Fichier:** `src/app/sitemap.ts`

Le sitemap est généré automatiquement et accessible sur `/sitemap.xml`.

**Pages incluses:**
- Page d'accueil (/)
- Login (/login)
- Dashboard (/dashboard)
- Animaux (/animals)
- Lots (/lots)
- Vaccinations (/vaccinations)
- Traitements (/treatments)
- Rapports (/reports)
- Paramètres (/settings)

**Configuration:**
```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // ...
  ]
}
```

**Tester:**
```bash
curl http://localhost:4000/sitemap.xml
```

### 2. Robots.txt

**Fichier:** `src/app/robots.ts`

Le fichier robots.txt est généré dynamiquement et accessible sur `/robots.txt`.

**Configuration:**
```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', ...], // Pages privées
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
```

**Comportement:**
- ✅ Autorise l'indexation de la page d'accueil
- ❌ Bloque l'indexation des pages protégées (dashboard, etc.)
- 📍 Référence le sitemap.xml

### 3. Meta Tags & Open Graph

**Fichier:** `src/lib/utils/metadata.ts`

Système centralisé pour gérer les meta tags de toutes les pages.

**Usage dans une page:**
```typescript
import { createMetadata } from '@/lib/utils/metadata'

export const metadata = createMetadata({
  title: 'Gestion des Animaux',
  description: 'Suivez et gérez tous vos animaux',
  keywords: ['élevage', 'animaux', 'suivi'],
  path: '/animals',
  image: '/images/animals-og.png',
})
```

**Meta tags générés:**
- Title et description
- Keywords SEO
- Open Graph (Facebook, LinkedIn)
- Twitter Card
- Favicon et manifest
- Viewport et responsive

**Exemple de méta données générées:**
```html
<meta name="title" content="Gestion des Animaux | AniTra" />
<meta name="description" content="Suivez et gérez tous vos animaux" />
<meta name="keywords" content="gestion élevage, suivi animaux, ..." />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://example.com/animals" />
<meta property="og:title" content="Gestion des Animaux | AniTra" />
<meta property="og:description" content="Suivez..." />
<meta property="og:image" content="https://example.com/images/animals-og.png" />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:title" content="Gestion des Animaux | AniTra" />
```

### 4. Variables d'environnement SEO

**.env.local:**
```env
# URL du site pour SEO
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com
```

**Utilisé dans:**
- Sitemap.xml
- Robots.txt
- Open Graph URLs
- Meta tags canoniques

## ⚡ Performance

### 1. Lazy Loading

**Fichier:** `src/lib/utils/lazy.tsx`

Système de lazy loading pour charger les composants lourds uniquement quand nécessaire.

**Usage basique:**
```tsx
import { lazy } from '@/lib/utils/lazy'

// Lazy load d'un composant
const HeavyChart = lazy(() => import('./components/HeavyChart'))

function MyPage() {
  return (
    <div>
      <h1>Ma Page</h1>
      <HeavyChart data={data} /> {/* Chargé uniquement quand visible */}
    </div>
  )
}
```

**Avec skeleton personnalisé:**
```tsx
import { lazy, ChartSkeleton } from '@/lib/utils/lazy'

const HeavyChart = lazy(
  () => import('./components/HeavyChart'),
  { fallback: <ChartSkeleton height={400} /> }
)
```

**Skeletons disponibles:**
- `<ComponentSkeleton />` - Skeleton générique
- `<TableSkeleton rows={5} />` - Pour les tableaux
- `<CardSkeleton />` - Pour les cartes
- `<ChartSkeleton height={300} />` - Pour les graphiques

**Quand utiliser le lazy loading:**
- ✅ Composants de graphiques (recharts, etc.)
- ✅ Éditeurs riches (WYSIWYG)
- ✅ Composants lourds avec beaucoup de dépendances
- ✅ Modal/Dialog non critiques
- ❌ Composants du header/footer
- ❌ Composants critiques above-the-fold

### 2. Optimisation des images

**Next.js Image:**
```tsx
import Image from 'next/image'

// Optimisé automatiquement
<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // Pour les images above-the-fold
  loading="lazy" // Pour les autres images
/>
```

**Avantages:**
- Lazy loading automatique
- Formats modernes (WebP, AVIF)
- Responsive images
- Placeholder blur

### 3. Code Splitting

Next.js fait du code splitting automatiquement:
- Chaque page est un bundle séparé
- Les imports dynamiques créent des chunks
- Les librairies communes sont dans un chunk partagé

**Vérifier les bundles:**
```bash
npm run build
# Analyser le rapport de build
```

### 4. Prefetching

Next.js prefetch automatiquement les pages liées:

```tsx
import Link from 'next/link'

// Prefetch automatique au hover
<Link href="/animals" prefetch>
  Animaux
</Link>
```

## 📊 Monitoring des performances

### Web Vitals

Next.js track automatiquement les Web Vitals:
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)

**Voir les metrics en dev:**
```bash
npm run dev
# Ouvrir http://localhost:4000
# Ouvrir DevTools > Network > Disable cache
```

### Lighthouse

```bash
# Installer Lighthouse CLI
npm install -g lighthouse

# Analyser la production
lighthouse https://votre-domaine.com --view
```

**Objectifs:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

## 🚀 Checklist de déploiement SEO

### Avant le déploiement

- [ ] Configurer `NEXT_PUBLIC_SITE_URL` avec l'URL de production
- [ ] Vérifier que sitemap.xml est accessible
- [ ] Vérifier que robots.txt est configuré
- [ ] Ajouter les méta tags sur toutes les pages
- [ ] Créer les images Open Graph (1200x630px)
- [ ] Tester les previews sur:
  - [ ] Facebook Sharing Debugger
  - [ ] Twitter Card Validator
  - [ ] LinkedIn Post Inspector

### Après le déploiement

- [ ] Soumettre le sitemap à Google Search Console
- [ ] Soumettre le sitemap à Bing Webmaster Tools
- [ ] Vérifier l'indexation avec `site:votre-domaine.com`
- [ ] Configurer Google Analytics
- [ ] Configurer un outil de monitoring (Vercel Analytics, etc.)

## 📝 Best Practices

### SEO

1. **Titles:**
   - Max 60 caractères
   - Inclure le mot-clé principal
   - Format: "Page Title | Site Name"

2. **Descriptions:**
   - Max 160 caractères
   - Inclure un appel à l'action
   - Unique pour chaque page

3. **Images:**
   - Toujours ajouter un attribut `alt`
   - Optimiser la taille (< 200KB)
   - Utiliser des formats modernes (WebP)

4. **URLs:**
   - Courtes et descriptives
   - Utiliser des tirets (-)
   - Éviter les paramètres GET

### Performance

1. **Lazy Loading:**
   - Lazy load tout ce qui n'est pas critique
   - Utiliser des skeletons pour le UX

2. **Fonts:**
   - Utiliser `next/font` pour l'optimisation
   - Limiter le nombre de polices
   - Subset les caractères si possible

3. **Bundle Size:**
   - Surveiller la taille des bundles
   - Éviter les grosses librairies
   - Tree-shaking pour éliminer le code mort

4. **Caching:**
   - Configurer les headers de cache
   - Utiliser un CDN pour les assets
   - ISR pour les pages statiques

## 🛠️ Outils recommandés

### SEO

- **Google Search Console** - Monitoring de l'indexation
- **Screaming Frog** - Audit SEO complet
- **Ahrefs/SEMrush** - Analyse de mots-clés
- **Schema.org** - Structured data

### Performance

- **Lighthouse** - Audit de performance
- **WebPageTest** - Test de vitesse
- **Bundle Analyzer** - Analyse des bundles
- **Vercel Analytics** - Real User Monitoring

## 📚 Ressources

- [Next.js SEO](https://nextjs.org/learn/seo/introduction-to-seo)
- [Web.dev Performance](https://web.dev/performance/)
- [Google Search Central](https://developers.google.com/search)
- [Core Web Vitals](https://web.dev/vitals/)

## 🔧 Configuration avancée

### Structured Data (Schema.org)

Pour ajouter des données structurées:

```typescript
// src/app/animals/[id]/page.tsx
export async function generateMetadata({ params }) {
  const animal = await getAnimal(params.id)

  return {
    ...otherMetadata,
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: animal.name,
        description: animal.description,
        // ...
      })
    }
  }
}
```

### Canonical URLs

```typescript
export const metadata = {
  alternates: {
    canonical: 'https://votre-domaine.com/animals',
  },
}
```

### Multilingual SEO (pour plus tard avec i18n)

```typescript
export const metadata = {
  alternates: {
    languages: {
      'fr-DZ': 'https://votre-domaine.com/fr/animals',
      'ar-DZ': 'https://votre-domaine.com/ar/animals',
    },
  },
}
```

## ✅ État actuel

### Implémenté ✅
- [x] Sitemap.xml dynamique
- [x] Robots.txt dynamique
- [x] Meta tags complets (title, description, keywords)
- [x] Open Graph tags
- [x] Twitter Card
- [x] Système de lazy loading
- [x] Skeletons de chargement
- [x] Variable d'environnement SITE_URL

### À implémenter ⏳
- [ ] Images Open Graph personnalisées par page
- [ ] Structured data (Schema.org)
- [ ] PWA manifest complet
- [ ] Service Worker pour le cache
- [ ] Image optimization complète
- [ ] Internationalisation (i18n) avec SEO multilingue

### À configurer en production 🚀
- [ ] Google Search Console
- [ ] Google Analytics
- [ ] Vercel Analytics ou similaire
- [ ] CDN pour les assets
- [ ] Monitoring des erreurs (Sentry)
