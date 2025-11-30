'use client'

/**
 * Composant de pagination réutilisable
 *
 * Features:
 * - Navigation par page (première, précédente, suivante, dernière)
 * - Changement nombre d'items par page
 * - Affichage du total d'items
 * - Désactivation des boutons aux limites
 * - Support i18n complet
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   totalItems={250}
 *   itemsPerPage={25}
 *   onPageChange={setPage}
 *   onItemsPerPageChange={setLimit}
 * />
 * ```
 */

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  /** Page actuelle (1-indexed) */
  currentPage: number

  /** Nombre total de pages */
  totalPages: number

  /** Nombre total d'items */
  totalItems: number

  /** Nombre d'items par page */
  itemsPerPage: number

  /** Callback changement de page */
  onPageChange: (page: number) => void

  /** Callback changement items par page (optionnel) */
  onItemsPerPageChange?: (limit: number) => void

  /** Options pour items par page */
  pageSizeOptions?: number[]
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const t = useTranslations('common')

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <div className="flex items-center justify-between px-2">
      {/* Info */}
      <div className="text-sm text-muted-foreground">
        {totalItems > 0 ? (
          <>
            {startItem}-{endItem} {t('pagination.of')} {totalItems}
          </>
        ) : (
          <>0 {t('pagination.items')}</>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {/* Items per page */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('pagination.itemsPerPage')}:
            </span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(value) => onItemsPerPageChange(Number(value))}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={!canGoPrevious}
            title={t('pagination.firstPage')}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
            title={t('pagination.previousPage')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 px-2">
            <span className="text-sm">
              {t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            title={t('pagination.nextPage')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext}
            title={t('pagination.lastPage')}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
