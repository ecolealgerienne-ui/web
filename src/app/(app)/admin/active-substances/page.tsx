'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/admin/common/DataTable'
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal'
import { ActiveSubstanceFormDialog } from '@/components/admin/active-substances/ActiveSubstanceFormDialog'
import { useActiveSubstances } from '@/lib/hooks/admin/useActiveSubstances'
import type { ActiveSubstance } from '@/lib/types/admin/active-substance'
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
 * Page d'administration des Substances Actives
 *
 * ✅ RÈGLE #3 : Utilise DataTable générique
 * ✅ RÈGLE #3 : Utilise Pagination générique
 * ✅ RÈGLE #3 : Utilise DeleteConfirmModal générique
 * ✅ RÈGLE #6 : i18n complet
 *
 * Cette page sert de modèle pilote pour les 15 autres entités admin.
 */
export default function ActiveSubstancesPage() {
  const t = useTranslations('activeSubstance')
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
  } = useActiveSubstances()

  // États locaux pour modales
  const [formOpen, setFormOpen] = useState(false)
  const [editingSubstance, setEditingSubstance] = useState<ActiveSubstance | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingSubstance, setDeletingSubstance] = useState<ActiveSubstance | null>(null)
  const [submitting, setSubmitting] = useState(false)

  /**
   * Définition des colonnes du DataTable
   * ✅ RÈGLE #1 : Aucune valeur en dur (i18n pour headers)
   */
  const columns: ColumnDef<ActiveSubstance>[] = [
    {
      key: 'code',
      header: t('fields.code'),
      sortable: true,
      render: (substance: ActiveSubstance) => (
        <span className="font-mono font-semibold">{substance.code}</span>
      ),
    },
    {
      key: 'name',
      header: t('fields.name'),
      sortable: true,
      render: (substance: ActiveSubstance) => (
        <span className="font-medium">{substance.name}</span>
      ),
    },
    {
      key: 'description',
      header: t('fields.description'),
      render: (substance: ActiveSubstance) => (
        <span className="text-muted-foreground text-sm">
          {substance.description || '-'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: t('fields.isActive'),
      render: (substance: ActiveSubstance) => (
        <Badge variant={substance.isActive ? 'success' : 'warning'}>
          {substance.isActive ? tc('status.active') : tc('status.inactive')}
        </Badge>
      ),
      align: 'center',
    },
  ]

  // Handlers
  const handleAdd = () => {
    setEditingSubstance(null)
    setFormOpen(true)
  }

  const handleEdit = (substance: ActiveSubstance) => {
    setEditingSubstance(substance)
    setFormOpen(true)
  }

  const handleDeleteClick = (substance: ActiveSubstance) => {
    setDeletingSubstance(substance)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingSubstance) return

    setSubmitting(true)
    try {
      await deleteItem(deletingSubstance.id)
      setDeleteDialogOpen(false)
      setDeletingSubstance(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormSubmit = async (
    data: any
  ) => {
    setSubmitting(true)
    try {
      if (editingSubstance) {
        // Mode édition
        await update(editingSubstance.id, {
          ...data,
          version: editingSubstance.version || 1,
        })
      } else {
        // Mode création
        await create(data)
      }
      setFormOpen(false)
      setEditingSubstance(null)
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
            {t('title.singular')} - {tc('fields.description')}
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
          <DataTable<ActiveSubstance>
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
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            loading={loading}
            emptyMessage={t('messages.noResults')}
            searchPlaceholder={`${tc('actions.search')} ${t('title.plural').toLowerCase()}...`}
          />
        </CardContent>
      </Card>

      {/* Formulaire de création/édition */}
      <ActiveSubstanceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        substance={editingSubstance}
        onSubmit={handleFormSubmit}
        loading={submitting}
      />

      {/* Modale de confirmation de suppression (RÈGLE #3) */}
      <DeleteConfirmModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        itemName={deletingSubstance?.name || ''}
      />
    </div>
  )
}
