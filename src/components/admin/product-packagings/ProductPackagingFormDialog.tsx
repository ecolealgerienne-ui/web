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
  productPackagingSchema,
  type ProductPackagingFormData,
} from '@/lib/validation/schemas/admin/product-packaging.schema'
import type { ProductPackaging } from '@/lib/types/admin/product-packaging'
import type { Product } from '@/lib/types/admin/product'
import type { Unit } from '@/lib/types/admin/unit'
import type { Country } from '@/lib/types/admin/country'
import { productsService } from '@/lib/services/admin/products.service'
import { unitsService } from '@/lib/services/admin/units.service'
import { countriesService } from '@/lib/services/admin/countries.service'

/**
 * Constante pour représenter "Aucune unité" dans le Select
 * ✅ RÈGLE Section 7.5 : Select.Item ne peut pas avoir value=""
 */
const NONE_UNIT = '__none__'

/**
 * Props du formulaire de conditionnement
 *
 * ✅ RÈGLE #3 : Composant réutilisable pour création ET édition
 */
interface ProductPackagingFormDialogProps {
  /**
   * Dialog ouvert ou fermé
   */
  open: boolean

  /**
   * Callback changement d'état
   */
  onOpenChange: (open: boolean) => void

  /**
   * Conditionnement à éditer (si null = mode création)
   */
  packaging: ProductPackaging | null

  /**
   * Callback soumission du formulaire
   */
  onSubmit: (data: ProductPackagingFormData) => Promise<void>

  /**
   * État de chargement lors de la soumission
   */
  loading?: boolean

  /**
   * ID de produit pré-sélectionné (pour création depuis filtre)
   */
  preSelectedProductId?: string
}

/**
 * Dialog de formulaire pour créer/éditer un Conditionnement de Produit
 *
 * ✅ RÈGLE #3 : Composant réutilisable pour création ET édition
 * ✅ RÈGLE #6 : i18n complet via useTranslations
 * ✅ RÈGLE #9 : react-hook-form + zodResolver
 * ✅ RÈGLE Section 5.3 : valueAsNumber: true pour displayOrder
 * ✅ RÈGLE Section 5.5 : Messages Zod avec clés relatives
 * ✅ RÈGLE Section 7.6 : Pattern checkbox pour isActive
 *
 * Pattern: Scoped Reference Data (Scope: Product)
 */
export function ProductPackagingFormDialog({
  open,
  onOpenChange,
  packaging,
  onSubmit,
  loading = false,
  preSelectedProductId,
}: ProductPackagingFormDialogProps) {
  const t = useTranslations('productPackaging')
  const tc = useTranslations('common')

  // État local pour les listes de référence
  const [products, setProducts] = useState<Product[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingReferences, setLoadingReferences] = useState(false)

  // Initialisation du formulaire
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductPackagingFormData>({
    resolver: zodResolver(productPackagingSchema),
    defaultValues: {
      productId: preSelectedProductId || '',
      packagingLabel: '',
      countryCode: '',
      gtinEan: '',
      numeroAMM: '',
      concentration: '',
      unitId: '',
      description: '',
      displayOrder: undefined,
      isActive: true,
    },
  })

  /**
   * Charger les données de référence (Products, Units, Countries)
   * ✅ RÈGLE Section 7.4 : Charger les données au montage
   */
  useEffect(() => {
    const loadReferences = async () => {
      setLoadingReferences(true)
      try {
        // Charger en parallèle
        const [productsRes, unitsRes, countriesRes] = await Promise.all([
          productsService.getAll({ limit: 100 }),
          unitsService.getAll({ limit: 100 }),
          countriesService.getAll({ limit: 100 }),
        ])

        // Filtrer uniquement les actifs
        setProducts(productsRes.data.filter((p) => p.isActive))
        setUnits(unitsRes.data.filter((u) => u.isActive))
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
   * Réinitialiser le formulaire quand le packaging change ou dialog s'ouvre
   * ✅ RÈGLE Section 7.4 : Reset form on dialog open
   */
  useEffect(() => {
    if (open) {
      if (packaging) {
        // Mode édition : pré-remplir
        reset({
          productId: packaging.productId,
          packagingLabel: packaging.packagingLabel,
          countryCode: packaging.countryCode,
          gtinEan: packaging.gtinEan || '',
          numeroAMM: packaging.numeroAMM || '',
          concentration: packaging.concentration || '',
          unitId: packaging.unitId || '',
          description: packaging.description || '',
          displayOrder: packaging.displayOrder || undefined,
          isActive: packaging.isActive,
        })
      } else {
        // Mode création : réinitialiser
        reset({
          productId: preSelectedProductId || '',
          packagingLabel: '',
          countryCode: '',
          gtinEan: '',
          numeroAMM: '',
          concentration: '',
          unitId: '',
          description: '',
          displayOrder: undefined,
          isActive: true,
        })
      }
    }
  }, [open, packaging, preSelectedProductId, reset])

  /**
   * Soumission du formulaire
   */
  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {packaging ? t('form.editTitle') : t('form.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Section 1 : Produit et Pays */}
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
          </div>

          {/* Label du conditionnement */}
          <div className="space-y-2">
            <Label htmlFor="packagingLabel">
              {t('fields.packagingLabel')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="packagingLabel"
              {...register('packagingLabel')}
              placeholder={t('form.packagingLabelPlaceholder')}
              disabled={loading}
              className={errors.packagingLabel ? 'border-destructive' : ''}
            />
            {errors.packagingLabel && (
              <p className="text-sm text-destructive">{t(errors.packagingLabel.message!)}</p>
            )}
          </div>

          {/* Section 2 : Codes et Concentration */}
          <div className="grid grid-cols-2 gap-4">
            {/* GTIN/EAN */}
            <div className="space-y-2">
              <Label htmlFor="gtinEan">{t('fields.gtinEan')}</Label>
              <Input
                id="gtinEan"
                {...register('gtinEan')}
                placeholder={t('form.gtinEanPlaceholder')}
                disabled={loading}
                className={errors.gtinEan ? 'border-destructive' : ''}
              />
              {errors.gtinEan && (
                <p className="text-sm text-destructive">{t(errors.gtinEan.message!)}</p>
              )}
            </div>

            {/* Numéro AMM */}
            <div className="space-y-2">
              <Label htmlFor="numeroAMM">{t('fields.numeroAMM')}</Label>
              <Input
                id="numeroAMM"
                {...register('numeroAMM')}
                placeholder={t('form.numeroAMMPlaceholder')}
                disabled={loading}
                className={errors.numeroAMM ? 'border-destructive' : ''}
              />
              {errors.numeroAMM && (
                <p className="text-sm text-destructive">{t(errors.numeroAMM.message!)}</p>
              )}
            </div>
          </div>

          {/* Section 3 : Concentration et Unité */}
          <div className="grid grid-cols-2 gap-4">
            {/* Concentration */}
            <div className="space-y-2">
              <Label htmlFor="concentration">{t('fields.concentration')}</Label>
              <Input
                id="concentration"
                {...register('concentration')}
                placeholder={t('form.concentrationPlaceholder')}
                disabled={loading}
                className={errors.concentration ? 'border-destructive' : ''}
              />
              {errors.concentration && (
                <p className="text-sm text-destructive">{t(errors.concentration.message!)}</p>
              )}
            </div>

            {/* Unité */}
            <div className="space-y-2">
              <Label htmlFor="unitId">{t('fields.unit')}</Label>
              <Select
                value={watch('unitId') || NONE_UNIT}
                onValueChange={(value) => {
                  // Convertir NONE_UNIT en '' pour le formulaire
                  setValue('unitId', value === NONE_UNIT ? '' : value, { shouldValidate: true })
                }}
                disabled={loadingReferences || loading}
              >
                <SelectTrigger id="unitId">
                  <SelectValue placeholder={t('form.selectUnit')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_UNIT}>{tc('fields.none')}</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unitId && (
                <p className="text-sm text-destructive">{t(errors.unitId.message!)}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('fields.description')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('form.descriptionPlaceholder')}
              rows={3}
              disabled={loading}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{t(errors.description.message!)}</p>
            )}
          </div>

          {/* Section 4 : Ordre et Statut */}
          <div className="grid grid-cols-2 gap-4">
            {/* Ordre d'affichage */}
            <div className="space-y-2">
              <Label htmlFor="displayOrder">{t('fields.displayOrder')}</Label>
              <Input
                id="displayOrder"
                type="number"
                {...register('displayOrder', { valueAsNumber: true })}
                placeholder={t('form.displayOrderPlaceholder')}
                disabled={loading}
                className={errors.displayOrder ? 'border-destructive' : ''}
              />
              {errors.displayOrder && (
                <p className="text-sm text-destructive">{t(errors.displayOrder.message!)}</p>
              )}
            </div>

            {/* Statut actif */}
            <div className="space-y-2 flex items-end">
              <div className="flex items-center space-x-2 pb-2">
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
              {loading ? tc('actions.saving') : packaging ? tc('actions.update') : tc('actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
