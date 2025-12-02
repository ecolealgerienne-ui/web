'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  therapeuticIndicationSchema,
  type TherapeuticIndicationFormData,
} from '@/lib/validation/schemas/admin/therapeutic-indication.schema'
import type { TherapeuticIndication } from '@/lib/types/admin/therapeutic-indication'
import type { Product } from '@/lib/types/admin/product'
import type { Species } from '@/lib/types/admin/species'
import type { Country } from '@/lib/types/admin/country'
import type { AdministrationRoute } from '@/lib/types/admin/administration-route'
import { productsService } from '@/lib/services/admin/products.service'
import { speciesService } from '@/lib/services/admin/species.service'
import { countriesService } from '@/lib/services/admin/countries.service'
import { administrationRoutesService } from '@/lib/services/admin/administration-routes.service'

/**
 * Props du formulaire d'indication thérapeutique
 *
 * ✅ RÈGLE #3 : Composant réutilisable pour création ET édition
 * Pattern: Simple Reference Data (entité la plus complexe)
 */
interface TherapeuticIndicationFormDialogProps {
  /**
   * Dialog ouvert ou fermé
   */
  open: boolean

  /**
   * Callback changement d'état
   */
  onOpenChange: (open: boolean) => void

  /**
   * Indication thérapeutique à éditer (si null = mode création)
   */
  indication: TherapeuticIndication | null

  /**
   * Callback soumission du formulaire
   */
  onSubmit: (data: TherapeuticIndicationFormData) => Promise<void>

  /**
   * État de chargement lors de la soumission
   */
  loading?: boolean

  /**
   * ID de produit pré-sélectionné (pour création depuis filtre)
   */
  preSelectedProductId?: string

  /**
   * ID d'espèce pré-sélectionné (pour création depuis filtre)
   */
  preSelectedSpeciesId?: string

  /**
   * Code pays pré-sélectionné (pour création depuis filtre)
   */
  preSelectedCountryCode?: string
}

/**
 * Dialog de formulaire pour créer/éditer une Indication Thérapeutique
 *
 * ✅ RÈGLE #3 : Composant réutilisable pour création ET édition
 * ✅ RÈGLE #6 : i18n complet via useTranslations
 * ✅ RÈGLE #9 : react-hook-form + zodResolver
 * ✅ RÈGLE Section 5.3 : valueAsNumber: true pour délais
 * ✅ RÈGLE Section 5.5 : Messages Zod avec clés relatives
 * ✅ RÈGLE Section 7.6 : Pattern checkbox pour isActive et isVerified
 *
 * Pattern: Simple Reference Data (entité la plus complexe)
 * Formulaire organisé en sections : Général, Ciblage, Posologie, Délais, Infos supplémentaires
 */
export function TherapeuticIndicationFormDialog({
  open,
  onOpenChange,
  indication,
  onSubmit,
  loading = false,
  preSelectedProductId,
  preSelectedSpeciesId,
  preSelectedCountryCode,
}: TherapeuticIndicationFormDialogProps) {
  const t = useTranslations('therapeuticIndication')
  const tc = useTranslations('common')

  // État local pour les listes de référence
  const [products, setProducts] = useState<Product[]>([])
  const [speciesList, setSpeciesList] = useState<Species[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [routes, setRoutes] = useState<AdministrationRoute[]>([])
  const [loadingReferences, setLoadingReferences] = useState(false)

  // Initialisation du formulaire
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TherapeuticIndicationFormData>({
    resolver: zodResolver(therapeuticIndicationSchema),
    defaultValues: {
      code: '',
      pathology: '',
      productId: preSelectedProductId || '',
      speciesId: preSelectedSpeciesId || '',
      countryCode: preSelectedCountryCode || '',
      routeId: '',
      isVerified: false,
      dosage: '',
      frequency: '',
      duration: '',
      withdrawalMeat: undefined,
      withdrawalMilk: undefined,
      withdrawalEggs: undefined,
      instructions: '',
      contraindications: '',
      warnings: '',
      isActive: true,
    },
  })

  /**
   * Charger les données de référence (Products, Species, Countries, Routes)
   * ✅ RÈGLE Section 7.4 : Charger les données au montage
   */
  useEffect(() => {
    const loadReferences = async () => {
      setLoadingReferences(true)
      try {
        // Charger en parallèle
        const [productsRes, speciesRes, countriesRes, routesRes] = await Promise.all([
          productsService.getAll({ limit: 100 }),
          speciesService.getAll({ limit: 100 }),
          countriesService.getAll({ limit: 100 }),
          administrationRoutesService.getAll({ limit: 100 }),
        ])

        // Filtrer uniquement les actifs
        setProducts(productsRes.data.filter((p) => p.isActive))
        setSpeciesList(speciesRes.data.filter((s) => s.isActive))
        setCountries(countriesRes.data.filter((c) => c.isActive))
        setRoutes(routesRes.data.filter((r) => r.isActive))
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
   * Réinitialiser le formulaire quand l'indication change ou dialog s'ouvre
   * ✅ RÈGLE Section 7.4 : Reset form on dialog open
   */
  useEffect(() => {
    if (open) {
      if (indication) {
        // Mode édition : pré-remplir
        reset({
          code: indication.code,
          pathology: indication.pathology,
          productId: indication.productId,
          speciesId: indication.speciesId,
          countryCode: indication.countryCode,
          routeId: indication.routeId,
          isVerified: indication.isVerified,
          dosage: indication.dosage || '',
          frequency: indication.frequency || '',
          duration: indication.duration || '',
          withdrawalMeat: indication.withdrawalMeat || undefined,
          withdrawalMilk: indication.withdrawalMilk || undefined,
          withdrawalEggs: indication.withdrawalEggs || undefined,
          instructions: indication.instructions || '',
          contraindications: indication.contraindications || '',
          warnings: indication.warnings || '',
          isActive: indication.isActive,
        })
      } else {
        // Mode création : réinitialiser
        reset({
          code: '',
          pathology: '',
          productId: preSelectedProductId || '',
          speciesId: preSelectedSpeciesId || '',
          countryCode: preSelectedCountryCode || '',
          routeId: '',
          isVerified: false,
          dosage: '',
          frequency: '',
          duration: '',
          withdrawalMeat: undefined,
          withdrawalMilk: undefined,
          withdrawalEggs: undefined,
          instructions: '',
          contraindications: '',
          warnings: '',
          isActive: true,
        })
      }
    }
  }, [open, indication, preSelectedProductId, preSelectedSpeciesId, preSelectedCountryCode, reset])

  /**
   * Soumission du formulaire
   */
  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {indication ? t('form.editTitle') : t('form.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Section 1 : Informations Générales */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('form.sectionGeneral')}</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">
                  {t('fields.code')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  {...register('code')}
                  placeholder={t('form.codePlaceholder')}
                  disabled={loading}
                  className={errors.code ? 'border-destructive' : ''}
                />
                {errors.code && (
                  <p className="text-sm text-destructive">{t(errors.code.message!)}</p>
                )}
              </div>

              {/* Pathologie */}
              <div className="space-y-2">
                <Label htmlFor="pathology">
                  {t('fields.pathology')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pathology"
                  {...register('pathology')}
                  placeholder={t('form.pathologyPlaceholder')}
                  disabled={loading}
                  className={errors.pathology ? 'border-destructive' : ''}
                />
                {errors.pathology && (
                  <p className="text-sm text-destructive">{t(errors.pathology.message!)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2 : Ciblage */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('form.sectionTargeting')}</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Produit */}
              <div className="space-y-2">
                <Label htmlFor="productId">
                  {t('fields.product')} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch('productId')}
                  onValueChange={(value) => setValue('productId', value, { shouldValidate: true })}
                  disabled={loadingReferences || loading}
                >
                  <SelectTrigger id="productId">
                    <SelectValue placeholder={t('form.selectProduct')} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.commercialName} ({product.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && (
                  <p className="text-sm text-destructive">{t(errors.productId.message!)}</p>
                )}
              </div>

              {/* Espèce */}
              <div className="space-y-2">
                <Label htmlFor="speciesId">
                  {t('fields.species')} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch('speciesId')}
                  onValueChange={(value) => setValue('speciesId', value, { shouldValidate: true })}
                  disabled={loadingReferences || loading}
                >
                  <SelectTrigger id="speciesId">
                    <SelectValue placeholder={t('form.selectSpecies')} />
                  </SelectTrigger>
                  <SelectContent>
                    {speciesList.map((species) => (
                      <SelectItem key={species.id} value={species.id}>
                        {species.name} ({species.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.speciesId && (
                  <p className="text-sm text-destructive">{t(errors.speciesId.message!)}</p>
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
                  disabled={loadingReferences || loading}
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

              {/* Voie d'administration */}
              <div className="space-y-2">
                <Label htmlFor="routeId">
                  {t('fields.route')} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch('routeId')}
                  onValueChange={(value) => setValue('routeId', value, { shouldValidate: true })}
                  disabled={loadingReferences || loading}
                >
                  <SelectTrigger id="routeId">
                    <SelectValue placeholder={t('form.selectRoute')} />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name} ({route.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.routeId && (
                  <p className="text-sm text-destructive">{t(errors.routeId.message!)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3 : Posologie */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('form.sectionPosology')}</h3>

            <div className="grid grid-cols-3 gap-4">
              {/* Dosage */}
              <div className="space-y-2">
                <Label htmlFor="dosage">{t('fields.dosage')}</Label>
                <Input
                  id="dosage"
                  {...register('dosage')}
                  placeholder={t('form.dosagePlaceholder')}
                  disabled={loading}
                  className={errors.dosage ? 'border-destructive' : ''}
                />
                {errors.dosage && (
                  <p className="text-sm text-destructive">{t(errors.dosage.message!)}</p>
                )}
              </div>

              {/* Fréquence */}
              <div className="space-y-2">
                <Label htmlFor="frequency">{t('fields.frequency')}</Label>
                <Input
                  id="frequency"
                  {...register('frequency')}
                  placeholder={t('form.frequencyPlaceholder')}
                  disabled={loading}
                  className={errors.frequency ? 'border-destructive' : ''}
                />
                {errors.frequency && (
                  <p className="text-sm text-destructive">{t(errors.frequency.message!)}</p>
                )}
              </div>

              {/* Durée */}
              <div className="space-y-2">
                <Label htmlFor="duration">{t('fields.duration')}</Label>
                <Input
                  id="duration"
                  {...register('duration')}
                  placeholder={t('form.durationPlaceholder')}
                  disabled={loading}
                  className={errors.duration ? 'border-destructive' : ''}
                />
                {errors.duration && (
                  <p className="text-sm text-destructive">{t(errors.duration.message!)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4 : Délais d'Attente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('form.sectionWithdrawal')}</h3>

            <div className="grid grid-cols-3 gap-4">
              {/* Délai viande */}
              <div className="space-y-2">
                <Label htmlFor="withdrawalMeat">{t('fields.withdrawalMeat')}</Label>
                <Input
                  id="withdrawalMeat"
                  type="number"
                  {...register('withdrawalMeat', { valueAsNumber: true })}
                  placeholder={t('form.withdrawalPlaceholder')}
                  disabled={loading}
                  className={errors.withdrawalMeat ? 'border-destructive' : ''}
                />
                {errors.withdrawalMeat && (
                  <p className="text-sm text-destructive">{t(errors.withdrawalMeat.message!)}</p>
                )}
              </div>

              {/* Délai lait */}
              <div className="space-y-2">
                <Label htmlFor="withdrawalMilk">{t('fields.withdrawalMilk')}</Label>
                <Input
                  id="withdrawalMilk"
                  type="number"
                  {...register('withdrawalMilk', { valueAsNumber: true })}
                  placeholder={t('form.withdrawalPlaceholder')}
                  disabled={loading}
                  className={errors.withdrawalMilk ? 'border-destructive' : ''}
                />
                {errors.withdrawalMilk && (
                  <p className="text-sm text-destructive">{t(errors.withdrawalMilk.message!)}</p>
                )}
              </div>

              {/* Délai œufs */}
              <div className="space-y-2">
                <Label htmlFor="withdrawalEggs">{t('fields.withdrawalEggs')}</Label>
                <Input
                  id="withdrawalEggs"
                  type="number"
                  {...register('withdrawalEggs', { valueAsNumber: true })}
                  placeholder={t('form.withdrawalPlaceholder')}
                  disabled={loading}
                  className={errors.withdrawalEggs ? 'border-destructive' : ''}
                />
                {errors.withdrawalEggs && (
                  <p className="text-sm text-destructive">{t(errors.withdrawalEggs.message!)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 5 : Informations Supplémentaires */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('form.sectionAdditional')}</h3>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions">{t('fields.instructions')}</Label>
              <Textarea
                id="instructions"
                {...register('instructions')}
                placeholder={t('form.instructionsPlaceholder')}
                rows={3}
                disabled={loading}
                className={errors.instructions ? 'border-destructive' : ''}
              />
              {errors.instructions && (
                <p className="text-sm text-destructive">{t(errors.instructions.message!)}</p>
              )}
            </div>

            {/* Contre-indications */}
            <div className="space-y-2">
              <Label htmlFor="contraindications">{t('fields.contraindications')}</Label>
              <Textarea
                id="contraindications"
                {...register('contraindications')}
                placeholder={t('form.contraindicationsPlaceholder')}
                rows={3}
                disabled={loading}
                className={errors.contraindications ? 'border-destructive' : ''}
              />
              {errors.contraindications && (
                <p className="text-sm text-destructive">{t(errors.contraindications.message!)}</p>
              )}
            </div>

            {/* Avertissements */}
            <div className="space-y-2">
              <Label htmlFor="warnings">{t('fields.warnings')}</Label>
              <Textarea
                id="warnings"
                {...register('warnings')}
                placeholder={t('form.warningsPlaceholder')}
                rows={3}
                disabled={loading}
                className={errors.warnings ? 'border-destructive' : ''}
              />
              {errors.warnings && (
                <p className="text-sm text-destructive">{t(errors.warnings.message!)}</p>
              )}
            </div>
          </div>

          {/* Section 6 : Statut */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('form.sectionStatus')}</h3>

            <div className="flex items-center gap-8">
              {/* Vérifiée */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isVerified"
                  {...register('isVerified')}
                  className="h-4 w-4 rounded border-input"
                  disabled={loading}
                />
                <Label htmlFor="isVerified" className="cursor-pointer">
                  {t('fields.isVerified')}
                </Label>
              </div>

              {/* Active */}
              <div className="flex items-center space-x-2">
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              {tc('actions.cancel')}
            </Button>
            <Button type="submit" disabled={loading || loadingReferences}>
              {loading ? tc('actions.saving') : indication ? tc('actions.update') : tc('actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
