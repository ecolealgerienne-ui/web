/**
 * Page d'administration des Campagnes Nationales (Admin Reference Data)
 *
 * ✅ RÈGLE #3 : Utilise DataTable générique
 * ✅ RÈGLE #3 : Utilise Pagination générique
 * ✅ RÈGLE #3 : Utilise DeleteConfirmModal générique
 * ✅ RÈGLE #6 : i18n complet
 * ✅ RÈGLE #8.3.16 : Row click avec DetailSheet
 * ✅ RÈGLE #8.3.17 : Badge rendering pour type et status
 *
 * Sprint 1 - Entité indépendante (campagnes nationales de santé animale)
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
import { NationalCampaignFormDialog } from '@/components/admin/national-campaigns/NationalCampaignFormDialog'
import { useNationalCampaigns } from '@/lib/hooks/admin/useNationalCampaigns'
import type { NationalCampaign } from '@/lib/types/admin/national-campaign'
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

export default function NationalCampaignsPage() {
  const t = useTranslations('nationalCampaign')
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
  } = useNationalCampaigns()

  // États locaux pour modales
  const [formOpen, setFormOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] =
    useState<NationalCampaign | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingCampaign, setDeletingCampaign] =
    useState<NationalCampaign | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] =
    useState<NationalCampaign | null>(null)
  const [submitting, setSubmitting] = useState(false)

  /**
   * Définition des colonnes du DataTable
   * ✅ RÈGLE #1 : Aucune valeur en dur (i18n pour headers)
   */
  const columns: ColumnDef<NationalCampaign>[] = [
    {
      key: 'code',
      header: t('fields.code'),
      sortable: true,
      render: (campaign: NationalCampaign) => (
        <span className="font-mono font-semibold">{campaign.code}</span>
      ),
    },
    {
      key: 'nameFr',
      header: t('fields.nameFr'),
      sortable: true,
      render: (campaign: NationalCampaign) => (
        <span className="font-medium">{campaign.nameFr}</span>
      ),
    },
    {
      key: 'type',
      header: t('fields.type'),
      sortable: true,
      render: (campaign: NationalCampaign) => (
        <Badge variant="default">{t(`types.${campaign.type}`)}</Badge>
      ),
    },
    {
      key: 'startDate',
      header: t('fields.startDate'),
      sortable: true,
      render: (campaign: NationalCampaign) => (
        <span className="text-sm">
          {new Date(campaign.startDate).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'endDate',
      header: t('fields.endDate'),
      sortable: true,
      render: (campaign: NationalCampaign) => (
        <span className="text-sm">
          {new Date(campaign.endDate).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: t('fields.isActive'),
      render: (campaign: NationalCampaign) => (
        <Badge variant={campaign.isActive ? 'success' : 'warning'}>
          {campaign.isActive ? tc('status.active') : tc('status.inactive')}
        </Badge>
      ),
      align: 'center',
    },
  ]

  // Handlers
  const handleAdd = () => {
    setEditingCampaign(null)
    setFormOpen(true)
  }

  const handleRowClick = (campaign: NationalCampaign) => {
    setSelectedCampaign(campaign)
    setDetailOpen(true)
  }

  const handleEdit = (campaign: NationalCampaign) => {
    setEditingCampaign(campaign)
    setFormOpen(true)
  }

  const handleDeleteClick = (campaign: NationalCampaign) => {
    setDeletingCampaign(campaign)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCampaign) return

    setSubmitting(true)
    try {
      await deleteItem(deletingCampaign.id)
      setDeleteDialogOpen(false)
      setDeletingCampaign(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormSubmit = async (data: any) => {
    setSubmitting(true)
    try {
      if (editingCampaign) {
        // Mode édition
        await update(editingCampaign.id, {
          ...data,
          version: editingCampaign.version || 1,
        })
      } else {
        // Mode création
        await create(data)
      }
      setFormOpen(false)
      setEditingCampaign(null)
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
          <DataTable<NationalCampaign>
            data={data}
            columns={columns}
            totalItems={total}
            page={params.page || 1}
            limit={params.limit || 20}
            onPageChange={(page) => setParams({ ...params, page })}
            onLimitChange={(limit) => setParams({ ...params, limit, page: 1 })}
            sortBy={params.orderBy}
            sortOrder={params.order?.toLowerCase() as 'asc' | 'desc' | undefined}
            onSortChange={(sortBy, sortOrder) =>
              setParams({
                ...params,
                orderBy: sortBy as any,
                order: sortOrder?.toUpperCase() as 'ASC' | 'DESC' | undefined
              })
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
      <NationalCampaignFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        campaign={editingCampaign}
        onSubmit={handleFormSubmit}
        loading={submitting}
      />

      {/* Dialog de détail (RÈGLE #8.3.16) */}
      <DetailSheet<NationalCampaign>
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedCampaign}
        title={t('title.singular')}
        description={
          selectedCampaign ? selectedCampaign.nameFr : ''
        }
        fields={[
          { key: 'code', label: t('fields.code') },
          { key: 'nameFr', label: t('fields.nameFr') },
          { key: 'nameEn', label: t('fields.nameEn') },
          { key: 'nameAr', label: t('fields.nameAr') },
          {
            key: 'type',
            label: t('fields.type'),
            render: (value) => (
              <Badge variant="default">{t(`types.${value}`)}</Badge>
            ),
          },
          {
            key: 'startDate',
            label: t('fields.startDate'),
            render: (value) =>
              value ? new Date(value as string).toLocaleDateString('fr-FR') : '-',
          },
          {
            key: 'endDate',
            label: t('fields.endDate'),
            render: (value) =>
              value ? new Date(value as string).toLocaleDateString('fr-FR') : '-',
          },
          { key: 'description', label: t('fields.description') },
          { key: 'isActive', label: t('fields.isActive'), type: 'badge' },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setDetailOpen(false)
                if (selectedCampaign) handleEdit(selectedCampaign)
              }}
            >
              {tc('actions.edit')}
            </Button>
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                setDetailOpen(false)
                if (selectedCampaign) handleDeleteClick(selectedCampaign)
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
        itemName={deletingCampaign ? deletingCampaign.nameFr : ''}
      />
    </div>
  )
}
