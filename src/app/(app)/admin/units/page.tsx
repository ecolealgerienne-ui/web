'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useUnits } from '@/lib/hooks/admin/useUnits'
import { DataTable } from '@/components/admin/common/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal'
import { UnitFormDialog } from '@/components/admin/units/UnitFormDialog'
import { Plus } from 'lucide-react'
import type { Unit } from '@/lib/types/admin/unit'

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
 * Page d'administration des unités de mesure
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur (i18n)
 * ✅ RÈGLE #6 : Tous les textes via i18n
 * ✅ Pattern Simple Reference Data
 *
 * @example
 * URL: /admin/units
 */
export default function UnitsPage() {
  const t = useTranslations('unit')
  const tc = useTranslations('common')

  // Hook de gestion des unités
  const {
    data,
    total,
    loading,
    params,
    setParams,
    create,
    update,
    delete: deleteUnit,
  } = useUnits()

  // États UI
  const [formOpen, setFormOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)
  const [submitting, setSubmitting] = useState(false)

  /**
   * Ouvrir le formulaire en mode création
   */
  const handleCreate = () => {
    setEditingUnit(null)
    setFormOpen(true)
  }

  /**
   * Ouvrir le formulaire en mode édition
   */
  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setFormOpen(true)
  }

  /**
   * Ouvrir la modale de confirmation de suppression
   */
  const handleDeleteClick = (unit: Unit) => {
    setUnitToDelete(unit)
    setDeleteDialogOpen(true)
  }

  /**
   * Soumettre le formulaire (create ou update)
   */
  const handleSubmit = async (data: CreateUnitDto | UpdateUnitDto) => {
    setSubmitting(true)
    try {
      if (editingUnit) {
        // Mode édition
        await update(editingUnit.id, data as UpdateUnitDto)
      } else {
        // Mode création
        await create(data as CreateUnitDto)
      }
      setFormOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Confirmer la suppression
   */
  const handleDeleteConfirm = async () => {
    if (!unitToDelete) return

    setSubmitting(true)
    try {
      const success = await deleteUnit(unitToDelete.id)
      if (success) {
        setDeleteDialogOpen(false)
        setUnitToDelete(null)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Définition des colonnes du tableau
  const columns: ColumnDef<Unit>[] = [
    {
      key: 'code',
      header: t('fields.code'),
      sortable: true,
      render: (unit) => (
        <span className="font-mono text-sm font-medium">{unit.code}</span>
      ),
    },
    {
      key: 'name',
      header: t('fields.name'),
      sortable: true,
    },
    {
      key: 'symbol',
      header: t('fields.symbol'),
      sortable: true,
      render: (unit) => (
        <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
          {unit.symbol}
        </span>
      ),
    },
    {
      key: 'type',
      header: t('fields.type'),
      sortable: true,
      render: (unit) => (
        <span className="text-sm">{t(`types.${unit.type}`)}</span>
      ),
    },
    {
      key: 'isActive',
      header: t('fields.isActive'),
      render: (unit) => (
        <Badge variant={unit.isActive ? 'success' : 'warning'}>
          {unit.isActive ? tc('status.active') : tc('status.inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: tc('table.actions'),
      render: (unit) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(unit)}
            title={t('actions.edit')}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(unit)}
            title={t('actions.delete')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title.plural')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t('actions.create')}
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        pagination={{
          page: params.page || 1,
          limit: params.limit || 25,
          total,
          onPageChange: (page) => setParams({ ...params, page }),
          onLimitChange: (limit) => setParams({ ...params, limit, page: 1 }),
        }}
        sorting={{
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
          onSortChange: (sortBy, sortOrder) =>
            setParams({ ...params, sortBy, sortOrder }),
        }}
        search={{
          value: params.search || '',
          onSearchChange: (search) =>
            setParams({ ...params, search, page: 1 }),
          placeholder: t('search.placeholder'),
        }}
        emptyMessage={t('messages.noResults')}
      />

      {/* Form Dialog */}
      <UnitFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        unit={editingUnit}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t('actions.delete')}
        description={
          unitToDelete
            ? `${tc('table.confirmDeleteItem')} "${unitToDelete.name}" (${unitToDelete.code}) ?`
            : ''
        }
        loading={submitting}
      />
    </div>
  )
}
