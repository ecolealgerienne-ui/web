'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/admin/common/DataTable'
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal'
import { DetailSheet } from '@/components/admin/common/DetailSheet'
import { CountryFormDialog } from '@/components/admin/countries/CountryFormDialog'
import { useCountries } from '@/lib/hooks/admin/useCountries'
import type { Country } from '@/lib/types/admin/country'
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
 * Page d'administration des Pays
 *
 * ✅ RÈGLE #3 : Utilise DataTable générique
 * ✅ RÈGLE #3 : Utilise Pagination générique
 * ✅ RÈGLE #3 : Utilise DeleteConfirmModal générique
 * ✅ RÈGLE #6 : i18n complet
 * ✅ RÈGLE #8.3.16 : Row click avec DetailSheet
 *
 * Sprint 1 - Entité indépendante (référentiel géographique)
 */
export default function CountriesPage() {
  const t = useTranslations('country')
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
  } = useCountries()

  // États locaux pour modales
  const [formOpen, setFormOpen] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingCountry, setDeletingCountry] = useState<Country | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [submitting, setSubmitting] = useState(false)

  /**
   * Définition des colonnes du DataTable
   * ✅ RÈGLE #1 : Aucune valeur en dur (i18n pour headers)
   */
  const columns: ColumnDef<Country>[] = [
    {
      key: 'code',
      header: t('fields.code'),
      sortable: true,
      render: (country: Country) => (
        <span className="font-mono font-semibold">{country.code}</span>
      ),
    },
    {
      key: 'nameFr',
      header: t('fields.nameFr'),
      sortable: true,
      render: (country: Country) => (
        <span className="font-medium">{country.nameFr}</span>
      ),
    },
    {
      key: 'nameEn',
      header: t('fields.nameEn'),
      sortable: true,
      render: (country: Country) => (
        <span className="text-muted-foreground text-sm">{country.nameEn}</span>
      ),
    },
    {
      key: 'isoCode2',
      header: t('fields.isoCode2'),
      render: (country: Country) => (
        <span className="font-mono text-xs">{country.isoCode2}</span>
      ),
      align: 'center',
    },
    {
      key: 'isoCode3',
      header: t('fields.isoCode3'),
      render: (country: Country) => (
        <span className="font-mono text-xs">{country.isoCode3}</span>
      ),
      align: 'center',
    },
    {
      key: 'isActive',
      header: t('fields.isActive'),
      render: (country: Country) => (
        <Badge variant={country.isActive ? 'success' : 'warning'}>
          {country.isActive ? tc('status.active') : tc('status.inactive')}
        </Badge>
      ),
      align: 'center',
    },
  ]

  // Handlers
  const handleAdd = () => {
    setEditingCountry(null)
    setFormOpen(true)
  }

  const handleRowClick = (country: Country) => {
    setSelectedCountry(country)
    setDetailOpen(true)
  }

  const handleEdit = (country: Country) => {
    setEditingCountry(country)
    setFormOpen(true)
  }

  const handleDeleteClick = (country: Country) => {
    setDeletingCountry(country)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCountry) return

    setSubmitting(true)
    try {
      await deleteItem(deletingCountry.id)
      setDeleteDialogOpen(false)
      setDeletingCountry(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormSubmit = async (data: any) => {
    setSubmitting(true)
    try {
      if (editingCountry) {
        // Mode édition
        await update(editingCountry.id, {
          ...data,
          version: editingCountry.version || 1,
        })
      } else {
        // Mode création
        await create(data)
      }
      setFormOpen(false)
      setEditingCountry(null)
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
          <DataTable<Country>
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
      <CountryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        country={editingCountry}
        onSubmit={handleFormSubmit}
        loading={submitting}
      />

      {/* Dialog de détail (RÈGLE #8.3.16) */}
      <DetailSheet<Country>
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedCountry}
        title={t('title.singular')}
        description={selectedCountry?.nameFr}
        fields={[
          { key: 'code', label: t('fields.code') },
          { key: 'nameFr', label: t('fields.nameFr') },
          { key: 'nameEn', label: t('fields.nameEn') },
          {
            key: 'nameAr',
            label: t('fields.nameAr'),
            render: (value) => (
              <span dir="rtl" className="text-right block">
                {value || '-'}
              </span>
            ),
          },
          { key: 'isoCode2', label: t('fields.isoCode2') },
          { key: 'isoCode3', label: t('fields.isoCode3') },
          { key: 'isActive', label: t('fields.isActive'), type: 'badge' },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setDetailOpen(false)
                if (selectedCountry) handleEdit(selectedCountry)
              }}
            >
              {tc('actions.edit')}
            </Button>
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                setDetailOpen(false)
                if (selectedCountry) handleDeleteClick(selectedCountry)
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
        itemName={deletingCountry?.nameFr || ''}
      />
    </div>
  )
}
