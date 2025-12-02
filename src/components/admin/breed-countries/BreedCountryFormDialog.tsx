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
  breedCountrySchema,
  type BreedCountryFormData,
} from '@/lib/validation/schemas/admin/breed-country.schema'
import type { BreedCountry } from '@/lib/types/admin/breed-country'
import type { Breed } from '@/lib/types/admin/breed'
import type { Country } from '@/lib/types/admin/country'
import { breedsService } from '@/lib/services/admin/breeds.service'
import { countriesService } from '@/lib/services/admin/countries.service'

/**
 * Props du formulaire de liaison Race-Pays
 *
 * ✅ RÈGLE #3 : Composant réutilisable
 * Pattern: Junction Table (Many-to-Many)
 */
interface BreedCountryFormDialogProps {
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
  onSubmit: (data: BreedCountryFormData) => Promise<void>

  /**
   * État de chargement lors de la soumission
   */
  loading?: boolean

  /**
   * BreedCountry à éditer (mode édition)
   * Si null/undefined, c'est le mode création
   */
  breedCountry?: BreedCountry | null

  /**
   * ID de race pré-sélectionné (pour création depuis filtre)
   */
  preSelectedBreedId?: string

  /**
   * Code pays pré-sélectionné (pour création depuis filtre)
   */
  preSelectedCountryCode?: string
}

/**
 * Dialog de formulaire pour créer/éditer un lien Race-Pays
 *
 * ✅ RÈGLE #6 : i18n complet via useTranslations
 * ✅ RÈGLE #9 : react-hook-form + zodResolver
 * ✅ RÈGLE Section 5.5 : Messages Zod avec clés relatives
 * ✅ RÈGLE Section 7.6 : Pattern checkbox pour isActive
 *
 * Pattern: Junction Table (Many-to-Many)
 * Mode création et édition (édition = modifier isActive uniquement)
 */
export function BreedCountryFormDialog({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  breedCountry,
  preSelectedBreedId,
  preSelectedCountryCode,
}: BreedCountryFormDialogProps) {
  const t = useTranslations('breedCountry')
  const tc = useTranslations('common')

  // État local pour les listes de référence
  const [breeds, setBreeds] = useState<Breed[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingReferences, setLoadingReferences] = useState(false)

  // Mode édition ou création
  const isEditMode = Boolean(breedCountry)

  // Initialisation du formulaire
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BreedCountryFormData>({
    resolver: zodResolver(breedCountrySchema),
    defaultValues: {
      breedId: breedCountry?.breedId || preSelectedBreedId || '',
      countryCode: breedCountry?.countryCode || preSelectedCountryCode || '',
      isActive: breedCountry?.isActive ?? true,
    },
  })

  /**
   * Charger les données de référence (Breeds, Countries)
   * ✅ RÈGLE Section 7.4 : Charger les données au montage
   */
  useEffect(() => {
    const loadReferences = async () => {
      setLoadingReferences(true)
      try {
        // Charger en parallèle
        const [breedsRes, countriesRes] = await Promise.all([
          breedsService.getAll({ limit: 100 }),
          countriesService.getAll({ limit: 100 }),
        ])

        // Filtrer uniquement les actifs
        setBreeds(breedsRes.data.filter((b) => b.isActive))
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
        breedId: breedCountry?.breedId || preSelectedBreedId || '',
        countryCode: breedCountry?.countryCode || preSelectedCountryCode || '',
        isActive: breedCountry?.isActive ?? true,
      })
    }
  }, [open, breedCountry, preSelectedBreedId, preSelectedCountryCode, reset])

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
          {/* Race */}
          <div className="space-y-2">
            <Label htmlFor="breedId">
              {t('fields.breed')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('breedId')}
              onValueChange={(value) => setValue('breedId', value, { shouldValidate: true })}
              disabled={isEditMode || loadingReferences || loading}
            >
              <SelectTrigger id="breedId">
                <SelectValue placeholder={t('form.selectBreed')} />
              </SelectTrigger>
              <SelectContent>
                {breeds.map((breed) => (
                  <SelectItem key={breed.id} value={breed.id}>
                    {breed.nameFr} ({breed.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.breedId && (
              <p className="text-sm text-destructive">{t(errors.breedId.message!)}</p>
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
