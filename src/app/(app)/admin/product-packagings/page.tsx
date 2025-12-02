'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/admin/common/DataTable'
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal'
import { DetailSheet } from '@/components/admin/common/DetailSheet'
import { ProductPackagingFormDialog } from '@/components/admin/product-packagings/ProductPackagingFormDialog'
import { useProductPackagings } from '@/lib/hooks/admin/useProductPackagings'
import type { ProductPackaging } from '@/lib/types/admin/product-packaging'
import type { ProductPackagingFormData } from '@/lib/validation/schemas/admin/product-packaging.schema'
import type { ProductPackagingFilterParams } from '@/lib/services/admin/product-packagings.service'
import type { Product } from '@/lib/types/admin/product'
import { productsService } from '@/lib/services/admin/products.service'

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
 * Page de gestion des Conditionnements de Produits
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur (tout via i18n)
 * ✅ RÈGLE #2 : Composants génériques réutilisés (DataTable, DeleteConfirmModal, DetailSheet)
 * ✅ RÈGLE #3 : Gestion d'erreurs centralisée (via hook)
 * ✅ RÈGLE #6 : i18n complet avec useTranslations
 * ✅ RÈGLE Section 7.5 : Pattern filtre avec constante ALL_PRODUCTS
 * ✅ RÈGLE Section 8.3.16 : onRowClick pour afficher le détail
 *
 * Pattern: Scoped Reference Data (Scope: Product)
 */
export default function ProductPackagingsPage() {
  const t = useTranslations('productPackaging')
  const tc = useTranslations('common')
  const tp = useTranslations('product')

  // Constante pour filtre "Tous les produits"
  const ALL_PRODUCTS = '__all__'

  // État local pour le filtre par produit
  const [selectedProductId, setSelectedProductId] = useState<string>(ALL_PRODUCTS)
  const [products, setProducts] = useState<Product[]>([])

  // État pour les dialogs
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // État pour la sélection
  const [editingPackaging, setEditingPackaging] = useState<ProductPackaging | null>(null)
  const [selectedPackaging, setSelectedPackaging] = useState<ProductPackaging | null>(null)
  const [packagingToDelete, setPackagingToDelete] = useState<ProductPackaging | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Hook pour la gestion CRUD - le hook gère les params en interne
  const { data, total, loading, params, setParams, create, update, delete: deletePackaging } = useProductPackagings({
    page: 1,
    limit: 25,
    sortBy: 'packagingLabel',
    sortOrder: 'asc',
  })

  /**
   * Charger la liste des produits pour le filtre
   * ✅ RÈGLE Section 7.4 : Charger au montage
   */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productsService.getAll({ limit: 100 })
        setProducts(response.data.filter((p) => p.isActive))
      } catch (error) {
        console.error('Failed to load products:', error)
      }
    }
    loadProducts()
  }, [])

  /**
   * Mettre à jour les paramètres quand le filtre produit change
   */
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      productId: selectedProductId === ALL_PRODUCTS ? undefined : selectedProductId,
      page: 1, // Reset à la page 1
    }))
  }, [selectedProductId, setParams])

  /**
   * Définition des colonnes du tableau
   * ✅ RÈGLE Section 8.3.2 : ColumnDef[] pour DataTable
   */
  const columns: ColumnDef<ProductPackaging>[] = useMemo(
    () => [
      {
        key: 'packagingLabel',
        header: t('fields.packagingLabel'),
        sortable: true,
        render: (packaging) => <span className="font-medium">{packaging.packagingLabel}</span>,
      },
      {
        key: 'product',
        header: t('fields.product'),
        render: (packaging) => (
          <div>
            <div className="font-medium">{packaging.product?.commercialName || '—'}</div>
            {packaging.product?.code && (
              <div className="text-sm text-muted-foreground">{packaging.product.code}</div>
            )}
          </div>
        ),
      },
      {
        key: 'countryCode',
        header: t('fields.country'),
        sortable: true,
        render: (packaging) => <Badge variant="default">{packaging.countryCode}</Badge>,
      },
      {
        key: 'concentration',
        header: t('fields.concentration'),
        sortable: true,
        render: (packaging) => (
          <span>{packaging.concentration || '—'}</span>
        ),
      },
      {
        key: 'gtinEan',
        header: t('fields.gtinEan'),
        sortable: true,
        render: (packaging) => (
          <span className="font-mono text-sm">{packaging.gtinEan || '—'}</span>
        ),
      },
      {
        key: 'isActive',
        header: tc('fields.status'),
        render: (packaging) =>
          packaging.isActive ? (
            <Badge variant="success">{tc('status.active')}</Badge>
          ) : (
            <Badge variant="warning">{tc('status.inactive')}</Badge>
          ),
      },
    ],
    [t, tc]
  )

  /**
   * Ouvrir le formulaire de création
   */
  const handleCreate = () => {
    setEditingPackaging(null)
    setFormOpen(true)
  }

  /**
   * Ouvrir le formulaire d'édition
   */
  const handleEdit = (packaging: ProductPackaging) => {
    setEditingPackaging(packaging)
    setFormOpen(true)
  }

  /**
   * Ouvrir le dialog de détail
   * ✅ RÈGLE Section 8.3.16 : Affichage du détail par clic
   */
  const handleView = (packaging: ProductPackaging) => {
    setSelectedPackaging(packaging)
    setDetailOpen(true)
  }

  /**
   * Ouvrir le modal de confirmation de suppression
   */
  const handleDeleteClick = (packaging: ProductPackaging) => {
    setPackagingToDelete(packaging)
    setShowDeleteModal(true)
  }

  /**
   * Confirmer la suppression
   */
  const handleDeleteConfirm = async () => {
    if (!packagingToDelete) return

    const success = await deletePackaging(packagingToDelete.id)
    if (success) {
      setShowDeleteModal(false)
      setPackagingToDelete(null)
    }
  }

  /**
   * Soumission du formulaire (création ou édition)
   * ✅ RÈGLE Section 8.3.4 : Version field pour optimistic locking
   */
  const handleFormSubmit = async (data: ProductPackagingFormData) => {
    setSubmitting(true)
    try {
      if (editingPackaging) {
        // Mode édition
        const updateData = {
          ...data,
          version: editingPackaging.version ?? 0,
        }
        await update(editingPackaging.id, updateData)
      } else {
        // Mode création
        await create(data)
      }
      setFormOpen(false)
      setEditingPackaging(null)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Gérer le changement de page
   */
  const handlePageChange = (page: number) => {
    setParams((prev: ProductPackagingFilterParams) => ({ ...prev, page }))
  }

  /**
   * Gérer le changement de recherche
   */
  const handleSearchChange = (search: string) => {
    setParams((prev: ProductPackagingFilterParams) => ({ ...prev, search, page: 1 }))
  }

  /**
   * Gérer le changement de tri
   */
  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setParams((prev: ProductPackagingFilterParams) => ({
      ...prev,
      sortBy: sortBy as any,
      sortOrder,
    }))
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8" />
            {t('title')}
          </h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('actions.create')}
        </Button>
      </div>

      {/* Filtre par produit */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="product-filter" className="whitespace-nowrap">
              {t('filters.product')}
            </Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger id="product-filter" className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PRODUCTS}>
                  {t('filters.allProducts')}
                </SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.commercialName} ({product.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table des données */}
      <Card>
        <CardContent className="pt-6">
          <DataTable<ProductPackaging>
            data={data}
            columns={columns}
            totalItems={total}
            page={params.page || 1}
            limit={params.limit || 25}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onView={handleView}
            onRowClick={handleView}
            loading={loading}
            emptyMessage={t('messages.noResults')}
            searchPlaceholder={t('search.placeholder')}
            searchValue={params.search || ''}
            onSearchChange={handleSearchChange}
            sortBy={params.sortBy}
            sortOrder={params.sortOrder}
            onSortChange={handleSortChange}
          />
        </CardContent>
      </Card>

      {/* Formulaire de création/édition */}
      <ProductPackagingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        packaging={editingPackaging}
        onSubmit={handleFormSubmit}
        loading={submitting}
        preSelectedProductId={selectedProductId === ALL_PRODUCTS ? undefined : selectedProductId}
      />

      {/* Dialog de détail */}
      <DetailSheet<ProductPackaging>
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedPackaging}
        title={t('detail.title')}
        fields={[
          { key: 'packagingLabel', label: t('fields.packagingLabel') },
          {
            key: 'product',
            label: t('fields.product'),
            render: (value) => value ? `${value.commercialName} (${value.code})` : '—',
          },
          { key: 'countryCode', label: t('fields.country') },
          { key: 'gtinEan', label: t('fields.gtinEan') },
          { key: 'numeroAMM', label: t('fields.numeroAMM') },
          { key: 'concentration', label: t('fields.concentration') },
          {
            key: 'unit',
            label: t('fields.unit'),
            render: (value) => value ? `${value.name} (${value.symbol})` : '—',
          },
          { key: 'description', label: t('fields.description') },
          { key: 'displayOrder', label: t('fields.displayOrder') },
          {
            key: 'isActive',
            label: t('fields.isActive'),
            type: 'badge',
          },
        ]}
      />

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        itemName={packagingToDelete?.packagingLabel || ''}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
