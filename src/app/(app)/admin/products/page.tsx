'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/admin/common/DataTable'
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal'
import { DetailSheet } from '@/components/admin/common/DetailSheet'
import { ProductFormDialog } from '@/components/admin/products/ProductFormDialog'
import { useProducts } from '@/lib/hooks/admin/useProducts'
import type { Product } from '@/lib/types/admin/product'
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
 * Page d'administration des Produits Vétérinaires
 *
 * ✅ RÈGLE #3 : Utilise DataTable générique
 * ✅ RÈGLE #3 : Utilise Pagination générique
 * ✅ RÈGLE #3 : Utilise DeleteConfirmModal générique
 * ✅ RÈGLE #6 : i18n complet
 *
 * Suit le modèle pilote Active-Substances (Phase 3)
 * Sprint 1 - Entité 1/4
 */
export default function ProductsPage() {
  const t = useTranslations('product')
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
  } = useProducts()

  // États locaux pour modales
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Liste des formes thérapeutiques traduites
  const validTherapeuticForms = [
    'injectable', 'oral', 'topical', 'intramammary',
    'pour-on', 'bolus', 'powder', 'suspension', 'tablet'
  ]

  /**
   * Définition des colonnes du DataTable
   * ✅ RÈGLE #1 : Aucune valeur en dur (i18n pour headers)
   */
  const columns: ColumnDef<Product>[] = [
    {
      key: 'code',
      header: t('fields.code'),
      sortable: true,
      render: (product: Product) => (
        <span className="font-mono font-semibold">{product.code}</span>
      ),
    },
    {
      key: 'commercialName',
      header: t('fields.commercialName'),
      sortable: true,
      render: (product: Product) => (
        <div>
          <span className="font-medium">{product.commercialName}</span>
          <p className="text-xs text-muted-foreground">
            {product.laboratoryName}
          </p>
        </div>
      ),
    },
    {
      key: 'therapeuticForm',
      header: t('fields.therapeuticForm'),
      sortable: true,
      render: (product: Product) => {
        // Gérer le cas où therapeuticForm est undefined ou vide
        if (!product.therapeuticForm) {
          return <span className="text-muted-foreground text-xs">-</span>
        }

        // Vérifier si la forme thérapeutique a une traduction
        if (validTherapeuticForms.includes(product.therapeuticForm)) {
          return (
            <Badge variant="default">
              {t(`therapeuticForms.${product.therapeuticForm}`)}
            </Badge>
          )
        }

        // Sinon afficher la valeur brute (valeur du backend non traduite)
        return (
          <Badge variant="default" className="opacity-60">
            {product.therapeuticForm}
          </Badge>
        )
      },
    },
    {
      key: 'dosage',
      header: t('fields.dosage'),
      render: (product: Product) => (
        <span className="text-sm">{product.dosage}</span>
      ),
    },
    {
      key: 'activeSubstances',
      header: t('fields.activeSubstances'),
      render: (product: Product) => (
        <div className="flex flex-wrap gap-1">
          {product.activeSubstances?.slice(0, 2).map((substance) => (
            <Badge
              key={substance.id}
              variant="default"
              className="text-xs"
            >
              {substance.code}
            </Badge>
          ))}
          {product.activeSubstances?.length > 2 && (
            <Badge variant="default" className="text-xs">
              +{product.activeSubstances.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'isVeterinaryPrescriptionRequired',
      header: 'Rx',
      render: (product: Product) =>
        product.isVeterinaryPrescriptionRequired ? (
          <Badge variant="destructive" className="text-xs">
            Rx
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        ),
      align: 'center',
    },
    {
      key: 'isActive',
      header: t('fields.isActive'),
      render: (product: Product) => (
        <Badge variant={product.isActive ? 'success' : 'warning'}>
          {product.isActive ? tc('status.active') : tc('status.inactive')}
        </Badge>
      ),
      align: 'center',
    },
  ]

  // Handlers
  const handleAdd = () => {
    setEditingProduct(null)
    setFormOpen(true)
  }

  const handleRowClick = (product: Product) => {
    setSelectedProduct(product)
    setDetailOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormOpen(true)
  }

  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return

    setSubmitting(true)
    try {
      await deleteItem(deletingProduct.id)
      setDeleteDialogOpen(false)
      setDeletingProduct(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormSubmit = async (data: any) => {
    setSubmitting(true)
    try {
      if (editingProduct) {
        // Mode édition
        await update(editingProduct.id, {
          ...data,
          version: editingProduct.version || 1,
        })
      } else {
        // Mode création
        await create(data)
      }
      setFormOpen(false)
      setEditingProduct(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title.plural')}</h1>
          <p className="text-muted-foreground mt-1">
            {tc('admin.products.subtitle')}
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {t('actions.create')}
        </Button>
      </div>

      {/* DataTable générique (RÈGLE #3) */}
      <Card>
        <CardContent className="pt-6">
          <DataTable<Product>
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

      {/* Formulaire de création/édition */}
      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        onSubmit={handleFormSubmit}
        loading={submitting}
      />

      {/* Dialog de détail (RÈGLE #8.3.16) */}
      <DetailSheet<Product>
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedProduct}
        title={t('title.singular')}
        description={selectedProduct?.commercialName}
        fields={[
          { key: 'code', label: t('fields.code') },
          { key: 'commercialName', label: t('fields.commercialName') },
          { key: 'laboratoryName', label: t('fields.laboratoryName') },
          {
            key: 'therapeuticForm',
            label: t('fields.therapeuticForm'),
            render: (value) => value ? (
              <Badge variant="default">
                {validTherapeuticForms.includes(value) ? t(`therapeuticForms.${value}`) : value}
              </Badge>
            ) : '-'
          },
          { key: 'dosage', label: t('fields.dosage') },
          {
            key: 'activeSubstances',
            label: t('fields.activeSubstances'),
            render: (value) => value && value.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {value.map((substance: any) => (
                  <Badge key={substance.id} variant="default" className="text-xs">
                    {substance.code} - {substance.name}
                  </Badge>
                ))}
              </div>
            ) : '-'
          },
          {
            key: 'withdrawalPeriodMeat',
            label: t('fields.withdrawalPeriodMeat'),
            render: (value) => value ? `${value} ${t('fields.days')}` : '-'
          },
          {
            key: 'withdrawalPeriodMilk',
            label: t('fields.withdrawalPeriodMilk'),
            render: (value) => value ? `${value} ${t('fields.days')}` : '-'
          },
          {
            key: 'isVeterinaryPrescriptionRequired',
            label: t('fields.isVeterinaryPrescriptionRequired'),
            render: (value) => value ? (
              <Badge variant="destructive">Rx</Badge>
            ) : (
              <Badge variant="default">{tc('status.inactive')}</Badge>
            )
          },
          { key: 'isActive', label: t('fields.isActive'), type: 'badge' },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setDetailOpen(false)
                if (selectedProduct) handleEdit(selectedProduct)
              }}
            >
              {tc('actions.edit')}
            </Button>
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                setDetailOpen(false)
                if (selectedProduct) handleDeleteClick(selectedProduct)
              }}
            >
              {tc('actions.delete')}
            </Button>
          </>
        }
      />

      {/* Modale de confirmation de suppression (RÈGLE #3) */}
      <DeleteConfirmModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        itemName={deletingProduct?.commercialName || ''}
      />
    </div>
  )
}
