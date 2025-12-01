'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/admin/common/DataTable'
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal'
import { DetailSheet } from '@/components/admin/common/DetailSheet'
import { ProductCategoryFormDialog } from '@/components/admin/product-categories/ProductCategoryFormDialog'
import { useProductCategories } from '@/lib/hooks/admin/useProductCategories'
import type { ProductCategory } from '@/lib/types/admin/product-category'
import { Badge } from '@/components/ui/badge'

/**
 * Définition locale de ColumnDef (pas exportée de DataTable)
 */
interface ColumnDef<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

/**
 * Page d'administration des Catégories de Produits
 *
 * ✅ RÈGLE #3 : Utilise DataTable générique
 * ✅ RÈGLE #3 : Utilise Pagination générique
 * ✅ RÈGLE #3 : Utilise DeleteConfirmModal générique
 * ✅ RÈGLE #6 : i18n complet
 *
 * Suit le modèle pilote Active-Substances (Phase 3)
 * Sprint 1 - Entité 3/5
 */
export default function ProductCategoriesPage() {
  const t = useTranslations('productCategory')
  const tc = useTranslations('common')

  // Hook personnalisé pour CRUD
  const {
    data,
    total,
    loading,
    params,
    setParams,
    create,
    update,
    delete: deleteItem,
  } = useProductCategories()

  // États locaux pour modales
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<ProductCategory | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null)
  const [submitting, setSubmitting] = useState(false)

  /**
   * Définition des colonnes du DataTable
   * ✅ RÈGLE #1 : Aucune valeur en dur (i18n pour headers)
   */
  const columns: ColumnDef<ProductCategory>[] = [
    {
      key: 'code',
      header: t('fields.code'),
      sortable: true,
      render: (category: ProductCategory) => (
        <span className="font-mono font-semibold">{category.code}</span>
      ),
    },
    {
      key: 'name',
      header: t('fields.name'),
      sortable: true,
      render: (category: ProductCategory) => (
        <span className="font-medium">{category.name}</span>
      ),
    },
    {
      key: 'description',
      header: t('fields.description'),
      render: (category: ProductCategory) => (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {category.description || '-'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: t('fields.isActive'),
      render: (category: ProductCategory) => (
        <Badge variant={category.isActive ? 'success' : 'warning'}>
          {category.isActive ? tc('status.active') : tc('status.inactive')}
        </Badge>
      ),
      align: 'center',
    },
  ]

  /**
   * Ouvre le formulaire en mode création
   */
  const handleCreate = () => {
    setEditingCategory(null)
    setFormOpen(true)
  }

  /**
   * Affiche le détail d'une catégorie
   */
  const handleRowClick = (category: ProductCategory) => {
    setSelectedCategory(category)
    setDetailOpen(true)
  }

  /**
   * Ouvre le formulaire en mode édition
   */
  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category)
    setFormOpen(true)
  }

  /**
   * Ouvre la modale de confirmation de suppression
   */
  const handleDeleteClick = (category: ProductCategory) => {
    setDeletingCategory(category)
    setDeleteDialogOpen(true)
  }

  /**
   * Soumet le formulaire (création ou édition)
   */
  const handleSubmit = async (data: any) => {
    setSubmitting(true)
    try {
      if (editingCategory) {
        await update(editingCategory.id, {
          ...data,
          version: editingCategory.version || 1,
        })
      } else {
        await create(data)
      }
      setFormOpen(false)
      setEditingCategory(null)
    } catch (error) {
      // L'erreur est déjà gérée par le hook (toast)
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Confirme la suppression
   */
  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return

    try {
      await deleteItem(deletingCategory.id)
      setDeleteDialogOpen(false)
      setDeletingCategory(null)
    } catch (error) {
      // L'erreur est déjà gérée par le hook (toast)
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('title.plural')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {tc('pagination.totalItems', { count: total })}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('actions.create')}
        </Button>
      </div>

      {/* Table - ✅ API correcte (flat props) */}
      <Card>
        <CardContent className="pt-6">
          <DataTable<ProductCategory>
            data={data}
            columns={columns}
            totalItems={total}
            page={params.page || 1}
            limit={params.limit || 25}
            onPageChange={(page) => setParams({ ...params, page })}
            onLimitChange={(limit) => setParams({ ...params, limit, page: 1 })}
            sortBy={params.sortBy}
            sortOrder={params.sortOrder}
            onSortChange={(sortBy, sortOrder) =>
              setParams({ ...params, sortBy, sortOrder })
            }
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            loading={loading}
            emptyMessage={t('messages.noResults')}
            searchPlaceholder={`${tc('actions.search')} ${t('title.plural').toLowerCase()}...`}
          />
        </CardContent>
      </Card>

      {/* Modale de formulaire */}
      <ProductCategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      {/* Dialog de détail (RÈGLE #8.3.16) */}
      <DetailSheet<ProductCategory>
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedCategory}
        title={t('title.singular')}
        description={selectedCategory?.name}
        fields={[
          { key: 'code', label: t('fields.code') },
          { key: 'name', label: t('fields.name') },
          {
            key: 'description',
            label: t('fields.description'),
            render: (value) => value || <span className="text-muted-foreground italic">-</span>
          },
          { key: 'isActive', label: t('fields.isActive'), type: 'badge' },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setDetailOpen(false)
                if (selectedCategory) handleEdit(selectedCategory)
              }}
            >
              {tc('actions.edit')}
            </Button>
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                setDetailOpen(false)
                if (selectedCategory) handleDeleteClick(selectedCategory)
              }}
            >
              {tc('actions.delete')}
            </Button>
          </>
        }
      />

      {/* Modale de suppression */}
      <DeleteConfirmModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        itemName={deletingCategory?.name || ''}
      />
    </div>
  )
}
