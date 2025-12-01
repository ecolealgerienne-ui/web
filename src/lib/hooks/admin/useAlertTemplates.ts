/**
 * useAlertTemplates Hook
 *
 * Custom hook for managing alert templates state and operations
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { alertTemplatesService } from '@/lib/services/admin/alert-templates.service'
import type {
  AlertTemplate,
  CreateAlertTemplateDto,
  UpdateAlertTemplateDto,
  AlertTemplateFilterParams,
} from '@/lib/types/admin/alert-template'
import type { PaginatedResponse } from '@/lib/types/common/api'

export function useAlertTemplates(initialParams?: AlertTemplateFilterParams) {
  const [data, setData] = useState<AlertTemplate[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Ref to track if there's an ongoing request
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * Fetch alert templates with current filters
   */
  const fetchAlertTemplates = useCallback(
    async (params?: AlertTemplateFilterParams) => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      try {
        setLoading(true)
        setError(null)
        const response: PaginatedResponse<AlertTemplate> =
          await alertTemplatesService.getAll(params)
        setData(response.data)
        setTotal(response.meta.total)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err)
        }
      } finally {
        setLoading(false)
        abortControllerRef.current = null
      }
    },
    []
  )

  /**
   * Create a new alert template
   */
  const create = useCallback(
    async (dto: CreateAlertTemplateDto): Promise<AlertTemplate> => {
      const newTemplate = await alertTemplatesService.create(dto)
      // Refresh the list after creation
      await fetchAlertTemplates(initialParams)
      return newTemplate
    },
    [fetchAlertTemplates, initialParams]
  )

  /**
   * Update an existing alert template
   */
  const update = useCallback(
    async (
      id: string,
      dto: UpdateAlertTemplateDto
    ): Promise<AlertTemplate> => {
      const updated = await alertTemplatesService.update(id, dto)
      // Refresh the list after update
      await fetchAlertTemplates(initialParams)
      return updated
    },
    [fetchAlertTemplates, initialParams]
  )

  /**
   * Delete an alert template
   */
  const remove = useCallback(
    async (id: string): Promise<void> => {
      await alertTemplatesService.delete(id)
      // Refresh the list after deletion
      await fetchAlertTemplates(initialParams)
    },
    [fetchAlertTemplates, initialParams]
  )

  /**
   * Refresh the current list
   */
  const refresh = useCallback(() => {
    fetchAlertTemplates(initialParams)
  }, [fetchAlertTemplates, initialParams])

  // Initial fetch on mount
  useEffect(() => {
    fetchAlertTemplates(initialParams)
  }, [fetchAlertTemplates, initialParams])

  return {
    data,
    total,
    loading,
    error,
    create,
    update,
    delete: remove,
    refresh,
    fetchAlertTemplates,
  }
}
