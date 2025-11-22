# Guide de préparation pour la production

Ce document décrit toutes les fonctionnalités implémentées pour rendre l'application production-ready.

## 🎯 Niveau 1 - ESSENTIEL (Implémenté)

### 1. Gestion des erreurs

#### Error Boundaries

**Pages d'erreur:**
- `src/app/error.tsx` - Error boundary global pour toute l'application
- `src/app/(app)/error.tsx` - Error boundary spécifique à la section applicative
- `src/app/not-found.tsx` - Page 404 personnalisée

**Fonctionnalités:**
- ✅ Affichage visuel élégant des erreurs
- ✅ Bouton "Réessayer" pour relancer le composant
- ✅ Navigation vers la page d'accueil
- ✅ Affichage des détails techniques en mode développement
- ✅ Logging automatique des erreurs

**Usage:**
```tsx
// Les error boundaries capturent automatiquement les erreurs
// Aucun code supplémentaire nécessaire dans les composants
```

#### Page 404

**Fichier:** `src/app/not-found.tsx`

**Fonctionnalités:**
- Design cohérent avec l'application
- Bouton retour à l'accueil
- Bouton retour à la page précédente
- Message explicatif

**Déclenchement:**
```tsx
import { notFound } from 'next/navigation'

// Dans un composant ou une page
if (!data) {
  notFound() // Redirige vers la page 404
}
```

### 2. Système de notifications (Toast)

**Fichiers:**
- `src/components/ui/toast.tsx` - Composant Toast
- `src/contexts/toast-context.tsx` - Provider et hook

**Types de notifications:**
- ✅ Success (vert)
- ✅ Error (rouge)
- ✅ Info (bleu)
- ✅ Warning (orange)

**Usage:**
```tsx
import { useToast } from '@/contexts/toast-context'

function MyComponent() {
  const toast = useToast()

  const handleSuccess = () => {
    toast.success('Opération réussie', 'L\'animal a été ajouté')
  }

  const handleError = () => {
    toast.error('Erreur', 'Impossible de sauvegarder')
  }

  const handleInfo = () => {
    toast.info('Information', 'Nouvelle mise à jour disponible')
  }

  const handleWarning = () => {
    toast.warning('Attention', 'Cette action est irréversible')
  }

  // Toast personnalisé
  toast.toast({
    type: 'success',
    title: 'Titre',
    message: 'Message optionnel',
    duration: 5000 // 5 secondes (défaut)
  })
}
```

**Caractéristiques:**
- Auto-fermeture après 5 secondes (configurable)
- Fermeture manuelle avec bouton X
- Empilage automatique en haut à droite
- Animations d'entrée/sortie
- Support du dark mode

### 3. Logging centralisé

**Fichier:** `src/lib/utils/logger.ts`

**Niveaux de log:**
- `debug` - Informations de débogage (dev uniquement)
- `info` - Informations générales
- `warn` - Avertissements
- `error` - Erreurs

**Usage:**
```tsx
import { logger } from '@/lib/utils/logger'

// Log simple
logger.info('Utilisateur connecté')
logger.error('Erreur de connexion')

// Log avec contexte
logger.error('API error', {
  endpoint: '/api/animals',
  status: 500,
  error: error.message
})

// Log d'erreur HTTP
logger.httpError('POST', '/api/animals', 500, error)
```

**Fonctionnalités:**
- ✅ Format unifié des logs avec timestamp, environnement, côté (client/serveur)
- ✅ Filtrage par niveau selon l'environnement
- ✅ Ready pour intégration Sentry/LogRocket (commenté dans le code)
- ✅ Helpers pour wrapper les fonctions async

**Intégration future:**
```typescript
// Dans src/lib/utils/logger.ts, décommenter:

// Sentry
if (typeof window !== 'undefined' && window.Sentry) {
  Sentry.captureException(new Error(message), { extra: context })
}

// LogRocket
if (typeof window !== 'undefined' && window.LogRocket) {
  LogRocket.log(message, context)
}
```

### 4. Client API centralisé

**Fichier:** `src/lib/api/client.ts`

**Fonctionnalités:**
- ✅ URL backend configurable via env
- ✅ Ajout automatique du token JWT
- ✅ Logging automatique des requêtes
- ✅ Gestion des erreurs HTTP
- ✅ Timeout configurable (30s par défaut)
- ✅ Support upload de fichiers

**Configuration:**
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Usage:**
```tsx
import { apiClient, ApiError } from '@/lib/api/client'

// GET
const animals = await apiClient.get<Animal[]>('/api/animals')

// POST
const newAnimal = await apiClient.post<Animal>('/api/animals', {
  name: 'Vache 001',
  species: 'bovine'
})

// PUT
await apiClient.put(`/api/animals/${id}`, updatedData)

// DELETE
await apiClient.delete(`/api/animals/${id}`)

// Upload
await apiClient.upload('/api/animals/import', file, {
  format: 'csv'
})

// Gestion des erreurs
try {
  const data = await apiClient.get('/api/animals')
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status) // 404, 500, etc.
    console.log(error.data) // Corps de la réponse
  }
}
```

**Méthodes disponibles:**
- `get<T>(endpoint, options?)` - GET request
- `post<T>(endpoint, data?, options?)` - POST request
- `put<T>(endpoint, data?, options?)` - PUT request
- `patch<T>(endpoint, data?, options?)` - PATCH request
- `delete<T>(endpoint, options?)` - DELETE request
- `upload<T>(endpoint, file, additionalData?, options?)` - File upload

**Options:**
```typescript
{
  timeout: 10000,      // Timeout en ms (défaut: 30000)
  skipAuth: true,      // Ne pas ajouter le token JWT
  headers: { ... }     // Headers supplémentaires
}
```

### 5. Variables d'environnement

**Fichier de configuration:** `.env.local`

**Variables disponibles:**

```env
# Serveur
PORT=4000

# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3000

# Authentification
NEXT_PUBLIC_AUTH_ENABLED=false
NEXT_PUBLIC_KEYCLOAK_URL=
NEXT_PUBLIC_KEYCLOAK_REALM=
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=
```

**Template:** `.env.local.example` - À copier pour créer `.env.local`

## 📋 Checklist de déploiement

### Avant le déploiement

- [ ] Vérifier toutes les variables d'environnement
- [ ] Activer l'authentification (`NEXT_PUBLIC_AUTH_ENABLED=true`)
- [ ] Configurer l'URL de l'API de production
- [ ] Tester les error boundaries
- [ ] Tester les notifications
- [ ] Vérifier les logs

### Configuration production

**Variables à définir:**
```env
# Production
NODE_ENV=production
PORT=4000

# API
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com

# Auth
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_KEYCLOAK_URL=https://auth.votre-domaine.com
NEXT_PUBLIC_KEYCLOAK_REALM=production
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=web-app-prod
```

### Intégrations recommandées

**Monitoring des erreurs:**
1. **Sentry** - Tracking des erreurs
   ```bash
   npm install @sentry/nextjs
   ```
   Décommenter le code dans `src/lib/utils/logger.ts`

2. **LogRocket** - Session replay
   ```bash
   npm install logrocket
   ```

**Analytics:**
1. **Google Analytics**
2. **Plausible Analytics**
3. **Vercel Analytics**

## 🚀 Fonctionnalités implémentées

### ✅ Gestion d'erreur
- [x] Error boundaries (global + section)
- [x] Page 404 personnalisée
- [x] Logging centralisé des erreurs
- [x] Toast notifications
- [ ] Sentry (à intégrer)

### ✅ Configuration
- [x] Variables d'environnement pour l'API
- [x] Client API centralisé
- [x] Gestion des environnements (dev/staging/prod)

### ✅ Sécurité
- [x] Architecture auth centralisée
- [x] Middleware de protection des routes
- [x] Gestion des tokens JWT

### ✅ Developer Experience
- [x] TypeScript strict
- [x] Logging structuré
- [x] Error handling standardisé
- [x] Documentation complète

## 📊 Prochaines étapes (Niveau 2)

### Internationalisation (i18n)
- [ ] Installer next-intl ou react-i18next
- [ ] Extraire tous les textes en fichiers de traduction
- [ ] Support FR/AR
- [ ] Sélecteur de langue fonctionnel

### SEO
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] Meta tags optimisés
- [ ] Open Graph tags

### Performance
- [ ] Lazy loading des composants
- [ ] Optimisation des images
- [ ] Code splitting
- [ ] Cache stratégies

## 🧪 Tests

### Tester les error boundaries

```tsx
// Créer un composant qui throw une erreur
function ErrorTest() {
  throw new Error('Test error boundary')
}

// L'error boundary va l'attraper et afficher la page d'erreur
```

### Tester les notifications

```tsx
function NotificationTest() {
  const toast = useToast()

  return (
    <div>
      <button onClick={() => toast.success('Test', 'Success!')}>
        Test Success
      </button>
      <button onClick={() => toast.error('Test', 'Error!')}>
        Test Error
      </button>
    </div>
  )
}
```

### Tester l'API client

```tsx
// Mock l'API en dev
const mockAnimals = await apiClient.get('/api/animals')
console.log('Animals:', mockAnimals)
```

## 📖 Documentation

- **AUTHENTICATION.md** - Guide d'authentification
- **PRODUCTION-READY.md** - Ce fichier
- **.env.local.example** - Template de configuration

## 🔍 Debugging

### Vérifier les logs
```javascript
// Ouvrir la console du navigateur
// Les logs sont formatés: [timestamp] [ENV] [SIDE] [LEVEL] message
```

### Tester les erreurs
```javascript
// Forcer une erreur pour tester l'error boundary
throw new Error('Test error')
```

### Vérifier l'API
```javascript
// Voir les requêtes dans Network tab
// Vérifier les headers (Authorization, etc.)
```

## 💡 Best Practices

1. **Toujours utiliser apiClient** pour les requêtes API
2. **Toujours utiliser logger** au lieu de console.log/error
3. **Utiliser useToast** pour notifier l'utilisateur
4. **Tester les error boundaries** en dev
5. **Vérifier les variables d'env** avant chaque déploiement

## 🆘 Support

En cas de problème:
1. Vérifier les logs dans la console
2. Vérifier les variables d'environnement
3. Vérifier la documentation
4. Contacter l'équipe technique
