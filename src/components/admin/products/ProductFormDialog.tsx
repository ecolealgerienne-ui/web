'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
 * Formulaire de création/édition de produit vétérinaire (local)
 *
 * Note: Les produits globaux (ANMV) sont en lecture seule
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

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData | UpdateProductFormData>({
    resolver: zodResolver(
      isEditMode ? updateProductSchema : productSchema
    ),
    defaultValues: {
      nameFr: '',
      commercialName: '',
      manufacturer: '',
      therapeuticForm: '',
      dosage: '',
      composition: '',
      administrationRoute: '',
      description: '',
      prescriptionRequired: false,
      isActive: true,
    },
  })

  // Charge les données en mode édition
  useEffect(() => {
    if (product && open) {
      reset({
        nameFr: product.nameFr || '',
        commercialName: product.commercialName || '',
        manufacturer: product.manufacturer || '',
        therapeuticForm: product.therapeuticForm || '',
        dosage: product.dosage || '',
        composition: product.composition || '',
        administrationRoute: product.administrationRoute || '',
        description: product.description || '',
        prescriptionRequired: product.prescriptionRequired ?? false,
        isActive: product.isActive ?? true,
        ...(isEditMode && { version: product.version || 1 }),
      } as UpdateProductFormData)
    } else if (!product && open) {
      reset({
        nameFr: '',
        commercialName: '',
        manufacturer: '',
        therapeuticForm: '',
        dosage: '',
        composition: '',
        administrationRoute: '',
        description: '',
        prescriptionRequired: false,
        isActive: true,
      })
    }
  }, [product, open, reset, isEditMode])

  const handleFormSubmission = async (
    data: ProductFormData | UpdateProductFormData
  ) => {
    await onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
              {/* Nom (FR) */}
              <div className="col-span-2">
                <Label htmlFor="nameFr">
                  {t('fields.commercialName')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nameFr"
                  {...register('nameFr')}
                  placeholder="AMOXIVAL 500 SUSPENSION INJECTABLE"
                  className={errors.nameFr ? 'border-destructive' : ''}
                  disabled={loading}
                />
                {errors.nameFr && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.nameFr.message as string)}
                  </p>
                )}
              </div>

              {/* Fabricant */}
              <div>
                <Label htmlFor="manufacturer">
                  {t('fields.manufacturer')}
                </Label>
                <Input
                  id="manufacturer"
                  {...register('manufacturer')}
                  placeholder="VIRBAC"
                  className={errors.manufacturer ? 'border-destructive' : ''}
                  disabled={loading}
                />
              </div>

              {/* Forme thérapeutique */}
              <div>
                <Label htmlFor="therapeuticForm">
                  {t('fields.therapeuticForm')}
                </Label>
                <Input
                  id="therapeuticForm"
                  {...register('therapeuticForm')}
                  placeholder="suspension injectable"
                  className={errors.therapeuticForm ? 'border-destructive' : ''}
                  disabled={loading}
                />
              </div>

              {/* Dosage */}
              <div>
                <Label htmlFor="dosage">
                  {t('fields.dosage')}
                </Label>
                <Input
                  id="dosage"
                  {...register('dosage')}
                  placeholder="100 mg/ml"
                  className={errors.dosage ? 'border-destructive' : ''}
                  disabled={loading}
                />
              </div>

              {/* Voie d'administration */}
              <div>
                <Label htmlFor="administrationRoute">
                  {t('fields.administrationRoute')}
                </Label>
                <Input
                  id="administrationRoute"
                  {...register('administrationRoute')}
                  placeholder="intramusculaire, sous-cutanée"
                  className={errors.administrationRoute ? 'border-destructive' : ''}
                  disabled={loading}
                />
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
                placeholder="Amoxicilline trihydratée, Acide clavulanique..."
                disabled={loading}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              {t('fields.description')}
            </h3>

            <div>
              <textarea
                id="description"
                {...register('description')}
                className={`flex min-h-[80px] w-full rounded-md border ${
                  errors.description ? 'border-destructive' : 'border-input'
                } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                placeholder={tc('placeholders.optional')}
                disabled={loading}
              />
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
                  id="prescriptionRequired"
                  {...register('prescriptionRequired')}
                  className="h-4 w-4 rounded border-input"
                  disabled={loading}
                />
                <Label
                  htmlFor="prescriptionRequired"
                  className="cursor-pointer font-normal"
                >
                  {t('fields.prescriptionRequired')}
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
