'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { AgeCategory } from '@/lib/types/admin/age-category'
import type { Unit } from '@/lib/types/admin/unit'
import { productsService } from '@/lib/services/admin/products.service'
import { speciesService } from '@/lib/services/admin/species.service'
import { countriesService } from '@/lib/services/admin/countries.service'
import { administrationRoutesService } from '@/lib/services/admin/administration-routes.service'
import { ageCategoriesService } from '@/lib/services/admin/age-categories.service'
import { unitsService } from '@/lib/services/admin/units.service'

interface TherapeuticIndicationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  indication: TherapeuticIndication | null
  onSubmit: (data: TherapeuticIndicationFormData) => Promise<void>
  loading?: boolean
  preSelectedProductId?: string
  preSelectedSpeciesId?: string
  preSelectedCountryCode?: string
}

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

  // Listes de référence
  const [products, setProducts] = useState<Product[]>([])
  const [species, setSpecies] = useState<Species[]>([])
  const [ageCategories, setAgeCategories] = useState<AgeCategory[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [routes, setRoutes] = useState<AdministrationRoute[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loadingLists, setLoadingLists] = useState(true)

  // Formulaire
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TherapeuticIndicationFormData>({
    resolver: zodResolver(therapeuticIndicationSchema),
    defaultValues: {
      productId: preSelectedProductId || '',
      speciesId: preSelectedSpeciesId || '',
      ageCategoryId: null,
      countryCode: preSelectedCountryCode || null,
      routeId: '',
      doseUnitId: '',
      doseMin: null,
      doseMax: null,
      doseOriginalText: null,
      protocolDurationDays: null,
      withdrawalMeatDays: null,
      withdrawalMilkDays: null,
      isVerified: false,
      validationNotes: null,
      isActive: true,
    },
  })

  /**
   * Charger les listes de référence
   */
  useEffect(() => {
    const loadReferenceLists = async () => {
      try {
        setLoadingLists(true)
        const [
          productsRes,
          speciesRes,
          ageCategoriesRes,
          countriesRes,
          routesRes,
          unitsRes,
        ] = await Promise.all([
          productsService.getAll({ limit: 100 }),
          speciesService.getAll({ limit: 100 }),
          ageCategoriesService.getAll({ limit: 100 }),
          countriesService.getAll({ limit: 100 }),
          administrationRoutesService.getAll({ limit: 100 }),
          unitsService.getAll({ limit: 100 }),
        ])
        setProducts(productsRes.data.filter((p) => p.isActive))
        setSpecies(speciesRes.data.filter((s) => s.isActive))
        setAgeCategories(ageCategoriesRes.data.filter((a) => a.isActive))
        setCountries(countriesRes.data.filter((c) => c.isActive))
        setRoutes(routesRes.data.filter((r) => r.isActive))
        setUnits(unitsRes.data.filter((u) => u.isActive))
      } catch (error) {
        console.error('Failed to load reference lists:', error)
      } finally {
        setLoadingLists(false)
      }
    }

    if (open) {
      loadReferenceLists()
    }
  }, [open])

  /**
   * Charger les données en mode édition
   */
  useEffect(() => {
    if (indication && open) {
      setValue('productId', indication.productId)
      setValue('speciesId', indication.speciesId)
      setValue('ageCategoryId', indication.ageCategoryId)
      setValue('countryCode', indication.countryCode)
      setValue('routeId', indication.routeId)
      setValue('doseUnitId', indication.doseUnitId)
      setValue('doseMin', indication.doseMin)
      setValue('doseMax', indication.doseMax)
      setValue('doseOriginalText', indication.doseOriginalText)
      setValue('protocolDurationDays', indication.protocolDurationDays)
      setValue('withdrawalMeatDays', indication.withdrawalMeatDays)
      setValue('withdrawalMilkDays', indication.withdrawalMilkDays)
      setValue('isVerified', indication.isVerified)
      setValue('validationNotes', indication.validationNotes)
      setValue('isActive', indication.isActive)
    }
  }, [indication, open, setValue])

  /**
   * Reset lors de la fermeture
   */
  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  /**
   * Soumission du formulaire
   */
  const handleFormSubmit = async (data: TherapeuticIndicationFormData) => {
    await onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {indication ? t('form.editTitle') : t('form.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Section 1: Relations/Ciblage */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              {t('form.sectionTargeting')}
            </h3>

            {/* Produit */}
            <div className="space-y-2">
              <Label htmlFor="productId">
                {t('fields.product')} <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="productId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loading || loadingLists}
                  >
                    <SelectTrigger className={errors.productId ? 'border-destructive' : ''}>
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
                )}
              />
              {errors.productId && (
                <p className="text-sm text-destructive">{t(errors.productId.message!)}</p>
              )}
            </div>

            {/* Espèce */}
            <div className="space-y-2">
              <Label htmlFor="speciesId">
                {t('fields.species')} <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="speciesId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loading || loadingLists}
                  >
                    <SelectTrigger className={errors.speciesId ? 'border-destructive' : ''}>
                      <SelectValue placeholder={t('form.selectSpecies')} />
                    </SelectTrigger>
                    <SelectContent>
                      {species.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.speciesId && (
                <p className="text-sm text-destructive">{t(errors.speciesId.message!)}</p>
              )}
            </div>

            {/* Catégorie d'âge */}
            <div className="space-y-2">
              <Label htmlFor="ageCategoryId">{t('fields.ageCategory')}</Label>
              <Controller
                name="ageCategoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value === '' ? null : value)}
                    value={field.value || ''}
                    disabled={loading || loadingLists}
                  >
                    <SelectTrigger className={errors.ageCategoryId ? 'border-destructive' : ''}>
                      <SelectValue placeholder={t('form.selectAgeCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{tc('placeholders.optional')}</SelectItem>
                      {ageCategories.map((ac) => (
                        <SelectItem key={ac.id} value={ac.id}>
                          {ac.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.ageCategoryId && (
                <p className="text-sm text-destructive">{t(errors.ageCategoryId.message!)}</p>
              )}
            </div>

            {/* Pays */}
            <div className="space-y-2">
              <Label htmlFor="countryCode">{t('fields.country')}</Label>
              <Controller
                name="countryCode"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value === '' ? null : value)}
                    value={field.value || ''}
                    disabled={loading || loadingLists}
                  >
                    <SelectTrigger className={errors.countryCode ? 'border-destructive' : ''}>
                      <SelectValue placeholder={t('form.selectCountry')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{tc('placeholders.optional')}</SelectItem>
                      {countries.map((country) => (
                        <SelectItem key={country.isoCode2} value={country.isoCode2}>
                          {country.nameFr} ({country.isoCode2})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.countryCode && (
                <p className="text-sm text-destructive">{t(errors.countryCode.message!)}</p>
              )}
            </div>

            {/* Voie d'administration */}
            <div className="space-y-2">
              <Label htmlFor="routeId">
                {t('fields.route')} <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="routeId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loading || loadingLists}
                  >
                    <SelectTrigger className={errors.routeId ? 'border-destructive' : ''}>
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
                )}
              />
              {errors.routeId && (
                <p className="text-sm text-destructive">{t(errors.routeId.message!)}</p>
              )}
            </div>
          </div>

          {/* Section 2: Posologie */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              {t('form.sectionDosage')}
            </h3>

            {/* Unité de dosage */}
            <div className="space-y-2">
              <Label htmlFor="doseUnitId">
                {t('fields.doseUnit')} <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="doseUnitId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loading || loadingLists}
                  >
                    <SelectTrigger className={errors.doseUnitId ? 'border-destructive' : ''}>
                      <SelectValue placeholder={t('form.selectDoseUnit')} />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.doseUnitId && (
                <p className="text-sm text-destructive">{t(errors.doseUnitId.message!)}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Dose minimale */}
              <div className="space-y-2">
                <Label htmlFor="doseMin">{t('fields.doseMin')}</Label>
                <Input
                  id="doseMin"
                  type="number"
                  step="0.01"
                  placeholder={t('form.doseMinPlaceholder')}
                  {...register('doseMin', { valueAsNumber: true })}
                  disabled={loading}
                  className={errors.doseMin ? 'border-destructive' : ''}
                />
                {errors.doseMin && (
                  <p className="text-sm text-destructive">{t(errors.doseMin.message!)}</p>
                )}
              </div>

              {/* Dose maximale */}
              <div className="space-y-2">
                <Label htmlFor="doseMax">{t('fields.doseMax')}</Label>
                <Input
                  id="doseMax"
                  type="number"
                  step="0.01"
                  placeholder={t('form.doseMaxPlaceholder')}
                  {...register('doseMax', { valueAsNumber: true })}
                  disabled={loading}
                  className={errors.doseMax ? 'border-destructive' : ''}
                />
                {errors.doseMax && (
                  <p className="text-sm text-destructive">{t(errors.doseMax.message!)}</p>
                )}
              </div>
            </div>

            {/* Texte original */}
            <div className="space-y-2">
              <Label htmlFor="doseOriginalText">{t('fields.doseOriginalText')}</Label>
              <Textarea
                id="doseOriginalText"
                placeholder={t('form.doseOriginalTextPlaceholder')}
                {...register('doseOriginalText')}
                disabled={loading}
                className={errors.doseOriginalText ? 'border-destructive' : ''}
              />
              {errors.doseOriginalText && (
                <p className="text-sm text-destructive">{t(errors.doseOriginalText.message!)}</p>
              )}
            </div>

            {/* Durée du protocole */}
            <div className="space-y-2">
              <Label htmlFor="protocolDurationDays">{t('fields.protocolDurationDays')}</Label>
              <Input
                id="protocolDurationDays"
                type="number"
                placeholder={t('form.protocolDurationPlaceholder')}
                {...register('protocolDurationDays', { valueAsNumber: true })}
                disabled={loading}
                className={errors.protocolDurationDays ? 'border-destructive' : ''}
              />
              {errors.protocolDurationDays && (
                <p className="text-sm text-destructive">{t(errors.protocolDurationDays.message!)}</p>
              )}
            </div>
          </div>

          {/* Section 3: Délais d'attente */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              {t('form.sectionWithdrawal')}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Délai viande */}
              <div className="space-y-2">
                <Label htmlFor="withdrawalMeatDays">{t('fields.withdrawalMeat')}</Label>
                <Input
                  id="withdrawalMeatDays"
                  type="number"
                  placeholder={t('form.withdrawalPlaceholder')}
                  {...register('withdrawalMeatDays', { valueAsNumber: true })}
                  disabled={loading}
                  className={errors.withdrawalMeatDays ? 'border-destructive' : ''}
                />
                {errors.withdrawalMeatDays && (
                  <p className="text-sm text-destructive">{t(errors.withdrawalMeatDays.message!)}</p>
                )}
              </div>

              {/* Délai lait */}
              <div className="space-y-2">
                <Label htmlFor="withdrawalMilkDays">{t('fields.withdrawalMilk')}</Label>
                <Input
                  id="withdrawalMilkDays"
                  type="number"
                  placeholder={t('form.withdrawalPlaceholder')}
                  {...register('withdrawalMilkDays', { valueAsNumber: true })}
                  disabled={loading}
                  className={errors.withdrawalMilkDays ? 'border-destructive' : ''}
                />
                {errors.withdrawalMilkDays && (
                  <p className="text-sm text-destructive">{t(errors.withdrawalMilkDays.message!)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Validation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              {t('form.sectionValidation')}
            </h3>

            {/* Notes de validation */}
            <div className="space-y-2">
              <Label htmlFor="validationNotes">{t('fields.validationNotes')}</Label>
              <Textarea
                id="validationNotes"
                placeholder={t('form.validationNotesPlaceholder')}
                {...register('validationNotes')}
                disabled={loading}
                className={errors.validationNotes ? 'border-destructive' : ''}
              />
              {errors.validationNotes && (
                <p className="text-sm text-destructive">{t(errors.validationNotes.message!)}</p>
              )}
            </div>
          </div>

          {/* Section 5: Statut */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              {t('form.sectionStatus')}
            </h3>

            <div className="space-y-4">
              {/* isVerified */}
              <div className="flex items-center space-x-2">
                <Controller
                  name="isVerified"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isVerified"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  )}
                />
                <Label htmlFor="isVerified" className="cursor-pointer font-normal">
                  {t('fields.isVerified')}
                </Label>
              </div>

              {/* isActive */}
              <div className="flex items-center space-x-2">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  )}
                />
                <Label htmlFor="isActive" className="cursor-pointer font-normal">
                  {t('fields.isActive')}
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {tc('actions.cancel')}
            </Button>
            <Button type="submit" disabled={loading || loadingLists}>
              {loading ? tc('actions.saving') : tc('actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
