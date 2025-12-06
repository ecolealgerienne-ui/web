import { useState, useEffect, useCallback } from 'react'
import {
  campaignCountriesService,
  type CampaignCountryFilterParams,
} from '@/lib/services/admin/campaign-countries.service'
import type {
  CampaignCountry,
  CreateCampaignCountryDto,
  UpdateCampaignCountryDto,
  UnlinkCampaignCountryDto,
} from '@/lib/types/admin/campaign-country'
import { useToast } from '@/contexts/toast-context'
import { handleApiError } from '@/lib/utils/api-error-handler'

/**
 * Hook personnalisé pour gérer les associations Campagne-Pays (Campaign-Countries)
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
 * } = useCampaignCountries({ campaignId: 'campaign-123', page: 1, limit: 50 })
 * ```
 */
export function useCampaignCountries(initialParams: CampaignCountryFilterParams = {}) {
  // États
  const [data, setData] = useState<CampaignCountry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [params, setParams] = useState<CampaignCountryFilterParams>({
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
  const fetchCampaignCountries = useCallback(async () => {
    setLoading(true)
    try {
      const response = await campaignCountriesService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (error) {
      handleApiError(error, 'campaignCountries.fetch', toast)
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
    fetchCampaignCountries()
  }, [fetchCampaignCountries])

  /**
   * Créer un lien Campagne-Pays (link)
   *
   * @param data - Données de création du lien
   * @returns Promise<CampaignCountry | null>
   */
  const link = async (data: CreateCampaignCountryDto): Promise<CampaignCountry | null> => {
    try {
      const campaignCountry = await campaignCountriesService.link(data)
      toast.success('campaignCountry.messages.linkSuccess')
      await fetchCampaignCountries() // Rafraîchir la liste
      return campaignCountry
    } catch (error) {
      handleApiError(error, 'campaignCountries.link', toast)
      return null
    }
  }

  /**
   * Activer/Désactiver un lien
   *
   * @param id - ID de l'association
   * @param isActive - Nouveau statut
   * @returns Promise<CampaignCountry | null>
   */
  const toggleActive = async (id: string, isActive: boolean): Promise<CampaignCountry | null> => {
    try {
      const campaignCountry = await campaignCountriesService.toggleActive(id, { isActive })
      toast.success(
        isActive
          ? 'campaignCountry.messages.activateSuccess'
          : 'campaignCountry.messages.deactivateSuccess'
      )
      await fetchCampaignCountries() // Rafraîchir la liste
      return campaignCountry
    } catch (error) {
      handleApiError(error, 'campaignCountries.toggleActive', toast)
      return null
    }
  }

  /**
   * Supprimer un lien Campagne-Pays (unlink)
   * Suppression définitive (pas de soft delete)
   *
   * @param data - Données pour identifier le lien à supprimer
   * @returns Promise<boolean> - true si succès, false sinon
   */
  const unlink = async (data: UnlinkCampaignCountryDto): Promise<boolean> => {
    try {
      await campaignCountriesService.unlink(data)
      toast.success('campaignCountry.messages.unlinkSuccess')
      await fetchCampaignCountries() // Rafraîchir la liste
      return true
    } catch (error) {
      handleApiError(error, 'campaignCountries.unlink', toast)
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
      await campaignCountriesService.delete(id)
      toast.success('campaignCountry.messages.deleteSuccess')
      await fetchCampaignCountries() // Rafraîchir la liste
      return true
    } catch (error) {
      handleApiError(error, 'campaignCountries.delete', toast)
      return false
    }
  }

  /**
   * Rafraîchir manuellement les données
   */
  const refetch = useCallback(() => {
    fetchCampaignCountries()
  }, [fetchCampaignCountries])

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
