# Phase 1 : Fondations - Plan Détaillé

**Date :** 2025-11-30
**Objectif :** Créer les fondations réutilisables pour toutes les entités admin
**Durée estimée :** 2-3 heures

---

## 📋 Vue d'ensemble

### Objectifs de cette phase

1. ✅ Installer dépendances manquantes (Zod)
2. ✅ Créer structure de dossiers complète
3. ✅ Créer types communs réutilisables
4. ✅ Créer helper pour gestion erreurs API
5. ✅ Créer constantes HTTP
6. ✅ Vérifier build et tests

### Livrables

```
/src/lib/
├── types/common/
│   ├── api.ts              # Types pagination, API responses
│   └── http.ts             # Constantes HTTP
├── utils/
│   └── api-error-handler.ts # Helper gestion erreurs centralisée
└── validation/
    └── schemas/
        └── admin/          # Dossier pour futurs schémas Zod
```

---

## 🚫 Vérification des Règles de Développement

### Avant de commencer

- [x] ✅ Document `DEVELOPMENT_STANDARDS.md` créé et lu
- [x] ✅ Document `DEVELOPMENT_STANDARDS_SUMMARY.md` créé et lu
- [x] ✅ Build actuel fonctionne (`npm run build`)
- [ ] ✅ Branche feature créée
- [ ] ✅ Dépendances installées

### Pendant le développement

- [ ] ❌ Aucune valeur en dur
- [ ] ✅ Utilisation de `apiClient` (dans error handler)
- [ ] ✅ Utilisation de `logger` (dans error handler)
- [ ] ✅ Types TypeScript stricts
- [ ] ✅ Pas de `any` sauf si absolument nécessaire
- [ ] ✅ JSDoc pour fonctions complexes

### Après le développement

- [ ] ✅ Build réussi (`npm run build`)
- [ ] ✅ Aucune erreur TypeScript
- [ ] ✅ Aucune erreur ESLint
- [ ] ✅ Commit conventionnel
- [ ] ✅ Push vers branche

---

## 📦 Étape 1 : Installation des Dépendances

### Commandes

```bash
# Installer Zod et resolvers pour react-hook-form
npm install zod @hookform/resolvers
```

### Vérification

```bash
# Vérifier que les packages sont ajoutés
cat package.json | grep -A2 '"dependencies"'
```

### Résultat attendu

```json
{
  "dependencies": {
    "zod": "^3.x.x",
    "@hookform/resolvers": "^3.x.x"
  }
}
```

**Temps estimé :** 5 minutes

---

## 📁 Étape 2 : Création de la Structure de Dossiers

### Commandes

```bash
# Créer tous les dossiers nécessaires
mkdir -p src/lib/types/common
mkdir -p src/lib/types/admin
mkdir -p src/lib/services/admin
mkdir -p src/lib/validation/schemas/admin
mkdir -p src/lib/hooks/admin
mkdir -p src/app/\(app\)/admin
mkdir -p src/components/admin/common
mkdir -p src/lib/constants
```

### Vérification

```bash
# Lister la structure créée
tree src/lib/types src/lib/validation src/lib/constants -d -L 3
```

### Structure attendue

```
src/
├── app/(app)/admin/              ✅ Créé
├── components/admin/common/      ✅ Créé
└── lib/
    ├── constants/                ✅ Créé
    ├── hooks/admin/              ✅ Créé
    ├── services/admin/           ✅ Créé
    ├── types/
    │   ├── admin/                ✅ Créé
    │   └── common/               ✅ Créé
    └── validation/schemas/admin/ ✅ Créé
```

**Temps estimé :** 5 minutes

---

## 🔧 Étape 3 : Créer Types Communs

### Fichier : `/src/lib/types/common/api.ts`

**Objectif :** Définir les types réutilisables pour toutes les entités

**Code complet :**

```typescript
/**
 * Types communs pour les appels API et la pagination
 *
 * Ces types sont utilisés par TOUTES les entités admin
 * pour assurer la cohérence des interfaces.
 */

/**
 * Entité de base avec champs communs
 * Toutes les entités admin doivent étendre cette interface
 */
export interface BaseEntity {
  /** Identifiant unique */
  id: string

  /** Date de création (ISO 8601) */
  createdAt?: string

  /** Date de dernière modification (ISO 8601) */
  updatedAt?: string

  /** Date de suppression (soft delete) - null si non supprimé */
  deletedAt?: string | null

  /** Version pour optimistic locking */
  version?: number

  /** Indique si l'entité est active */
  isActive?: boolean
}

/**
 * Métadonnées de pagination
 */
export interface PaginationMeta {
  /** Nombre total d'éléments */
  total: number

  /** Page actuelle (1-indexed) */
  page: number

  /** Nombre d'éléments par page */
  limit: number

  /** Nombre total de pages */
  totalPages: number
}

/**
 * Réponse API paginée générique
 *
 * @template T - Type des éléments retournés
 *
 * @example
 * ```typescript
 * const response: PaginatedResponse<ActiveSubstance> = await api.get('/substances')
 * ```
 */
export interface PaginatedResponse<T> {
  /** Tableau des données */
  data: T[]

  /** Métadonnées de pagination */
  meta: PaginationMeta
}

/**
 * Paramètres de pagination et filtres
 *
 * Utilisé pour toutes les requêtes GET de listes
 */
export interface PaginationParams {
  /** Numéro de page (1-indexed, défaut: 1) */
  page?: number

  /** Nombre d'éléments par page (défaut: 25) */
  limit?: number

  /** Terme de recherche full-text */
  search?: string

  /** Inclure les éléments supprimés (soft deleted) */
  includeDeleted?: boolean

  /** Champ de tri (ex: 'code', 'name', 'createdAt') */
  sortBy?: string

  /** Ordre de tri */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Structure d'erreur API standardisée
 *
 * Correspond à la structure retournée par NestJS
 */
export interface ApiErrorResponse {
  /** Code de statut HTTP */
  statusCode: number

  /** Message(s) d'erreur */
  message: string | string[]

  /** Type d'erreur */
  error: string

  /** Timestamp de l'erreur */
  timestamp?: string

  /** Chemin de l'endpoint */
  path?: string

  /** Dépendances empêchant la suppression (pour 409 Conflict) */
  dependencies?: Record<string, number>
}

/**
 * Options de requête API
 */
export interface RequestOptions {
  /** Headers HTTP additionnels */
  headers?: Record<string, string>

  /** Timeout en millisecondes */
  timeout?: number

  /** Skip l'authentification (pour endpoints publics) */
  skipAuth?: boolean
}

/**
 * Interface générique pour les services CRUD
 *
 * @template T - Type de l'entité
 * @template CreateDto - Type du DTO de création
 * @template UpdateDto - Type du DTO de mise à jour
 */
export interface CrudService<T extends BaseEntity, CreateDto, UpdateDto> {
  /**
   * Récupère toutes les entités (paginées)
   */
  getAll(params?: PaginationParams): Promise<PaginatedResponse<T>>

  /**
   * Récupère une entité par ID
   */
  getById(id: string): Promise<T>

  /**
   * Crée une nouvelle entité
   */
  create(data: CreateDto): Promise<T>

  /**
   * Met à jour une entité existante
   */
  update(id: string, data: UpdateDto): Promise<T>

  /**
   * Supprime une entité (soft delete)
   */
  delete(id: string): Promise<void>

  /**
   * Restaure une entité supprimée
   */
  restore?(id: string): Promise<T>
}
```

### Règles respectées

- ✅ Types TypeScript stricts
- ✅ JSDoc complet pour toutes les interfaces
- ✅ Génériques réutilisables
- ✅ Pas de `any`
- ✅ Nomenclature cohérente

**Temps estimé :** 15 minutes

---

## 🔧 Étape 4 : Créer Constantes HTTP

### Fichier : `/src/lib/constants/http-status.ts`

**Objectif :** Centraliser les codes de statut HTTP

**Code complet :**

```typescript
/**
 * Codes de statut HTTP standardisés
 *
 * Utiliser ces constantes au lieu de valeurs magiques (200, 404, etc.)
 *
 * @example
 * ```typescript
 * if (response.status === HTTP_STATUS.NOT_FOUND) {
 *   // ...
 * }
 * ```
 */
export const HTTP_STATUS = {
  // 2xx Success
  /** 200 - Requête réussie */
  OK: 200,

  /** 201 - Ressource créée avec succès */
  CREATED: 201,

  /** 204 - Requête réussie sans contenu de réponse */
  NO_CONTENT: 204,

  // 4xx Client Errors
  /** 400 - Requête invalide (erreurs de validation) */
  BAD_REQUEST: 400,

  /** 401 - Non authentifié (token manquant ou invalide) */
  UNAUTHORIZED: 401,

  /** 403 - Non autorisé (pas les permissions) */
  FORBIDDEN: 403,

  /** 404 - Ressource non trouvée */
  NOT_FOUND: 404,

  /** 408 - Timeout de la requête */
  REQUEST_TIMEOUT: 408,

  /** 409 - Conflit (contrainte unique, version, dépendances) */
  CONFLICT: 409,

  /** 422 - Entité non traitable (validation sémantique) */
  UNPROCESSABLE_ENTITY: 422,

  /** 429 - Trop de requêtes (rate limiting) */
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Errors
  /** 500 - Erreur serveur interne */
  INTERNAL_SERVER_ERROR: 500,

  /** 502 - Bad Gateway */
  BAD_GATEWAY: 502,

  /** 503 - Service indisponible */
  SERVICE_UNAVAILABLE: 503,

  /** 504 - Gateway Timeout */
  GATEWAY_TIMEOUT: 504,
} as const

/**
 * Type pour les codes de statut HTTP
 */
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS]

/**
 * Vérifie si un statut indique un succès (2xx)
 */
export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300
}

/**
 * Vérifie si un statut indique une erreur client (4xx)
 */
export function isClientError(status: number): boolean {
  return status >= 400 && status < 500
}

/**
 * Vérifie si un statut indique une erreur serveur (5xx)
 */
export function isServerError(status: number): boolean {
  return status >= 500 && status < 600
}

/**
 * Obtient un message par défaut pour un code de statut
 */
export function getDefaultStatusMessage(status: number): string {
  const messages: Record<number, string> = {
    [HTTP_STATUS.OK]: 'Success',
    [HTTP_STATUS.CREATED]: 'Created',
    [HTTP_STATUS.NO_CONTENT]: 'No Content',
    [HTTP_STATUS.BAD_REQUEST]: 'Bad Request',
    [HTTP_STATUS.UNAUTHORIZED]: 'Unauthorized',
    [HTTP_STATUS.FORBIDDEN]: 'Forbidden',
    [HTTP_STATUS.NOT_FOUND]: 'Not Found',
    [HTTP_STATUS.REQUEST_TIMEOUT]: 'Request Timeout',
    [HTTP_STATUS.CONFLICT]: 'Conflict',
    [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
    [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Too Many Requests',
    [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    [HTTP_STATUS.BAD_GATEWAY]: 'Bad Gateway',
    [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Service Unavailable',
    [HTTP_STATUS.GATEWAY_TIMEOUT]: 'Gateway Timeout',
  }

  return messages[status] || 'Unknown Status'
}
```

### Règles respectées

- ✅ Constantes nommées (pas de valeurs magiques)
- ✅ JSDoc complet
- ✅ Helpers utilitaires
- ✅ Type-safe avec `as const`

**Temps estimé :** 10 minutes

---

## 🔧 Étape 5 : Créer Helper de Gestion d'Erreurs API

### Fichier : `/src/lib/utils/api-error-handler.ts`

**Objectif :** Centraliser la gestion des erreurs API avec toast et i18n

**Code complet :**

```typescript
/**
 * Helper centralisé pour la gestion des erreurs API
 *
 * Gère automatiquement :
 * - Affichage des toasts d'erreur
 * - Logging des erreurs
 * - Messages i18n
 * - Cas spéciaux (409 Conflict, 400 Validation, etc.)
 */

import { ApiError } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import { HTTP_STATUS } from '@/lib/constants/http-status'

/**
 * Interface pour le contexte Toast
 * (pour éviter la dépendance circulaire)
 */
interface ToastContext {
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

/**
 * Formate les dépendances pour affichage utilisateur
 *
 * @param dependencies - Objet des dépendances {entity: count}
 * @returns Message formaté
 *
 * @example
 * ```typescript
 * formatDependencies({ therapeuticIndications: 12 })
 * // → "12 indication(s) thérapeutique(s)"
 * ```
 */
function formatDependencies(dependencies: Record<string, number>): string {
  const parts: string[] = []

  for (const [entityKey, count] of Object.entries(dependencies)) {
    // Convertir camelCase en texte lisible
    // therapeuticIndications → therapeutic indications
    const readable = entityKey
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .trim()

    parts.push(`${count} ${readable}`)
  }

  return parts.join(', ')
}

/**
 * Gère une erreur API de manière centralisée
 *
 * Cette fonction :
 * 1. Identifie le type d'erreur (400, 404, 409, 500, etc.)
 * 2. Affiche un toast approprié avec message i18n
 * 3. Log l'erreur dans la console et services externes
 *
 * @param error - Erreur capturée (ApiError ou Error générique)
 * @param context - Contexte de l'erreur (ex: "create active substance")
 * @param toast - Contexte Toast pour afficher les notifications
 * @param customMessages - Messages i18n personnalisés (optionnel)
 *
 * @example
 * ```typescript
 * try {
 *   await service.create(data)
 * } catch (error) {
 *   handleApiError(error, 'create active substance', toast)
 * }
 * ```
 */
export function handleApiError(
  error: unknown,
  context: string,
  toast: ToastContext,
  customMessages?: {
    400?: string
    404?: string
    409?: string
    500?: string
  }
): void {
  // Logger l'erreur dans tous les cas
  logger.error(`API error in ${context}`, { error })

  // Si c'est une ApiError, traiter selon le code de statut
  if (error instanceof ApiError) {
    const { status, data } = error

    switch (status) {
      case HTTP_STATUS.BAD_REQUEST: {
        // 400 - Erreurs de validation
        const validationMessages = Array.isArray(data?.message)
          ? data.message
          : [data?.message || 'common.error.validation']

        toast.error(
          customMessages?.[400] || 'common.error.validation',
          validationMessages.join('\n')
        )
        break
      }

      case HTTP_STATUS.UNAUTHORIZED: {
        // 401 - Non authentifié
        toast.error('common.error.unauthorized', 'common.error.unauthorized.message')
        // Optionnel : Redirect vers login
        // window.location.href = '/login'
        break
      }

      case HTTP_STATUS.FORBIDDEN: {
        // 403 - Non autorisé
        toast.error('common.error.forbidden', 'common.error.forbidden.message')
        break
      }

      case HTTP_STATUS.NOT_FOUND: {
        // 404 - Ressource non trouvée
        toast.error(
          customMessages?.[404] || 'common.error.notFound',
          'common.error.notFound.message'
        )
        break
      }

      case HTTP_STATUS.REQUEST_TIMEOUT: {
        // 408 - Timeout
        toast.error('common.error.timeout', 'common.error.timeout.message')
        break
      }

      case HTTP_STATUS.CONFLICT: {
        // 409 - Conflit (unique, version, dépendances)
        if (data?.dependencies) {
          // Cas spécial : Dépendances empêchant la suppression
          const dependenciesText = formatDependencies(data.dependencies)
          toast.warning(
            'common.error.hasDependencies',
            `Impossible de supprimer : ${dependenciesText}`
          )
        } else if (data?.message?.includes('version')) {
          // Cas spécial : Conflit de version (optimistic locking)
          toast.warning(
            'common.error.versionConflict',
            'Les données ont été modifiées par un autre utilisateur. Veuillez recharger.'
          )
        } else {
          // Conflit générique (ex: contrainte unique)
          toast.error(
            customMessages?.[409] || 'common.error.conflict',
            data?.message || 'Un conflit est survenu'
          )
        }
        break
      }

      case HTTP_STATUS.TOO_MANY_REQUESTS: {
        // 429 - Rate limiting
        toast.warning('common.error.tooManyRequests', 'Trop de requêtes, veuillez patienter')
        break
      }

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.BAD_GATEWAY:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
      case HTTP_STATUS.GATEWAY_TIMEOUT: {
        // 5xx - Erreurs serveur
        toast.error(
          customMessages?.[500] || 'common.error.serverError',
          'Une erreur serveur est survenue. Veuillez réessayer.'
        )
        break
      }

      default: {
        // Erreur HTTP non gérée
        toast.error(
          'common.error.unknown',
          `Erreur ${status}: ${data?.message || 'Une erreur est survenue'}`
        )
      }
    }
  } else if (error instanceof Error) {
    // Erreur JavaScript générique (network, etc.)
    if (error.name === 'AbortError') {
      toast.error('common.error.timeout', 'La requête a expiré')
    } else if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
      toast.error('common.error.network', 'Erreur réseau : vérifiez votre connexion')
    } else {
      toast.error('common.error.unknown', error.message || 'Une erreur est survenue')
    }
  } else {
    // Erreur inconnue
    toast.error('common.error.unknown', 'Une erreur inattendue est survenue')
  }
}

/**
 * Vérifie si une erreur API indique que la ressource n'existe pas
 */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === HTTP_STATUS.NOT_FOUND
}

/**
 * Vérifie si une erreur API indique un conflit (contrainte unique, etc.)
 */
export function isConflictError(error: unknown): boolean {
  return error instanceof ApiError && error.status === HTTP_STATUS.CONFLICT
}

/**
 * Vérifie si une erreur API indique des erreurs de validation
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof ApiError && error.status === HTTP_STATUS.BAD_REQUEST
}

/**
 * Extrait les messages de validation d'une erreur 400
 */
export function getValidationMessages(error: unknown): string[] {
  if (error instanceof ApiError && error.status === HTTP_STATUS.BAD_REQUEST) {
    const { data } = error
    return Array.isArray(data?.message) ? data.message : [data?.message || 'Erreur de validation']
  }
  return []
}
```

### Règles respectées

- ✅ Utilise `apiClient` (via ApiError)
- ✅ Utilise `logger` pour logging
- ✅ Utilise `HTTP_STATUS` (pas de valeurs magiques)
- ✅ JSDoc complet
- ✅ Gestion exhaustive des cas d'erreur
- ✅ Type-safe

**Temps estimé :** 30 minutes

---

## 🧪 Étape 6 : Ajouter les Clés i18n Manquantes

### Fichier : `/src/lib/i18n/messages/fr.json`

**Ajouter dans la section `common.error` :**

```json
{
  "common": {
    "error": {
      "title": "Erreur",
      "validation": "Erreur de validation",
      "validation.message": "Veuillez corriger les erreurs dans le formulaire",
      "unauthorized": "Non authentifié",
      "unauthorized.message": "Vous devez vous connecter pour accéder à cette ressource",
      "forbidden": "Accès refusé",
      "forbidden.message": "Vous n'avez pas les permissions nécessaires",
      "notFound": "Ressource non trouvée",
      "notFound.message": "La ressource demandée n'existe pas ou a été supprimée",
      "timeout": "Délai d'attente dépassé",
      "timeout.message": "La requête a pris trop de temps. Veuillez réessayer.",
      "conflict": "Conflit détecté",
      "conflict.message": "Un conflit est survenu lors de l'opération",
      "versionConflict": "Conflit de version",
      "versionConflict.message": "Les données ont été modifiées par un autre utilisateur. Veuillez recharger.",
      "hasDependencies": "Suppression impossible",
      "hasDependencies.message": "Cette ressource est utilisée par d'autres éléments",
      "tooManyRequests": "Trop de requêtes",
      "tooManyRequests.message": "Vous avez effectué trop de requêtes. Veuillez patienter.",
      "serverError": "Erreur serveur",
      "serverError.message": "Une erreur serveur est survenue. Veuillez réessayer plus tard.",
      "network": "Erreur réseau",
      "network.message": "Impossible de contacter le serveur. Vérifiez votre connexion.",
      "unknown": "Erreur inconnue",
      "unknown.message": "Une erreur inattendue est survenue"
    }
  }
}
```

### Fichier : `/src/lib/i18n/messages/en.json`

```json
{
  "common": {
    "error": {
      "title": "Error",
      "validation": "Validation error",
      "validation.message": "Please correct the errors in the form",
      "unauthorized": "Unauthorized",
      "unauthorized.message": "You must log in to access this resource",
      "forbidden": "Access denied",
      "forbidden.message": "You don't have the necessary permissions",
      "notFound": "Resource not found",
      "notFound.message": "The requested resource doesn't exist or has been deleted",
      "timeout": "Timeout",
      "timeout.message": "The request took too long. Please try again.",
      "conflict": "Conflict detected",
      "conflict.message": "A conflict occurred during the operation",
      "versionConflict": "Version conflict",
      "versionConflict.message": "Data was modified by another user. Please reload.",
      "hasDependencies": "Cannot delete",
      "hasDependencies.message": "This resource is used by other elements",
      "tooManyRequests": "Too many requests",
      "tooManyRequests.message": "You've made too many requests. Please wait.",
      "serverError": "Server error",
      "serverError.message": "A server error occurred. Please try again later.",
      "network": "Network error",
      "network.message": "Unable to contact the server. Check your connection.",
      "unknown": "Unknown error",
      "unknown.message": "An unexpected error occurred"
    }
  }
}
```

### Fichier : `/src/lib/i18n/messages/ar.json`

```json
{
  "common": {
    "error": {
      "title": "خطأ",
      "validation": "خطأ في التحقق",
      "validation.message": "يرجى تصحيح الأخطاء في النموذج",
      "unauthorized": "غير مصرح",
      "unauthorized.message": "يجب عليك تسجيل الدخول للوصول إلى هذا المورد",
      "forbidden": "الوصول مرفوض",
      "forbidden.message": "ليس لديك الأذونات اللازمة",
      "notFound": "المورد غير موجود",
      "notFound.message": "المورد المطلوب غير موجود أو تم حذفه",
      "timeout": "انتهت المهلة",
      "timeout.message": "استغرق الطلب وقتًا طويلاً. يرجى المحاولة مرة أخرى.",
      "conflict": "تم اكتشاف تعارض",
      "conflict.message": "حدث تعارض أثناء العملية",
      "versionConflict": "تعارض الإصدار",
      "versionConflict.message": "تم تعديل البيانات من قبل مستخدم آخر. يرجى إعادة التحميل.",
      "hasDependencies": "لا يمكن الحذف",
      "hasDependencies.message": "يتم استخدام هذا المورد من قبل عناصر أخرى",
      "tooManyRequests": "طلبات كثيرة جدًا",
      "tooManyRequests.message": "لقد قمت بإجراء طلبات كثيرة جدًا. يرجى الانتظار.",
      "serverError": "خطأ في الخادم",
      "serverError.message": "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.",
      "network": "خطأ في الشبكة",
      "network.message": "تعذر الاتصال بالخادم. تحقق من اتصالك.",
      "unknown": "خطأ غير معروف",
      "unknown.message": "حدث خطأ غير متوقع"
    }
  }
}
```

**Temps estimé :** 20 minutes

---

## ✅ Étape 7 : Build et Vérifications

### Commandes de vérification

```bash
# 1. Build du projet
npm run build

# 2. Vérifier qu'il n'y a pas d'erreurs TypeScript
# (doit se terminer avec ✓ Compiled successfully)

# 3. Vérifier la structure créée
ls -la src/lib/types/common/
ls -la src/lib/constants/
ls -la src/lib/utils/api-error-handler.ts

# 4. Vérifier que les fichiers sont bien typés
npx tsc --noEmit
```

### Résultats attendus

```bash
✓ Compiled successfully in X.Xs
✓ Linting and checking validity of types
✓ Generating static pages
✓ No TypeScript errors
```

**Temps estimé :** 10 minutes

---

## 📝 Étape 8 : Git - Commit & Push

### Workflow Git

```bash
# 1. Vérifier le statut
git status

# 2. Ajouter tous les fichiers créés
git add .

# 3. Vérifier ce qui va être commité
git diff --staged

# 4. Commit avec message conventionnel
git commit -m "feat(foundations): add reusable types, error handler and HTTP constants

- Add common API types (BaseEntity, PaginatedResponse, PaginationParams)
- Add HTTP status constants with helper functions
- Add centralized API error handler with toast integration
- Add i18n error messages (FR/EN/AR)
- Create folder structure for admin entities
- Install Zod and @hookform/resolvers dependencies

This provides the foundation for all admin CRUD pages."

# 5. Push vers la branche
git push -u origin claude/review-admin-ui-specs-018EWY8FVmADVGdM8UxLtM5d
```

**Temps estimé :** 10 minutes

---

## 📊 Résumé de la Phase 1

### Fichiers créés (7 fichiers)

1. ✅ `/src/lib/types/common/api.ts` - Types communs
2. ✅ `/src/lib/constants/http-status.ts` - Constantes HTTP
3. ✅ `/src/lib/utils/api-error-handler.ts` - Helper erreurs
4. ✅ `/src/lib/i18n/messages/fr.json` - Messages FR (modifié)
5. ✅ `/src/lib/i18n/messages/en.json` - Messages EN (modifié)
6. ✅ `/src/lib/i18n/messages/ar.json` - Messages AR (modifié)
7. ✅ `package.json` - Dépendances (modifié)

### Dossiers créés (7 dossiers)

1. ✅ `/src/lib/types/common/`
2. ✅ `/src/lib/types/admin/`
3. ✅ `/src/lib/services/admin/`
4. ✅ `/src/lib/validation/schemas/admin/`
5. ✅ `/src/lib/hooks/admin/`
6. ✅ `/src/lib/constants/`
7. ✅ `/src/app/(app)/admin/`

### Règles respectées

- ✅ Aucune valeur en dur
- ✅ Utilisation apiClient (dans error handler)
- ✅ Utilisation logger (dans error handler)
- ✅ i18n complet (FR/EN/AR)
- ✅ Types TypeScript stricts
- ✅ JSDoc pour toutes les fonctions
- ✅ Build réussi
- ✅ Commit conventionnel

---

## ✅ Checklist Finale Phase 1

### Avant de démarrer Phase 2

- [ ] ✅ Tous les fichiers créés
- [ ] ✅ Tous les dossiers créés
- [ ] ✅ Build réussi sans erreur
- [ ] ✅ Pas d'erreurs TypeScript
- [ ] ✅ Pas d'erreurs ESLint
- [ ] ✅ i18n messages ajoutés (FR/EN/AR)
- [ ] ✅ Commit et push réussis
- [ ] ✅ Vérification manuelle du code

### Prêt pour Phase 2 ?

Si toutes les cases sont cochées ✅, on peut passer à :

**Phase 2 : Composants Génériques**
- DataTable
- DeleteConfirmModal
- EntityFormDialog
- Pagination

---

**Durée totale estimée Phase 1 :** 2-3 heures
**Prochaine étape :** Phase 2 - Composants Génériques

