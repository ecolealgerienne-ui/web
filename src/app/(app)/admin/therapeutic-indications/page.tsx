'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Pill, CheckCircle, XCircle } from 'lucide-react'
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
import { TherapeuticIndicationFormDialog } from '@/components/admin/therapeutic-indications/TherapeuticIndicationFormDialog'
import { useTherapeuticIndications } from '@/lib/hooks/admin/useTherapeuticIndications'
import type { TherapeuticIndication } from '@/lib/types/admin/therapeutic-indication'
import type { TherapeuticIndicationFormData } from '@/lib/validation/schemas/admin/therapeutic-indication.schema'
import type { TherapeuticIndicationFilterParams } from '@/lib/services/admin/therapeutic-indications.service'
import type { Product } from '@/lib/types/admin/product'
import type { Species } from '@/lib/types/admin/species'
import type { Country } from '@/lib/types/admin/country'
import { productsService } from '@/lib/services/admin/products.service'
import { speciesService } from '@/lib/services/admin/species.service'
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
 * Page de gestion des Indications Thérapeutiques
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur (tout via i18n)
 * ✅ RÈGLE #2 : Composants génériques réutilisés (DataTable, DeleteConfirmModal, DetailSheet)
 * ✅ RÈGLE #3 : Gestion d'erreurs centralisée (via hook)
 * ✅ RÈGLE #6 : i18n complet avec useTranslations
 * ✅ RÈGLE Section 7.5 : Pattern filtre avec constante ALL_*
 * ✅ RÈGLE Section 7.7 : Utilise params/setParams du hook
 * ✅ RÈGLE Section 8.3.16 : onRowClick pour afficher le détail
 *
 * Pattern: Simple Reference Data (entité la plus complexe)
 */
export default function TherapeuticIndicationsPage() {
  const t = useTranslations('therapeuticIndication')
  const tc = useTranslations('common')

  // Constantes pour filtres "Tous"
  const ALL_PRODUCTS = '__all__'
  const ALL_SPECIES = '__all__'
  const ALL_COUNTRIES = '__all__'
  const ALL_VERIFIED = '__all__'

  // État local pour les filtres
  const [selectedProductId, setSelectedProductId] = useState<string>(ALL_PRODUCTS)
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(ALL_SPECIES)
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(ALL_COUNTRIES)
  const [selectedVerifiedStatus, setSelectedVerifiedStatus] = useState<string>(ALL_VERIFIED)
  const [products, setProducts] = useState<Product[]>([])
  const [speciesList, setSpeciesList] = useState<Species[]>([])
  const [countries, setCountries] = useState<Country[]>([])

  // État pour les dialogs
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // État pour la sélection
  const [editingIndication, setEditingIndication] = useState<TherapeuticIndication | null>(null)
  const [selectedIndication, setSelectedIndication] = useState<TherapeuticIndication | null>(null)
  const [indicationToDelete, setIndicationToDelete] = useState<TherapeuticIndication | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Hook pour la gestion CRUD - le hook gère les params en interne
  const {
    data,
    total,
    loading,
    params,
    setParams,
    create,
    update,
    delete: deleteIndication,
    verify,
    unverify,
  } = useTherapeuticIndications({
    page: 1,
    limit: 50,
    sortBy: 'code',
    sortOrder: 'asc',
  })

  /**
   * Charger les listes pour les filtres
   * ✅ RÈGLE Section 7.4 : Charger au montage
   */
  useEffect(() => {
    const loadReferences = async () => {
      try {
        const [productsRes, speciesRes, countriesRes] = await Promise.all([
          productsService.getAll({ limit: 100 }),
          speciesService.getAll({ limit: 100 }),
          countriesService.getAll({ limit: 100 }),
        ])
        setProducts(productsRes.data.filter((p) => p.isActive))
        setSpeciesList(speciesRes.data.filter((s) => s.isActive))
        setCountries(countriesRes.data.filter((c) => c.isActive))
      } catch (error) {
        console.error('Failed to load reference data:', error)
      }
    }
    loadReferences()
  }, [])

  /**
   * Mettre à jour les paramètres quand les filtres changent
   * ✅ RÈGLE Section 7.7 : Gestion params via setParams
   */
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      productId: selectedProductId === ALL_PRODUCTS ? undefined : selectedProductId,
      speciesId: selectedSpeciesId === ALL_SPECIES ? undefined : selectedSpeciesId,
      countryCode: selectedCountryCode === ALL_COUNTRIES ? undefined : selectedCountryCode,
      isVerified:
        selectedVerifiedStatus === ALL_VERIFIED
          ? undefined
          : selectedVerifiedStatus === 'true',
      page: 1, // Reset à la page 1
    }))
  }, [selectedProductId, selectedSpeciesId, selectedCountryCode, selectedVerifiedStatus, setParams])

  /**
   * Définition des colonnes du tableau
   * ✅ RÈGLE Section 8.3.2 : ColumnDef[] pour DataTable
   */
  const columns: ColumnDef<TherapeuticIndication>[] = useMemo(
    () => [
      {
        key: 'code',
        header: t('fields.code'),
        sortable: true,
        render: (indication) => <span className="font-medium">{indication.code}</span>,
      },
      {
        key: 'pathology',
        header: t('fields.pathology'),
        sortable: true,
        render: (indication) => <span className="font-medium">{indication.pathology}</span>,
      },
      {
        key: 'product',
        header: t('fields.product'),
        render: (indication) => (
          <div>
            <div className="text-sm">{indication.product?.commercialName || '—'}</div>
            {indication.product?.code && (
              <div className="text-xs text-muted-foreground">{indication.product.code}</div>
            )}
          </div>
        ),
      },
      {
        key: 'species',
        header: t('fields.species'),
        render: (indication) => (
          <div>
            <div className="text-sm">{indication.species?.name || '—'}</div>
            {indication.species?.code && (
              <div className="text-xs text-muted-foreground">{indication.species.code}</div>
            )}
          </div>
        ),
      },
      {
        key: 'country',
        header: t('fields.country'),
        render: (indication) => (
          <Badge variant="default">{indication.countryCode}</Badge>
        ),
      },
      {
        key: 'isVerified',
        header: t('fields.isVerified'),
        render: (indication) => (
          <div className="flex items-center gap-2">
            {indication.isVerified ? (
              <>
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {t('status.verified')}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    unverify(indication.id)
                  }}
                >
                  {t('actions.unverify')}
                </Button>
              </>
            ) : (
              <>
                <Badge variant="warning" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {t('status.notVerified')}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    verify(indication.id)
                  }}
                >
                  {t('actions.verify')}
                </Button>
              </>
            )}
          </div>
        ),
      },
      {
        key: 'isActive',
        header: tc('fields.status'),
        render: (indication) =>
          indication.isActive ? (
            <Badge variant="success">{tc('status.active')}</Badge>
          ) : (
            <Badge variant="warning">{tc('status.inactive')}</Badge>
          ),
      },
    ],
    [t, tc, verify, unverify]
  )

  /**
   * Ouvrir le formulaire de création
   */
  const handleCreate = () => {
    setEditingIndication(null)
    setFormOpen(true)
  }

  /**
   * Ouvrir le formulaire d'édition
   */
  const handleEdit = (indication: TherapeuticIndication) => {
    setEditingIndication(indication)
    setFormOpen(true)
  }

  /**
   * Ouvrir le dialog de détail
   * ✅ RÈGLE Section 8.3.16 : Affichage du détail par clic
   */
  const handleView = (indication: TherapeuticIndication) => {
    setSelectedIndication(indication)
    setDetailOpen(true)
  }

  /**
   * Ouvrir le modal de confirmation de suppression
   */
  const handleDeleteClick = (indication: TherapeuticIndication) => {
    setIndicationToDelete(indication)
    setShowDeleteModal(true)
  }

  /**
   * Confirmer la suppression
   */
  const handleDeleteConfirm = async () => {
    if (!indicationToDelete) return

    const success = await deleteIndication(indicationToDelete.id)
    if (success) {
      setShowDeleteModal(false)
      setIndicationToDelete(null)
    }
  }

  /**
   * Soumission du formulaire (création ou édition)
   * ✅ RÈGLE Section 8.3.4 : Version field pour optimistic locking
   */
  const handleFormSubmit = async (data: TherapeuticIndicationFormData) => {
    setSubmitting(true)
    try {
      if (editingIndication) {
        // Mode édition
        const updateData = {
          ...data,
          version: editingIndication.version ?? 0,
        }
        await update(editingIndication.id, updateData)
      } else {
        // Mode création
        await create(data)
      }
      setFormOpen(false)
      setEditingIndication(null)
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
    setParams((prev: TherapeuticIndicationFilterParams) => ({ ...prev, page }))
  }

  /**
   * Gérer le changement de recherche
   */
  const handleSearchChange = (search: string) => {
    setParams((prev: TherapeuticIndicationFilterParams) => ({ ...prev, search, page: 1 }))
  }

  /**
   * Gérer le changement de tri
   */
  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setParams((prev: TherapeuticIndicationFilterParams) => ({
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
            <Pill className="h-8 w-8" />
            {t('title')}
          </h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('actions.create')}
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Filtre par produit */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="product-filter" className="whitespace-nowrap">
                {t('filters.product')}
              </Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger id="product-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_PRODUCTS}>{t('filters.allProducts')}</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.commercialName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par espèce */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="species-filter" className="whitespace-nowrap">
                {t('filters.species')}
              </Label>
              <Select value={selectedSpeciesId} onValueChange={setSelectedSpeciesId}>
                <SelectTrigger id="species-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_SPECIES}>{t('filters.allSpecies')}</SelectItem>
                  {speciesList.map((species) => (
                    <SelectItem key={species.id} value={species.id}>
                      {species.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par pays */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="country-filter" className="whitespace-nowrap">
                {t('filters.country')}
              </Label>
              <Select value={selectedCountryCode} onValueChange={setSelectedCountryCode}>
                <SelectTrigger id="country-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_COUNTRIES}>{t('filters.allCountries')}</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country.isoCode2} value={country.isoCode2}>
                      {country.nameFr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par statut de vérification */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="verified-filter" className="whitespace-nowrap">
                {t('filters.verified')}
              </Label>
              <Select value={selectedVerifiedStatus} onValueChange={setSelectedVerifiedStatus}>
                <SelectTrigger id="verified-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VERIFIED}>{t('filters.allStatus')}</SelectItem>
                  <SelectItem value="true">{t('filters.verifiedOnly')}</SelectItem>
                  <SelectItem value="false">{t('filters.notVerifiedOnly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table des données */}
      <Card>
        <CardContent className="pt-6">
          <DataTable<TherapeuticIndication>
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

      {/* Formulaire de création/édition */}
      <TherapeuticIndicationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        indication={editingIndication}
        onSubmit={handleFormSubmit}
        loading={submitting}
        preSelectedProductId={selectedProductId === ALL_PRODUCTS ? undefined : selectedProductId}
        preSelectedSpeciesId={selectedSpeciesId === ALL_SPECIES ? undefined : selectedSpeciesId}
        preSelectedCountryCode={selectedCountryCode === ALL_COUNTRIES ? undefined : selectedCountryCode}
      />

      {/* Dialog de détail */}
      <DetailSheet<TherapeuticIndication>
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedIndication}
        title={t('detail.title')}
        fields={[
          { key: 'code', label: t('fields.code') },
          { key: 'pathology', label: t('fields.pathology') },
          {
            key: 'product',
            label: t('fields.product'),
            render: (value) => (value ? `${value.commercialName} (${value.code})` : '—'),
          },
          {
            key: 'species',
            label: t('fields.species'),
            render: (value) => (value ? `${value.name} (${value.code})` : '—'),
          },
          {
            key: 'country',
            label: t('fields.country'),
            render: (value) => (value ? `${value.nameFr} (${value.isoCode2})` : '—'),
          },
          {
            key: 'route',
            label: t('fields.route'),
            render: (value) => (value ? `${value.name} (${value.code})` : '—'),
          },
          { key: 'dosage', label: t('fields.dosage') },
          { key: 'frequency', label: t('fields.frequency') },
          { key: 'duration', label: t('fields.duration') },
          { key: 'withdrawalMeat', label: t('fields.withdrawalMeat'), render: (value) => value ? `${value} jours` : '—' },
          { key: 'withdrawalMilk', label: t('fields.withdrawalMilk'), render: (value) => value ? `${value} jours` : '—' },
          { key: 'withdrawalEggs', label: t('fields.withdrawalEggs'), render: (value) => value ? `${value} jours` : '—' },
          { key: 'instructions', label: t('fields.instructions') },
          { key: 'contraindications', label: t('fields.contraindications') },
          { key: 'warnings', label: t('fields.warnings') },
          {
            key: 'isVerified',
            label: t('fields.isVerified'),
            type: 'badge',
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
        itemName={indicationToDelete ? `${indicationToDelete.code} - ${indicationToDelete.pathology}` : ''}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
