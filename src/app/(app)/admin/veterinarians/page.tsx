/**
 * Page d'administration des Vétérinaires (Admin Reference Data)
 *
 * ✅ RÈGLE #3 : Utilise DataTable générique
 * ✅ RÈGLE #3 : Utilise Pagination générique
 * ✅ RÈGLE #3 : Utilise DeleteConfirmModal générique
 * ✅ RÈGLE #6 : i18n complet
 * ✅ RÈGLE #8.3.16 : Row click avec DetailSheet
 * ✅ RÈGLE #8.3.17 : Badge rendering pour status
 *
 * Sprint 1 - Entité indépendante (vétérinaires référence)
 */

'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/admin/common/DataTable'
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal'
import { DetailSheet } from '@/components/admin/common/DetailSheet'
import { VeterinarianFormDialog } from '@/components/admin/veterinarians/VeterinarianFormDialog'
import { useVeterinarians } from '@/lib/hooks/admin/useVeterinarians'
import type { Veterinarian } from '@/lib/types/admin/veterinarian'
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

export default function VeterinariansPage() {
  const t = useTranslations('veterinarian')
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
  } = useVeterinarians()

  // États locaux pour modales
  const [formOpen, setFormOpen] = useState(false)
  const [editingVeterinarian, setEditingVeterinarian] =
    useState<Veterinarian | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingVeterinarian, setDeletingVeterinarian] =
    useState<Veterinarian | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedVeterinarian, setSelectedVeterinarian] =
    useState<Veterinarian | null>(null)
  const [submitting, setSubmitting] = useState(false)

  /**
   * Définition des colonnes du DataTable
   * ✅ RÈGLE #1 : Aucune valeur en dur (i18n pour headers)
   */
  const columns: ColumnDef<Veterinarian>[] = [
    {
      key: 'code',
      header: t('fields.code'),
      sortable: true,
      render: (vet: Veterinarian) => (
        <span className="font-mono font-semibold">{vet.code}</span>
      ),
    },
    {
      key: 'fullName',
      header: t('fields.fullName'),
      sortable: true,
      render: (vet: Veterinarian) => (
        <span className="font-medium">
          {vet.firstName} {vet.lastName}
        </span>
      ),
    },
    {
      key: 'licenseNumber',
      header: t('fields.licenseNumber'),
      sortable: true,
      render: (vet: Veterinarian) => (
        <span className="font-mono text-sm">{vet.licenseNumber}</span>
      ),
    },
    {
      key: 'specialties',
      header: t('fields.specialties'),
      render: (vet: Veterinarian) => (
        <div className="flex flex-wrap gap-1">
          {vet.specialties.slice(0, 2).map((specialty, idx) => (
            <Badge key={idx} variant="default" className="text-xs">
              {specialty}
            </Badge>
          ))}
          {vet.specialties.length > 2 && (
            <Badge variant="default" className="text-xs">
              +{vet.specialties.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'clinic',
      header: t('fields.clinic'),
      render: (vet: Veterinarian) => (
        <span className="text-sm text-muted-foreground">
          {vet.clinic || '-'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: t('fields.isActive'),
      render: (vet: Veterinarian) => (
        <Badge variant={vet.isActive ? 'success' : 'warning'}>
          {vet.isActive ? tc('status.active') : tc('status.inactive')}
        </Badge>
      ),
      align: 'center',
    },
  ]

  // Handlers
  const handleAdd = () => {
    setEditingVeterinarian(null)
    setFormOpen(true)
  }

  const handleRowClick = (vet: Veterinarian) => {
    setSelectedVeterinarian(vet)
    setDetailOpen(true)
  }

  const handleEdit = (vet: Veterinarian) => {
    setEditingVeterinarian(vet)
    setFormOpen(true)
  }

  const handleDeleteClick = (vet: Veterinarian) => {
    setDeletingVeterinarian(vet)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingVeterinarian) return

    setSubmitting(true)
    try {
      await deleteItem(deletingVeterinarian.id)
      setDeleteDialogOpen(false)
      setDeletingVeterinarian(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormSubmit = async (data: any) => {
    setSubmitting(true)
    try {
      if (editingVeterinarian) {
        // Mode édition
        await update(editingVeterinarian.id, {
          ...data,
          version: editingVeterinarian.version || 1,
        })
      } else {
        // Mode création
        await create(data)
      }
      setFormOpen(false)
      setEditingVeterinarian(null)
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
          <DataTable<Veterinarian>
            data={data}
            columns={columns}
            totalItems={total}
            page={params.page || 1}
            limit={params.limit || 25}
            onPageChange={(page) => setParams({ ...params, page })}
            onLimitChange={(limit) => setParams({ ...params, limit, page: 1 })}
            sortBy={params.sort}
            sortOrder={params.order}
            onSortChange={(sortBy, sortOrder) =>
              setParams({ ...params, sort: sortBy, order: sortOrder })
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
      <VeterinarianFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        veterinarian={editingVeterinarian}
        onSubmit={handleFormSubmit}
        loading={submitting}
      />

      {/* Dialog de détail (RÈGLE #8.3.16) */}
      <DetailSheet<Veterinarian>
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedVeterinarian}
        title={t('title.singular')}
        description={
          selectedVeterinarian
            ? `${selectedVeterinarian.firstName} ${selectedVeterinarian.lastName}`
            : ''
        }
        fields={[
          { key: 'code', label: t('fields.code') },
          {
            key: 'fullName',
            label: t('fields.fullName'),
            render: () =>
              selectedVeterinarian
                ? `${selectedVeterinarian.firstName} ${selectedVeterinarian.lastName}`
                : '-',
          },
          {
            key: 'licenseNumber',
            label: t('fields.licenseNumber'),
            render: (value) => (
              <span className="font-mono">{value || '-'}</span>
            ),
          },
          {
            key: 'specialties',
            label: t('fields.specialties'),
            render: (value) =>
              Array.isArray(value) ? (
                <div className="flex flex-wrap gap-1">
                  {value.map((specialty: string, idx: number) => (
                    <Badge key={idx} variant="default">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              ) : (
                '-'
              ),
          },
          {
            key: 'clinic',
            label: t('fields.clinic'),
            render: (value) =>
              value || <span className="text-muted-foreground italic">-</span>,
          },
          {
            key: 'contactInfo.phone',
            label: t('fields.phone'),
            render: () =>
              selectedVeterinarian?.contactInfo?.phone ? (
                <span className="font-mono">
                  {selectedVeterinarian.contactInfo.phone}
                </span>
              ) : (
                '-'
              ),
          },
          {
            key: 'contactInfo.mobile',
            label: t('fields.mobile'),
            render: () =>
              selectedVeterinarian?.contactInfo?.mobile ? (
                <span className="font-mono">
                  {selectedVeterinarian.contactInfo.mobile}
                </span>
              ) : (
                '-'
              ),
          },
          {
            key: 'contactInfo.email',
            label: t('fields.email'),
            render: () => selectedVeterinarian?.contactInfo?.email || '-',
          },
          {
            key: 'contactInfo.address',
            label: t('fields.address'),
            render: () => selectedVeterinarian?.contactInfo?.address || '-',
          },
          {
            key: 'contactInfo.city',
            label: t('fields.city'),
            render: () => selectedVeterinarian?.contactInfo?.city || '-',
          },
          { key: 'isActive', label: t('fields.isActive'), type: 'badge' },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setDetailOpen(false)
                if (selectedVeterinarian) handleEdit(selectedVeterinarian)
              }}
            >
              {tc('actions.edit')}
            </Button>
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                setDetailOpen(false)
                if (selectedVeterinarian)
                  handleDeleteClick(selectedVeterinarian)
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
        itemName={
          deletingVeterinarian
            ? `${deletingVeterinarian.firstName} ${deletingVeterinarian.lastName}`
            : ''
        }
      />
    </div>
  )
}
