'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  campaignCountrySchema,
  type CampaignCountryFormData,
} from '@/lib/validation/schemas/admin/campaign-country.schema'
import type { CampaignCountry } from '@/lib/types/admin/campaign-country'
import type { NationalCampaign } from '@/lib/types/admin/national-campaign'
import type { Country } from '@/lib/types/admin/country'
import { nationalCampaignsService } from '@/lib/services/admin/national-campaigns.service'
import { countriesService } from '@/lib/services/admin/countries.service'

/**
 * Props du formulaire de liaison Campagne-Pays
 *
 * ✅ RÈGLE #3 : Composant réutilisable
 * Pattern: Junction Table (Many-to-Many)
 */
interface CampaignCountryFormDialogProps {
  /**
   * Dialog ouvert ou fermé
   */
  open: boolean

  /**
   * Callback changement d'état
   */
  onOpenChange: (open: boolean) => void

  /**
   * Callback soumission du formulaire
   */
  onSubmit: (data: CampaignCountryFormData) => Promise<void>

  /**
   * État de chargement lors de la soumission
   */
  loading?: boolean

  /**
   * CampaignCountry à éditer (mode édition)
   * Si null/undefined, c'est le mode création
   */
  campaignCountry?: CampaignCountry | null

  /**
   * ID de campagne pré-sélectionné (pour création depuis filtre)
   */
  preSelectedCampaignId?: string

  /**
   * Code pays pré-sélectionné (pour création depuis filtre)
   */
  preSelectedCountryCode?: string
}

/**
 * Dialog de formulaire pour créer/éditer un lien Campagne-Pays
 *
 * ✅ RÈGLE #6 : i18n complet via useTranslations
 * ✅ RÈGLE #9 : react-hook-form + zodResolver
 * ✅ RÈGLE Section 5.5 : Messages Zod avec clés relatives
 * ✅ RÈGLE Section 7.6 : Pattern checkbox pour isActive
 *
 * Pattern: Junction Table (Many-to-Many)
 * Mode création et édition (édition = modifier isActive uniquement)
 */
export function CampaignCountryFormDialog({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  campaignCountry,
  preSelectedCampaignId,
  preSelectedCountryCode,
}: CampaignCountryFormDialogProps) {
  const t = useTranslations('campaignCountry')
  const tc = useTranslations('common')

  // État local pour les listes de référence
  const [campaigns, setCampaigns] = useState<NationalCampaign[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingReferences, setLoadingReferences] = useState(false)

  // Mode édition ou création
  const isEditMode = Boolean(campaignCountry)

  // Initialisation du formulaire
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CampaignCountryFormData>({
    resolver: zodResolver(campaignCountrySchema),
    defaultValues: {
      campaignId: campaignCountry?.campaignId || preSelectedCampaignId || '',
      countryCode: campaignCountry?.countryCode || preSelectedCountryCode || '',
      isActive: campaignCountry?.isActive ?? true,
    },
  })

  /**
   * Charger les données de référence (Campaigns, Countries)
   * ✅ RÈGLE Section 7.4 : Charger les données au montage
   */
  useEffect(() => {
    const loadReferences = async () => {
      setLoadingReferences(true)
      try {
        // Charger en parallèle
        const [campaignsRes, countriesRes] = await Promise.all([
          nationalCampaignsService.getAll({ limit: 100 }),
          countriesService.getAll({ limit: 100 }),
        ])

        // Filtrer uniquement les actifs
        setCampaigns(campaignsRes.data.filter((c) => c.isActive))
        setCountries(countriesRes.data.filter((c) => c.isActive))
      } catch (error) {
        console.error('Failed to load reference data:', error)
      } finally {
        setLoadingReferences(false)
      }
    }

    if (open) {
      loadReferences()
    }
  }, [open])

  /**
   * Réinitialiser le formulaire quand dialog s'ouvre
   * ✅ RÈGLE Section 7.4 : Reset form on dialog open
   */
  useEffect(() => {
    if (open) {
      reset({
        campaignId: campaignCountry?.campaignId || preSelectedCampaignId || '',
        countryCode: campaignCountry?.countryCode || preSelectedCountryCode || '',
        isActive: campaignCountry?.isActive ?? true,
      })
    }
  }, [open, campaignCountry, preSelectedCampaignId, preSelectedCountryCode, reset])

  /**
   * Soumission du formulaire
   */
  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Campagne */}
          <div className="space-y-2">
            <Label htmlFor="campaignId">
              {t('fields.campaign')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('campaignId')}
              onValueChange={(value) => setValue('campaignId', value, { shouldValidate: true })}
              disabled={isEditMode || loadingReferences || loading}
            >
              <SelectTrigger id="campaignId">
                <SelectValue placeholder={t('form.selectCampaign')} />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.nameFr} ({campaign.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.campaignId && (
              <p className="text-sm text-destructive">{t(errors.campaignId.message!)}</p>
            )}
          </div>

          {/* Pays */}
          <div className="space-y-2">
            <Label htmlFor="countryCode">
              {t('fields.country')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('countryCode')}
              onValueChange={(value) => setValue('countryCode', value, { shouldValidate: true })}
              disabled={isEditMode || loadingReferences || loading}
            >
              <SelectTrigger id="countryCode">
                <SelectValue placeholder={t('form.selectCountry')} />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.isoCode2} value={country.isoCode2}>
                    {country.nameFr} ({country.isoCode2})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.countryCode && (
              <p className="text-sm text-destructive">{t(errors.countryCode.message!)}</p>
            )}
          </div>

          {/* Statut actif */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="h-4 w-4 rounded border-input"
                disabled={loading}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                {t('fields.isActive')}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              {tc('actions.cancel')}
            </Button>
            <Button type="submit" disabled={loading || loadingReferences}>
              {loading ? tc('actions.saving') : t('actions.link')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
