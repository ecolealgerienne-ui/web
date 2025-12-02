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
import { CampaignCountryFormDialog } from '@/components/admin/campaign-countries/CampaignCountryFormDialog'
import { useCampaignCountries } from '@/lib/hooks/admin/useCampaignCountries'
import type { CampaignCountry } from '@/lib/types/admin/campaign-country'
import type { CampaignCountryFormData } from '@/lib/validation/schemas/admin/campaign-country.schema'
import type { CampaignCountryFilterParams } from '@/lib/services/admin/campaign-countries.service'
import type { NationalCampaign } from '@/lib/types/admin/national-campaign'
import type { Country } from '@/lib/types/admin/country'
import { nationalCampaignsService } from '@/lib/services/admin/national-campaigns.service'
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
 * Page de gestion des associations Campagne-Pays (Campaign-Countries)
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur (tout via i18n)
 * ✅ RÈGLE #2 : Composants génériques réutilisés (DataTable, DeleteConfirmModal, DetailSheet)
 * ✅ RÈGLE #3 : Gestion d'erreurs centralisée (via hook)
 * ✅ RÈGLE #6 : i18n complet avec useTranslations
 * ✅ RÈGLE Section 7.5 : Pattern filtre avec constante ALL_CAMPAIGNS/ALL_COUNTRIES
 * ✅ RÈGLE Section 7.7 : Utilise params/setParams du hook
 *
 * Pattern: Junction Table (Many-to-Many)
 */
export default function CampaignCountriesPage() {
  const t = useTranslations('campaignCountry')
  const tc = useTranslations('common')

  // Constantes pour filtres "Toutes les campagnes" / "Tous les pays"
  const ALL_CAMPAIGNS = '__all__'
  const ALL_COUNTRIES = '__all__'

  // État local pour les filtres
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(ALL_CAMPAIGNS)
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(ALL_COUNTRIES)
  const [campaigns, setCampaigns] = useState<NationalCampaign[]>([])
  const [countries, setCountries] = useState<Country[]>([])

  // État pour les dialogs
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // État pour la sélection
  const [selectedCampaignCountry, setSelectedCampaignCountry] = useState<CampaignCountry | null>(
    null
  )
  const [editingCampaignCountry, setEditingCampaignCountry] = useState<CampaignCountry | null>(
    null
  )
  const [campaignCountryToDelete, setCampaignCountryToDelete] = useState<CampaignCountry | null>(
    null
  )
  const [submitting, setSubmitting] = useState(false)

  // Hook pour la gestion CRUD - le hook gère les params en interne
  const {
    data,
    total,
    loading,
    params,
    setParams,
    link,
    toggleActive,
    delete: deleteCampaignCountry,
  } = useCampaignCountries({
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'asc',
  })

  /**
   * Charger la liste des campagnes et pays pour les filtres
   * ✅ RÈGLE Section 7.4 : Charger au montage
   */
  useEffect(() => {
    const loadReferences = async () => {
      try {
        const [campaignsRes, countriesRes] = await Promise.all([
          nationalCampaignsService.getAll({ limit: 100 }),
          countriesService.getAll({ limit: 100 }),
        ])
        setCampaigns(campaignsRes.data.filter((c) => c.isActive))
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
      campaignId: selectedCampaignId === ALL_CAMPAIGNS ? undefined : selectedCampaignId,
      countryCode: selectedCountryCode === ALL_COUNTRIES ? undefined : selectedCountryCode,
      page: 1, // Reset à la page 1
    }))
  }, [selectedCampaignId, selectedCountryCode, setParams])

  /**
   * Définition des colonnes du tableau
   * ✅ RÈGLE Section 8.3.2 : ColumnDef[] pour DataTable
   */
  const columns: ColumnDef<CampaignCountry>[] = useMemo(
    () => [
      {
        key: 'campaign',
        header: t('fields.campaign'),
        render: (campaignCountry) => (
          <div>
            <div className="font-medium">{campaignCountry.campaign?.nameFr || '—'}</div>
            {campaignCountry.campaign?.code && (
              <div className="text-sm text-muted-foreground">{campaignCountry.campaign.code}</div>
            )}
          </div>
        ),
      },
      {
        key: 'country',
        header: t('fields.country'),
        render: (campaignCountry) => (
          <div>
            <div className="font-medium">{campaignCountry.country?.nameFr || '—'}</div>
            <Badge variant="default" className="mt-1">
              {campaignCountry.countryCode}
            </Badge>
          </div>
        ),
      },
      {
        key: 'isActive',
        header: tc('fields.status'),
        render: (campaignCountry) => (
          <div className="flex items-center gap-2">
            {campaignCountry.isActive ? (
              <Badge variant="success">{tc('status.active')}</Badge>
            ) : (
              <Badge variant="warning">{tc('status.inactive')}</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                toggleActive(campaignCountry.id, !campaignCountry.isActive)
              }}
            >
              {campaignCountry.isActive ? t('actions.deactivate') : t('actions.activate')}
            </Button>
          </div>
        ),
      },
      {
        key: 'createdAt',
        header: tc('fields.createdAt'),
        sortable: true,
        render: (campaignCountry) =>
          new Date(campaignCountry.createdAt).toLocaleDateString('fr-FR'),
      },
    ],
    [t, tc, toggleActive]
  )

  /**
   * Ouvrir le formulaire de création (link)
   */
  const handleCreate = () => {
    setEditingCampaignCountry(null)
    setFormOpen(true)
  }

  /**
   * Ouvrir le formulaire d'édition
   */
  const handleEdit = (campaignCountry: CampaignCountry) => {
    setEditingCampaignCountry(campaignCountry)
    setFormOpen(true)
  }

  /**
   * Ouvrir le dialog de détail
   */
  const handleView = (campaignCountry: CampaignCountry) => {
    setSelectedCampaignCountry(campaignCountry)
    setDetailOpen(true)
  }

  /**
   * Ouvrir le modal de confirmation de suppression (unlink)
   */
  const handleDeleteClick = (campaignCountry: CampaignCountry) => {
    setCampaignCountryToDelete(campaignCountry)
    setShowDeleteModal(true)
  }

  /**
   * Confirmer la suppression (unlink)
   */
  const handleDeleteConfirm = async () => {
    if (!campaignCountryToDelete) return

    const success = await deleteCampaignCountry(campaignCountryToDelete.id)
    if (success) {
      setShowDeleteModal(false)
      setCampaignCountryToDelete(null)
    }
  }

  /**
   * Soumission du formulaire (création/link ou édition)
   */
  const handleFormSubmit = async (data: CampaignCountryFormData) => {
    setSubmitting(true)
    try {
      if (editingCampaignCountry) {
        // Mode édition : update isActive uniquement
        await toggleActive(editingCampaignCountry.id, data.isActive ?? true)
      } else {
        // Mode création : link
        await link(data)
      }
      setFormOpen(false)
      setEditingCampaignCountry(null)
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
    setParams((prev: CampaignCountryFilterParams) => ({ ...prev, page }))
  }

  /**
   * Gérer le changement de recherche
   */
  const handleSearchChange = (search: string) => {
    setParams((prev: CampaignCountryFilterParams) => ({ ...prev, search, page: 1 }))
  }

  /**
   * Gérer le changement de tri
   */
  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setParams((prev: CampaignCountryFilterParams) => ({
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
            {/* Filtre par campagne */}
            <div className="flex items-center gap-2">
              <Label htmlFor="campaign-filter" className="whitespace-nowrap">
                {t('filters.campaign')}
              </Label>
              <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                <SelectTrigger id="campaign-filter" className="w-[250px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CAMPAIGNS}>{t('filters.allCampaigns')}</SelectItem>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.nameFr} ({campaign.code})
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
          <DataTable<CampaignCountry>
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
      <CampaignCountryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        loading={submitting}
        campaignCountry={editingCampaignCountry}
        preSelectedCampaignId={selectedCampaignId === ALL_CAMPAIGNS ? undefined : selectedCampaignId}
        preSelectedCountryCode={
          selectedCountryCode === ALL_COUNTRIES ? undefined : selectedCountryCode
        }
      />

      {/* Dialog de détail */}
      <DetailSheet<CampaignCountry>
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selectedCampaignCountry}
        title={t('detail.title')}
        fields={[
          {
            key: 'campaign',
            label: t('fields.campaign'),
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
          campaignCountryToDelete
            ? `${campaignCountryToDelete.campaign?.nameFr || '?'} - ${campaignCountryToDelete.country?.nameFr || '?'}`
            : ''
        }
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
