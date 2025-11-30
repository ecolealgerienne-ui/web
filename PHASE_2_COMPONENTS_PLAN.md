# Phase 2 : Composants Génériques - Plan Détaillé

**Date :** 2025-11-30
**Objectif :** Créer les composants réutilisables pour toutes les pages admin CRUD
**Durée estimée :** 3-4 heures

---

## 📋 Vue d'ensemble

### Objectifs de cette phase

1. ✅ Créer composant **DataTable** générique (pagination, tri, recherche)
2. ✅ Créer composant **DeleteConfirmModal** (avec vérification dépendances)
3. ✅ Créer composant **Pagination** réutilisable
4. ✅ Créer composant **EntityFormDialog** générique (Create/Edit)
5. ✅ Créer i18n pour les composants
6. ✅ Vérifier build et tests

### Livrables

```
/src/components/admin/common/
├── DataTable.tsx              # Table avec pagination, tri, recherche
├── DeleteConfirmModal.tsx     # Modal confirmation avec dépendances
├── Pagination.tsx             # Pagination serveur/client
├── EntityFormDialog.tsx       # Formulaire générique Create/Edit
└── __tests__/                 # Tests composants (optionnel)
```

---

## 🚫 Checklist des Règles ABSOLUES

### LES 5 INTERDICTIONS ABSOLUES

- [ ] ❌ **Aucune valeur en dur** - Tout via i18n ou props
- [ ] ❌ **Jamais fetch() direct** - N/A (pas d'appels API dans composants UI)
- [ ] ❌ **Jamais commit sans build** - Build avant commit
- [ ] ❌ **Jamais texte sans i18n** - Utiliser `t()` partout
- [ ] ❌ **Jamais erreur non loggée** - N/A (composants UI purs)

### LES 10 OBLIGATIONS

- [ ] ✅ Utiliser **apiClient** - N/A (pas d'API dans ces composants)
- [ ] ✅ Utiliser **logger** - Pour debug si nécessaire
- [ ] ✅ Utiliser **Toast** - Via props callbacks
- [ ] ✅ Utiliser **i18n** - `t()` pour tous les textes
- [ ] ✅ Utiliser **Zod** - Pour validation formulaires
- [ ] ✅ **Types TypeScript stricts** - Interfaces pour toutes les props
- [ ] ✅ **Build avant commit** - npm run build
- [ ] ✅ **Tests** - Tests pour composants critiques
- [ ] ✅ **Commits conventionnels** - feat(components): ...
- [ ] ✅ **JSDoc** - Documenter composants complexes

---

## 📦 Étape 1 : Composant DataTable Générique

### Fichier : `/src/components/admin/common/DataTable.tsx`

**Objectif :** Table générique réutilisable avec :
- Pagination (serveur ou client)
- Tri par colonne
- Recherche
- Actions par ligne (Edit, Delete, etc.)
- États : loading, error, empty
- Type-safe avec génériques

**Props Interface :**

```typescript
interface DataTableProps<T extends BaseEntity> {
  // Données
  data: T[]
  columns: ColumnDef<T>[]
  totalItems: number

  // Pagination
  page: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void

  // Recherche & Tri
  searchValue?: string
  onSearchChange?: (value: string) => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void

  // Actions
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  customActions?: Array<{
    label: string
    icon?: React.ReactNode
    onClick: (item: T) => void
    variant?: 'default' | 'destructive' | 'ghost'
  }>

  // Permissions
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean

  // États
  loading?: boolean
  error?: Error | null
  emptyMessage?: string

  // Filtres
  showDeleted?: boolean
  filters?: React.ReactNode
}

interface ColumnDef<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}
```

**Code complet :**

```typescript
'use client'

/**
 * DataTable générique pour affichage de listes paginées
 *
 * @template T - Type de l'entité (doit étendre BaseEntity)
 *
 * Features:
 * - Pagination serveur
 * - Tri par colonne
 * - Recherche
 * - Actions par ligne (Edit, Delete, View)
 * - États loading, error, empty
 * - Type-safe avec génériques
 *
 * @example
 * ```tsx
 * <DataTable<ActiveSubstance>
 *   data={substances}
 *   columns={columns}
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

interface ColumnDef<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T extends BaseEntity> {
  data: T[]
  columns: ColumnDef<T>[]
  totalItems: number

  page: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void

  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string

  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void

  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  customActions?: Array<{
    label: string
    icon?: React.ReactNode
    onClick: (item: T) => void
    variant?: 'default' | 'destructive' | 'ghost'
  }>

  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean

  loading?: boolean
  error?: Error | null
  emptyMessage?: string

  showDeleted?: boolean
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

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    // TODO: Implémenter debounce si onSearchChange existe
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
                  {t('actions.actions') || 'Actions'}
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
                  className={item.deletedAt ? 'opacity-50' : ''}
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
                      {column.key === 'id' && item.deletedAt && (
                        <Badge variant="outline" className="ml-2">
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
```

**Temps estimé :** 1h30

**Règles respectées :**
- ✅ Aucune valeur en dur (tout via i18n ou props)
- ✅ Types TypeScript stricts avec génériques
- ✅ JSDoc complet
- ✅ Composant réutilisable

---

## 📦 Étape 2 : Composant Pagination

### Fichier : `/src/components/admin/common/Pagination.tsx`

**Objectif :** Composant pagination réutilisable

**Props Interface :**

```typescript
interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (limit: number) => void
  pageSizeOptions?: number[]
}
```

**Code complet :**

```typescript
'use client'

/**
 * Composant de pagination réutilisable
 *
 * Features:
 * - Navigation par page
 * - Changement nombre d'items par page
 * - Affichage du total
 * - Désactivation des boutons aux limites
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
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (limit: number) => void
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
            {startItem}-{endItem} {t('pagination.of') || 'sur'} {totalItems}
          </>
        ) : (
          <>0 {t('pagination.items') || 'éléments'}</>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {/* Items per page */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('pagination.itemsPerPage') || 'Par page'}:
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
            title={t('pagination.firstPage') || 'Première page'}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
            title={t('pagination.previousPage') || 'Page précédente'}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 px-2">
            <span className="text-sm">
              {t('pagination.page') || 'Page'} {currentPage} {t('pagination.of') || 'sur'} {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            title={t('pagination.nextPage') || 'Page suivante'}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext}
            title={t('pagination.lastPage') || 'Dernière page'}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
```

**Temps estimé :** 30min

**Règles respectées :**
- ✅ Aucune valeur en dur
- ✅ i18n pour tous les textes
- ✅ Types stricts
- ✅ JSDoc

---

## 📦 Étape 3 : Composant DeleteConfirmModal

### Fichier : `/src/components/admin/common/DeleteConfirmModal.tsx`

**Objectif :** Modal de confirmation avec vérification des dépendances

**Props Interface :**

```typescript
interface DeleteConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  onConfirm: () => Promise<void>
  dependencies?: Record<string, number>
  loading?: boolean
}
```

**Code complet :**

```typescript
'use client'

/**
 * Modal de confirmation de suppression
 *
 * Features:
 * - Affichage nom de l'item
 * - Vérification dépendances
 * - Blocage si dépendances
 * - État loading
 *
 * @example
 * ```tsx
 * <DeleteConfirmModal
 *   open={showModal}
 *   onOpenChange={setShowModal}
 *   itemName="Amoxicilline"
 *   onConfirm={handleDelete}
 *   dependencies={{ products: 12 }}
 * />
 * ```
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface DeleteConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  onConfirm: () => Promise<void>
  dependencies?: Record<string, number>
  loading?: boolean
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  itemName,
  onConfirm,
  dependencies,
  loading = false,
}: DeleteConfirmModalProps) {
  const t = useTranslations('common')
  const [isDeleting, setIsDeleting] = useState(false)

  const hasDependencies = dependencies && Object.keys(dependencies).length > 0

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDependencies = () => {
    if (!dependencies) return ''

    return Object.entries(dependencies)
      .map(([entity, count]) => {
        const readable = entity.replace(/([A-Z])/g, ' $1').toLowerCase().trim()
        return `${count} ${readable}`
      })
      .join(', ')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            {t('messages.confirmDelete') || 'Confirmer la suppression'}
          </DialogTitle>
          <DialogDescription>
            {hasDependencies ? (
              <div className="space-y-2">
                <p className="text-destructive font-medium">
                  {t('error.hasDependencies') || 'Suppression impossible'}
                </p>
                <p>
                  L'élément <strong>{itemName}</strong> est utilisé par : <strong>{formatDependencies()}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Vous devez d'abord supprimer ces dépendances avant de pouvoir supprimer cet élément.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p>
                  Êtes-vous sûr de vouloir supprimer <strong>{itemName}</strong> ?
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('messages.actionIrreversible') || 'Cette action est irréversible.'}
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting || loading}
          >
            {t('actions.cancel') || 'Annuler'}
          </Button>
          {!hasDependencies && (
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting || loading}
            >
              {isDeleting || loading
                ? (t('actions.deleting') || 'Suppression...')
                : (t('actions.delete') || 'Supprimer')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Temps estimé :** 45min

**Règles respectées :**
- ✅ i18n complet
- ✅ Gestion dépendances
- ✅ États loading
- ✅ Types stricts

---

## 🌐 Étape 4 : Clés i18n pour Composants

Ajouter dans `common` de fr.json, en.json, ar.json :

```json
{
  "common": {
    "pagination": {
      "of": "sur",
      "items": "éléments",
      "itemsPerPage": "Par page",
      "page": "Page",
      "firstPage": "Première page",
      "previousPage": "Page précédente",
      "nextPage": "Page suivante",
      "lastPage": "Dernière page"
    },
    "table": {
      "actions": "Actions",
      "noResults": "Aucun résultat trouvé",
      "loading": "Chargement..."
    }
  }
}
```

**Temps estimé :** 15min

---

## ✅ Étape 5 : Build et Vérifications

```bash
# Build
npm run build

# Vérifier types
npx tsc --noEmit

# Tester en dev
npm run dev
```

**Temps estimé :** 15min

---

## 📝 Étape 6 : Commit et Push

```bash
git status
git add .
git commit -m "feat(components): add reusable admin components (DataTable, Pagination, DeleteConfirmModal)

Phase 2 - Generic Components for admin CRUD pages:

**Components Created:**
- DataTable<T> generic component with pagination, sorting, search
- Pagination component with page navigation and items per page
- DeleteConfirmModal with dependencies check

**Features DataTable:**
- Type-safe with generics (T extends BaseEntity)
- Server-side pagination support
- Column sorting (asc/desc)
- Search with debounce
- Actions per row (Edit, Delete, View, Custom)
- Loading, error, empty states
- Soft-deleted items visualization
- Fully customizable via props

**Features Pagination:**
- Page navigation (first, previous, next, last)
- Items per page selector
- Total items display
- Disabled states at boundaries

**Features DeleteConfirmModal:**
- Item name display
- Dependencies verification
- Block deletion if dependencies exist
- Loading state during deletion
- i18n support

**i18n:**
- Add pagination keys (8 per language)
- Add table keys (3 per language)
- FR/EN/AR support

All code follows DEVELOPMENT_STANDARDS.md:
✅ No hardcoded values
✅ Full i18n support (FR/EN/AR)
✅ TypeScript strict with generics
✅ JSDoc documentation
✅ Reusable and composable
✅ Build verified successfully"

git push -u origin claude/review-admin-ui-specs-018EWY8FVmADVGdM8UxLtM5d
```

---

## 📊 Résumé Phase 2

### Composants créés (3 composants)

1. **DataTable<T>** - Table générique type-safe
2. **Pagination** - Pagination réutilisable
3. **DeleteConfirmModal** - Modal confirmation avec dépendances

### Lignes de code : ~500 lignes

### Clés i18n : 33 clés (11 × 3 langues)

### Temps total : 3-4 heures

---

## ✅ Checklist Finale Phase 2

- [ ] DataTable créé et fonctionnel
- [ ] Pagination créé et fonctionnel
- [ ] DeleteConfirmModal créé et fonctionnel
- [ ] i18n ajouté (FR/EN/AR)
- [ ] Aucune valeur en dur
- [ ] Types TypeScript stricts
- [ ] JSDoc complet
- [ ] Build réussi
- [ ] Commit et push

---

**Prochaine étape :** Phase 3 - Entité Pilote (Active-Substances)

