'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  productSchema,
  updateProductSchema,
  type ProductFormData,
  type UpdateProductFormData,
} from '@/lib/validation/schemas/admin/product.schema'
import type { Product } from '@/lib/types/admin/product'
import { useTranslations } from 'next-intl'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSubmit: (
    data: ProductFormData | UpdateProductFormData
  ) => Promise<void>
  loading?: boolean
}

/**
 * Formulaire de création/édition de produit vétérinaire
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur (i18n)
 * ✅ RÈGLE #6 : i18n complet
 * ✅ RÈGLE #3 : Utilise composants génériques (Dialog, Input, Select)
 *
 * Utilise react-hook-form + Zod pour la validation côté client
 *
 * @example
 * ```tsx
 * <ProductFormDialog
 *   open={formOpen}
 *   onOpenChange={setFormOpen}
 *   product={editingProduct}
 *   onSubmit={handleSubmit}
 *   loading={loading}
 * />
 * ```
 */
export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  loading = false,
}: ProductFormDialogProps) {
  const t = useTranslations('product')
  const tc = useTranslations('common')

  const isEditMode = Boolean(product)

  // Utilise le schéma approprié selon le mode (création/édition)
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<ProductFormData | UpdateProductFormData>({
    resolver: zodResolver(
      isEditMode ? updateProductSchema : productSchema
    ),
    defaultValues: {
      code: '',
      commercialName: '',
      laboratoryName: '',
      therapeuticForm: '',
      dosage: '',
      packaging: '',
      composition: '',
      description: '',
      usageInstructions: '',
      contraindications: '',
      storageConditions: '',
      isVeterinaryPrescriptionRequired: false,
      isActive: true,
    },
  })

  // Charge les données en mode édition
  useEffect(() => {
    if (product && open) {
      reset({
        code: product.code,
        commercialName: product.commercialName,
        laboratoryName: product.laboratoryName,
        therapeuticForm: product.therapeuticForm,
        dosage: product.dosage,
        packaging: product.packaging,
        composition: product.composition || '',
        description: product.description || '',
        usageInstructions: product.usageInstructions || '',
        contraindications: product.contraindications || '',
        storageConditions: product.storageConditions || '',
        isVeterinaryPrescriptionRequired:
          product.isVeterinaryPrescriptionRequired ?? false,
        isActive: product.isActive ?? true,
        ...(isEditMode && { version: product.version || 1 }),
      } as UpdateProductFormData)
    } else if (!product && open) {
      // Réinitialise en mode création
      reset({
        code: '',
        commercialName: '',
        laboratoryName: '',
        therapeuticForm: '',
        dosage: '',
        packaging: '',
        composition: '',
        description: '',
        usageInstructions: '',
        contraindications: '',
        storageConditions: '',
        isVeterinaryPrescriptionRequired: false,
        isActive: true,
      })
    }
  }, [product, open, reset, isEditMode])

  const handleFormSubmission = async (
    data: ProductFormData | UpdateProductFormData
  ) => {
    await onSubmit(data)
  }

  // Liste des formes thérapeutiques disponibles
  const therapeuticForms = [
    'injectable',
    'oral',
    'topical',
    'intramammary',
    'pour-on',
    'bolus',
    'powder',
    'suspension',
    'tablet',
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('actions.edit') : t('actions.create')}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleFormSubmit(handleFormSubmission)}
          className="space-y-6"
        >
          {/* Section : Informations principales */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              {tc('sections.mainInfo')}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <Label htmlFor="code">
                  {t('fields.code')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  {...register('code')}
                  placeholder="AMOX-500-INJ"
                  className={errors.code ? 'border-destructive' : ''}
                  disabled={loading}
                />
                {errors.code && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.code.message as string)}
                  </p>
                )}
              </div>

              {/* Nom commercial */}
              <div>
                <Label htmlFor="commercialName">
                  {t('fields.commercialName')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="commercialName"
                  {...register('commercialName')}
                  placeholder="Amoxival 500"
                  className={errors.commercialName ? 'border-destructive' : ''}
                  disabled={loading}
                />
                {errors.commercialName && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.commercialName.message as string)}
                  </p>
                )}
              </div>

              {/* Laboratoire */}
              <div>
                <Label htmlFor="laboratoryName">
                  {t('fields.laboratoryName')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="laboratoryName"
                  {...register('laboratoryName')}
                  placeholder="Virbac"
                  className={errors.laboratoryName ? 'border-destructive' : ''}
                  disabled={loading}
                />
                {errors.laboratoryName && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.laboratoryName.message as string)}
                  </p>
                )}
              </div>

              {/* Forme thérapeutique */}
              <div>
                <Label htmlFor="therapeuticForm">
                  {t('fields.therapeuticForm')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="therapeuticForm"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <SelectTrigger
                        className={
                          errors.therapeuticForm ? 'border-destructive' : ''
                        }
                      >
                        <SelectValue placeholder={tc('placeholders.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        {therapeuticForms.map((form) => (
                          <SelectItem key={form} value={form}>
                            {t(`therapeuticForms.${form}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.therapeuticForm && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.therapeuticForm.message as string)}
                  </p>
                )}
              </div>

              {/* Dosage */}
              <div>
                <Label htmlFor="dosage">
                  {t('fields.dosage')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dosage"
                  {...register('dosage')}
                  placeholder="500mg/ml"
                  className={errors.dosage ? 'border-destructive' : ''}
                  disabled={loading}
                />
                {errors.dosage && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.dosage.message as string)}
                  </p>
                )}
              </div>

              {/* Conditionnement */}
              <div>
                <Label htmlFor="packaging">
                  {t('fields.packaging')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="packaging"
                  {...register('packaging')}
                  placeholder="Flacon 100ml"
                  className={errors.packaging ? 'border-destructive' : ''}
                  disabled={loading}
                />
                {errors.packaging && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.packaging.message as string)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Composition */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              {t('fields.composition')}
            </h3>

            <div>
              <textarea
                id="composition"
                {...register('composition')}
                className={`flex min-h-[80px] w-full rounded-md border ${
                  errors.composition ? 'border-destructive' : 'border-input'
                } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                placeholder="Amoxicilline trihydratée 500mg/ml, Acide clavulanique 125mg/ml..."
                disabled={loading}
              />
              {errors.composition && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.composition.message as string)}
                </p>
              )}
            </div>
          </div>

          {/* Section : Informations complémentaires */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              {tc('sections.additionalInfo')}
            </h3>

            {/* Description */}
            <div>
              <Label htmlFor="description">{t('fields.description')}</Label>
              <textarea
                id="description"
                {...register('description')}
                className={`flex min-h-[80px] w-full rounded-md border ${
                  errors.description ? 'border-destructive' : 'border-input'
                } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                placeholder={tc('placeholders.optional')}
                disabled={loading}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.description.message as string)}
                </p>
              )}
            </div>

            {/* Instructions d'utilisation */}
            <div>
              <Label htmlFor="usageInstructions">
                {t('fields.usageInstructions')}
              </Label>
              <textarea
                id="usageInstructions"
                {...register('usageInstructions')}
                className={`flex min-h-[80px] w-full rounded-md border ${
                  errors.usageInstructions
                    ? 'border-destructive'
                    : 'border-input'
                } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                placeholder={tc('placeholders.optional')}
                disabled={loading}
              />
              {errors.usageInstructions && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.usageInstructions.message as string)}
                </p>
              )}
            </div>

            {/* Contre-indications */}
            <div>
              <Label htmlFor="contraindications">
                {t('fields.contraindications')}
              </Label>
              <textarea
                id="contraindications"
                {...register('contraindications')}
                className={`flex min-h-[60px] w-full rounded-md border ${
                  errors.contraindications
                    ? 'border-destructive'
                    : 'border-input'
                } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                placeholder={tc('placeholders.optional')}
                disabled={loading}
              />
              {errors.contraindications && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.contraindications.message as string)}
                </p>
              )}
            </div>

            {/* Conditions de stockage */}
            <div>
              <Label htmlFor="storageConditions">
                {t('fields.storageConditions')}
              </Label>
              <textarea
                id="storageConditions"
                {...register('storageConditions')}
                className={`flex min-h-[60px] w-full rounded-md border ${
                  errors.storageConditions
                    ? 'border-destructive'
                    : 'border-input'
                } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                placeholder={tc('placeholders.optional')}
                disabled={loading}
              />
              {errors.storageConditions && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.storageConditions.message as string)}
                </p>
              )}
            </div>
          </div>

          {/* Section : Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              {tc('sections.options')}
            </h3>

            <div className="space-y-3">
              {/* Prescription obligatoire */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isVeterinaryPrescriptionRequired"
                  {...register('isVeterinaryPrescriptionRequired')}
                  className="h-4 w-4 rounded border-input"
                  disabled={loading}
                />
                <Label
                  htmlFor="isVeterinaryPrescriptionRequired"
                  className="cursor-pointer font-normal"
                >
                  {t('fields.isVeterinaryPrescriptionRequired')}
                </Label>
              </div>

              {/* Actif */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="h-4 w-4 rounded border-input"
                  disabled={loading}
                />
                <Label
                  htmlFor="isActive"
                  className="cursor-pointer font-normal"
                >
                  {t('fields.isActive')}
                </Label>
              </div>
            </div>
          </div>

          {/* Version (hidden field for edit mode) */}
          {isEditMode && <input type="hidden" {...register('version' as any)} />}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {tc('actions.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? tc('actions.saving')
                : isEditMode
                  ? tc('actions.update')
                  : tc('actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
