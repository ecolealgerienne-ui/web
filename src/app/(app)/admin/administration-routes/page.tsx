'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/admin/common/DataTable'
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal'
import { DetailSheet } from '@/components/admin/common/DetailSheet'
import { AdministrationRouteFormDialog } from '@/components/admin/administration-routes/AdministrationRouteFormDialog'
import { useAdministrationRoutes } from '@/lib/hooks/admin/useAdministrationRoutes'
import type { AdministrationRoute } from '@/lib/types/admin/administration-route'
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
 * Page d'administration des Voies d'Administration
 *
 * ✅ RÈGLE #3 : Utilise DataTable générique
 * ✅ RÈGLE #3 : Utilise Pagination générique
 * ✅ RÈGLE #3 : Utilise DeleteConfirmModal générique
 * ✅ RÈGLE #6 : i18n complet
 * ✅ RÈGLE #8.3.16 : Row click avec DetailSheet
 *
 * Sprint 1 - Entité indépendante (voies d'administration)
 */
export default function AdministrationRoutesPage() {
  const t = useTranslations('administrationRoute')
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
  } = useAdministrationRoutes()

  // États locaux pour modales
  const [formOpen, setFormOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<AdministrationRoute | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingRoute, setDeletingRoute] = useState<AdministrationRoute | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<AdministrationRoute | null>(null)
  const [submitting, setSubmitting] = useState(false)

  /**
   * Définition des colonnes du DataTable
   * ✅ RÈGLE #1 : Aucune valeur en dur (i18n pour headers)
   */
  const columns: ColumnDef<AdministrationRoute>[] = [
    {
      key: 'code',
      header: t('fields.code'),
      sortable: true,
      render: (route: AdministrationRoute) => (
        <span className="font-mono font-semibold">{route.code}</span>
      ),
    },
    {
      key: 'name',
      header: t('fields.name'),
      sortable: true,
      render: (route: AdministrationRoute) => (
        <span className="font-medium">{route.name}</span>
      ),
    },
    {
      key: 'description',
      header: t('fields.description'),
      render: (route: AdministrationRoute) => (
        <span className="text-muted-foreground text-sm">
          {route.description || '-'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: t('fields.isActive'),
      render: (route: AdministrationRoute) => (
        <Badge variant={route.isActive ? 'success' : 'warning'}>
          {route.isActive ? tc('status.active') : tc('status.inactive')}
        </Badge>
      ),
      align: 'center',
    },
  ]

  // Handlers
  const handleAdd = () => {
    setEditingRoute(null)
    setFormOpen(true)
  }

  const handleRowClick = (route: AdministrationRoute) => {
    setSelectedRoute(route)
    setDetailOpen(true)
  }

  const handleEdit = (route: AdministrationRoute) => {
    setEditingRoute(route)
    setFormOpen(true)
  }

  const handleDeleteClick = (route: AdministrationRoute) => {
    setDeletingRoute(route)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingRoute) return

    setSubmitting(true)
    try {
      await deleteItem(deletingRoute.id)
      setDeleteDialogOpen(false)
      setDeletingRoute(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormSubmit = async (data: any) => {
    setSubmitting(true)
    try {
      if (editingRoute) {
        // Mode édition
        await update(editingRoute.id, {
          ...data,
          version: editingRoute.version || 1,
        })
      } else {
        // Mode création
        await create(data)
      }
      setFormOpen(false)
      setEditingRoute(null)
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
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {t('actions.create')}
        </Button>
      </div>

      {/* DataTable générique (RÈGLE #3) */}
      <Card>
        <CardContent className="pt-6">
          <DataTable<AdministrationRoute>
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
            searchPlaceholder={t('search.placeholder')}
          />
        </CardContent>
      </Card>

      {/* Formulaire de création/édition */}
      <AdministrationRouteFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        route={editingRoute}
        onSubmit={handleFormSubmit}
        loading={submitting}
      />

      {/* Dialog de détail (RÈGLE #8.3.16) */}
      <DetailSheet<AdministrationRoute>
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedRoute}
        title={t('title.singular')}
        description={selectedRoute?.name}
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
                if (selectedRoute) handleEdit(selectedRoute)
              }}
            >
              {tc('actions.edit')}
            </Button>
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                setDetailOpen(false)
                if (selectedRoute) handleDeleteClick(selectedRoute)
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
        itemName={deletingRoute?.name || ''}
      />
    </div>
  )
}
