import { useState, useEffect, useCallback } from 'react'
import {
  therapeuticIndicationsService,
  type TherapeuticIndicationFilterParams,
} from '@/lib/services/admin/therapeutic-indications.service'
import type {
  TherapeuticIndication,
  CreateTherapeuticIndicationDto,
  UpdateTherapeuticIndicationDto,
} from '@/lib/types/admin/therapeutic-indication'
import { useToast } from '@/contexts/toast-context'
import { handleApiError } from '@/lib/utils/api-error-handler'

/**
 * Hook personnalisé pour gérer les Indications Thérapeutiques (Therapeutic Indications)
 *
 * ✅ RÈGLE #7 : Hook personnalisé pour encapsuler la logique CRUD
 * ✅ RÈGLE #8 : Gestion d'erreurs avec handleApiError
 * ✅ RÈGLE #8 : Toast notifications pour succès/erreurs
 * ✅ RÈGLE Section 8.3.24 : Utilise response.meta.total
 * ✅ RÈGLE Section 7.7 : Hook gère params en interne, exposé au composant
 *
 * Pattern: Simple Reference Data (entité la plus complexe)
 *
 * @param initialParams - Paramètres de filtrage initiaux
 * @returns Objet contenant data, total, loading, params, et fonctions CRUD
 *
 * @example
 * ```typescript
 * const {
 *   data,
 *   total,
 *   loading,
 *   params,
 *   setParams,
 *   create,
 *   update,
 *   delete: deleteIndication,
 *   restore,
 *   verify,
 *   unverify,
 *   refetch
 * } = useTherapeuticIndications({ productId: 'prod-123', page: 1, limit: 50 })
 * ```
 */
export function useTherapeuticIndications(initialParams: TherapeuticIndicationFilterParams = {}) {
  // États
  const [data, setData] = useState<TherapeuticIndication[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [params, setParams] = useState<TherapeuticIndicationFilterParams>({
    page: 1,
    limit: 50,
    sortBy: 'code',
    sortOrder: 'asc',
    ...initialParams,
  })

  // Contexte toast pour notifications
  const toast = useToast()

  /**
   * Récupérer la liste des indications thérapeutiques
   * ✅ RÈGLE Section 7.4 : useCallback pour fonction dans dépendances
   */
  const fetchIndications = useCallback(async () => {
    setLoading(true)
    try {
      const response = await therapeuticIndicationsService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (error) {
      handleApiError(error, 'therapeuticIndications.fetch', toast)
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [params, toast])

  /**
   * Effet pour charger les données au montage et quand params change
   * ✅ RÈGLE Section 7.4 : Dépendances exhaustives
   */
  useEffect(() => {
    fetchIndications()
  }, [fetchIndications])

  /**
   * Créer une nouvelle indication thérapeutique
   *
   * @param data - Données de création
   * @returns Promise<TherapeuticIndication | null>
   */
  const create = async (data: CreateTherapeuticIndicationDto): Promise<TherapeuticIndication | null> => {
    try {
      const indication = await therapeuticIndicationsService.create(data)
      toast.success('therapeuticIndication.messages.createSuccess')
      await fetchIndications() // Rafraîchir la liste
      return indication
    } catch (error) {
      handleApiError(error, 'therapeuticIndications.create', toast)
      return null
    }
  }

  /**
   * Mettre à jour une indication thérapeutique existante
   *
   * @param id - ID de l'indication
   * @param data - Données de mise à jour
   * @returns Promise<TherapeuticIndication | null>
   */
  const update = async (
    id: string,
    data: UpdateTherapeuticIndicationDto
  ): Promise<TherapeuticIndication | null> => {
    try {
      const indication = await therapeuticIndicationsService.update(id, data)
      toast.success('therapeuticIndication.messages.updateSuccess')
      await fetchIndications() // Rafraîchir la liste
      return indication
    } catch (error) {
      handleApiError(error, 'therapeuticIndications.update', toast)
      return null
    }
  }

  /**
   * Supprimer une indication thérapeutique (soft delete)
   *
   * @param id - ID de l'indication
   * @returns Promise<boolean> - true si succès, false sinon
   */
  const deleteIndication = async (id: string): Promise<boolean> => {
    try {
      await therapeuticIndicationsService.delete(id)
      toast.success('therapeuticIndication.messages.deleteSuccess')
      await fetchIndications() // Rafraîchir la liste
      return true
    } catch (error) {
      handleApiError(error, 'therapeuticIndications.delete', toast)
      return false
    }
  }

  /**
   * Restaurer une indication thérapeutique supprimée
   *
   * @param id - ID de l'indication
   * @returns Promise<TherapeuticIndication | null>
   */
  const restore = async (id: string): Promise<TherapeuticIndication | null> => {
    try {
      const indication = await therapeuticIndicationsService.restore(id)
      toast.success('therapeuticIndication.messages.restoreSuccess')
      await fetchIndications() // Rafraîchir la liste
      return indication
    } catch (error) {
      handleApiError(error, 'therapeuticIndications.restore', toast)
      return null
    }
  }

  /**
   * Vérifier (valider) une indication thérapeutique
   *
   * @param id - ID de l'indication
   * @returns Promise<TherapeuticIndication | null>
   */
  const verify = async (id: string): Promise<TherapeuticIndication | null> => {
    try {
      const indication = await therapeuticIndicationsService.verify(id)
      toast.success('therapeuticIndication.messages.verifySuccess')
      await fetchIndications() // Rafraîchir la liste
      return indication
    } catch (error) {
      handleApiError(error, 'therapeuticIndications.verify', toast)
      return null
    }
  }

  /**
   * Révoquer la vérification d'une indication thérapeutique
   *
   * @param id - ID de l'indication
   * @returns Promise<TherapeuticIndication | null>
   */
  const unverify = async (id: string): Promise<TherapeuticIndication | null> => {
    try {
      const indication = await therapeuticIndicationsService.unverify(id)
      toast.success('therapeuticIndication.messages.unverifySuccess')
      await fetchIndications() // Rafraîchir la liste
      return indication
    } catch (error) {
      handleApiError(error, 'therapeuticIndications.unverify', toast)
      return null
    }
  }

  /**
   * Rafraîchir manuellement les données
   */
  const refetch = useCallback(() => {
    fetchIndications()
  }, [fetchIndications])

  return {
    // Données
    data,
    total,
    loading,

    // Paramètres
    params,
    setParams,

    // Actions CRUD
    create,
    update,
    delete: deleteIndication,
    restore,

    // Actions spécifiques (workflow de vérification)
    verify,
    unverify,

    // Utilitaires
    refetch,
  }
}
