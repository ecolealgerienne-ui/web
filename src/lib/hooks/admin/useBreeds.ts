import { useState, useEffect, useCallback } from 'react'
import { breedsService, type BreedFilterParams } from '@/lib/services/admin/breeds.service'
import type { Breed, CreateBreedDto, UpdateBreedDto } from '@/lib/types/admin/breed'
import { useToast } from '@/contexts/toast-context'
import { handleApiError } from '@/lib/utils/api-error-handler'

/**
 * Hook personnalisé pour gérer les Races (Breeds)
 *
 * ✅ RÈGLE #7 : Hook personnalisé pour encapsuler la logique CRUD
 * ✅ RÈGLE #8 : Gestion d'erreurs avec handleApiError
 * ✅ RÈGLE #8 : Toast notifications pour succès/erreurs
 *
 * Pattern: Scoped Reference Data (Scope: Species)
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
 *   delete: deleteBreed,
 *   restore,
 *   refetch
 * } = useBreeds({ speciesId: 'CAT', page: 1, limit: 25 })
 * ```
 */
export function useBreeds(initialParams: BreedFilterParams = {}) {
  // États
  const [data, setData] = useState<Breed[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [params, setParams] = useState<BreedFilterParams>({
    page: 1,
    limit: 25,
    sortBy: 'nameFr',
    sortOrder: 'asc',
    ...initialParams,
  })

  // Contexte toast pour notifications
  const toast = useToast()

  /**
   * Récupérer la liste des races
   * ✅ RÈGLE Section 7.4 : useCallback pour fonction dans dépendances
   */
  const fetchBreeds = useCallback(async () => {
    setLoading(true)
    try {
      const response = await breedsService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (error) {
      handleApiError(error, 'breeds.fetch', toast)
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
    fetchBreeds()
  }, [fetchBreeds])

  /**
   * Créer une nouvelle race
   *
   * @param data - Données de création
   * @returns Promise<Breed | null>
   */
  const create = async (data: CreateBreedDto): Promise<Breed | null> => {
    try {
      const breed = await breedsService.create(data)
      toast.success('breed.messages.createSuccess')
      await fetchBreeds() // Rafraîchir la liste
      return breed
    } catch (error) {
      handleApiError(error, 'breeds.create', toast)
      return null
    }
  }

  /**
   * Mettre à jour une race existante
   *
   * @param id - ID de la race
   * @param data - Données de mise à jour
   * @returns Promise<Breed | null>
   */
  const update = async (id: string, data: UpdateBreedDto): Promise<Breed | null> => {
    try {
      const breed = await breedsService.update(id, data)
      toast.success('breed.messages.updateSuccess')
      await fetchBreeds() // Rafraîchir la liste
      return breed
    } catch (error) {
      handleApiError(error, 'breeds.update', toast)
      return null
    }
  }

  /**
   * Supprimer une race (soft delete)
   *
   * @param id - ID de la race
   * @returns Promise<boolean> - true si succès, false sinon
   */
  const deleteBreed = async (id: string): Promise<boolean> => {
    try {
      await breedsService.delete(id)
      toast.success('breed.messages.deleteSuccess')
      await fetchBreeds() // Rafraîchir la liste
      return true
    } catch (error) {
      handleApiError(error, 'breeds.delete', toast)
      return false
    }
  }

  /**
   * Restaurer une race supprimée
   *
   * @param id - ID de la race
   * @returns Promise<Breed | null>
   */
  const restore = async (id: string): Promise<Breed | null> => {
    try {
      const breed = await breedsService.restore(id)
      toast.success('breed.messages.restoreSuccess')
      await fetchBreeds() // Rafraîchir la liste
      return breed
    } catch (error) {
      handleApiError(error, 'breeds.restore', toast)
      return null
    }
  }

  /**
   * Rafraîchir manuellement les données
   */
  const refetch = useCallback(() => {
    fetchBreeds()
  }, [fetchBreeds])

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
    delete: deleteBreed,
    restore,

    // Utilitaires
    refetch,
  }
}
