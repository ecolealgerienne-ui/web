'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/admin/common/DataTable'
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal'
import { DetailSheet } from '@/components/admin/common/DetailSheet'
import { AgeCategoryFormDialog } from '@/components/admin/age-categories/AgeCategoryFormDialog'
import { useAgeCategories } from '@/lib/hooks/admin/useAgeCategories'
import type { AgeCategory } from '@/lib/types/admin/age-category'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { speciesService } from '@/lib/services/admin/species.service'
import type { Species } from '@/lib/types/admin/species'

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
 * Page d'administration des Catégories d'Âge
 *
 * ✅ RÈGLE #3 : Utilise DataTable générique
 * ✅ RÈGLE #3 : Utilise Pagination générique
 * ✅ RÈGLE #3 : Utilise DeleteConfirmModal générique
 * ✅ RÈGLE #6 : i18n complet
 * ✅ RÈGLE #14.8 : Suit le modèle Species (Pattern: Scoped Reference Data)
 *
 * Age-Categories est une entité "Scoped" qui dépend de Species
 * Sprint 2 - Entité 1/4
 */
export default function AgeCategoriesPage() {
  const t = useTranslations('ageCategory')
  const tc = useTranslations('common')
  const ts = useTranslations('species')

  // État local pour liste des espèces (dropdown filter)
  const [species, setSpecies] = useState<Species[]>([])
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('')

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
  } = useAgeCategories({
    page: 1,
    limit: 25,
    sortBy: 'displayOrder',
    sortOrder: 'asc',
    speciesId: selectedSpeciesId || undefined,
  })

  // États locaux pour modales
  const [formOpen, setFormOpen] = useState(false)
  const [editingAgeCategory, setEditingAgeCategory] = useState<AgeCategory | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingAgeCategory, setDeletingAgeCategory] = useState<AgeCategory | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedAgeCategory, setSelectedAgeCategory] = useState<AgeCategory | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Charger la liste des espèces au montage
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await speciesService.getAll({
          page: 1,
          limit: 100,
          sortBy: 'name',
          sortOrder: 'asc',
        })
        setSpecies(response.data.filter((s) => s.isActive))
      } catch (error) {
        console.error('Failed to load species', error)
      }
    }

    fetchSpecies()
  }, [])

  // Mettre à jour les paramètres quand le filtre espèce change
  useEffect(() => {
    setParams((prevParams) => ({
      ...prevParams,
      speciesId: selectedSpeciesId || undefined,
      page: 1, // Reset page quand on change de filtre
    }))
  }, [selectedSpeciesId, setParams])

  /**
   * Définition des colonnes du DataTable
   * ✅ RÈGLE #1 : Aucune valeur en dur (i18n pour headers)
   */
  const columns: ColumnDef<AgeCategory>[] = [
    {
      key: 'code',
      header: t('fields.code'),
      sortable: true,
      render: (ageCategory: AgeCategory) => (
        <span className="font-mono font-semibold">{ageCategory.code}</span>
      ),
    },
    {
      key: 'nameFr',
      header: t('fields.nameFr'),
      sortable: true,
      render: (ageCategory: AgeCategory) => (
        <span className="font-medium">{ageCategory.nameFr}</span>
      ),
    },
    {
      key: 'nameEn',
      header: t('fields.nameEn'),
      sortable: true,
      render: (ageCategory: AgeCategory) => (
        <span className="text-muted-foreground text-sm">{ageCategory.nameEn}</span>
      ),
    },
    {
      key: 'ageMinDays',
      header: t('fields.ageRange'),
      sortable: true,
      render: (ageCategory: AgeCategory) => (
        <span className="text-sm">
          {ageCategory.ageMinDays}{' '}
          {ageCategory.ageMaxDays
            ? `- ${ageCategory.ageMaxDays}`
            : '+'}{' '}
          {t('fields.days')}
        </span>
      ),
    },
    {
      key: 'displayOrder',
      header: t('fields.displayOrder'),
      sortable: true,
      align: 'center',
      render: (ageCategory: AgeCategory) => (
        <span className="text-sm">{ageCategory.displayOrder || '-'}</span>
      ),
    },
    {
      key: 'isActive',
      header: t('fields.isActive'),
      render: (ageCategory: AgeCategory) => (
        <Badge variant={ageCategory.isActive ? 'success' : 'warning'}>
          {ageCategory.isActive ? tc('status.active') : tc('status.inactive')}
        </Badge>
      ),
      align: 'center',
    },
  ]

  // Handlers
  const handleAdd = () => {
    setEditingAgeCategory(null)
    setFormOpen(true)
  }

  const handleRowClick = (ageCategory: AgeCategory) => {
    setSelectedAgeCategory(ageCategory)
    setDetailOpen(true)
  }

  const handleEdit = (ageCategory: AgeCategory) => {
    setEditingAgeCategory(ageCategory)
    setFormOpen(true)
  }

  const handleDeleteClick = (ageCategory: AgeCategory) => {
    setDeletingAgeCategory(ageCategory)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingAgeCategory) return

    setSubmitting(true)
    try {
      await deleteItem(deletingAgeCategory.id)
      setDeleteDialogOpen(false)
      setDeletingAgeCategory(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormSubmit = async (data: any) => {
    setSubmitting(true)
    try {
      if (editingAgeCategory) {
        // Mode édition
        await update(editingAgeCategory.id, {
          ...data,
          version: editingAgeCategory.version || 1,
        })
      } else {
        // Mode création
        await create(data)
      }
      setFormOpen(false)
      setEditingAgeCategory(null)
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

      {/* Filtre Espèce (Scope Selector) */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Label className="font-medium">{t('filters.species')}</Label>
            <Select
              value={selectedSpeciesId}
              onValueChange={setSelectedSpeciesId}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder={t('filters.allSpecies')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('filters.allSpecies')}</SelectItem>
                {species.map((sp: Species) => (
                  <SelectItem key={sp.id} value={sp.id}>
                    {sp.name} ({sp.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* DataTable générique (RÈGLE #3 + #8.3.14) */}
      <Card>
        <CardContent className="pt-6">
          <DataTable<AgeCategory>
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
      <AgeCategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        ageCategory={editingAgeCategory}
        onSubmit={handleFormSubmit}
        loading={submitting}
        preSelectedSpeciesId={selectedSpeciesId}
      />

      {/* Dialog de détail */}
      <DetailSheet<AgeCategory>
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedAgeCategory}
        title={t('title.singular')}
        description={selectedAgeCategory?.nameFr}
        fields={[
          { key: 'code', label: t('fields.code') },
          { key: 'nameFr', label: t('fields.nameFr') },
          { key: 'nameEn', label: t('fields.nameEn') },
          {
            key: 'nameAr',
            label: t('fields.nameAr'),
            render: (value) =>
              value || <span className="text-muted-foreground italic">-</span>,
          },
          {
            key: 'ageMinDays',
            label: t('fields.ageMinDays'),
            render: (value) => `${value} ${t('fields.days')}`,
          },
          {
            key: 'ageMaxDays',
            label: t('fields.ageMaxDays'),
            render: (value) =>
              value ? `${value} ${t('fields.days')}` : t('fields.noLimit'),
          },
          { key: 'displayOrder', label: t('fields.displayOrder') },
          { key: 'isActive', label: t('fields.isActive'), type: 'badge' },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setDetailOpen(false)
                if (selectedAgeCategory) handleEdit(selectedAgeCategory)
              }}
            >
              {tc('actions.edit')}
            </Button>
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                setDetailOpen(false)
                if (selectedAgeCategory) handleDeleteClick(selectedAgeCategory)
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
        itemName={deletingAgeCategory?.nameFr || ''}
      />
    </div>
  )
}

/**
 * Label component local (import standard manquant)
 */
function Label({ children, className, htmlFor }: { children: React.ReactNode; className?: string; htmlFor?: string }) {
  return <label className={className} htmlFor={htmlFor}>{children}</label>
}
