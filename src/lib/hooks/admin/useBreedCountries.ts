import { useState, useEffect, useCallback } from 'react'
import {
  breedCountriesService,
  type BreedCountryFilterParams,
} from '@/lib/services/admin/breed-countries.service'
import type {
  BreedCountry,
  CreateBreedCountryDto,
  UpdateBreedCountryDto,
  UnlinkBreedCountryDto,
} from '@/lib/types/admin/breed-country'
import { useToast } from '@/contexts/toast-context'
import { handleApiError } from '@/lib/utils/api-error-handler'

/**
 * Hook personnalisé pour gérer les associations Race-Pays (Breed-Countries)
 *
 * ✅ RÈGLE #7 : Hook personnalisé pour encapsuler la logique CRUD
 * ✅ RÈGLE #8 : Gestion d'erreurs avec handleApiError
 * ✅ RÈGLE #8 : Toast notifications pour succès/erreurs
 * ✅ RÈGLE Section 8.3.24 : Utilise response.meta.total
 * ✅ RÈGLE Section 7.7 : Hook gère params en interne, exposé au composant
 *
 * Pattern: Junction Table (Many-to-Many)
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
 *   link,
 *   toggleActive,
 *   unlink,
 *   refetch
 * } = useBreedCountries({ breedId: 'breed-123', page: 1, limit: 50 })
 * ```
 */
export function useBreedCountries(initialParams: BreedCountryFilterParams = {}) {
  // États
  const [data, setData] = useState<BreedCountry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [params, setParams] = useState<BreedCountryFilterParams>({
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'asc',
    ...initialParams,
  })

  // Contexte toast pour notifications
  const toast = useToast()

  /**
   * Récupérer la liste des associations
   * ✅ RÈGLE Section 7.4 : useCallback pour fonction dans dépendances
   */
  const fetchBreedCountries = useCallback(async () => {
    setLoading(true)
    try {
      const response = await breedCountriesService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (error) {
      handleApiError(error, 'breedCountries.fetch', toast)
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
    fetchBreedCountries()
  }, [fetchBreedCountries])

  /**
   * Créer un lien Race-Pays (link)
   *
   * @param data - Données de création du lien
   * @returns Promise<BreedCountry | null>
   */
  const link = async (data: CreateBreedCountryDto): Promise<BreedCountry | null> => {
    try {
      const breedCountry = await breedCountriesService.link(data)
      toast.success('breedCountry.messages.linkSuccess')
      await fetchBreedCountries() // Rafraîchir la liste
      return breedCountry
    } catch (error) {
      handleApiError(error, 'breedCountries.link', toast)
      return null
    }
  }

  /**
   * Activer/Désactiver un lien
   *
   * @param id - ID de l'association
   * @param isActive - Nouveau statut
   * @returns Promise<BreedCountry | null>
   */
  const toggleActive = async (id: string, isActive: boolean): Promise<BreedCountry | null> => {
    try {
      const breedCountry = await breedCountriesService.toggleActive(id, { isActive })
      toast.success(
        isActive ? 'breedCountry.messages.activateSuccess' : 'breedCountry.messages.deactivateSuccess'
      )
      await fetchBreedCountries() // Rafraîchir la liste
      return breedCountry
    } catch (error) {
      handleApiError(error, 'breedCountries.toggleActive', toast)
      return null
    }
  }

  /**
   * Supprimer un lien Race-Pays (unlink)
   * Suppression définitive (pas de soft delete)
   *
   * @param data - Données pour identifier le lien à supprimer
   * @returns Promise<boolean> - true si succès, false sinon
   */
  const unlink = async (data: UnlinkBreedCountryDto): Promise<boolean> => {
    try {
      await breedCountriesService.unlink(data)
      toast.success('breedCountry.messages.unlinkSuccess')
      await fetchBreedCountries() // Rafraîchir la liste
      return true
    } catch (error) {
      handleApiError(error, 'breedCountries.unlink', toast)
      return false
    }
  }

  /**
   * Supprimer un lien par son ID
   * Alternative à unlink() quand on a l'ID directement
   *
   * @param id - ID de l'association
   * @returns Promise<boolean> - true si succès, false sinon
   */
  const deleteById = async (id: string): Promise<boolean> => {
    try {
      await breedCountriesService.delete(id)
      toast.success('breedCountry.messages.deleteSuccess')
      await fetchBreedCountries() // Rafraîchir la liste
      return true
    } catch (error) {
      handleApiError(error, 'breedCountries.delete', toast)
      return false
    }
  }

  /**
   * Rafraîchir manuellement les données
   */
  const refetch = useCallback(() => {
    fetchBreedCountries()
  }, [fetchBreedCountries])

  return {
    // Données
    data,
    total,
    loading,

    // Paramètres
    params,
    setParams,

    // Actions CRUD spécifiques aux jonctions
    link,
    toggleActive,
    unlink,
    delete: deleteById,

    // Utilitaires
    refetch,
  }
}
