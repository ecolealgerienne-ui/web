# Phase 3 : Entité Pilote - Active-Substances

**Date :** 2025-11-30
**Objectif :** Créer l'entité pilote Active-Substances avec CRUD complet qui servira de modèle pour les 15 autres entités

---

## ✅ CHECKLIST DES 7 RÈGLES ABSOLUES

Avant CHAQUE fichier créé, vérifier :

- [ ] ❌ **Règle #1** : Aucune valeur en dur (toujours i18n)
- [ ] ❌ **Règle #2** : Jamais fetch() directement (toujours apiClient)
- [ ] ❌ **Règle #3** : Utiliser composants génériques (DataTable/Pagination/DeleteConfirmModal)
- [ ] ❌ **Règle #4** : Utiliser types Phase 1 (BaseEntity/PaginatedResponse/HTTP_STATUS/CrudService)
- [ ] ❌ **Règle #5** : Build réussi avant commit
- [ ] ❌ **Règle #6** : i18n complet (FR/EN/AR)
- [ ] ❌ **Règle #7** : Toutes les erreurs loggées

---

## 📋 TÂCHES PHASE 3

### 1. Types TypeScript (30min)

**Fichier :** `/src/lib/types/admin/active-substance.ts`

```typescript
import { BaseEntity } from '@/lib/types/common/api'

/**
 * Substance active pharmaceutique
 * ✅ RÈGLE #4 : Étend BaseEntity
 */
export interface ActiveSubstance extends BaseEntity {
  /** Code unique (ex: AMOX) */
  code: string

  /** Nom international (DCI) */
  name: string

  /** Description optionnelle */
  description?: string

  // BaseEntity fournit :
  // - id: string
  // - createdAt?: string
  // - updatedAt?: string
  // - deletedAt?: string | null
  // - version?: number
  // - isActive?: boolean
}

/**
 * DTO pour création
 */
export interface CreateActiveSubstanceDto {
  code: string
  name: string
  description?: string
  isActive?: boolean
}

/**
 * DTO pour mise à jour
 * ✅ RÈGLE #4 : version obligatoire pour optimistic locking
 */
export interface UpdateActiveSubstanceDto {
  code?: string
  name?: string
  description?: string
  isActive?: boolean
  version: number
}
```

**Vérifications :**
- ✅ Étend BaseEntity (Règle #4)
- ✅ Types stricts
- ✅ JSDoc complet

---

### 2. Schéma Zod Validation (30min)

**Fichier :** `/src/lib/validation/schemas/admin/active-substance.schema.ts`

```typescript
import { z } from 'zod'

/**
 * Schéma de validation pour Active-Substance
 * ✅ RÈGLE #6 : Messages i18n (pas de texte en dur)
 */
export const activeSubstanceSchema = z.object({
  code: z.string()
    .min(1, 'activeSubstance.validation.code.required')
    .max(50, 'activeSubstance.validation.code.maxLength')
    .regex(/^[A-Z0-9_-]+$/, 'activeSubstance.validation.code.pattern'),

  name: z.string()
    .min(1, 'activeSubstance.validation.name.required')
    .max(200, 'activeSubstance.validation.name.maxLength'),

  description: z.string()
    .max(1000, 'activeSubstance.validation.description.maxLength')
    .optional(),

  isActive: z.boolean().optional(),
})

export const updateActiveSubstanceSchema = activeSubstanceSchema.extend({
  version: z.number().int().positive(),
})

export type ActiveSubstanceFormData = z.infer<typeof activeSubstanceSchema>
export type UpdateActiveSubstanceFormData = z.infer<typeof updateActiveSubstanceSchema>
```

**Vérifications :**
- ✅ Messages i18n (Règle #6)
- ✅ Validation complète
- ✅ Types inférés

---

### 3. Service CRUD (1-2h)

**Fichier :** `/src/lib/services/admin/active-substances.service.ts`

```typescript
import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import { HTTP_STATUS } from '@/lib/constants/http-status'
import type {
  ActiveSubstance,
  CreateActiveSubstanceDto,
  UpdateActiveSubstanceDto
} from '@/lib/types/admin/active-substance'
import type {
  CrudService,
  PaginatedResponse,
  PaginationParams
} from '@/lib/types/common/api'

/**
 * Service CRUD pour Active-Substances
 * ✅ RÈGLE #2 : Utilise apiClient (jamais fetch directement)
 * ✅ RÈGLE #4 : Implémente CrudService
 * ✅ RÈGLE #7 : Logger toutes les opérations
 */
class ActiveSubstancesService implements CrudService<ActiveSubstance, CreateActiveSubstanceDto, UpdateActiveSubstanceDto> {
  private readonly baseUrl = '/api/v1/admin/active-substances'

  /**
   * Récupère toutes les substances actives avec pagination
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<ActiveSubstance>> {
    try {
      logger.info('Fetching active substances', { params })

      const response = await apiClient.get<PaginatedResponse<ActiveSubstance>>(
        this.baseUrl,
        { params }
      )

      logger.info('Active substances fetched', {
        count: response.data.length,
        total: response.meta.total
      })

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
      logger.info('Fetching active substance', { id })

      const substance = await apiClient.get<ActiveSubstance>(
        `${this.baseUrl}/${id}`
      )

      logger.info('Active substance fetched', { id, code: substance.code })
      return substance
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
      logger.info('Creating active substance', { code: data.code })

      const substance = await apiClient.post<ActiveSubstance>(
        this.baseUrl,
        data
      )

      logger.info('Active substance created', {
        id: substance.id,
        code: substance.code
      })

      return substance
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
      logger.info('Updating active substance', { id, version: data.version })

      const substance = await apiClient.patch<ActiveSubstance>(
        `${this.baseUrl}/${id}`,
        data
      )

      logger.info('Active substance updated', {
        id: substance.id,
        code: substance.code,
        newVersion: substance.version
      })

      return substance
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
      logger.info('Deleting active substance', { id })

      await apiClient.delete(`${this.baseUrl}/${id}`)

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
      logger.info('Restoring active substance', { id })

      const substance = await apiClient.post<ActiveSubstance>(
        `${this.baseUrl}/${id}/restore`
      )

      logger.info('Active substance restored', {
        id: substance.id,
        code: substance.code
      })

      return substance
    } catch (error) {
      logger.error('Failed to restore active substance', { error, id })
      throw error
    }
  }
}

export const activeSubstancesService = new ActiveSubstancesService()
```

**Vérifications :**
- ✅ Utilise apiClient (Règle #2)
- ✅ Implémente CrudService (Règle #4)
- ✅ Logger partout (Règle #7)
- ✅ Utilise HTTP_STATUS (Règle #4)
- ✅ JSDoc complet

---

### 4. i18n (FR/EN/AR) (1h)

**Fichiers :** Ajouter dans `/src/lib/i18n/messages/{fr,en,ar}.json`

**Structure complète :**

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
      "description": "Description",
      "isActive": "Actif"
    },
    "validation": {
      "code": {
        "required": "Le code est requis",
        "maxLength": "Le code ne doit pas dépasser 50 caractères",
        "pattern": "Le code doit contenir uniquement des lettres majuscules, chiffres, tirets et underscores"
      },
      "name": {
        "required": "Le nom est requis",
        "maxLength": "Le nom ne doit pas dépasser 200 caractères"
      },
      "description": {
        "maxLength": "La description ne doit pas dépasser 1000 caractères"
      }
    },
    "actions": {
      "create": "Créer une substance active",
      "edit": "Modifier la substance active",
      "delete": "Supprimer la substance active",
      "restore": "Restaurer la substance active"
    },
    "messages": {
      "created": "Substance active créée avec succès",
      "updated": "Substance active mise à jour avec succès",
      "deleted": "Substance active supprimée avec succès",
      "restored": "Substance active restaurée avec succès",
      "createError": "Erreur lors de la création de la substance active",
      "updateError": "Erreur lors de la mise à jour de la substance active",
      "deleteError": "Erreur lors de la suppression de la substance active",
      "confirmDelete": "Voulez-vous vraiment supprimer la substance active «{name}» ?",
      "noResults": "Aucune substance active trouvée"
    }
  }
}
```

**Vérifications :**
- ✅ i18n complet FR/EN/AR (Règle #6)
- ✅ Aucune valeur en dur (Règle #1)

---

### 5. Hook Custom (1h)

**Fichier :** `/src/lib/hooks/admin/useActiveSubstances.ts`

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/contexts/toast-context'
import { useTranslations } from 'next-intl'
import { activeSubstancesService } from '@/lib/services/admin/active-substances.service'
import { handleApiError } from '@/lib/utils/api-error-handler'
import type {
  ActiveSubstance,
  CreateActiveSubstanceDto,
  UpdateActiveSubstanceDto
} from '@/lib/types/admin/active-substance'
import type { PaginationParams } from '@/lib/types/common/api'

/**
 * Hook pour gérer les substances actives
 * ✅ RÈGLE #6 : i18n pour tous les messages
 * ✅ RÈGLE #7 : Gestion d'erreurs avec handleApiError
 */
export function useActiveSubstances(initialParams?: PaginationParams) {
  const toast = useToast()
  const t = useTranslations('activeSubstance')
  const tc = useTranslations('common')

  const [data, setData] = useState<ActiveSubstance[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [params, setParams] = useState<PaginationParams>(initialParams || {
    page: 1,
    limit: 25,
    sortBy: 'name',
    sortOrder: 'asc',
  })

  /**
   * Charge les substances actives
   */
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await activeSubstancesService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (err) {
      setError(err as Error)
      handleApiError(err, 'fetch active substances', toast)
    } finally {
      setLoading(false)
    }
  }, [params, toast])

  /**
   * Crée une substance active
   */
  const create = useCallback(async (dto: CreateActiveSubstanceDto) => {
    try {
      const substance = await activeSubstancesService.create(dto)
      toast.success(tc('messages.success'), t('messages.created'))
      await fetchData()
      return substance
    } catch (err) {
      handleApiError(err, 'create active substance', toast, {
        409: t('messages.createError'),
      })
      throw err
    }
  }, [fetchData, toast, t, tc])

  /**
   * Met à jour une substance active
   */
  const update = useCallback(async (id: string, dto: UpdateActiveSubstanceDto) => {
    try {
      const substance = await activeSubstancesService.update(id, dto)
      toast.success(tc('messages.success'), t('messages.updated'))
      await fetchData()
      return substance
    } catch (err) {
      handleApiError(err, 'update active substance', toast, {
        409: t('messages.updateError'),
      })
      throw err
    }
  }, [fetchData, toast, t, tc])

  /**
   * Supprime une substance active
   */
  const deleteItem = useCallback(async (id: string) => {
    try {
      await activeSubstancesService.delete(id)
      toast.success(tc('messages.success'), t('messages.deleted'))
      await fetchData()
    } catch (err) {
      handleApiError(err, 'delete active substance', toast, {
        409: t('messages.deleteError'),
      })
      throw err
    }
  }, [fetchData, toast, t, tc])

  /**
   * Charge au montage et quand params changent
   */
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    total,
    loading,
    error,
    params,
    setParams,
    refetch: fetchData,
    create,
    update,
    delete: deleteItem,
  }
}
```

**Vérifications :**
- ✅ i18n complet (Règle #6)
- ✅ handleApiError (Règle #7)
- ✅ Toast pour feedback utilisateur

---

### 6. Composant Formulaire (1-2h)

**Fichier :** `/src/components/admin/active-substances/ActiveSubstanceForm.tsx`

Détails dans l'implémentation...

---

### 7. Page Liste (1-2h)

**Fichier :** `/src/app/(app)/admin/active-substances/page.tsx`

**Utilisation OBLIGATOIRE :**
- ✅ **DataTable<ActiveSubstance>** (Règle #3)
- ✅ **Pagination** (Règle #3)
- ✅ **DeleteConfirmModal** (Règle #3)

---

## 🎯 RÉSULTAT FINAL

Après Phase 3, nous aurons :

1. ✅ Types complets (BaseEntity)
2. ✅ Validation Zod (i18n)
3. ✅ Service CRUD (CrudService, apiClient, logger)
4. ✅ i18n FR/EN/AR complet
5. ✅ Hook custom useActiveSubstances
6. ✅ Formulaire réutilisable
7. ✅ Page liste avec DataTable
8. ✅ Build réussi
9. ✅ **MODÈLE pour 15 autres entités**

---

## 📊 ESTIMATION

**Temps total :** ~8-10 heures

- Types + Validation : 1h
- Service CRUD : 2h
- i18n : 1h
- Hook : 1h
- Formulaire : 2h
- Page liste : 2h
- Tests + Build : 1h

---

**Ce plan sera le modèle EXACT pour les 15 autres entités admin.**
