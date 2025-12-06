'use client';

/**
 * DataTable générique pour pages transactionnelles
 *
 * Utilise le système i18n du projet (@/lib/i18n)
 *
 * @template T - Type de l'entité
 *
 * Features:
 * - Pagination client ou serveur
 * - Tri par colonne (asc/desc)
 * - Recherche avec debounce
 * - Actions par ligne (Edit, Delete, View)
 * - États loading, error, empty
 * - Clic sur ligne pour détail
 * - Totalement configurable via props
 *
 * @example
 * ```tsx
 * <DataTable<Animal>
 *   data={animals}
 *   columns={[
 *     { key: 'currentEid', header: 'Identification', sortable: true },
 *     { key: 'status', header: 'Statut', render: (item) => <Badge>{item.status}</Badge> },
 *   ]}
 *   totalItems={animals.length}
 *   onRowClick={handleViewDetail}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */

import { useState } from 'react';
import { useCommonTranslations } from '@/lib/i18n';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { Pagination } from './Pagination';

/**
 * Définition d'une colonne du tableau
 */
export interface ColumnDef<T> {
  /** Clé de la propriété dans l'entité */
  key: keyof T | string;

  /** Label affiché dans le header */
  header: string;

  /** Colonne triable ? */
  sortable?: boolean;

  /** Render personnalisé de la cellule */
  render?: (item: T) => React.ReactNode;

  /** Largeur de la colonne (CSS) */
  width?: string;

  /** Alignement du contenu */
  align?: 'left' | 'center' | 'right';
}

/**
 * Props du DataTable
 */
interface DataTableProps<T extends { id: string }> {
  // Données
  /** Données à afficher */
  data: T[];

  /** Définition des colonnes */
  columns: ColumnDef<T>[];

  /** Nombre total d'items (pour pagination) */
  totalItems?: number;

  // Pagination (optionnel - si non fourni, pas de pagination)
  /** Page actuelle (1-indexed) */
  page?: number;

  /** Nombre d'items par page */
  limit?: number;

  /** Callback changement de page */
  onPageChange?: (page: number) => void;

  /** Callback changement limit */
  onLimitChange?: (limit: number) => void;

  // Recherche & Tri
  /** Valeur du champ de recherche */
  searchValue?: string;

  /** Callback changement recherche */
  onSearchChange?: (value: string) => void;

  /** Placeholder du champ recherche */
  searchPlaceholder?: string;

  /** Champ de tri actuel */
  sortBy?: string;

  /** Ordre de tri actuel */
  sortOrder?: 'asc' | 'desc';

  /** Callback changement tri */
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;

  // Actions
  /** Callback clic sur ligne (affichage détail) */
  onRowClick?: (item: T) => void;

  /** Callback édition */
  onEdit?: (item: T) => void;

  /** Callback suppression */
  onDelete?: (item: T) => void;

  /** Callback visualisation */
  onView?: (item: T) => void;

  /** Actions personnalisées */
  customActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (item: T) => void;
    variant?: 'default' | 'ghost' | 'outline';
    className?: string;
  }>;

  // Permissions
  /** Permission édition */
  canEdit?: boolean;

  /** Permission suppression */
  canDelete?: boolean;

  /** Permission visualisation */
  canView?: boolean;

  // États
  /** État chargement */
  loading?: boolean;

  /** Erreur */
  error?: Error | string | null;

  /** Message si vide */
  emptyMessage?: string;

  /** Icône si vide */
  emptyIcon?: React.ReactNode;

  // Filtres
  /** Filtres personnalisés (render) */
  filters?: React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  totalItems,
  page = 1,
  limit = 25,
  onPageChange,
  onLimitChange,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
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
  emptyMessage = 'Aucune donnée',
  emptyIcon,
  filters,
}: DataTableProps<T>) {
  const tc = useCommonTranslations();
  const [searchInput, setSearchInput] = useState(searchValue);

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    onSearchChange?.(value);
  };

  // Toggle sort
  const handleSort = (columnKey: string) => {
    if (!onSortChange) return;

    if (sortBy === columnKey) {
      onSortChange(columnKey, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(columnKey, 'asc');
    }
  };

  // Render sort icon
  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // Calculer si on a des actions
  const hasActions =
    canEdit || canDelete || canView || (customActions && customActions.length > 0);

  // Calculer la pagination
  const total = totalItems ?? data.length;
  const totalPages = Math.ceil(total / limit);
  const showPagination = onPageChange && total > limit;

  // Error state
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
        <p className="text-destructive">{tc('messages.loadError')}</p>
        {errorMessage && (
          <p className="text-sm text-muted-foreground mt-2">{errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      {(onSearchChange || filters) && (
        <div className="flex items-center gap-4 flex-wrap">
          {onSearchChange && (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
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
                  className={
                    column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                      ? 'text-right'
                      : ''
                  }
                >
                  {column.sortable && onSortChange ? (
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
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((column, j) => (
                    <TableCell key={`skeleton-cell-${j}`}>
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
                <TableCell
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="h-40"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    {emptyIcon && <div className="mb-2">{emptyIcon}</div>}
                    <p>{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              data.map((item) => (
                <TableRow
                  key={item.id}
                  className={
                    onRowClick
                      ? 'cursor-pointer hover:bg-accent/50 transition-colors'
                      : ''
                  }
                  onClick={(e) => {
                    // Ne pas déclencher onRowClick si on clique sur un bouton d'action
                    const target = e.target as HTMLElement;
                    if (target.closest('button')) return;
                    onRowClick?.(item);
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      className={
                        column.align === 'center'
                          ? 'text-center'
                          : column.align === 'right'
                          ? 'text-right'
                          : ''
                      }
                    >
                      {column.render
                        ? column.render(item)
                        : String((item as any)[column.key] ?? '-')}
                    </TableCell>
                  ))}

                  {/* Actions */}
                  {hasActions && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canView && onView && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(item);
                            }}
                            title={tc('actions.view')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {canEdit && onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(item);
                            }}
                            title={tc('actions.edit')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item);
                            }}
                            title={tc('actions.delete')}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                        {customActions?.map((action, index) => (
                          <Button
                            key={index}
                            variant={action.variant || 'ghost'}
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(item);
                            }}
                            title={action.label}
                            className={action.className}
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
      {showPagination && !loading && total > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={onPageChange}
          onItemsPerPageChange={onLimitChange}
        />
      )}
    </div>
  );
}
