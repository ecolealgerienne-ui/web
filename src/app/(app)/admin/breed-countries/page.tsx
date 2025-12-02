'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/admin/common/DataTable'
import { DeleteConfirmModal } from '@/components/admin/common/DeleteConfirmModal'
import { DetailSheet } from '@/components/admin/common/DetailSheet'
import { BreedCountryFormDialog } from '@/components/admin/breed-countries/BreedCountryFormDialog'
import { useBreedCountries } from '@/lib/hooks/admin/useBreedCountries'
import type { BreedCountry } from '@/lib/types/admin/breed-country'
import type { BreedCountryFormData } from '@/lib/validation/schemas/admin/breed-country.schema'
import type { BreedCountryFilterParams } from '@/lib/services/admin/breed-countries.service'
import type { Breed } from '@/lib/types/admin/breed'
import type { Country } from '@/lib/types/admin/country'
import { breedsService } from '@/lib/services/admin/breeds.service'
import { countriesService } from '@/lib/services/admin/countries.service'

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
 * Page de gestion des associations Race-Pays (Breed-Countries)
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur (tout via i18n)
 * ✅ RÈGLE #2 : Composants génériques réutilisés (DataTable, DeleteConfirmModal, DetailSheet)
 * ✅ RÈGLE #3 : Gestion d'erreurs centralisée (via hook)
 * ✅ RÈGLE #6 : i18n complet avec useTranslations
 * ✅ RÈGLE Section 7.5 : Pattern filtre avec constante ALL_BREEDS/ALL_COUNTRIES
 * ✅ RÈGLE Section 7.7 : Utilise params/setParams du hook
 *
 * Pattern: Junction Table (Many-to-Many)
 */
export default function BreedCountriesPage() {
  const t = useTranslations('breedCountry')
  const tc = useTranslations('common')

  // Constantes pour filtres "Toutes les races" / "Tous les pays"
  const ALL_BREEDS = '__all__'
  const ALL_COUNTRIES = '__all__'

  // État local pour les filtres
  const [selectedBreedId, setSelectedBreedId] = useState<string>(ALL_BREEDS)
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(ALL_COUNTRIES)
  const [breeds, setBreeds] = useState<Breed[]>([])
  const [countries, setCountries] = useState<Country[]>([])

  // État pour les dialogs
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // État pour la sélection
  const [selectedBreedCountry, setSelectedBreedCountry] = useState<BreedCountry | null>(null)
  const [editingBreedCountry, setEditingBreedCountry] = useState<BreedCountry | null>(null)
  const [breedCountryToDelete, setBreedCountryToDelete] = useState<BreedCountry | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Hook pour la gestion CRUD - le hook gère les params en interne
  const { data, total, loading, params, setParams, link, toggleActive, delete: deleteBreedCountry } = useBreedCountries({
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'asc',
  })

  /**
   * Charger la liste des races et pays pour les filtres
   * ✅ RÈGLE Section 7.4 : Charger au montage
   */
  useEffect(() => {
    const loadReferences = async () => {
      try {
        const [breedsRes, countriesRes] = await Promise.all([
          breedsService.getAll({ limit: 100 }),
          countriesService.getAll({ limit: 100 }),
        ])
        setBreeds(breedsRes.data.filter((b) => b.isActive))
        setCountries(countriesRes.data.filter((c) => c.isActive))
      } catch (error) {
        console.error('Failed to load reference data:', error)
      }
    }
    loadReferences()
  }, [])

  /**
   * Mettre à jour les paramètres quand les filtres changent
   */
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      breedId: selectedBreedId === ALL_BREEDS ? undefined : selectedBreedId,
      countryCode: selectedCountryCode === ALL_COUNTRIES ? undefined : selectedCountryCode,
      page: 1, // Reset à la page 1
    }))
  }, [selectedBreedId, selectedCountryCode, setParams])

  /**
   * Définition des colonnes du tableau
   * ✅ RÈGLE Section 8.3.2 : ColumnDef[] pour DataTable
   */
  const columns: ColumnDef<BreedCountry>[] = useMemo(
    () => [
      {
        key: 'breed',
        header: t('fields.breed'),
        render: (breedCountry) => (
          <div>
            <div className="font-medium">{breedCountry.breed?.nameFr || '—'}</div>
            {breedCountry.breed?.code && (
              <div className="text-sm text-muted-foreground">{breedCountry.breed.code}</div>
            )}
          </div>
        ),
      },
      {
        key: 'country',
        header: t('fields.country'),
        render: (breedCountry) => (
          <div>
            <div className="font-medium">{breedCountry.country?.nameFr || '—'}</div>
            <Badge variant="default" className="mt-1">
              {breedCountry.countryCode}
            </Badge>
          </div>
        ),
      },
      {
        key: 'isActive',
        header: tc('fields.status'),
        render: (breedCountry) => (
          <div className="flex items-center gap-2">
            {breedCountry.isActive ? (
              <Badge variant="success">{tc('status.active')}</Badge>
            ) : (
              <Badge variant="warning">{tc('status.inactive')}</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                toggleActive(breedCountry.id, !breedCountry.isActive)
              }}
            >
              {breedCountry.isActive ? t('actions.deactivate') : t('actions.activate')}
            </Button>
          </div>
        ),
      },
      {
        key: 'createdAt',
        header: tc('fields.createdAt'),
        sortable: true,
        render: (breedCountry) => new Date(breedCountry.createdAt).toLocaleDateString('fr-FR'),
      },
    ],
    [t, tc, toggleActive]
  )

  /**
   * Ouvrir le formulaire de création (link)
   */
  const handleCreate = () => {
    setEditingBreedCountry(null)
    setFormOpen(true)
  }

  /**
   * Ouvrir le formulaire d'édition
   */
  const handleEdit = (breedCountry: BreedCountry) => {
    setEditingBreedCountry(breedCountry)
    setFormOpen(true)
  }

  /**
   * Ouvrir le dialog de détail
   */
  const handleView = (breedCountry: BreedCountry) => {
    setSelectedBreedCountry(breedCountry)
    setDetailOpen(true)
  }

  /**
   * Toggle active/inactive
   */
  const handleToggleActive = async (breedCountry: BreedCountry) => {
    await toggleActive(breedCountry.id, !breedCountry.isActive)
  }

  /**
   * Ouvrir le modal de confirmation de suppression (unlink)
   */
  const handleDeleteClick = (breedCountry: BreedCountry) => {
    setBreedCountryToDelete(breedCountry)
    setShowDeleteModal(true)
  }

  /**
   * Confirmer la suppression (unlink)
   */
  const handleDeleteConfirm = async () => {
    if (!breedCountryToDelete) return

    const success = await deleteBreedCountry(breedCountryToDelete.id)
    if (success) {
      setShowDeleteModal(false)
      setBreedCountryToDelete(null)
    }
  }

  /**
   * Soumission du formulaire (création/link ou édition)
   */
  const handleFormSubmit = async (data: BreedCountryFormData) => {
    setSubmitting(true)
    try {
      if (editingBreedCountry) {
        // Mode édition : update isActive uniquement
        await toggleActive(editingBreedCountry.id, data.isActive ?? true)
      } else {
        // Mode création : link
        await link(data)
      }
      setFormOpen(false)
      setEditingBreedCountry(null)
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
    setParams((prev: BreedCountryFilterParams) => ({ ...prev, page }))
  }

  /**
   * Gérer le changement de recherche
   */
  const handleSearchChange = (search: string) => {
    setParams((prev: BreedCountryFilterParams) => ({ ...prev, search, page: 1 }))
  }

  /**
   * Gérer le changement de tri
   */
  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setParams((prev: BreedCountryFilterParams) => ({
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LinkIcon className="h-8 w-8" />
            {t('title')}
          </h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('actions.link')}
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {/* Filtre par race */}
            <div className="flex items-center gap-2">
              <Label htmlFor="breed-filter" className="whitespace-nowrap">
                {t('filters.breed')}
              </Label>
              <Select value={selectedBreedId} onValueChange={setSelectedBreedId}>
                <SelectTrigger id="breed-filter" className="w-[250px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_BREEDS}>{t('filters.allBreeds')}</SelectItem>
                  {breeds.map((breed) => (
                    <SelectItem key={breed.id} value={breed.id}>
                      {breed.nameFr} ({breed.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par pays */}
            <div className="flex items-center gap-2">
              <Label htmlFor="country-filter" className="whitespace-nowrap">
                {t('filters.country')}
              </Label>
              <Select value={selectedCountryCode} onValueChange={setSelectedCountryCode}>
                <SelectTrigger id="country-filter" className="w-[250px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_COUNTRIES}>{t('filters.allCountries')}</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country.isoCode2} value={country.isoCode2}>
                      {country.nameFr} ({country.isoCode2})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table des données */}
      <Card>
        <CardContent className="pt-6">
          <DataTable<BreedCountry>
            data={data}
            columns={columns}
            totalItems={total}
            page={params.page || 1}
            limit={params.limit || 50}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onView={handleView}
            onRowClick={handleView}
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

      {/* Formulaire de création/liaison */}
      <BreedCountryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        loading={submitting}
        breedCountry={editingBreedCountry}
        preSelectedBreedId={selectedBreedId === ALL_BREEDS ? undefined : selectedBreedId}
        preSelectedCountryCode={
          selectedCountryCode === ALL_COUNTRIES ? undefined : selectedCountryCode
        }
      />

      {/* Dialog de détail */}
      <DetailSheet<BreedCountry>
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedBreedCountry}
        title={t('detail.title')}
        fields={[
          {
            key: 'breed',
            label: t('fields.breed'),
            render: (value) => (value ? `${value.nameFr} (${value.code})` : '—'),
          },
          {
            key: 'country',
            label: t('fields.country'),
            render: (value) => (value ? `${value.nameFr} (${value.isoCode2})` : '—'),
          },
          {
            key: 'isActive',
            label: t('fields.isActive'),
            type: 'badge',
          },
          { key: 'createdAt', label: tc('fields.createdAt'), type: 'date' },
          { key: 'updatedAt', label: tc('fields.updatedAt'), type: 'date' },
        ]}
      />

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        itemName={
          breedCountryToDelete
            ? `${breedCountryToDelete.breed?.nameFr || '?'} - ${breedCountryToDelete.country?.nameFr || '?'}`
            : ''
        }
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
