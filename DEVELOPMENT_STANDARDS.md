# Standards de Développement - AniTra Web

**Version:** 1.0
**Date:** 2025-11-30
**Application:** Tous les développements de fonctionnalités

---

## 📋 Table des Matières

- [1. Principes Fondamentaux](#1-principes-fondamentaux)
- [2. Architecture & Organisation](#2-architecture--organisation)
- [3. Gestion des Erreurs](#3-gestion-des-erreurs)
- [4. Internationalisation (i18n)](#4-internationalisation-i18n)
- [5. Validation des Données](#5-validation-des-données)
- [6. TypeScript & Types](#6-typescript--types)
- [7. Composants React](#7-composants-react)
- [8. Services API](#8-services-api)
- [9. State Management](#9-state-management)
- [10. Tests](#10-tests)
- [11. Git & Versioning](#11-git--versioning)
- [12. Performance](#12-performance)
- [13. Sécurité](#13-sécurité)
- [14. Checklist par Phase](#14-checklist-par-phase)

---

## 1. Principes Fondamentaux

### 1.1 Règles d'Or

❌ **INTERDICTIONS ABSOLUES :**

- ❌ **Aucune valeur en dur dans le code**
  - Pas de textes UI hardcodés (toujours via i18n)
  - Pas d'URLs hardcodées (utiliser env vars)
  - Pas de constantes magiques (créer des constantes nommées)

- ❌ **Aucun bypass de la gestion d'erreurs centralisée**
  - Ne jamais utiliser `fetch` directement
  - Toujours utiliser `apiClient` de `/src/lib/api/client.ts`
  - Toujours logger les erreurs via `/src/lib/utils/logger.ts`

- ❌ **Ne jamais recréer les composants génériques admin**
  - **TOUJOURS** utiliser `DataTable<T>` pour les tableaux paginés admin
  - **TOUJOURS** utiliser `Pagination` pour la pagination
  - **TOUJOURS** utiliser `DeleteConfirmModal` pour les suppressions
  - Ces composants sont dans `/src/components/admin/common/`
  - Voir section 7.2 pour documentation complète

- ❌ **Ne jamais ignorer les types et patterns communs (Phase 1)**
  - **TOUJOURS** étendre `BaseEntity` pour toutes les entités admin
  - **TOUJOURS** utiliser `PaginatedResponse<T>` pour les listes paginées
  - **TOUJOURS** utiliser `HTTP_STATUS` constants (jamais de magic numbers : 200, 404, etc.)
  - **TOUJOURS** utiliser `handleApiError()` pour la gestion d'erreurs API
  - **TOUJOURS** implémenter `CrudService<T, CreateDto, UpdateDto>` pour les services
  - Ces types sont dans `/src/lib/types/common/api.ts` et `/src/lib/constants/http-status.ts`
  - Voir section 6 pour documentation complète

- ❌ **Aucun commit sans build réussi**
  - Toujours exécuter `npm run build` avant commit
  - Corriger toutes les erreurs TypeScript
  - Vérifier qu'il n'y a pas d'erreurs ESLint critiques

✅ **OBLIGATIONS :**

- ✅ **Respecter l'architecture existante**
- ✅ **Code TypeScript strict**
- ✅ **Composants réutilisables**
- ✅ **Tests pour fonctionnalités critiques**
- ✅ **Documentation des fonctions complexes**

---

## 2. Architecture & Organisation

### 2.1 Structure des Dossiers

```
/src
├── app/
│   └── (app)/                    # Pages Next.js App Router
│       ├── admin/               # Pages admin (référentiel global)
│       │   ├── active-substances/
│       │   ├── products/
│       │   └── ...
│       ├── data/                # Pages données (farm-scoped)
│       └── dashboard/
├── components/
│   ├── ui/                      # Composants UI primitifs (shadcn/ui)
│   ├── admin/                   # Composants spécifiques admin
│   │   ├── common/             # Composants réutilisables admin
│   │   └── [entity]/           # Composants par entité
│   ├── data/                    # Composants données farm
│   └── layout/                  # Composants layout
├── lib/
│   ├── api/
│   │   └── client.ts           # ⚠️ Client API centralisé (à utiliser TOUJOURS)
│   ├── services/
│   │   ├── admin/              # Services entités admin
│   │   └── [entity].service.ts
│   ├── types/
│   │   ├── admin/              # Types admin
│   │   ├── common/             # Types communs (pagination, etc.)
│   │   └── [entity].ts
│   ├── validation/
│   │   └── schemas/
│   │       ├── admin/          # Schémas Zod admin
│   │       └── [entity].schema.ts
│   ├── hooks/
│   │   ├── admin/              # Hooks admin
│   │   └── use[Entity].ts
│   ├── i18n/                   # ⚠️ Configuration i18n
│   │   ├── config.ts
│   │   └── messages/
│   │       ├── fr.json
│   │       ├── en.json
│   │       └── ar.json
│   ├── utils/
│   │   ├── logger.ts           # ⚠️ Logger centralisé
│   │   ├── api-error-handler.ts
│   │   └── ...
│   └── constants/              # Constantes globales
└── contexts/                    # React Contexts
    ├── auth-context.tsx
    └── toast-context.tsx       # ⚠️ Toast centralisé
```

### 2.2 Règles de Nommage

**Fichiers :**
- Composants React : `PascalCase.tsx` (ex: `DataTable.tsx`)
- Services : `kebab-case.service.ts` (ex: `active-substances.service.ts`)
- Types : `kebab-case.ts` (ex: `active-substance.ts`)
- Hooks : `camelCase.ts` (ex: `useActiveSubstances.ts`)
- Schémas : `kebab-case.schema.ts` (ex: `active-substance.schema.ts`)

**Variables et Fonctions :**
- Variables : `camelCase` (ex: `activeSubstances`)
- Constantes : `UPPER_SNAKE_CASE` (ex: `API_BASE_URL`)
- Fonctions : `camelCase` (ex: `handleSubmit`)
- Types/Interfaces : `PascalCase` (ex: `ActiveSubstance`)

**Composants :**
- Props interface : `[ComponentName]Props` (ex: `DataTableProps`)
- Event handlers : `handle[Event]` (ex: `handleSubmit`, `handleDelete`)
- Boolean props : `is[State]`, `has[Feature]`, `can[Action]` (ex: `isLoading`, `hasError`, `canDelete`)

---

## 3. Gestion des Erreurs

### 3.1 Client API Centralisé

⚠️ **RÈGLE ABSOLUE** : Toujours utiliser `apiClient`, jamais `fetch` directement.

```typescript
// ✅ BON
import { apiClient } from '@/lib/api/client'

const data = await apiClient.get<MyType>('/api/v1/endpoint')

// ❌ MAUVAIS
const response = await fetch('http://localhost:3000/api/v1/endpoint')
```

### 3.2 Gestion des Erreurs dans les Services

**Pattern standard :**

```typescript
// /src/lib/services/admin/active-substances.service.ts
import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'

class ActiveSubstancesService {
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<ActiveSubstance>> {
    try {
      const url = this.buildUrl('/api/v1/active-substances', params)
      const response = await apiClient.get<PaginatedResponse<ActiveSubstance>>(url)

      logger.info('Active substances fetched', { count: response.data.length })
      return response
    } catch (error) {
      logger.error('Failed to fetch active substances', { error, params })
      throw error // ⚠️ Ne pas capturer, laisser remonter au composant
    }
  }
}
```

### 3.3 Gestion des Erreurs dans les Composants

**Pattern avec Toast :**

```typescript
import { useToast } from '@/contexts/toast-context'
import { handleApiError } from '@/lib/utils/api-error-handler'

function MyComponent() {
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await service.create(data)
      toast.success(t('common.messages.success'), t('entity.messages.created'))
      onSuccess()
    } catch (error) {
      handleApiError(error, 'create entity', toast)
    } finally {
      setLoading(false)
    }
  }
}
```

### 3.4 Types d'Erreurs API

```typescript
// Erreurs gérées automatiquement par handleApiError()
// - 400: Validation errors → Affiche les messages de validation
// - 401: Unauthorized → Redirect login
// - 403: Forbidden → Toast error
// - 404: Not Found → Toast error
// - 409: Conflict → Gestion spéciale (unique, version, dépendances)
// - 500: Server Error → Toast error générique
```

---

## 4. Internationalisation (i18n)

### 4.1 Configuration

Framework : `next-intl`
Langues supportées : FR (défaut), EN, AR
Fichiers : `/src/lib/i18n/messages/{fr,en,ar}.json`

### 4.2 Structure des Clés

**Hiérarchie obligatoire :**

```
{entity}.{category}.{subcategory}.{key}
```

**Catégories standards :**
- `title` - Titres de page
- `fields` - Labels de champs
- `validation` - Messages de validation
- `error` - Erreurs métier
- `success` - Messages de succès
- `actions` - Labels d'actions
- `filters` - Labels de filtres
- `status` - Labels de statut
- `messages` - Messages généraux

**Exemple complet :**

```json
{
  "activeSubstance": {
    "title": {
      "singular": "Substance Active",
      "plural": "Substances Actives"
    },
    "fields": {
      "code": "Code",
      "name": "Nom International (DCI)",
      "description": "Description"
    },
    "validation": {
      "code": {
        "required": "Le code est requis",
        "maxLength": "Le code ne doit pas dépasser 50 caractères",
        "pattern": "Le code doit contenir uniquement des lettres majuscules, chiffres, tirets et underscores"
      }
    },
    "error": {
      "notFound": "Substance active non trouvée",
      "codeAlreadyExists": "Le code existe déjà",
      "versionConflict": "Conflit de version : les données ont été modifiées par un autre utilisateur",
      "hasDependencies": "Impossible de supprimer : {{count}} dépendance(s)"
    },
    "success": {
      "created": "Substance active créée avec succès",
      "updated": "Substance active mise à jour avec succès",
      "deleted": "Substance active supprimée avec succès",
      "restored": "Substance active restaurée avec succès"
    },
    "actions": {
      "create": "Créer une substance active",
      "edit": "Modifier",
      "delete": "Supprimer",
      "restore": "Restaurer"
    }
  }
}
```

### 4.3 Utilisation dans les Composants

```typescript
import { useTranslations } from 'next-intl'

function MyComponent() {
  const t = useTranslations('activeSubstance')
  const tc = useTranslations('common')

  return (
    <div>
      <h1>{t('title.plural')}</h1>
      <Button>{tc('actions.create')}</Button>
      <p>{t('validation.code.required')}</p>

      {/* Avec interpolation */}
      <p>{t('error.hasDependencies', { count: 12 })}</p>
    </div>
  )
}
```

### 4.4 Règles i18n

✅ **TOUJOURS :**
- Utiliser `t()` pour TOUS les textes affichés
- Créer les clés dans les 3 langues (FR, EN, AR)
- Utiliser des clés descriptives et hiérarchiques
- Supporter la pluralisation si nécessaire

❌ **JAMAIS :**
- Textes hardcodés dans les composants
- Clés à plat sans hiérarchie
- Textes en anglais seulement

---

## 5. Validation des Données

### 5.1 Zod pour la Validation

**Installation :**
```bash
npm install zod @hookform/resolvers
```

**Pattern standard :**

```typescript
// /src/lib/validation/schemas/admin/active-substance.schema.ts
import { z } from 'zod'

export const activeSubstanceSchema = z.object({
  code: z
    .string()
    .min(1, 'activeSubstance.validation.code.required')
    .max(50, 'activeSubstance.validation.code.maxLength')
    .regex(/^[A-Z0-9_-]+$/, 'activeSubstance.validation.code.pattern'),

  name: z
    .string()
    .min(1, 'activeSubstance.validation.name.required')
    .max(200, 'activeSubstance.validation.name.maxLength'),

  description: z
    .string()
    .max(1000, 'activeSubstance.validation.description.maxLength')
    .optional(),

  isActive: z.boolean().default(true),
})

export type ActiveSubstanceFormData = z.infer<typeof activeSubstanceSchema>
```

### 5.2 Intégration avec react-hook-form

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { activeSubstanceSchema, type ActiveSubstanceFormData } from '@/lib/validation/schemas/admin/active-substance.schema'

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActiveSubstanceFormData>({
    resolver: zodResolver(activeSubstanceSchema),
    defaultValues: {
      code: '',
      name: '',
      isActive: true,
    },
  })

  const onSubmit = async (data: ActiveSubstanceFormData) => {
    // Data is already validated
    await service.create(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('code')} />
      {errors.code && <span>{t(errors.code.message)}</span>}
    </form>
  )
}
```

---

## 6. TypeScript & Types

### 6.1 Types Communs Obligatoires

**Créer ces types pour TOUTE entité :**

```typescript
// /src/lib/types/admin/active-substance.ts

// Type complet de l'entité
export interface ActiveSubstance {
  id: string
  code: string
  name: string
  description?: string
  isActive: boolean
  deletedAt: string | null
  version: number
  createdAt: string
  updatedAt: string
}

// DTO pour création
export interface CreateActiveSubstanceDto {
  code: string
  name: string
  description?: string
  isActive?: boolean
}

// DTO pour mise à jour
export interface UpdateActiveSubstanceDto {
  code?: string
  name?: string
  description?: string
  isActive?: boolean
  version: number // ⚠️ Obligatoire pour versioning optimiste
}
```

### 6.2 Types Génériques (OBLIGATOIRES - Phase 1)

❌ **INTERDICTION ABSOLUE : Ne jamais recréer ces types**

**Ces types DOIVENT être utilisés pour TOUTES les entités admin :**

```typescript
// /src/lib/types/common/api.ts

/**
 * ⚠️ OBLIGATOIRE : Toutes les entités admin DOIVENT étendre BaseEntity
 */
export interface BaseEntity {
  id: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null  // Pour soft delete
  version?: number            // Pour optimistic locking
  isActive?: boolean
}

/**
 * ⚠️ OBLIGATOIRE : Utiliser pour TOUTES les listes paginées
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

/**
 * ⚠️ OBLIGATOIRE : Utiliser pour TOUS les paramètres de pagination
 */
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  includeDeleted?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * ⚠️ OBLIGATOIRE : Implémenter pour TOUS les services CRUD
 */
export interface CrudService<T extends BaseEntity, CreateDto, UpdateDto> {
  getAll(params?: PaginationParams): Promise<PaginatedResponse<T>>
  getById(id: string): Promise<T>
  create(data: CreateDto): Promise<T>
  update(id: string, data: UpdateDto): Promise<T>
  delete(id: string): Promise<void>
  restore?(id: string): Promise<T>
}
```

**Exemple d'utilisation obligatoire :**

```typescript
// ✅ CORRECT - L'entité étend BaseEntity
export interface ActiveSubstance extends BaseEntity {
  code: string
  name: string
  description?: string
}

// ❌ INTERDIT - Ne pas recréer les champs de BaseEntity
export interface ActiveSubstance {
  id: string           // ❌ Déjà dans BaseEntity
  code: string
  name: string
  createdAt: string    // ❌ Déjà dans BaseEntity
  updatedAt: string    // ❌ Déjà dans BaseEntity
}
```

### 6.3 Constantes HTTP (OBLIGATOIRES - Phase 1)

❌ **INTERDICTION ABSOLUE : Jamais de magic numbers HTTP**

**TOUJOURS utiliser les constantes HTTP_STATUS :**

```typescript
// /src/lib/constants/http-status.ts

export const HTTP_STATUS = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

// Helper functions
export function isSuccessStatus(status: number): boolean
export function isClientError(status: number): boolean
export function isServerError(status: number): boolean
```

**Utilisation :**

```typescript
// ❌ INTERDIT - Magic numbers
if (response.status === 200) { /* ... */ }
if (error.status === 404) { /* ... */ }

// ✅ OBLIGATOIRE - Constantes nommées
import { HTTP_STATUS } from '@/lib/constants/http-status'

if (response.status === HTTP_STATUS.OK) { /* ... */ }
if (error.status === HTTP_STATUS.NOT_FOUND) { /* ... */ }
```

---

### 6.4 Configuration TypeScript Stricte

```json
// tsconfig.json (déjà configuré, ne pas modifier)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## 7. Composants React

### 7.1 Structure d'un Composant

**Pattern standard :**

```typescript
'use client' // Si nécessaire (hooks, interactivité)

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/contexts/toast-context'

// Types
interface MyComponentProps {
  data: MyData[]
  onSuccess: () => void
  canEdit?: boolean
}

// Composant
export function MyComponent({ data, onSuccess, canEdit = true }: MyComponentProps) {
  // 1. Hooks i18n
  const t = useTranslations('entity')
  const tc = useTranslations('common')

  // 2. Hooks contexte
  const toast = useToast()

  // 3. State local
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // 4. Hooks custom
  const { items, refetch } = useMyData()

  // 5. Handlers
  const handleSubmit = async () => {
    setLoading(true)
    try {
      await service.action()
      toast.success(tc('messages.success'))
      onSuccess()
    } catch (err) {
      handleApiError(err, 'action', toast)
    } finally {
      setLoading(false)
    }
  }

  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### 7.2 Composants Génériques Admin (OBLIGATOIRES)

❌ **INTERDICTION ABSOLUE : Ne jamais recréer ces composants**

**Pour TOUTES les pages admin**, utiliser les composants génériques de `/src/components/admin/common/` :

#### 7.2.1 DataTable<T> - Tableau Paginé

```typescript
import { DataTable } from '@/components/admin/common/DataTable'

<DataTable<ActiveSubstance>
  data={substances}
  columns={[
    { key: 'code', header: t('fields.code'), sortable: true },
    { key: 'name', header: t('fields.name'), sortable: true },
    {
      key: 'isActive',
      header: t('fields.isActive'),
      render: (item) => item.isActive ? t('status.active') : t('status.inactive')
    },
  ]}
  totalItems={total}
  page={page}
  limit={limit}
  onPageChange={setPage}
  onEdit={handleEdit}
  onDelete={handleDelete}
  searchValue={search}
  onSearchChange={setSearch}
  sortBy={sortBy}
  sortOrder={sortOrder}
  onSortChange={handleSort}
/>
```

**Features incluses :**
- ✅ Pagination serveur
- ✅ Tri par colonne
- ✅ Recherche avec debounce
- ✅ Actions (Edit/Delete/View/Custom)
- ✅ Loading/error/empty states
- ✅ Badge soft-delete
- ✅ Type-safe avec génériques

#### 7.2.2 Pagination - Contrôles de Pagination

```typescript
import { Pagination } from '@/components/admin/common/Pagination'

<Pagination
  currentPage={page}
  totalPages={totalPages}
  totalItems={total}
  itemsPerPage={limit}
  onPageChange={setPage}
  onItemsPerPageChange={setLimit}
/>
```

**Features incluses :**
- ✅ Navigation : first, previous, next, last
- ✅ Sélecteur items/page : 10, 25, 50, 100
- ✅ Affichage "1-25 sur 250 éléments"
- ✅ i18n complet

#### 7.2.3 DeleteConfirmModal - Suppression avec Dépendances

```typescript
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal'

const [showDeleteModal, setShowDeleteModal] = useState(false)
const [itemToDelete, setItemToDelete] = useState<ActiveSubstance | null>(null)
const [dependencies, setDependencies] = useState<Record<string, number>>()

<DeleteConfirmModal
  open={showDeleteModal}
  onOpenChange={setShowDeleteModal}
  itemName={itemToDelete?.name || ''}
  onConfirm={handleDeleteConfirm}
  dependencies={dependencies}
/>
```

**Features incluses :**
- ✅ Vérification automatique des dépendances
- ✅ Blocage si dépendances existent
- ✅ Formatage lisible des dépendances
- ✅ Loading state
- ✅ i18n complet

**⚠️ RÈGLE ABSOLUE :** Ces composants DOIVENT être utilisés pour toutes les pages admin. Ne jamais créer de variantes ou de doublons.

---

### 7.3 Props Pattern

**✅ Bonnes pratiques :**

```typescript
interface ComponentProps {
  // Props requises en premier
  data: Data[]
  onSuccess: () => void

  // Props optionnelles ensuite
  title?: string
  canEdit?: boolean

  // Callbacks
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void

  // Flags booléens avec préfixes
  isLoading?: boolean
  hasError?: boolean
  canCreate?: boolean
}
```

### 7.3 Composants Réutilisables

**Créer des composants génériques quand :**
- Le pattern se répète 3+ fois
- La logique est complexe mais isolée
- Le composant peut servir plusieurs contextes

**Structure composant réutilisable :**

```typescript
// /src/components/admin/common/DataTable.tsx
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  canEdit?: boolean
  canDelete?: boolean
}

export function DataTable<T extends BaseEntity>({
  data,
  columns,
  loading = false,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: DataTableProps<T>) {
  // Generic table implementation
}
```

---

## 8. Services API

### 8.1 Structure d'un Service

**Pattern standard :**

```typescript
// /src/lib/services/admin/active-substances.service.ts
import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  ActiveSubstance,
  CreateActiveSubstanceDto,
  UpdateActiveSubstanceDto,
} from '@/lib/types/admin/active-substance'
import type { PaginatedResponse, PaginationParams } from '@/lib/types/common/api'

class ActiveSubstancesService {
  private readonly basePath = '/api/v1/active-substances'

  /**
   * Récupère toutes les substances actives (paginées)
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<ActiveSubstance>> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', String(params.page))
      if (params?.limit) queryParams.append('limit', String(params.limit))
      if (params?.search) queryParams.append('search', params.search)
      if (params?.includeDeleted) queryParams.append('includeDeleted', 'true')
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

      const url = queryParams.toString()
        ? `${this.basePath}?${queryParams}`
        : this.basePath

      const response = await apiClient.get<PaginatedResponse<ActiveSubstance>>(url)
      logger.info('Active substances fetched', { count: response.data.length })
      return response
    } catch (error) {
      logger.error('Failed to fetch active substances', { error, params })
      throw error
    }
  }

  /**
   * Récupère une substance active par ID
   */
  async getById(id: string): Promise<ActiveSubstance> {
    try {
      const response = await apiClient.get<ActiveSubstance>(`${this.basePath}/${id}`)
      logger.info('Active substance fetched', { id })
      return response
    } catch (error) {
      logger.error('Failed to fetch active substance', { error, id })
      throw error
    }
  }

  /**
   * Crée une nouvelle substance active
   */
  async create(data: CreateActiveSubstanceDto): Promise<ActiveSubstance> {
    try {
      const response = await apiClient.post<ActiveSubstance>(this.basePath, data)
      logger.info('Active substance created', { id: response.id })
      return response
    } catch (error) {
      logger.error('Failed to create active substance', { error, data })
      throw error
    }
  }

  /**
   * Met à jour une substance active
   */
  async update(id: string, data: UpdateActiveSubstanceDto): Promise<ActiveSubstance> {
    try {
      const response = await apiClient.patch<ActiveSubstance>(
        `${this.basePath}/${id}`,
        data
      )
      logger.info('Active substance updated', { id })
      return response
    } catch (error) {
      logger.error('Failed to update active substance', { error, id, data })
      throw error
    }
  }

  /**
   * Supprime une substance active (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`)
      logger.info('Active substance deleted', { id })
    } catch (error) {
      logger.error('Failed to delete active substance', { error, id })
      throw error
    }
  }

  /**
   * Restaure une substance active supprimée
   */
  async restore(id: string): Promise<ActiveSubstance> {
    try {
      const response = await apiClient.post<ActiveSubstance>(
        `${this.basePath}/${id}/restore`
      )
      logger.info('Active substance restored', { id })
      return response
    } catch (error) {
      logger.error('Failed to restore active substance', { error, id })
      throw error
    }
  }

  /**
   * Vérifie l'unicité d'un code
   */
  async checkCodeUnique(code: string, excludeId?: string): Promise<boolean> {
    try {
      const params = new URLSearchParams({ code })
      if (excludeId) params.append('excludeId', excludeId)

      await apiClient.get(`${this.basePath}/check-code?${params}`)
      return true
    } catch (error: any) {
      if (error.status === 409) {
        return false
      }
      throw error
    }
  }
}

// Export singleton
export const activeSubstancesService = new ActiveSubstancesService()
```

### 8.2 Règles Services

✅ **TOUJOURS :**
- Utiliser `apiClient` (jamais fetch direct)
- Logger les succès (info) et échecs (error)
- Documenter les méthodes avec JSDoc
- Typer les retours et paramètres
- Singleton export (`export const service = new Service()`)

❌ **JAMAIS :**
- Capturer les erreurs sans les re-throw
- Faire des transformations complexes (laisser au composant)
- Mélanger logique métier et logique API

### 8.3 Bonnes Pratiques Techniques (Phase 3)

**🔧 Découvertes lors de l'implémentation Active-Substances :**

#### 8.3.1 Query Parameters avec apiClient

⚠️ **IMPORTANT :** `apiClient.get()` ne supporte PAS l'option `{ params }`

❌ **NE FONCTIONNE PAS :**
```typescript
// ❌ ERREUR : RequestOptions ne contient pas 'params'
const response = await apiClient.get('/endpoint', { params: { page: 1 } })
```

✅ **SOLUTION :** Construire l'URL manuellement avec `URLSearchParams`
```typescript
// ✅ CORRECT
const queryParams = new URLSearchParams()
if (params?.page) queryParams.append('page', String(params.page))
if (params?.limit) queryParams.append('limit', String(params.limit))
if (params?.sortBy) queryParams.append('sortBy', params.sortBy)

const url = queryParams.toString()
  ? `${this.baseUrl}?${queryParams.toString()}`
  : this.baseUrl

const response = await apiClient.get<PaginatedResponse<T>>(url)
```

#### 8.3.2 ColumnDef pour DataTable

⚠️ **Le type `ColumnDef<T>` n'est pas exporté** de `DataTable.tsx`

✅ **SOLUTION :** Définir localement dans chaque page
```typescript
// Dans votre page.tsx
interface ColumnDef<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

const columns: ColumnDef<ActiveSubstance>[] = [
  {
    key: 'code',
    header: t('fields.code'),
    sortable: true,
    render: (substance: ActiveSubstance) => (
      <span className="font-mono">{substance.code}</span>
    ),
  },
]
```

#### 8.3.3 DeleteConfirmModal Props

⚠️ **Le composant `DeleteConfirmModal` n'a QUE `itemName` comme prop**

❌ **NE FONCTIONNE PAS :**
```typescript
<DeleteConfirmModal
  title={t('actions.delete')}        // ❌ Prop n'existe pas
  description={t('messages.confirm')} // ❌ Prop n'existe pas
  itemName="Amoxicilline"
/>
```

✅ **CORRECT :**
```typescript
<DeleteConfirmModal
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  onConfirm={handleDeleteConfirm}
  itemName={deletingItem?.name || ''} // ✅ Seule prop pour le nom
/>
```

Le composant génère automatiquement le titre et la description via i18n.

#### 8.3.4 Version Field pour Optimistic Locking

✅ **OBLIGATOIRE :** Le champ `version` est requis dans `UpdateDto`

```typescript
// Type definition
export interface UpdateActiveSubstanceDto {
  code?: string
  name?: string
  description?: string
  isActive?: boolean
  version: number  // ✅ OBLIGATOIRE pour optimistic locking
}

// Utilisation dans le hook
const update = async (id: string, dto: UpdateActiveSubstanceDto) => {
  // Le backend vérifie version et retourne 409 Conflict si mismatch
  const updated = await service.update(id, {
    ...dto,
    version: currentItem.version || 1,
  })
}
```

Le backend incrémente automatiquement la version à chaque mise à jour et retourne `409 Conflict` si la version envoyée ne correspond pas (détection de modifications concurrentes).

---

## 9. State Management

### 9.1 Custom Hooks Pattern

```typescript
// /src/lib/hooks/admin/useActiveSubstances.ts
import { useState, useEffect, useCallback } from 'react'
import { activeSubstancesService } from '@/lib/services/admin/active-substances.service'
import { logger } from '@/lib/utils/logger'
import type { ActiveSubstance } from '@/lib/types/admin/active-substance'
import type { PaginationParams } from '@/lib/types/common/api'

interface UseActiveSubstancesResult {
  data: ActiveSubstance[]
  total: number
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  create: (data: CreateActiveSubstanceDto) => Promise<ActiveSubstance>
  update: (id: string, data: UpdateActiveSubstanceDto) => Promise<ActiveSubstance>
  delete: (id: string) => Promise<void>
  restore: (id: string) => Promise<ActiveSubstance>
}

export function useActiveSubstances(
  params?: PaginationParams
): UseActiveSubstancesResult {
  const [data, setData] = useState<ActiveSubstance[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await activeSubstancesService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch active substances in hook', { error, params })
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const create = useCallback(async (createData: CreateActiveSubstanceDto) => {
    const newItem = await activeSubstancesService.create(createData)
    setData(prev => [...prev, newItem])
    setTotal(prev => prev + 1)
    return newItem
  }, [])

  const update = useCallback(async (id: string, updateData: UpdateActiveSubstanceDto) => {
    const updated = await activeSubstancesService.update(id, updateData)
    setData(prev => prev.map(item => (item.id === id ? updated : item)))
    return updated
  }, [])

  const deleteItem = useCallback(async (id: string) => {
    await activeSubstancesService.delete(id)
    setData(prev => prev.filter(item => item.id !== id))
    setTotal(prev => prev - 1)
  }, [])

  const restore = useCallback(async (id: string) => {
    const restored = await activeSubstancesService.restore(id)
    setData(prev => prev.map(item => (item.id === id ? restored : item)))
    return restored
  }, [])

  return {
    data,
    total,
    loading,
    error,
    refetch: fetchData,
    create,
    update,
    delete: deleteItem,
    restore,
  }
}
```

### 9.2 State dans les Composants

**Règles :**
- State local pour UI uniquement (modal open/close, form values)
- Custom hooks pour data fetching
- Context pour state global (auth, theme, toast)

---

## 10. Tests

### 10.1 Installation

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### 10.2 Tests Unitaires (Services)

```typescript
// /src/lib/services/admin/__tests__/active-substances.service.test.ts
import { describe, it, expect, vi } from 'vitest'
import { activeSubstancesService } from '../active-substances.service'
import { apiClient } from '@/lib/api/client'

vi.mock('@/lib/api/client')

describe('ActiveSubstancesService', () => {
  it('should fetch all active substances', async () => {
    const mockData = {
      data: [{ id: '1', code: 'AMX', name: 'Amoxicilline' }],
      meta: { total: 1, page: 1, limit: 25, totalPages: 1 },
    }
    vi.mocked(apiClient.get).mockResolvedValue(mockData)

    const result = await activeSubstancesService.getAll()

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/active-substances')
    expect(result).toEqual(mockData)
  })

  it('should create active substance', async () => {
    const newItem = { code: 'AMX', name: 'Amoxicilline' }
    const mockResponse = { id: '1', ...newItem }
    vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

    const result = await activeSubstancesService.create(newItem)

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/active-substances', newItem)
    expect(result).toEqual(mockResponse)
  })
})
```

### 10.3 Tests Composants

```typescript
// /src/components/admin/active-substances/__tests__/ActiveSubstanceForm.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ActiveSubstanceForm } from '../ActiveSubstanceForm'

describe('ActiveSubstanceForm', () => {
  it('should render form fields', () => {
    render(<ActiveSubstanceForm onSuccess={vi.fn()} />)

    expect(screen.getByLabelText(/code/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nom/i)).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    render(<ActiveSubstanceForm onSuccess={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /créer/i }))

    await waitFor(() => {
      expect(screen.getByText(/code est requis/i)).toBeInTheDocument()
    })
  })
})
```

### 10.4 Quand Tester

**Tests OBLIGATOIRES pour :**
- ✅ Services API (tous les endpoints)
- ✅ Composants réutilisables (DataTable, EntityForm, etc.)
- ✅ Hooks personnalisés
- ✅ Utilitaires (helpers, validators)
- ✅ Logique métier complexe

**Tests OPTIONNELS pour :**
- Pages simples
- Composants UI basiques

---

## 11. Git & Versioning

### 11.1 Workflow Git

```bash
# 1. Créer branche feature
git checkout -b feature/admin-active-substances

# 2. Développer
# ...

# 3. TOUJOURS build avant commit
npm run build

# 4. Commit si build OK
git add .
git commit -m "feat(admin): add Active Substances CRUD"

# 5. Push
git push -u origin feature/admin-active-substances
```

### 11.2 Convention Commits

**Format :**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `refactor`: Refactoring (sans changement fonctionnel)
- `style`: Changements de style (formatting, etc.)
- `docs`: Documentation uniquement
- `test`: Ajout/modification de tests
- `chore`: Tâches de maintenance (deps, config, etc.)
- `perf`: Amélioration de performance
- `i18n`: Ajout/modification traductions

**Scopes :**
- `admin`: Fonctionnalités admin
- `data`: Fonctionnalités données
- `components`: Composants
- `services`: Services
- `types`: Types TypeScript
- `i18n`: Internationalisation
- `build`: Build/CI
- `api`: API client

**Exemples :**
```bash
git commit -m "feat(admin): add ActiveSubstances CRUD page"
git commit -m "fix(components): handle null values in DataTable"
git commit -m "refactor(services): extract pagination logic"
git commit -m "i18n(admin): add Active-Substances translations (FR/EN/AR)"
git commit -m "test(services): add ActiveSubstances service tests"
```

### 11.3 Branches

**Nommage :**
- `feature/[description]` : Nouvelles fonctionnalités
- `fix/[description]` : Corrections de bugs
- `refactor/[description]` : Refactoring
- `docs/[description]` : Documentation

**Exemples :**
```
feature/admin-active-substances
feature/admin-products-crud
fix/datatable-pagination-bug
refactor/extract-api-error-handler
docs/update-development-standards
```

---

## 12. Performance

### 12.1 Optimisations React

```typescript
// ✅ Mémorisation des callbacks
const handleDelete = useCallback(async (id: string) => {
  await service.delete(id)
  refetch()
}, [refetch])

// ✅ Mémorisation des valeurs calculées
const filteredData = useMemo(() => {
  return data.filter(item => !item.deletedAt)
}, [data])

// ✅ Lazy loading composants lourds
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

### 12.2 Debounce Recherche

```typescript
import { useState, useEffect } from 'react'

function SearchInput({ onSearch }: { onSearch: (term: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm)
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm, onSearch])

  return <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
}
```

### 12.3 Pagination Serveur

```typescript
// ✅ BON - Pagination serveur
const { data } = await service.getAll({ page: 1, limit: 25 })

// ❌ MAUVAIS - Tout charger puis filtrer côté client
const { data } = await service.getAll() // 10000 items
const page1 = data.slice(0, 25)
```

---

## 13. Sécurité

### 13.1 Authentification

```typescript
// ✅ Token JWT dans headers (automatique via apiClient)
// Déjà configuré dans /src/lib/api/client.ts

// ❌ Ne jamais stocker de données sensibles en localStorage
// ❌ Ne jamais logger de tokens/passwords
```

### 13.2 Validation Input

```typescript
// ✅ Toujours valider avec Zod
const schema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^[A-Z0-9_-]+$/),
})

// ❌ Ne jamais faire confiance aux inputs utilisateur
```

### 13.3 XSS Protection

```typescript
// ✅ React échappe automatiquement les valeurs
<div>{userInput}</div>

// ⚠️ Attention avec dangerouslySetInnerHTML
// Ne jamais l'utiliser avec données utilisateur
```

---

## 14. Checklist par Phase

### Phase 1: Setup & Fondations

**Avant de coder :**
- [ ] Créer branche feature (`git checkout -b feature/[name]`)
- [ ] Installer dépendances si nécessaire (`npm install`)
- [ ] Lire specs de la fonctionnalité

**Structure :**
- [ ] Créer dossiers nécessaires (`types/`, `services/`, `components/`, etc.)
- [ ] Créer types communs si première entité
- [ ] Créer helpers si nécessaire

### Phase 2: Types & Validation

**Types :**
- [ ] Créer interface entité (`[Entity]`)
- [ ] Créer DTO création (`Create[Entity]Dto`)
- [ ] Créer DTO mise à jour (`Update[Entity]Dto`)
- [ ] Exporter types

**Validation :**
- [ ] Créer schéma Zod (`[entity].schema.ts`)
- [ ] Définir règles validation (min, max, regex, etc.)
- [ ] Utiliser clés i18n pour messages d'erreur
- [ ] Exporter type inféré (`FormData`)

### Phase 3: Service API

**Service :**
- [ ] Créer classe service
- [ ] Implémenter `getAll(params)` avec pagination
- [ ] Implémenter `getById(id)`
- [ ] Implémenter `create(data)`
- [ ] Implémenter `update(id, data)`
- [ ] Implémenter `delete(id)`
- [ ] Implémenter `restore(id)` si soft delete
- [ ] Implémenter méthodes métier spécifiques si nécessaire
- [ ] Ajouter JSDoc sur toutes les méthodes
- [ ] Logger succès et erreurs
- [ ] Exporter singleton

**Tests Service :**
- [ ] Créer fichier test (`__tests__/[entity].service.test.ts`)
- [ ] Tester `getAll()`
- [ ] Tester `create()`
- [ ] Tester `update()`
- [ ] Tester `delete()`
- [ ] Tester gestion erreurs

### Phase 4: i18n

**Traductions :**
- [ ] Ajouter clés dans `fr.json`
- [ ] Ajouter clés dans `en.json`
- [ ] Ajouter clés dans `ar.json`
- [ ] Vérifier hiérarchie (`entity.category.key`)
- [ ] Tester interpolation si nécessaire

**Catégories à couvrir :**
- [ ] `title` (singular, plural)
- [ ] `fields` (tous les champs du formulaire)
- [ ] `validation` (messages d'erreur validation)
- [ ] `error` (erreurs métier)
- [ ] `success` (messages succès)
- [ ] `actions` (labels boutons)
- [ ] `filters` si applicable
- [ ] `status` si applicable

### Phase 5: Custom Hook

**Hook :**
- [ ] Créer hook (`use[Entity].ts`)
- [ ] State : `data`, `loading`, `error`, `total`
- [ ] Fonction `fetchData()` avec useCallback
- [ ] Fonction `create()`
- [ ] Fonction `update()`
- [ ] Fonction `delete()`
- [ ] Fonction `restore()` si applicable
- [ ] useEffect pour fetch initial
- [ ] Typer le retour

**Tests Hook (optionnel) :**
- [ ] Tester fetch initial
- [ ] Tester actions CRUD

### Phase 6: Composants

**Liste (Page) :**
- [ ] Créer page `page.tsx` dans `/app/(app)/admin/[entity]/`
- [ ] Utiliser custom hook
- [ ] Implémenter DataTable (ou créer si pas existe)
- [ ] Ajouter recherche avec debounce
- [ ] Ajouter filtres (Actif/Supprimé)
- [ ] Ajouter pagination
- [ ] Ajouter actions (Créer, Modifier, Supprimer, Restaurer)
- [ ] Gérer états : loading, error, empty
- [ ] Utiliser i18n pour tous les textes

**Formulaire (Create/Edit) :**
- [ ] Créer composant formulaire
- [ ] Utiliser react-hook-form + zodResolver
- [ ] Implémenter mode création
- [ ] Implémenter mode édition
- [ ] Validation temps réel
- [ ] Gestion erreurs API (400, 409, etc.)
- [ ] Versioning optimiste (champ `version`)
- [ ] Toast succès/erreur
- [ ] Callback `onSuccess`
- [ ] Loading state

**Suppression :**
- [ ] Créer modale confirmation
- [ ] Vérifier dépendances (si applicable)
- [ ] Afficher dépendances si existent
- [ ] Désactiver bouton si dépendances
- [ ] Toast succès/erreur
- [ ] Refetch après suppression

**Tests Composants (optionnel) :**
- [ ] Tester rendu formulaire
- [ ] Tester validation
- [ ] Tester soumission

### Phase 7: Build & Tests

**Build :**
- [ ] Exécuter `npm run build`
- [ ] Vérifier aucune erreur TypeScript
- [ ] Vérifier aucune erreur ESLint critique
- [ ] Tester en dev (`npm run dev`)

**Tests Fonctionnels :**
- [ ] Créer entité
- [ ] Modifier entité
- [ ] Supprimer entité (vérifier soft delete)
- [ ] Restaurer entité
- [ ] Tester recherche
- [ ] Tester filtres
- [ ] Tester pagination
- [ ] Tester validation formulaire
- [ ] Tester gestion erreurs (409, 400, etc.)
- [ ] Tester en FR, EN, AR

### Phase 8: Git & Push

**Git :**
- [ ] Vérifier status (`git status`)
- [ ] Add fichiers (`git add .`)
- [ ] Commit avec message conventionnel
- [ ] Push vers branche feature
- [ ] Vérifier build CI (si activé)

**Review :**
- [ ] Code review (par pair si possible)
- [ ] Vérifier respect standards
- [ ] Vérifier i18n complet
- [ ] Vérifier aucune valeur hardcodée

---

## 📝 Résumé des Règles Essentielles

### 🚫 Interdictions Absolues

1. ❌ **Aucune valeur en dur** (textes, URLs, constantes)
2. ❌ **Jamais de `fetch` direct** (toujours `apiClient`)
3. ❌ **Jamais de commit sans build réussi**
4. ❌ **Jamais de texte sans i18n**
5. ❌ **Jamais d'erreur non loggée**

### ✅ Obligations

1. ✅ **Utiliser `apiClient`** de `/src/lib/api/client.ts`
2. ✅ **Logger avec `logger`** de `/src/lib/utils/logger.ts`
3. ✅ **Toast via `useToast()`** de `/src/contexts/toast-context`
4. ✅ **i18n avec `next-intl`** (FR/EN/AR)
5. ✅ **Validation avec Zod**
6. ✅ **Types TypeScript stricts**
7. ✅ **Build avant chaque commit**
8. ✅ **Tests pour code critique**
9. ✅ **Commits conventionnels**
10. ✅ **Documentation JSDoc pour fonctions complexes**

### 📐 Architecture

```
Service → Hook → Component
   ↓       ↓        ↓
Logger  State    i18n + Toast
```

### 🎯 Workflow Type

```
1. Créer branche
2. Types + Validation (Zod)
3. Service API
4. i18n (FR/EN/AR)
5. Hook personnalisé
6. Composants UI
7. Tests
8. Build (`npm run build`)
9. Commit + Push
```

---

**Ce document est LA référence pour tous les développements.**
**Toute déviation doit être justifiée et documentée.**

---

**Dernière mise à jour :** 2025-11-30
**Version :** 1.0
**Mainteneur :** Équipe AniTra
