# Standards de Développement - AniTra Web

**Version:** 1.5
**Date:** 2025-12-01
**Dernière mise à jour:** Ajout 2 nouvelles règles suite implémentation Veterinarians (Règles 8.3.19-20: useState vs useFieldArray, Import CrudService)
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

- ❌ **Aucun commit sans build réussi** ⚠️ **RÈGLE NON NÉGOCIABLE**
  - **AVANT CHAQUE COMMIT** : exécuter `npm run build`
  - Si build échoue : ❌ NE PAS commiter - Corriger TOUTES les erreurs TypeScript
  - Re-build jusqu'à succès ✅ ALORS commiter
  - **AUCUNE EXCEPTION** - même pas "erreur réseau Google Fonts"
  - Vérification rapide alternative : `npx tsc --noEmit`
  - **Conséquence violation** : Erreurs runtime en production, blocage CI/CD, perte de confiance du code
  - Voir section 11.3 pour renforcement détaillé de cette règle

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

### 2.3 Chemins d'Import Standardisés

⚠️ **IMPORTANT** : Utiliser TOUJOURS les chemins canoniques suivants

**Imports Communs :**

| Import | Chemin Correct | ❌ Chemins Incorrects |
|--------|---------------|---------------------|
| `useToast` | `@/contexts/toast-context` | `@/lib/hooks/useToast` |
| `BaseEntity` | `@/lib/types/common/api` | `../common/entity`, `@/lib/types/common/entity` |
| `handleApiError` | `@/lib/utils/api-error-handler` | `@/lib/utils/api-errors` |
| `useTranslations` | `next-intl` | `@/lib/i18n` |

**Vérification :**
- En cas de doute, vérifier dans un fichier existant (ex: `active-substances/page.tsx`)
- Utiliser la recherche globale pour trouver l'import correct
- Ne JAMAIS inventer de nouveaux chemins

**Conséquence violation :**
- Erreurs d'import TypeScript
- Inconsistance dans le codebase
- Build failures

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

### 4.5 Préparation des Clés i18n pour Nouveaux Composants

✅ **Pattern recommandé** : Ajouter TOUTES les clés i18n nécessaires AVANT l'implémentation UI

**Workflow obligatoire :**

1. **Analyser les besoins** - Identifier tous les champs qui seront affichés
2. **Créer les clés** - Ajouter toutes les clés dans les 3 langues (FR, EN, AR)
3. **Vérifier la complétude** - S'assurer qu'aucune clé ne manque
4. **Implémenter l'UI** - Utiliser les clés créées

**Exemple - Ajout d'un DetailSheet pour Products :**

```typescript
// 1. Analyser: DetailSheet affichera withdrawalPeriodMeat, withdrawalPeriodMilk
// 2. Créer les clés AVANT l'implémentation:

// fr.json
{
  "product": {
    "fields": {
      // ... champs existants
      "withdrawalPeriodMeat": "Délai d'attente Viande",
      "withdrawalPeriodMilk": "Délai d'attente Lait",
      "days": "jours"  // Unité de mesure réutilisable
    }
  }
}

// en.json
{
  "product": {
    "fields": {
      "withdrawalPeriodMeat": "Withdrawal Period Meat",
      "withdrawalPeriodMilk": "Withdrawal Period Milk",
      "days": "days"
    }
  }
}

// ar.json
{
  "product": {
    "fields": {
      "withdrawalPeriodMeat": "فترة السحب اللحوم",
      "withdrawalPeriodMilk": "فترة السحب الحليب",
      "days": "أيام"
    }
  }
}

// 3. Vérifier: Toutes les clés sont présentes dans les 3 langues
// 4. Implémenter: Utiliser les clés dans DetailSheet
{
  key: 'withdrawalPeriodMeat',
  label: t('fields.withdrawalPeriodMeat'),
  render: (value) => value ? `${value} ${t('fields.days')}` : '-'
}
```

**Cas d'usage :**
- ✅ Ajout d'un nouveau composant (DetailSheet, Form, etc.)
- ✅ Ajout de nouveaux champs à une entité existante
- ✅ Création d'une nouvelle entité admin
- ✅ Ajout de messages d'erreur ou de validation

**Raison :**
- Éviter les erreurs MISSING_MESSAGE en production
- Détecter les clés manquantes lors du build TypeScript
- Assurer la cohérence i18n dès le début
- Faciliter la revue de code (toutes les traductions visibles)

**Conséquence violation :**
- Erreur MISSING_MESSAGE au runtime
- Page blanche ou composant cassé
- Correctif d'urgence nécessaire en production
- Perte de temps en debug

**Pattern pour les champs avec unités de mesure :**

Créer des clés séparées pour les unités réutilisables dans `{entity}.fields` ou `common.fields`:

```json
// ✅ Bon - Unités réutilisables
{
  "product": {
    "fields": {
      "withdrawalPeriodMeat": "Délai d'attente Viande",
      "days": "jours",
      "hours": "heures",
      "weeks": "semaines"
    }
  }
}

// Utilisation
render: (value) => value ? `${value} ${t('fields.days')}` : '-'

// ❌ Mauvais - Hardcoder l'unité
render: (value) => value ? `${value} jours` : '-'
```

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

#### 8.3.5 Formulaires Complexes - Organisation en Sections

⚠️ **Problème** : Les formulaires avec 10+ champs deviennent illisibles et confus.

✅ **SOLUTION :** Organiser en sections logiques avec titres séparés par bordure

```tsx
// ❌ MAUVAIS : Tous les champs mélangés
<form>
  <Input label="Code" />
  <Input label="Commercial Name" />
  <Input label="Description" />
  <Input label="Usage Instructions" />
  {/* ... 10+ champs */}
</form>

// ✅ BON : Sections organisées
<form className="space-y-6">
  {/* Section 1 : Informations principales */}
  <div className="space-y-4">
    <h3 className="text-sm font-semibold border-b pb-2">
      {tc('sections.mainInfo')}
    </h3>
    <Input label={t('fields.code')} {...register('code')} />
    <Input label={t('fields.commercialName')} {...register('commercialName')} />
    <Input label={t('fields.laboratoryName')} {...register('laboratoryName')} />
  </div>

  {/* Section 2 : Informations complémentaires */}
  <div className="space-y-4">
    <h3 className="text-sm font-semibold border-b pb-2">
      {tc('sections.additionalInfo')}
    </h3>
    <Textarea label={t('fields.description')} {...register('description')} />
    <Textarea label={t('fields.usageInstructions')} {...register('usageInstructions')} />
  </div>

  {/* Section 3 : Options */}
  <div className="space-y-4">
    <h3 className="text-sm font-semibold border-b pb-2">
      {tc('sections.options')}
    </h3>
    <Checkbox label={t('fields.isActive')} {...register('isActive')} />
  </div>
</form>
```

**Traductions communes à ajouter dans `common` namespace :**
```json
{
  "common": {
    "sections": {
      "mainInfo": "Informations principales",
      "additionalInfo": "Informations complémentaires",
      "options": "Options"
    }
  }
}
```

**Impact** : Améliore significativement l'UX pour formulaires avec 10+ champs (ex: Products avec 13 champs).

#### 8.3.6 react-hook-form - Controller pour Select

⚠️ **PROBLÈME :** Les composants shadcn/ui `<Select>` ne fonctionnent PAS avec `{...register()}`

❌ **NE FONCTIONNE PAS :**
```tsx
// ❌ ERREUR : Le Select ne se synchronise pas avec react-hook-form
<Select {...register('therapeuticForm')}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="injectable">Injectable</SelectItem>
  </SelectContent>
</Select>
```

✅ **SOLUTION :** TOUJOURS utiliser `<Controller>` pour les Select shadcn/ui
```tsx
import { Controller } from 'react-hook-form'

<Controller
  name="therapeuticForm"
  control={control}
  render={({ field }) => (
    <Select
      onValueChange={field.onChange}
      defaultValue={field.value}
      disabled={loading}
    >
      <SelectTrigger className={errors.therapeuticForm ? 'border-destructive' : ''}>
        <SelectValue placeholder={tc('placeholders.select')} />
      </SelectTrigger>
      <SelectContent>
        {therapeuticForms.map((form) => (
          <SelectItem key={form} value={form}>
            {t(`therapeuticForms.${form}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
/>
```

**Impact** : Évite les bugs silencieux où le Select n'est pas synchronisé avec le state du formulaire.

#### 8.3.7 Multi-Select Pattern (Relations Many-to-Many)

⚠️ **PROBLÈME :** Relations many-to-many nécessitent multi-select (ex: `activeSubstanceIds[]`)

✅ **SOLUTION :** Pattern en 3 étapes avec checkboxes + useState + useEffect

```tsx
import { useState, useEffect } from 'react'

function ProductFormDialog({ product, onSubmit }: Props) {
  const { register, setValue, control } = useForm<ProductFormData>()

  // 1. State local pour les IDs sélectionnés
  const [selectedSubstanceIds, setSelectedSubstanceIds] = useState<string[]>([])

  // 2. Synchroniser avec react-hook-form
  useEffect(() => {
    setValue('activeSubstanceIds', selectedSubstanceIds)
  }, [selectedSubstanceIds, setValue])

  // 3. Charger les données en mode édition
  useEffect(() => {
    if (product && open) {
      const substanceIds = product.activeSubstances?.map((s) => s.id) || []
      setSelectedSubstanceIds(substanceIds)
    }
  }, [product, open])

  // Helper pour toggle checkbox
  const toggleSubstance = (id: string) => {
    setSelectedSubstanceIds((prev) =>
      prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id]
    )
  }

  return (
    <form>
      {/* 4. Affichage checkboxes dans conteneur scrollable */}
      <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
        {activeSubstances.map((substance) => (
          <div key={substance.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`substance-${substance.id}`}
              checked={selectedSubstanceIds.includes(substance.id)}
              onChange={() => toggleSubstance(substance.id)}
              className="h-4 w-4 rounded border-input"
              disabled={loading}
            />
            <Label htmlFor={`substance-${substance.id}`}>
              {substance.name} ({substance.code})
            </Label>
          </div>
        ))}
      </div>

      {/* Message compteur */}
      <p className="text-xs text-muted-foreground">
        {tc('messages.selectedCount', { count: selectedSubstanceIds.length })}
      </p>
    </form>
  )
}
```

**Traduction à ajouter dans `common` :**
```json
{
  "common": {
    "messages": {
      "selectedCount": "{count} sélectionné(s)"
    }
  }
}
```

**Impact** : Pattern réutilisable pour toutes les relations many-to-many futures (Dosages, Withdrawal-Periods, etc.).

#### 8.3.8 DTOs Many-to-Many - Toujours IDs Array

⚠️ **RÈGLE IMPORTANTE :** Différence entre entité display (GET) et DTO création/update (POST/PATCH)

✅ **PATTERN STANDARD :**

```typescript
// 1. Interface Product (pour GET - affichage)
export interface Product extends BaseEntity {
  code: string
  commercialName: string
  activeSubstances: ActiveSubstance[]  // ✅ Objets complets pour display
  // ...
}

// 2. CreateProductDto (pour POST)
export interface CreateProductDto {
  code: string
  commercialName: string
  activeSubstanceIds: string[]  // ✅ IDs uniquement pour création
  // ...
}

// 3. UpdateProductDto (pour PATCH)
export interface UpdateProductDto {
  code?: string
  commercialName?: string
  activeSubstanceIds?: string[]  // ✅ IDs uniquement pour update
  version: number  // Optimistic locking
}
```

**Utilisation dans le formulaire :**

```tsx
// Extraction des IDs en mode édition
useEffect(() => {
  if (product && open) {
    const substanceIds = product.activeSubstances?.map((s) => s.id) || []
    setSelectedSubstanceIds(substanceIds)  // ✅ Conversion vers IDs

    reset({
      code: product.code,
      commercialName: product.commercialName,
      activeSubstanceIds: substanceIds,  // ✅ IDs dans le formulaire
      // ...
    })
  }
}, [product, open])

// Soumission
const onSubmit = async (data: ProductFormData) => {
  // data.activeSubstanceIds est déjà un string[]
  await create(data)  // ✅ Envoi des IDs uniquement au backend
}
```

**Impact** :
- Performance : Évite d'envoyer des objets complets inutiles au backend
- Simplicité : Le backend n'a besoin que des IDs pour gérer les relations

#### 8.3.9 DataTable Relations - Limiter Affichage + Compteur

⚠️ **PROBLÈME :** Afficher 10+ relations dans une cellule de tableau = illisible

✅ **SOLUTION :** Max 2-3 items + badge compteur "+X"

```tsx
// Dans la définition des colonnes
const columns: ColumnDef<Product>[] = [
  // ... autres colonnes
  {
    key: 'activeSubstances',
    header: t('fields.activeSubstances'),
    render: (product: Product) => (
      <div className="flex flex-wrap gap-1">
        {/* Afficher max 2 premiers items */}
        {product.activeSubstances?.slice(0, 2).map((substance) => (
          <Badge
            key={substance.id}
            variant="default"
            className="text-xs"
          >
            {substance.code}
          </Badge>
        ))}

        {/* Badge compteur si plus de 2 items */}
        {product.activeSubstances?.length > 2 && (
          <Badge variant="default" className="text-xs">
            +{product.activeSubstances.length - 2}
          </Badge>
        )}
      </div>
    ),
  },
]
```

**Exemples d'affichage :**
- 1 substance : `AMOX`
- 2 substances : `AMOX` `CLAV`
- 5 substances : `AMOX` `CLAV` `+3`

**Impact** : Tables restent lisibles même avec relations many-to-many complexes.

#### 8.3.10 i18n Common Extensions - Namespace Partagé

⚠️ **RÈGLE :** Éviter la duplication des traductions communes entre entités

✅ **SOLUTION :** Ajouter dans namespace `common` quand utilisé par 2+ entités

**Exemples de traductions communes :**

```json
// fr.json, en.json, ar.json
{
  "common": {
    "sections": {
      "mainInfo": "Informations principales",
      "additionalInfo": "Informations complémentaires",
      "options": "Options"
    },
    "placeholders": {
      "select": "Sélectionner",
      "optional": "Optionnel",
      "search": "Rechercher..."
    },
    "messages": {
      "selectedCount": "{count} sélectionné(s)",
      "noData": "Aucune donnée disponible"
    },
    "admin": {
      "products": {
        "subtitle": "Gestion du catalogue des produits vétérinaires"
      },
      "activeSubstances": {
        "subtitle": "Gestion des substances actives"
      }
    }
  }
}
```

**Utilisation :**
```tsx
const t = useTranslations('product')
const tc = useTranslations('common')  // ✅ Traductions communes

<h3>{tc('sections.mainInfo')}</h3>
<SelectValue placeholder={tc('placeholders.select')} />
<p>{tc('messages.selectedCount', { count: 5 })}</p>
```

**Quand ajouter dans `common` :**
- ✅ Textes utilisés par 2+ entités différentes
- ✅ Labels UI génériques (sections, placeholders, actions)
- ✅ Messages de validation standards
- ❌ Textes spécifiques à une seule entité (garder dans namespace dédié)

**Impact** :
- Réduit duplication i18n entre entités similaires
- Facilite maintenance des traductions
- Cohérence terminologique sur toute l'application

#### 8.3.11 Protection contre Appels API Concurrents dans les Hooks

⚠️ **PROBLÈME :** Hooks avec auto-fetch peuvent créer des boucles infinies d'erreurs quand le backend est indisponible

❌ **SYMPTÔMES :**
- Console remplie d'erreurs API répétées
- Application qui "boucle" sans rendre la main
- Multiple appels API simultanés au même endpoint

✅ **SOLUTION :** TOUJOURS utiliser `useRef` pour empêcher les appels concurrents

**Pattern obligatoire pour tous les hooks avec fetch :**

```typescript
import { useState, useEffect, useCallback, useRef } from 'react'

export function useEntity(params?: PaginationParams) {
  const [data, setData] = useState<Entity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // ✅ OBLIGATOIRE : Ref pour empêcher appels concurrents
  // Ne PAS utiliser useState (causerait des re-renders)
  const isFetchingRef = useRef(false)

  const fetchData = useCallback(async () => {
    // ✅ OBLIGATOIRE : Vérifier si fetch déjà en cours
    if (isFetchingRef.current) {
      return  // Ignorer l'appel si fetch en cours
    }

    isFetchingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const response = await entityService.getAll(params)
      setData(response.data)
    } catch (err) {
      setError(err as Error)
      handleApiError(err, 'fetch entity', toast)
    } finally {
      setLoading(false)
      isFetchingRef.current = false  // ✅ Réinitialiser dans finally
    }
  }, [params, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
```

**❌ À NE PAS FAIRE :**

```typescript
// ❌ MAUVAIS : Utiliser useState (déclenche re-render)
const [isFetching, setIsFetching] = useState(false)

const fetchData = useCallback(async () => {
  if (isFetching) return  // ❌ Race condition possible

  setIsFetching(true)  // ❌ Déclenche re-render
  // ...
  setIsFetching(false)  // ❌ Déclenche re-render
}, [params, toast, isFetching])  // ❌ isFetching dans les deps
```

**❌ À NE PAS FAIRE :**

```typescript
// ❌ MAUVAIS : Pas de protection contre appels concurrents
const fetchData = useCallback(async () => {
  setLoading(true)  // ❌ Plusieurs appels peuvent se chevaucher
  try {
    const response = await entityService.getAll(params)
    setData(response.data)
  } finally {
    setLoading(false)
  }
}, [params, toast])
```

**Pourquoi useRef et pas useState ?**

1. **useRef ne déclenche PAS de re-render** quand la valeur change
2. **useState déclenche un re-render** → peut causer des boucles avec useEffect
3. **isFetchingRef.current** est accessible immédiatement (pas de closure)
4. **Plus performant** : pas de re-render inutile

**Impact :**
- Évite les boucles infinies d'erreurs quand backend indisponible
- Empêche les requêtes concurrentes au même endpoint
- Améliore la stabilité de l'application en environnement instable

**Applicable à :**
- ✅ Tous les hooks personnalisés qui font des appels API
- ✅ Particulièrement important pour hooks avec auto-fetch (useEffect)
- ✅ useProducts, useActiveSubstances, useTherapeuticIndications, etc.

#### 8.3.12 Validation contre Swagger avant Implémentation de Services

⚠️ **PROBLÈME :** Services frontend avec URLs ou paramètres incorrects causent des erreurs 404/400

❌ **SYMPTÔMES :**
- Erreurs HTTP 404 (endpoint introuvable)
- Erreurs HTTP 400 (paramètres invalides)
- Appels API qui échouent systématiquement au premier test

✅ **SOLUTION :** TOUJOURS consulter Swagger avant d'implémenter un service API

**Checklist obligatoire avant d'écrire un service :**

```typescript
// ❌ NE JAMAIS FAIRE : Deviner les URLs et paramètres

class MyService {
  // Devine l'URL sans vérifier
  private readonly baseUrl = '/api/v1/admin/my-entity'  // ❌

  async getAll(params?: PaginationParams) {
    // Devine les noms de paramètres
    queryParams.append('sortBy', params.sortBy)  // ❌
    queryParams.append('sortOrder', params.sortOrder)  // ❌
  }
}
```

```typescript
// ✅ OBLIGATOIRE : Vérifier Swagger puis implémenter

// 1. CONSULTER SWAGGER (http://localhost:3000/api/docs)
//    - Trouver l'endpoint exact : GET /api/v1/products (sans /admin/)
//    - Noter les paramètres acceptés : sort, order, page, limit
//    - Noter les valeurs par défaut : sort=nameFr, order=asc

class ProductsService {
  // ✅ URL exacte de Swagger
  private readonly baseUrl = '/api/v1/products'

  async getAll(params?: PaginationParams) {
    // ✅ Noms de paramètres de Swagger
    if (params?.sortBy) queryParams.append('sort', params.sortBy)     // Backend: 'sort'
    if (params?.sortOrder) queryParams.append('order', params.sortOrder) // Backend: 'order'

    // ✅ Commentaire pour expliquer le mapping
    // ⚠️ Backend utilise 'sort' et 'order' (pas 'sortBy' et 'sortOrder')
  }
}
```

**Process obligatoire :**

1. **Ouvrir Swagger** : http://localhost:3000/api/docs
2. **Trouver l'endpoint** : Vérifier le chemin exact (avec/sans `/admin/`)
3. **Noter les paramètres** : Noms exacts, types, valeurs par défaut
4. **Noter les filtres** : Valeurs enum possibles
5. **Documenter les différences** : Ajouter commentaires si mapping nécessaire

**Exemples de différences courantes :**

| Frontend (standard) | Backend (peut varier) | Action |
|---------------------|----------------------|--------|
| `sortBy` | `sort` | Mapper dans le service |
| `sortOrder` | `order` | Mapper dans le service |
| `page=1, limit=25` | `page=1, limit=50` | Vérifier défauts |
| `code` | `nameFr` | Vérifier champ de tri |

**Impact :**
- Évite les erreurs 404/400 au premier test
- Réduit le temps de debugging
- Documentation claire des différences backend/frontend

**Quand appliquer :**
- ✅ Avant d'écrire TOUT nouveau service API
- ✅ Quand un endpoint retourne 400/404
- ✅ Lors de l'ajout de nouveaux filtres

#### 8.3.13 Gestion Défensive des Valeurs en i18n

⚠️ **PROBLÈME :** Erreurs `MISSING_MESSAGE` quand le backend retourne des valeurs undefined ou non traduites

❌ **SYMPTÔMES :**
```
MISSING_MESSAGE: Could not resolve `entity.field.undefined` in messages
```

✅ **SOLUTION :** TOUJOURS valider avant d'utiliser une clé de traduction dynamique

**Pattern obligatoire pour traductions dynamiques :**

```typescript
// ❌ MAUVAIS : Traduction directe sans validation
render: (item) => (
  <Badge>
    {t(`statuses.${item.status}`)}  // ❌ Crash si status=undefined
  </Badge>
)
```

```typescript
// ✅ BON : Validation en 3 étapes

// 1. Définir la liste des valeurs valides
const validStatuses = ['active', 'inactive', 'pending', 'archived']

render: (item) => {
  // 2. Gérer undefined/null
  if (!item.status) {
    return <span className="text-muted-foreground">-</span>
  }

  // 3. Vérifier si la valeur a une traduction
  if (validStatuses.includes(item.status)) {
    return <Badge>{t(`statuses.${item.status}`)}</Badge>
  }

  // 4. Fallback : afficher la valeur brute
  return (
    <Badge variant="default" className="opacity-60">
      {item.status}
    </Badge>
  )
}
```

**Pattern avec helper function (réutilisable) :**

```typescript
// Dans le composant
const validTherapeuticForms = [
  'injectable', 'oral', 'topical', 'intramammary',
  'pour-on', 'bolus', 'powder', 'suspension', 'tablet'
]

// Helper pour rendu safe
const renderTranslatedBadge = (
  value: string | undefined,
  translationKey: string,
  validValues: string[]
) => {
  if (!value) return <span className="text-muted-foreground text-xs">-</span>

  if (validValues.includes(value)) {
    return <Badge variant="default">{t(`${translationKey}.${value}`)}</Badge>
  }

  return <Badge variant="default" className="opacity-60">{value}</Badge>
}

// Utilisation
render: (product) => renderTranslatedBadge(
  product.therapeuticForm,
  'therapeuticForms',
  validTherapeuticForms
)
```

**Cas d'usage critiques :**

1. **Enums du backend** : status, type, category, role, etc.
2. **Relations many-to-one** : categoryId → category.name
3. **Champs optionnels** : description, notes, metadata
4. **Valeurs calculées** : pourcentages, compteurs dérivés

**Liste de validValues :**

Options pour définir `validValues` :

```typescript
// Option 1 : Hardcodé (simple, rapide)
const validStatuses = ['active', 'inactive', 'pending']

// Option 2 : Import depuis types (mieux)
import { ProductTherapeuticForm } from '@/lib/types/admin/product'
const validForms = Object.values(ProductTherapeuticForm)

// Option 3 : Récupéré du backend (idéal mais async)
const { data: validCategories } = useCategoriesEnum()
```

**Impact :**
- Évite les crashes i18n sur valeurs inattendues
- UX résiliente : affiche toujours quelque chose
- Facilite le debugging (valeurs brutes visibles)

**Quand appliquer :**
- ✅ Toute traduction avec clé dynamique : `t(\`key.\${variable}\`)`
- ✅ Champs enum venant du backend
- ✅ Champs optionnels pouvant être null/undefined

#### 8.3.14 API DataTable - Props Plates (Flat Props)

⚠️ **ERREUR FRÉQUENTE** : Utiliser des props objets au lieu de props plates

❌ **INCORRECT** (props objets - NE FONCTIONNE PAS):
```tsx
<DataTable
  pagination={{ page: 1, limit: 25, total: 100 }}
  sorting={{ sortBy: 'name', sortOrder: 'asc' }}
  search={{ value: '', placeholder: '...' }}
/>
```

✅ **CORRECT** (props plates - API réelle):
```tsx
<DataTable<Entity>
  data={data}
  columns={columns}
  totalItems={total}              // ✅ Flat prop (pas "total")
  page={params.page || 1}         // ✅ Flat prop
  limit={params.limit || 25}      // ✅ Flat prop
  onPageChange={(page) => setParams({ ...params, page })}
  onLimitChange={(limit) => setParams({ ...params, limit, page: 1 })}
  sortBy={params.sortBy}          // ✅ Flat prop
  sortOrder={params.sortOrder}    // ✅ Flat prop
  onSortChange={(sortBy, sortOrder) =>
    setParams({ ...params, sortBy, sortOrder })
  }
  onEdit={handleEdit}             // ✅ DataTable gère les boutons
  onDelete={handleDeleteClick}    // ✅ DataTable gère les boutons
  loading={loading}
  emptyMessage={t('messages.noResults')}
  searchPlaceholder={t('search.placeholder')}
/>
```

**Wrapping obligatoire :**
```tsx
{/* ✅ TOUJOURS wrapper dans Card + CardContent */}
<Card>
  <CardContent className="pt-6">
    <DataTable<Entity> {...props} />
  </CardContent>
</Card>
```

**Actions dans DataTable :**
```tsx
// ❌ NE PAS définir manuellement une colonne 'actions'
const columns: ColumnDef<Unit>[] = [
  { key: 'code', header: 'Code' },
  { key: 'name', header: 'Name' },
  // ❌ PAS de colonne actions ici
]

// ✅ DataTable gère automatiquement via onEdit/onDelete
<DataTable
  columns={columns}
  onEdit={handleEdit}      // ✅ Boutons générés automatiquement
  onDelete={handleDelete}  // ✅ Boutons générés automatiquement
/>
```

**Raison :**
- L'API DataTable utilise des props plates pour plus de flexibilité
- Les props objets ne sont PAS supportées
- Pattern cohérent avec tous les composants shadcn/ui

**Vérification :**
- TOUJOURS lire `/src/components/admin/common/DataTable.tsx` pour l'API exacte
- TOUJOURS copier le pattern de `active-substances/page.tsx`

**Conséquence violation :**
- Pagination/recherche/tri ne fonctionnent pas
- Props ignorées silencieusement
- Bugs difficiles à debugger

#### 8.3.15 Gestion Défensive des Enums Avant Traduction

⚠️ **CAS PARTICULIER** de la règle 8.3.13 pour les enums TypeScript

❌ **INCORRECT** (crash si undefined/null):
```tsx
render: (item) => (
  <span>{t(`types.${item.type}`)}</span>  // ❌ Crash si type=undefined
)
```

✅ **CORRECT** (défensif):
```tsx
render: (item) => (
  <span>
    {item.type ? t(`types.${item.type}`) : '-'}  // ✅ Garde défensive
  </span>
)
```

**Exemple concret - Enum UnitType :**

```typescript
// Type definition
export enum UnitType {
  WEIGHT = 'WEIGHT',
  VOLUME = 'VOLUME',
  CONCENTRATION = 'CONCENTRATION',
}

// Dans le composant
{
  key: 'type',
  header: t('fields.type'),
  sortable: true,
  render: (unit: Unit) => (
    <span className="text-sm">
      {/* ✅ RÈGLE 8.3.15 : Gestion défensive enum */}
      {unit.type ? t(`types.${unit.type}`) : '-'}
    </span>
  ),
}
```

**Cas d'usage :**
- ✅ Enum traduit dynamiquement via i18n (UnitType, ProductTherapeuticForm, etc.)
- ✅ Champs enum pouvant être null/undefined (edge case, données corrompues)
- ✅ Tout `t(\`...${enumVariable}\`)` dans une fonction render

**Pattern générique :**
```tsx
// Pour tous les enums
{enumValue ? t(`namespace.${enumValue}`) : '-'}

// Avec style conditionnel
{enumValue ? (
  <Badge variant="default">{t(`namespace.${enumValue}`)}</Badge>
) : (
  <span className="text-muted-foreground">-</span>
)}
```

**Raison :**
- Éviter crash runtime si la valeur est undefined/null
- UX résiliente même avec données corrompues
- Facilite le debugging (affiche '-' au lieu de crasher)

**Conséquence violation :**
- Crash runtime avec `MISSING_MESSAGE` error
- Page blanche pour l'utilisateur
- Erreur difficile à reproduire (cas edge)

---

#### 8.3.16 Affichage du Détail par Clic sur Ligne (DataTable + DetailSheet)

✅ **Pattern recommandé** : Utiliser `onRowClick` + `DetailSheet` pour afficher le détail d'une entité

**Composants impliqués :**

1. **DataTable.tsx** - Ajouter prop `onRowClick` avec protection des boutons
2. **DetailSheet.tsx** - Dialog générique pour afficher les détails
3. **Page component** - Gérer l'état et les handlers

**1. Modification DataTable.tsx :**

```typescript
interface DataTableProps<T extends BaseEntity> {
  // ... autres props

  /** Callback clic sur ligne (affichage détail) */
  onRowClick?: (item: T) => void
}

// Dans TableRow
<TableRow
  key={item.id}
  className={`${item.deletedAt ? 'opacity-50' : ''} ${
    onRowClick ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''
  }`}
  onClick={(e) => {
    // Ne pas déclencher onRowClick si on clique sur un bouton d'action
    const target = e.target as HTMLElement
    if (target.closest('button')) return
    onRowClick?.(item)
  }}
>
```

**2. Composant DetailSheet.tsx :**

```typescript
// /src/components/admin/common/DetailSheet.tsx
'use client'

import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { BaseEntity } from '@/lib/types/common/api'

interface DetailField {
  /** Clé du champ */
  key: string

  /** Label du champ (clé i18n) */
  label: string

  /** Render personnalisé de la valeur */
  render?: (value: any) => React.ReactNode

  /** Type de champ (pour render par défaut) */
  type?: 'text' | 'date' | 'boolean' | 'badge'
}

interface DetailSheetProps<T extends BaseEntity> {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: T | null
  title: string
  description?: string
  fields: DetailField[]
  actions?: React.ReactNode
}

export function DetailSheet<T extends BaseEntity>({
  open,
  onOpenChange,
  item,
  title,
  description,
  fields,
  actions,
}: DetailSheetProps<T>) {
  const tc = useTranslations('common')

  if (!item) return null

  const renderValue = (field: DetailField, value: any) => {
    if (field.render) return field.render(value)
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground italic">-</span>
    }

    switch (field.type) {
      case 'date':
        return new Date(value).toLocaleString('fr-FR', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      case 'boolean':
      case 'badge':
        return value ? (
          <Badge variant="success">{tc('status.active')}</Badge>
        ) : (
          <Badge variant="warning">{tc('status.inactive')}</Badge>
        )
      default:
        return <span>{String(value)}</span>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Champs principaux */}
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">
                  {field.label}
                </dt>
                <dd className="text-base">
                  {renderValue(field, (item as any)[field.key])}
                </dd>
              </div>
            ))}
          </div>

          {/* Métadonnées BaseEntity */}
          <div className="mt-6 pt-6 border-t space-y-4">
            <h3 className="text-sm font-semibold">{tc('fields.metadata')}</h3>

            {item.createdAt && (
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">
                  {tc('fields.createdAt')}
                </dt>
                <dd className="text-sm">
                  {new Date(item.createdAt).toLocaleString('fr-FR', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </dd>
              </div>
            )}

            {item.updatedAt && (
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">
                  {tc('fields.updatedAt')}
                </dt>
                <dd className="text-sm">
                  {new Date(item.updatedAt).toLocaleString('fr-FR', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </dd>
              </div>
            )}

            {item.version !== undefined && (
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">
                  Version
                </dt>
                <dd className="text-sm">
                  <Badge variant="default">v{item.version}</Badge>
                </dd>
              </div>
            )}
          </div>

          {/* Actions personnalisées */}
          {actions && (
            <div className="mt-6 pt-6 border-t flex gap-2">{actions}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**3. Utilisation dans page.tsx :**

```typescript
const [detailOpen, setDetailOpen] = useState(false)
const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null)

const handleRowClick = (species: Species) => {
  setSelectedSpecies(species)
  setDetailOpen(true)
}

// DataTable avec onRowClick
<DataTable<Species>
  data={species}
  columns={columns}
  totalItems={total}
  page={page}
  limit={limit}
  onPageChange={setPage}
  onRowClick={handleRowClick}  // ← Clic sur ligne
  onEdit={handleEdit}
  onDelete={handleDeleteClick}
  // ... autres props
/>

// DetailSheet
<DetailSheet<Species>
  open={detailOpen}
  onOpenChange={setDetailOpen}
  item={selectedSpecies}
  title={t('title.singular')}
  fields={[
    { key: 'code', label: t('fields.code') },
    { key: 'name', label: t('fields.name') },
    {
      key: 'description',
      label: t('fields.description'),
      render: (value) => value || <span className="text-muted-foreground italic">-</span>,
    },
    { key: 'isActive', label: t('fields.isActive'), type: 'badge' },
  ]}
  actions={
    <>
      <Button variant="outline" onClick={() => {
        setDetailOpen(false)
        handleEdit(selectedSpecies!)
      }}>
        {tc('actions.edit')}
      </Button>
      <Button variant="ghost" className="text-destructive" onClick={() => {
        setDetailOpen(false)
        handleDeleteClick(selectedSpecies!)
      }}>
        {tc('actions.delete')}
      </Button>
    </>
  }
/>
```

**Avantages :**
- ✅ Pattern générique réutilisable pour toutes les entités
- ✅ Séparation des concerns (DataTable = liste, DetailSheet = détail)
- ✅ Protection des clics sur boutons (ne déclenche pas onRowClick)
- ✅ Feedback visuel (cursor-pointer, hover) uniquement si cliquable
- ✅ Type-safe avec génériques
- ✅ Métadonnées BaseEntity affichées automatiquement

**Cas d'usage :**
- ✅ Afficher le détail d'une entité au clic sur ligne
- ✅ Actions contextuelles dans le DetailSheet (Edit, Delete, Custom)
- ✅ Render personnalisé pour champs complexes (enums, relations, etc.)

**Conséquence violation :**
- UX moins intuitive (obligation de cliquer sur bouton "Voir")
- Code dupliqué si chaque page implémente son propre detail dialog
- Pas de standardisation du pattern d'affichage des détails

---

#### 8.3.17 Affichage des Champs Relationnels dans DetailSheet

✅ **Pattern recommandé** : Utiliser `render` personnalisé avec Badges pour afficher les relations many-to-many ou one-to-many

**Pattern pour collections (many-to-many, one-to-many) :**

```typescript
// Dans DetailSheet fields
{
  key: 'activeSubstances',
  label: t('fields.activeSubstances'),
  render: (value) => value && value.length > 0 ? (
    <div className="flex flex-wrap gap-1">
      {value.map((substance: any) => (
        <Badge key={substance.id} variant="default" className="text-xs">
          {substance.code} - {substance.name}
        </Badge>
      ))}
    </div>
  ) : '-'
}
```

**Pattern pour relation simple (many-to-one) :**

```typescript
// Pour afficher une seule relation
{
  key: 'category',
  label: t('fields.category'),
  render: (value) => value ? (
    <Badge variant="default">
      {value.code} - {value.name}
    </Badge>
  ) : '-'
}
```

**Pattern pour relations avec données supplémentaires :**

```typescript
// Afficher code + name + info supplémentaire
{
  key: 'suppliers',
  label: t('fields.suppliers'),
  render: (value) => value && value.length > 0 ? (
    <div className="flex flex-col gap-1">
      {value.map((supplier: any) => (
        <div key={supplier.id} className="flex items-center gap-2">
          <Badge variant="default" className="text-xs">
            {supplier.code}
          </Badge>
          <span className="text-sm">{supplier.name}</span>
          <span className="text-xs text-muted-foreground">
            ({supplier.location})
          </span>
        </div>
      ))}
    </div>
  ) : '-'
}
```

**Cas d'usage :**
- ✅ Relations many-to-many (activeSubstances, categories, tags, etc.)
- ✅ Relations one-to-many (comments, attachments, etc.)
- ✅ Relations many-to-one avec affichage enrichi
- ✅ Toute collection d'objets liés à afficher

**Raison :**
- Affichage visuel clair et structuré des relations
- Cohérence avec le design system (Badges)
- Facile à identifier visuellement (code + name)
- Support des relations vides (affiche '-')

**Conséquence violation :**
- Affichage brut difficile à lire (ex: [object Object])
- UX incohérente entre différentes pages
- Informations importantes masquées (uniquement ID)

**Bonnes pratiques :**

```typescript
// ✅ Bon - Affichage code + name
<Badge>{item.code} - {item.name}</Badge>

// ✅ Bon - Vérification de la collection vide
value && value.length > 0 ? (...) : '-'

// ✅ Bon - Key unique pour chaque Badge
{value.map((item) => <Badge key={item.id}>...</Badge>)}

// ❌ Mauvais - Afficher uniquement l'ID
<Badge>{item.id}</Badge>

// ❌ Mauvais - Pas de gestion du cas vide
value.map((item) => ...) // Crash si value est null/undefined
```

---

#### 8.3.18 Affichage des Champs Numériques avec Unités

✅ **Pattern recommandé** : Concaténer la valeur avec l'unité traduite via une clé i18n séparée

**Pattern standard :**

```typescript
// 1. Créer la clé i18n pour l'unité (Règle 4.5)
// fr.json
{
  "product": {
    "fields": {
      "withdrawalPeriodMeat": "Délai d'attente Viande",
      "days": "jours"  // Unité réutilisable
    }
  }
}

// 2. Utiliser dans le render
{
  key: 'withdrawalPeriodMeat',
  label: t('fields.withdrawalPeriodMeat'),
  render: (value) => value ? `${value} ${t('fields.days')}` : '-'
}
```

**Pattern pour unités multiples :**

```typescript
// Créer plusieurs unités dans common.fields pour réutilisation
// common.fields dans fr.json
{
  "common": {
    "fields": {
      "days": "jours",
      "hours": "heures",
      "weeks": "semaines",
      "months": "mois",
      "years": "ans",
      "kg": "kg",
      "liters": "litres",
      "percent": "%"
    }
  }
}

// Utilisation avec tc (common translation)
const tc = useTranslations('common')

{
  key: 'weight',
  label: t('fields.weight'),
  render: (value) => value ? `${value} ${tc('fields.kg')}` : '-'
}
```

**Pattern pour unités conditionnelles :**

```typescript
// Afficher l'unité selon le type
{
  key: 'quantity',
  label: t('fields.quantity'),
  render: (value, item) => {
    if (!value) return '-'
    const unit = item.unit?.symbol || tc('fields.units')
    return `${value} ${unit}`
  }
}
```

**Cas d'usage :**
- ✅ Durées (days, hours, weeks, months, years)
- ✅ Poids (kg, g, mg)
- ✅ Volumes (liters, ml)
- ✅ Pourcentages
- ✅ Températures
- ✅ Toute mesure avec unité

**Raison :**
- Support multilingue des unités (jours/days/أيام)
- Réutilisation des clés d'unités communes
- Cohérence dans l'affichage des mesures
- Facilite la maintenance (changement d'unité centralisé)

**Conséquence violation :**
- Unités hardcodées (toujours en français)
- Duplication des traductions d'unités
- Non-respect de l'i18n
- Incohérence entre les entités

**Bonnes pratiques :**

```typescript
// ✅ Bon - Unité traduite
render: (value) => value ? `${value} ${t('fields.days')}` : '-'

// ✅ Bon - Unité réutilisable dans common
render: (value) => value ? `${value} ${tc('fields.kg')}` : '-'

// ✅ Bon - Gestion du cas null/undefined
render: (value) => value ? `${value} ${t('fields.days')}` : '-'

// ❌ Mauvais - Unité hardcodée
render: (value) => value ? `${value} jours` : '-'

// ❌ Mauvais - Pas de gestion du null
render: (value) => `${value} ${t('fields.days')}` // Affiche "undefined jours"
```

---

#### 8.3.19 Gestion des Champs Array Dynamiques - useState vs useFieldArray

⚠️ **PROBLÈME** : `useFieldArray` de react-hook-form a des problèmes de typage TypeScript avec `zodResolver` + `as any`

❌ **SYMPTÔMES :**
```
Type 'string' is not assignable to type 'never'
Type error on useFieldArray name parameter
```

✅ **SOLUTION** : Utiliser `useState` avec synchronisation manuelle pour les arrays dynamiques

**Pattern recommandé (useState) :**

```typescript
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function MyFormDialog({ item, onSubmit }: Props) {
  // 1. État local pour l'array dynamique
  const [specialties, setSpecialties] = useState<string[]>([''])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MyFormData>({
    resolver: zodResolver(mySchema) as any,
    defaultValues: {
      specialties: [''],
      // ... autres champs
    },
  })

  // 2. Synchroniser avec react-hook-form
  useEffect(() => {
    setValue('specialties', specialties)
  }, [specialties, setValue])

  // 3. Fonctions de gestion
  const addItem = () => {
    if (specialties.length < MAX_ITEMS) {
      setSpecialties([...specialties, ''])
    }
  }

  const removeItem = (index: number) => {
    if (specialties.length > 1) {
      setSpecialties(specialties.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, value: string) => {
    const updated = [...specialties]
    updated[index] = value
    setSpecialties(updated)
  }

  // 4. Charger les données en mode édition
  useEffect(() => {
    if (item && open) {
      const items = item.specialties.length ? item.specialties : ['']
      setSpecialties(items)
      reset({
        specialties: items,
        // ... autres champs
      })
    }
  }, [item, open, reset])

  // 5. JSX avec inputs contrôlés
  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      {specialties.map((specialty, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={specialty}
            onChange={(e) => updateItem(index, e.target.value)}
            disabled={loading}
          />
          {specialties.length > 1 && (
            <Button
              type="button"
              onClick={() => removeItem(index)}
            >
              Remove
            </Button>
          )}
        </div>
      ))}
      <Button type="button" onClick={addItem}>
        Add Item
      </Button>
    </form>
  )
}
```

**❌ Pattern à éviter (useFieldArray avec as any) :**

```typescript
// ❌ Problème : Erreur TypeScript avec as any sur resolver
const { control } = useForm({
  resolver: zodResolver(schema) as any, // ← Casse l'inférence de type
})

const { fields, append, remove } = useFieldArray({
  control, // ← Type 'never' - ne peut pas inférer
  name: 'specialties', // ← Erreur: 'string' not assignable to 'never'
})
```

**Cas d'usage :**
- ✅ Arrays dynamiques de strings (specialties, tags, keywords)
- ✅ Arrays de nested objects simples
- ✅ Formulaires avec 'as any' sur zodResolver
- ✅ Quand useFieldArray donne des erreurs TypeScript persistantes

**Raison :**
- Évite les problèmes de typage TypeScript avec useFieldArray
- Plus de contrôle explicite sur l'état de l'array
- Déboggage plus simple (état local visible)
- Compatible avec tous les schémas Zod

**Conséquence violation :**
- 10+ commits pour résoudre des erreurs TypeScript
- Build bloqué par erreurs de type 'never'
- Perte de temps à chercher des workarounds de typage

**Performance :**
- ℹ️ useState est légèrement plus performant que useFieldArray (moins de re-renders)
- ℹ️ useFieldArray est utile pour validation granulaire par item, mais useState suffit pour la plupart des cas

---

#### 8.3.20 Import de CrudService et Types Communs

✅ **RÈGLE OBLIGATOIRE** : Toujours importer `CrudService` et autres types communs depuis `/src/lib/types/common/api.ts`

**Pattern correct :**

```typescript
// /src/lib/services/admin/my-entity.service.ts
import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  MyEntity,
  CreateMyEntityDto,
  UpdateMyEntityDto,
} from '@/lib/types/admin/my-entity'

// ✅ CORRECT : Import depuis le chemin canonique
import type {
  PaginatedResponse,
  PaginationParams,
  CrudService,
} from '@/lib/types/common/api'

// ✅ CORRECT : Spécifier les 3 génériques de CrudService
class MyEntityService implements CrudService<
  MyEntity,           // Type de l'entité
  CreateMyEntityDto,  // DTO création
  UpdateMyEntityDto   // DTO mise à jour
> {
  private readonly baseUrl = '/api/v1/my-entities'

  async getAll(params?: PaginationParams): Promise<PaginatedResponse<MyEntity>> {
    // ... implémentation
  }

  async create(data: CreateMyEntityDto): Promise<MyEntity> {
    // ... implémentation
  }

  async update(id: string, data: UpdateMyEntityDto): Promise<MyEntity> {
    // ... implémentation
  }

  // ... autres méthodes CRUD
}

export const myEntityService = new MyEntityService()
```

**❌ Erreurs courantes :**

```typescript
// ❌ ERREUR 1 : Import depuis chemin relatif inexistant
import type { CrudService } from './types' // Fichier n'existe pas

// ❌ ERREUR 2 : Génériques manquants
class MyService implements CrudService<MyEntity> {
  // Erreur: Generic type 'CrudService<T, CreateDto, UpdateDto>' requires 3 type argument(s)
}

// ❌ ERREUR 3 : Ne pas implémenter CrudService
class MyService { // Pas de garantie de l'interface CRUD
  async getAll() { /* ... */ }
}
```

**Types à importer depuis `/src/lib/types/common/api.ts` :**
- ✅ `CrudService<T, CreateDto, UpdateDto>` - Interface pour services CRUD
- ✅ `BaseEntity` - Type de base pour toutes les entités
- ✅ `PaginatedResponse<T>` - Réponse paginée
- ✅ `PaginationParams` - Paramètres de pagination
- ✅ `ApiError` - Type d'erreur API

**Raison :**
- Cohérence : Tous les services utilisent la même interface
- Type safety : Les 3 génériques garantissent l'implémentation complète
- Maintenance : Changement de l'interface se propage automatiquement
- Documentation : L'interface est auto-documentée

**Conséquence violation :**
- Build error: "Cannot find module './types'"
- Build error: "Generic type requires 3 type argument(s)"
- Services non standardisés (méthodes manquantes ou signatures différentes)
- Perte de type safety

**Checklist service CRUD :**
- [ ] Import `CrudService` depuis `@/lib/types/common/api`
- [ ] Spécifier les 3 génériques : `<Entity, CreateDto, UpdateDto>`
- [ ] Implémenter toutes les méthodes : getAll, getById, create, update, delete
- [ ] Ajouter restore() si soft delete
- [ ] Logger toutes les opérations
- [ ] Utiliser apiClient (jamais fetch direct)
- [ ] Documenter avec JSDoc

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

### 11.3 Règle du Build Obligatoire - Renforcement

⚠️ **RÈGLE CRITIQUE NON NÉGOCIABLE**

Cette règle est **LA PLUS IMPORTANTE** de tous les standards de développement. Sa violation entraîne des conséquences graves en production.

**Processus Obligatoire :**

```bash
# ❌ MAUVAIS - Commit sans build
git add .
git commit -m "feat: add new feature"  # ❌ ERREUR!

# ✅ CORRECT - Toujours build AVANT commit
npm run build                          # 1. Build d'abord
# Si succès ✅ :
git add .
git commit -m "feat: add new feature"  # 2. Commit ensuite
git push

# Si échec ❌ :
# - NE PAS commiter
# - Corriger TOUTES les erreurs TypeScript
# - Re-build jusqu'à succès
# - ALORS commiter
```

**Vérification Rapide (Alternative) :**

```bash
# Pour vérifier TypeScript sans full build
npx tsc --noEmit

# Si 0 erreurs → OK pour commiter
# Si erreurs → Corriger puis re-vérifier
```

**Conséquences de la Violation :**

1. **Erreurs Runtime en Production** 🔥
   - Types incorrects non détectés
   - Imports manquants
   - API incompatibles
   - Crash applicatif

2. **Blocage du Pipeline CI/CD** 🚫
   - Build échoue sur le serveur
   - Déploiement impossible
   - Blocage de toute l'équipe
   - Rollback nécessaire

3. **Perte de Confiance du Code** 📉
   - Code non fiable
   - Régressions fréquentes
   - Temps perdu en debugging
   - Dette technique croissante

**Exceptions Autorisées : AUCUNE**

Même les "erreurs de réseau Google Fonts" ou autres warnings doivent être investigués et résolus.

**Vérification du Succès du Build :**

```bash
npm run build

# ✅ SUCCÈS - Exemple de sortie OK :
#    ✓ Compiled successfully
#    Route (app)                              Size     First Load JS
#    ┌ ○ /                                    137 B          87 kB
#    └ ○ /admin/units                         145 B          89 kB

# ❌ ÉCHEC - Exemple de sortie KO :
#    Failed to compile.
#
#    ./src/app/(app)/admin/units/page.tsx:12:14
#    Type error: Cannot find module '@/lib/types/admin/unit'
#
#    > 12 | import type { Unit } from '@/lib/types/admin/unit'
#         |              ^
```

**Rappel de la Règle :**

> **AVANT CHAQUE COMMIT** : exécuter `npm run build`
>
> **Si build échoue** : ❌ NE PAS commiter
>
> **Corriger TOUTES les erreurs** : TypeScript, ESLint, imports
>
> **Re-build jusqu'à succès** : ✅ ALORS commiter
>
> **AUCUNE EXCEPTION** : Cette règle s'applique à 100% des commits

---

### 11.4 Branches

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

### Phase 9: Modèle de Référence Obligatoire

⚠️ **RÈGLE CRITIQUE : TOUJOURS COPIER DEPUIS LE MODÈLE**

Cette phase est **OBLIGATOIRE AVANT TOUTE IMPLÉMENTATION** d'une nouvelle entité admin.

#### 14.8 Utilisation du Modèle de Référence

**Modèle Pilote Officiel :**

Le fichier **`/src/app/(app)/admin/active-substances/page.tsx`** est le **SEUL modèle de référence** approuvé pour toutes les implémentations d'entités admin simples (référentiel global sans relations complexes).

**Processus Obligatoire :**

```bash
# 1. TOUJOURS commencer par copier le modèle
cp src/app/(app)/admin/active-substances/page.tsx \
   src/app/(app)/admin/[new-entity]/page.tsx

# 2. ENSUITE adapter les noms d'entité
# Remplacer "ActiveSubstance" par "YourEntity"
# Remplacer "active-substances" par "your-entities"
```

**Pourquoi ce Modèle est Obligatoire :**

1. ✅ **API DataTable Correcte** (props plates, pas d'objets)
2. ✅ **Imports Standardisés** (chemins canoniques vérifiés)
3. ✅ **Pattern Hook Correct** (useCallback, useEffect, pagination)
4. ✅ **Gestion Erreurs Complète** (Toast, logging, error boundaries)
5. ✅ **i18n Défensif** (gestion enum null/undefined)
6. ✅ **DeleteConfirmModal API** (itemName uniquement)
7. ✅ **Card Wrapper** (DataTable wrappé correctement)
8. ✅ **TypeScript Strict** (pas d'any, types complets)

**❌ INTERDICTIONS ABSOLUES :**

- ❌ **NE JAMAIS** inventer une nouvelle API pour DataTable
- ❌ **NE JAMAIS** deviner les imports (toujours copier du modèle)
- ❌ **NE JAMAIS** créer une structure différente sans justification
- ❌ **NE JAMAIS** ignorer les patterns du modèle (defensive coding, etc.)

**Exemple Concret - Création de l'entité "Units" :**

```typescript
// ❌ MAUVAIS - Inventer l'API
<DataTable
  pagination={{ page: 1, limit: 25, total: 100 }}  // ❌ N'existe pas!
  sorting={{ sortBy: 'name', sortOrder: 'asc' }}   // ❌ N'existe pas!
/>

// ✅ CORRECT - Copier du modèle active-substances/page.tsx
<DataTable<Unit>
  data={data}
  columns={columns}
  totalItems={total}              // ✅ Props plates
  page={params.page || 1}
  limit={params.limit || 25}
  onPageChange={(page) => setParams({ ...params, page })}
  onLimitChange={(limit) => setParams({ ...params, limit, page: 1 })}
  sortBy={params.sortBy}
  sortOrder={params.sortOrder}
  onSortChange={(sortBy, sortOrder) => setParams({ ...params, sortBy, sortOrder })}
  onEdit={handleEdit}
  onDelete={handleDeleteClick}
  loading={loading}
  emptyMessage={t('messages.noResults')}
  searchPlaceholder={t('search.placeholder')}
/>
```

**Checklist de Vérification :**

Après avoir copié et adapté le modèle, vérifier :

- [ ] Tous les imports correspondent au modèle
- [ ] L'API DataTable est identique (props plates)
- [ ] Les hooks utilisent useCallback et useEffect comme le modèle
- [ ] La gestion des erreurs utilise Toast comme le modèle
- [ ] Les enums sont défensifs avant traduction i18n
- [ ] DeleteConfirmModal utilise uniquement `itemName`
- [ ] DataTable est wrappé dans Card > CardContent
- [ ] Les types sont stricts (pas d'any)
- [ ] Le build passe : `npx tsc --noEmit`

**En Cas de Doute :**

> Si vous ne savez pas comment implémenter quelque chose, **REGARDEZ LE MODÈLE**.
>
> Si le modèle ne couvre pas votre cas d'usage, **DEMANDEZ AVANT D'INVENTER**.
>
> Le modèle active-substances/page.tsx a été validé et testé. Il contient toutes les bonnes pratiques.

**Conséquences de la Non-Conformité :**

- Build failures (imports incorrects, API incompatibles)
- Runtime errors (props undefined, crashes)
- Audit failures (violations des standards)
- Refactoring massif nécessaire (perte de temps)

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

**Dernière mise à jour :** 2025-12-01
**Version :** 1.3
**Mainteneur :** Équipe AniTra
