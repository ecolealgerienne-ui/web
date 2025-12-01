'use client'

/**
 * DataTable générique pour affichage de listes paginées
 *
 * @template T - Type de l'entité (doit étendre BaseEntity)
 *
 * Features:
 * - Pagination serveur
 * - Tri par colonne (asc/desc)
 * - Recherche avec debounce
 * - Actions par ligne (Edit, Delete, View, Custom)
 * - États loading, error, empty
 * - Visualisation items supprimés (soft delete)
 * - Type-safe avec génériques
 * - Totalement configurable via props
 *
 * @example
 * ```tsx
 * <DataTable<ActiveSubstance>
 *   data={substances}
 *   columns={[
 *     { key: 'code', header: 'Code', sortable: true },
 *     { key: 'name', header: 'Nom', sortable: true },
 *   ]}
 *   totalItems={total}
 *   page={page}
 *   limit={limit}
 *   onPageChange={setPage}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2, Eye } from 'lucide-react'
import { Pagination } from './Pagination'
import type { BaseEntity } from '@/lib/types/common/api'

/**
 * Définition d'une colonne du tableau
 */
interface ColumnDef<T> {
  /** Clé de la propriété dans l'entité */
  key: keyof T | string

  /** Label affiché dans le header */
  header: string

  /** Colonne triable ? */
  sortable?: boolean

  /** Render personnalisé de la cellule */
  render?: (item: T) => React.ReactNode

  /** Largeur de la colonne (CSS) */
  width?: string

  /** Alignement du contenu */
  align?: 'left' | 'center' | 'right'
}

/**
 * Props du DataTable
 */
interface DataTableProps<T extends BaseEntity> {
  // Données
  /** Données à afficher */
  data: T[]

  /** Définition des colonnes */
  columns: ColumnDef<T>[]

  /** Nombre total d'items (pour pagination) */
  totalItems: number

  // Pagination
  /** Page actuelle (1-indexed) */
  page: number

  /** Nombre d'items par page */
  limit: number

  /** Callback changement de page */
  onPageChange: (page: number) => void

  /** Callback changement limit (optionnel) */
  onLimitChange?: (limit: number) => void

  // Recherche & Tri
  /** Valeur du champ de recherche */
  searchValue?: string

  /** Callback changement recherche */
  onSearchChange?: (value: string) => void

  /** Placeholder du champ recherche */
  searchPlaceholder?: string

  /** Champ de tri actuel */
  sortBy?: string

  /** Ordre de tri actuel */
  sortOrder?: 'asc' | 'desc'

  /** Callback changement tri */
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void

  // Actions
  /** Callback clic sur ligne (affichage détail) */
  onRowClick?: (item: T) => void

  /** Callback édition */
  onEdit?: (item: T) => void

  /** Callback suppression */
  onDelete?: (item: T) => void

  /** Callback visualisation */
  onView?: (item: T) => void

  /** Actions personnalisées */
  customActions?: Array<{
    label: string
    icon?: React.ReactNode
    onClick: (item: T) => void
    variant?: 'default' | 'ghost' | 'outline'
  }>

  // Permissions
  /** Permission édition */
  canEdit?: boolean

  /** Permission suppression */
  canDelete?: boolean

  /** Permission visualisation */
  canView?: boolean

  // États
  /** État chargement */
  loading?: boolean

  /** Erreur */
  error?: Error | null

  /** Message si vide */
  emptyMessage?: string

  // Filtres
  /** Afficher items supprimés */
  showDeleted?: boolean

  /** Filtres personnalisés (render) */
  filters?: React.ReactNode
}

export function DataTable<T extends BaseEntity>({
  data,
  columns,
  totalItems,
  page,
  limit,
  onPageChange,
  onLimitChange,
  searchValue = '',
  onSearchChange,
  searchPlaceholder,
  sortBy,
  sortOrder = 'asc',
  onSortChange,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  customActions,
  canEdit = true,
  canDelete = true,
  canView = false,
  loading = false,
  error = null,
  emptyMessage,
  showDeleted = false,
  filters,
}: DataTableProps<T>) {
  const t = useTranslations('common')
  const [searchInput, setSearchInput] = useState(searchValue)

  // Debounce search (simple version)
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    onSearchChange?.(value)
  }

  // Toggle sort
  const handleSort = (columnKey: string) => {
    if (!onSortChange) return

    if (sortBy === columnKey) {
      // Toggle order
      onSortChange(columnKey, sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // New column
      onSortChange(columnKey, 'asc')
    }
  }

  // Render sort icon
  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
    }
    return sortOrder === 'asc'
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />
  }

  // Actions shown
  const hasActions = canEdit || canDelete || canView || (customActions && customActions.length > 0)
  const totalPages = Math.ceil(totalItems / limit)

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
        <p className="text-destructive">{t('messages.loadError')}</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      {(onSearchChange || filters) && (
        <div className="flex items-center gap-4">
          {onSearchChange && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder || t('actions.search')}
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          {filters && <div className="flex items-center gap-2">{filters}</div>}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  style={{ width: column.width }}
                  className={column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort(String(column.key))}
                      className="-ml-3 h-8 hover:bg-transparent"
                    >
                      {column.header}
                      {renderSortIcon(String(column.key))}
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
              {hasActions && (
                <TableHead className="text-right w-[100px]">
                  {t('table.actions')}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: limit }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((column, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell>
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} className="h-64">
                  <EmptyState
                    title={emptyMessage || t('messages.noData')}
                    description=""
                  />
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              data.map((item) => (
                <TableRow
                  key={item.id}
                  className={`${item.deletedAt ? 'opacity-50' : ''} ${onRowClick ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''}`}
                  onClick={(e) => {
                    // Ne pas déclencher onRowClick si on clique sur un bouton d'action
                    const target = e.target as HTMLElement
                    if (target.closest('button')) return
                    onRowClick?.(item)
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      className={column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}
                    >
                      {column.render
                        ? column.render(item)
                        : String(item[column.key as keyof T] || '-')}

                      {/* Badge supprimé */}
                      {column.key === columns[0].key && item.deletedAt && (
                        <Badge variant="default" className="ml-2">
                          {t('status.deleted') || 'Supprimé'}
                        </Badge>
                      )}
                    </TableCell>
                  ))}

                  {/* Actions */}
                  {hasActions && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canView && onView && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(item)}
                            title={t('actions.view') || 'Voir'}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {canEdit && onEdit && !item.deletedAt && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                            title={t('actions.edit') || 'Modifier'}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && onDelete && !item.deletedAt && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item)}
                            title={t('actions.delete') || 'Supprimer'}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                        {customActions?.map((action, index) => (
                          <Button
                            key={index}
                            variant={action.variant || 'ghost'}
                            size="icon"
                            onClick={() => action.onClick(item)}
                            title={action.label}
                          >
                            {action.icon}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && totalItems > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={limit}
          onPageChange={onPageChange}
          onItemsPerPageChange={onLimitChange}
        />
      )}
    </div>
  )
}
