'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/admin/common/DataTable'
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal'
import { DetailSheet } from '@/components/admin/common/DetailSheet'
import { BreedFormDialog } from '@/components/admin/breeds/BreedFormDialog'
import { useBreeds } from '@/lib/hooks/admin/useBreeds'
import type { Breed } from '@/lib/types/admin/breed'
import type { BreedFilterParams } from '@/lib/services/admin/breeds.service'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { speciesService } from '@/lib/services/admin/species.service'
import type { Species } from '@/lib/types/admin/species'
import { breedsService } from '@/lib/services/admin/breeds.service'

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
 * Constante pour représenter "Toutes les espèces" dans le filtre
 * ✅ RÈGLE Section 7.5 : Select.Item ne peut pas avoir value=""
 */
const ALL_SPECIES = '__all__'

/**
 * Page d'administration des Races (Breeds)
 *
 * ✅ RÈGLE #3 : Utilise DataTable générique
 * ✅ RÈGLE #3 : Utilise Pagination générique
 * ✅ RÈGLE #3 : Utilise DeleteConfirmModal générique
 * ✅ RÈGLE #6 : i18n complet
 * ✅ RÈGLE #14.8 : Suit le modèle Species (Pattern: Scoped Reference Data)
 * ✅ RÈGLE Section 7.5 : ALL_SPECIES au lieu de value=""
 *
 * Breeds est une entité "Scoped" qui dépend de Species
 * Sprint 2 - Entité 2/4
 */
export default function BreedsPage() {
  const t = useTranslations('breed')
  const tc = useTranslations('common')
  const ts = useTranslations('species')

  // État local pour liste des espèces (dropdown filter)
  const [species, setSpecies] = useState<Species[]>([])
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(ALL_SPECIES)

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
  } = useBreeds({
    page: 1,
    limit: 25,
    sortBy: 'nameFr',
    sortOrder: 'asc',
    speciesId: selectedSpeciesId === ALL_SPECIES ? undefined : selectedSpeciesId,
  })

  // États locaux pour modales
  const [formOpen, setFormOpen] = useState(false)
  const [editingBreed, setEditingBreed] = useState<Breed | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [breedToDelete, setBreedToDelete] = useState<Breed | null>(null)
  const [dependencies, setDependencies] = useState<Record<string, number>>()
  const [submitting, setSubmitting] = useState(false)

  /**
   * Charger les espèces au montage
   */
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await speciesService.getAll({ limit: 100 })
        setSpecies(response.data.filter((s) => s.isActive))
      } catch (error) {
        console.error('Failed to load species:', error)
      }
    }

    fetchSpecies()
  }, [])

  /**
   * Mettre à jour les paramètres quand le filtre espèce change
   * ✅ RÈGLE Section 7.4 : setState avec callback + dépendances exhaustives
   * ✅ RÈGLE Section 7.5 : Conversion ALL_SPECIES → undefined
   */
  useEffect(() => {
    setParams((prevParams: BreedFilterParams) => ({
      ...prevParams,
      speciesId: selectedSpeciesId === ALL_SPECIES ? undefined : selectedSpeciesId,
      page: 1, // Reset page quand on change de filtre
    }))
  }, [selectedSpeciesId, setParams])

  /**
   * Définition des colonnes du DataTable
   * ✅ RÈGLE #1 : Aucune valeur en dur (i18n pour headers)
   */
  const columns: ColumnDef<Breed>[] = [
    {
      key: 'code',
      header: t('fields.code'),
      sortable: true,
      width: '100px',
    },
    {
      key: 'nameFr',
      header: t('fields.nameFr'),
      sortable: true,
      width: '200px',
    },
    {
      key: 'nameEn',
      header: t('fields.nameEn'),
      sortable: true,
      width: '200px',
    },
    {
      key: 'species',
      header: t('fields.species'),
      width: '150px',
      render: (breed) => (
        <span>
          {breed.species?.name || '—'} ({breed.species?.code || '—'})
        </span>
      ),
    },
    {
      key: 'displayOrder',
      header: t('fields.displayOrder'),
      sortable: true,
      width: '100px',
      align: 'center',
      render: (breed) => breed.displayOrder ?? '—',
    },
    {
      key: 'isActive',
      header: t('fields.isActive'),
      width: '100px',
      align: 'center',
      render: (breed) =>
        breed.isActive ? (
          <Badge variant="success">{t('status.active')}</Badge>
        ) : (
          <Badge variant="warning">{t('status.inactive')}</Badge>
        ),
    },
  ]

  /**
   * Ouvrir le formulaire de création
   */
  const handleCreate = () => {
    setEditingBreed(null)
    setFormOpen(true)
  }

  /**
   * Ouvrir le formulaire d'édition
   */
  const handleEdit = (breed: Breed) => {
    setEditingBreed(breed)
    setFormOpen(true)
  }

  /**
   * Voir les détails d'une race
   */
  const handleView = (breed: Breed) => {
    setSelectedBreed(breed)
    setDetailOpen(true)
  }

  /**
   * Préparer la suppression (vérifier les dépendances)
   */
  const handleDeleteClick = async (breed: Breed) => {
    setBreedToDelete(breed)
    try {
      const deps = await breedsService.checkDependencies(breed.id)
      setDependencies(deps)
    } catch (error) {
      console.error('Failed to check dependencies:', error)
      setDependencies({})
    }
    setShowDeleteModal(true)
  }

  /**
   * Confirmer la suppression
   */
  const handleDeleteConfirm = async () => {
    if (!breedToDelete) return

    const success = await deleteItem(breedToDelete.id)
    if (success) {
      setShowDeleteModal(false)
      setBreedToDelete(null)
      setDependencies(undefined)
    }
  }

  /**
   * Soumettre le formulaire (création ou édition)
   */
  const handleFormSubmit = async (data: any) => {
    setSubmitting(true)
    try {
      if (editingBreed) {
        // Mode édition
        await update(editingBreed.id, {
          ...data,
          version: editingBreed.version,
        })
      } else {
        // Mode création
        await create(data)
      }
      setFormOpen(false)
      setEditingBreed(null)
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
    setParams((prev: BreedFilterParams) => ({ ...prev, page }))
  }

  /**
   * Gérer le changement de recherche
   */
  const handleSearchChange = (search: string) => {
    setParams((prev: BreedFilterParams) => ({ ...prev, search, page: 1 }))
  }

  /**
   * Gérer le changement de tri
   */
  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setParams((prev: BreedFilterParams) => ({
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
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('actions.create')}
        </Button>
      </div>

      {/* Filtre par espèce */}
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
                <SelectItem value={ALL_SPECIES}>{t('filters.allSpecies')}</SelectItem>
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

      {/* Table des données */}
      <Card>
        <CardContent className="pt-6">
          <DataTable<Breed>
            data={data}
            columns={columns}
            totalItems={total}
            page={params.page || 1}
            limit={params.limit || 25}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onView={handleView}
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
      <BreedFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        breed={editingBreed}
        onSubmit={handleFormSubmit}
        loading={submitting}
        preSelectedSpeciesId={selectedSpeciesId === ALL_SPECIES ? undefined : selectedSpeciesId}
      />

      {/* Dialog de détail */}
      <DetailSheet<Breed>
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedBreed}
        title={t('detail.title')}
        fields={[
          { label: t('fields.code'), value: (item) => item.code },
          { label: t('fields.nameFr'), value: (item) => item.nameFr },
          { label: t('fields.nameEn'), value: (item) => item.nameEn },
          { label: t('fields.nameAr'), value: (item) => item.nameAr || '—' },
          {
            label: t('fields.species'),
            value: (item) => `${item.species?.name || '—'} (${item.species?.code || '—'})`,
          },
          { label: t('fields.description'), value: (item) => item.description || '—' },
          { label: t('fields.displayOrder'), value: (item) => item.displayOrder?.toString() || '—' },
          {
            label: t('fields.isActive'),
            value: (item) => (item.isActive ? t('status.active') : t('status.inactive')),
          },
        ]}
      />

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        itemName={breedToDelete?.nameFr || ''}
        onConfirm={handleDeleteConfirm}
        dependencies={dependencies}
      />
    </div>
  )
}
