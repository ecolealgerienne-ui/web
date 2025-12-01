/**
 * Hook personnalisé pour gérer les campagnes nationales (Admin Reference Data)
 *
 * ✅ RÈGLE #6 : i18n pour tous les messages
 * ✅ RÈGLE #7 : Gestion d'erreurs avec handleApiError
 *
 * @param initialParams - Paramètres de pagination initiaux
 * @returns État et fonctions CRUD pour les campagnes nationales
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
 *   delete: deleteItem,
 *   refetch
 * } = useNationalCampaigns({ page: 1, limit: 20 })
 * ```
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/contexts/toast-context'
import { useTranslations } from 'next-intl'
import { nationalCampaignsService } from '@/lib/services/admin/national-campaigns.service'
import { handleApiError } from '@/lib/utils/api-error-handler'
import type {
  NationalCampaign,
  CreateNationalCampaignDto,
  UpdateNationalCampaignDto,
  NationalCampaignFilterParams,
} from '@/lib/types/admin/national-campaign'

export function useNationalCampaigns(
  initialParams?: NationalCampaignFilterParams
) {
  const toast = useToast()
  const t = useTranslations('nationalCampaign')
  const tc = useTranslations('common')

  // État local
  const [data, setData] = useState<NationalCampaign[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [params, setParams] = useState<NationalCampaignFilterParams>(
    initialParams || {
      page: 1,
      limit: 20,
      orderBy: 'startDate',
      order: 'DESC',
    }
  )

  // Ref pour empêcher les appels concurrents (ne déclenche pas de re-render)
  const isFetchingRef = useRef(false)

  /**
   * Charge les campagnes nationales avec les paramètres actuels
   */
  const fetchData = useCallback(async () => {
    // Empêcher les appels concurrents
    if (isFetchingRef.current) {
      return
    }

    isFetchingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const response = await nationalCampaignsService.getAll(params)
      setData(response.data)
      setTotal(response.meta.total)
    } catch (err) {
      setError(err as Error)
      handleApiError(err, 'fetch national campaigns', toast)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [params, toast])

  /**
   * Crée une nouvelle campagne nationale
   *
   * @param dto - Données de la campagne à créer
   * @returns Campagne créée
   */
  const create = useCallback(
    async (dto: CreateNationalCampaignDto) => {
      try {
        const campaign = await nationalCampaignsService.create(dto)
        toast.success(tc('messages.success'), t('messages.created'))
        await fetchData()
        return campaign
      } catch (err) {
        handleApiError(err, 'create national campaign', toast, {
          409: t('messages.createError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Met à jour une campagne nationale existante
   *
   * @param id - ID de la campagne
   * @param dto - Données à mettre à jour (doit inclure version)
   * @returns Campagne mise à jour
   */
  const update = useCallback(
    async (id: string, dto: UpdateNationalCampaignDto) => {
      try {
        const campaign = await nationalCampaignsService.update(id, dto)
        toast.success(tc('messages.success'), t('messages.updated'))
        await fetchData()
        return campaign
      } catch (err) {
        handleApiError(err, 'update national campaign', toast, {
          409: t('messages.updateError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Supprime une campagne nationale (soft delete)
   *
   * @param id - ID de la campagne à supprimer
   */
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await nationalCampaignsService.delete(id)
        toast.success(tc('messages.success'), t('messages.deleted'))
        await fetchData()
      } catch (err) {
        handleApiError(err, 'delete national campaign', toast, {
          409: t('messages.deleteError'),
        })
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Restaure une campagne nationale supprimée
   *
   * @param id - ID de la campagne à restaurer
   * @returns Campagne restaurée
   */
  const restore = useCallback(
    async (id: string) => {
      try {
        const campaign = await nationalCampaignsService.restore(id)
        toast.success(tc('messages.success'), t('messages.restored'))
        await fetchData()
        return campaign
      } catch (err) {
        handleApiError(err, 'restore national campaign', toast)
        throw err
      }
    },
    [fetchData, toast, t, tc]
  )

  /**
   * Charge les données au montage et quand params changent
   */
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    // État
    data,
    total,
    loading,
    error,
    params,

    // Fonctions de mutation de paramètres
    setParams,

    // Fonctions CRUD
    create,
    update,
    delete: deleteItem,
    restore,
    refetch: fetchData,
  }
}
