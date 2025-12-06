'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/admin/common/DataTable'
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal'
import { DetailSheet } from '@/components/admin/common/DetailSheet'
import { SpeciesFormDialog } from '@/components/admin/species/SpeciesFormDialog'
import { useSpecies } from '@/lib/hooks/admin/useSpecies'
import type { Species } from '@/lib/types/admin/species'
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
 * Page d'administration des Espèces
 *
 * ✅ RÈGLE #3 : Utilise DataTable générique
 * ✅ RÈGLE #3 : Utilise Pagination générique
 * ✅ RÈGLE #3 : Utilise DeleteConfirmModal générique
 * ✅ RÈGLE #6 : i18n complet
 * ✅ RÈGLE #14.8 : Copié depuis active-substances (modèle de référence)
 *
 * Suit le modèle pilote Active-Substances (Phase 3)
 * Sprint 1 - Entité 5/5
 */
export default function SpeciesPage() {
  const t = useTranslations('species')
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
  } = useSpecies()

  // États locaux pour modales
  const [formOpen, setFormOpen] = useState(false)
  const [editingSpecies, setEditingSpecies] = useState<Species | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingSpecies, setDeletingSpecies] = useState<Species | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null)
  const [submitting, setSubmitting] = useState(false)

  /**
   * Définition des colonnes du DataTable
   * ✅ RÈGLE #1 : Aucune valeur en dur (i18n pour headers)
   */
  const columns: ColumnDef<Species>[] = [
    {
      key: 'code',
      header: t('fields.code'),
      sortable: true,
      render: (species: Species) => (
        <span className="font-mono font-semibold">{species.code}</span>
      ),
    },
    {
      key: 'name',
      header: t('fields.name'),
      sortable: true,
      render: (species: Species) => (
        <span className="font-medium">{species.name}</span>
      ),
    },
    {
      key: 'description',
      header: t('fields.description'),
      render: (species: Species) => (
        <span className="text-muted-foreground text-sm">
          {species.description || '-'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: t('fields.isActive'),
      render: (species: Species) => (
        <Badge variant={species.isActive ? 'success' : 'warning'}>
          {species.isActive ? tc('status.active') : tc('status.inactive')}
        </Badge>
      ),
      align: 'center',
    },
  ]

  // Handlers
  const handleAdd = () => {
    setEditingSpecies(null)
    setFormOpen(true)
  }

  const handleRowClick = (species: Species) => {
    setSelectedSpecies(species)
    setDetailOpen(true)
  }

  const handleEdit = (species: Species) => {
    setEditingSpecies(species)
    setFormOpen(true)
  }

  const handleDeleteClick = (species: Species) => {
    setDeletingSpecies(species)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingSpecies) return

    setSubmitting(true)
    try {
      await deleteItem(deletingSpecies.id)
      setDeleteDialogOpen(false)
      setDeletingSpecies(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormSubmit = async (
    data: any
  ) => {
    setSubmitting(true)
    try {
      if (editingSpecies) {
        // Mode édition
        await update(editingSpecies.id, {
          ...data,
          version: editingSpecies.version || 1,
        })
      } else {
        // Mode création
        await create(data)
      }
      setFormOpen(false)
      setEditingSpecies(null)
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
            {t('subtitle')}
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {t('actions.create')}
        </Button>
      </div>

      {/* DataTable générique (RÈGLE #3 + #8.3.14) */}
      <Card>
        <CardContent className="pt-6">
          <DataTable<Species>
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
      <SpeciesFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        species={editingSpecies}
        onSubmit={handleFormSubmit}
        loading={submitting}
      />

      {/* Dialog de détail */}
      <DetailSheet<Species>
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedSpecies}
        title={t('title.singular')}
        description={selectedSpecies?.name}
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
                if (selectedSpecies) handleEdit(selectedSpecies)
              }}
            >
              {tc('actions.edit')}
            </Button>
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                setDetailOpen(false)
                if (selectedSpecies) handleDeleteClick(selectedSpecies)
              }}
            >
              {tc('actions.delete')}
            </Button>
          </>
        }
      />

      {/* Modale de confirmation de suppression (RÈGLE #3 + #8.3.3) */}
      <DeleteConfirmModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        itemName={deletingSpecies?.name || ''}
      />
    </div>
  )
}
