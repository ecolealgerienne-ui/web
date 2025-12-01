'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/admin/common/DataTable'
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal'
import { UnitFormDialog } from '@/components/admin/units/UnitFormDialog'
import { useUnits } from '@/lib/hooks/admin/useUnits'
import type { Unit, CreateUnitDto, UpdateUnitDto } from '@/lib/types/admin/unit'
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
 * Page d'administration des unités de mesure
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur (i18n)
 * ✅ RÈGLE #3 : Utilise DataTable générique
 * ✅ RÈGLE #3 : Utilise DeleteConfirmModal générique
 * ✅ RÈGLE #6 : i18n complet
 * ✅ RÈGLE #8.3.2 : ColumnDef défini localement
 * ✅ RÈGLE #8.3.3 : DeleteConfirmModal avec itemName uniquement
 * ✅ RÈGLE #8.3.13 : Gestion défensive i18n pour enum
 *
 * Pattern: Simple Reference Data (suit active-substances)
 * Sprint 1 - Entité 4/5
 */
export default function UnitsPage() {
  const t = useTranslations('unit')
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
  } = useUnits()

  // États locaux pour modales
  const [formOpen, setFormOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null)
  const [submitting, setSubmitting] = useState(false)

  /**
   * Définition des colonnes du DataTable
   * ✅ RÈGLE #1 : Aucune valeur en dur (i18n pour headers)
   * ✅ RÈGLE #8.3.13 : Gestion défensive pour enum (unit.type)
   */
  const columns: ColumnDef<Unit>[] = [
    {
      key: 'code',
      header: t('fields.code'),
      sortable: true,
      render: (unit: Unit) => (
        <span className="font-mono font-semibold">{unit.code}</span>
      ),
    },
    {
      key: 'name',
      header: t('fields.name'),
      sortable: true,
      render: (unit: Unit) => (
        <span className="font-medium">{unit.name}</span>
      ),
    },
    {
      key: 'symbol',
      header: t('fields.symbol'),
      sortable: true,
      render: (unit: Unit) => (
        <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
          {unit.symbol}
        </span>
      ),
    },
    {
      key: 'type',
      header: t('fields.type'),
      sortable: true,
      render: (unit: Unit) => (
        <span className="text-sm">
          {/* ✅ RÈGLE #8.3.13 : Gestion défensive i18n pour enum */}
          {unit.type ? t(`types.${unit.type}`) : '-'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: t('fields.isActive'),
      render: (unit: Unit) => (
        <Badge variant={unit.isActive ? 'success' : 'warning'}>
          {unit.isActive ? tc('status.active') : tc('status.inactive')}
        </Badge>
      ),
      align: 'center',
    },
  ]

  /**
   * Ouvre le formulaire en mode création
   */
  const handleCreate = () => {
    setEditingUnit(null)
    setFormOpen(true)
  }

  /**
   * Ouvre le formulaire en mode édition
   */
  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setFormOpen(true)
  }

  /**
   * Ouvre la modale de confirmation de suppression
   */
  const handleDeleteClick = (unit: Unit) => {
    setDeletingUnit(unit)
    setDeleteDialogOpen(true)
  }

  /**
   * Soumet le formulaire (création ou édition)
   */
  const handleSubmit = async (data: CreateUnitDto | UpdateUnitDto) => {
    setSubmitting(true)
    try {
      if (editingUnit) {
        // Mode édition - ajouter version pour optimistic locking
        await update(editingUnit.id, {
          ...data,
          version: editingUnit.version || 1,
        } as UpdateUnitDto)
      } else {
        // Mode création
        await create(data as CreateUnitDto)
      }
      setFormOpen(false)
      setEditingUnit(null)
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
    if (!deletingUnit) return

    try {
      await deleteItem(deletingUnit.id)
      setDeleteDialogOpen(false)
      setDeletingUnit(null)
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
            {t('subtitle')}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('actions.create')}
        </Button>
      </div>

      {/* Table - ✅ Wrappée dans Card (RÈGLE #7.2) */}
      <Card>
        <CardContent className="pt-6">
          <DataTable<Unit>
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
            searchPlaceholder={t('search.placeholder')}
          />
        </CardContent>
      </Card>

      {/* Modale de formulaire */}
      <UnitFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        unit={editingUnit}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      {/* Modale de suppression - ✅ RÈGLE #8.3.3 : Seulement itemName */}
      <DeleteConfirmModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        itemName={deletingUnit?.name || ''}
      />
    </div>
  )
}
