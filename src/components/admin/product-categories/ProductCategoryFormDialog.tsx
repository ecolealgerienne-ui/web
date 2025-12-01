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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  productCategorySchema,
  updateProductCategorySchema,
  type ProductCategoryFormData,
  type UpdateProductCategoryFormData,
} from '@/lib/validation/schemas/admin/product-category.schema'
import type { ProductCategory } from '@/lib/types/admin/product-category'
import { useTranslations } from 'next-intl'

interface ProductCategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: ProductCategory | null
  onSubmit: (
    data: ProductCategoryFormData | UpdateProductCategoryFormData
  ) => Promise<void>
  loading?: boolean
}

/**
 * Formulaire de création/édition de catégorie de produit
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur (i18n)
 * ✅ RÈGLE #6 : i18n complet
 *
 * Utilise react-hook-form + Zod pour la validation côté client
 *
 * @example
 * ```tsx
 * <ProductCategoryFormDialog
 *   open={formOpen}
 *   onOpenChange={setFormOpen}
 *   category={editingCategory}
 *   onSubmit={handleSubmit}
 *   loading={loading}
 * />
 * ```
 */
export function ProductCategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  loading = false,
}: ProductCategoryFormDialogProps) {
  const t = useTranslations('productCategory')
  const tc = useTranslations('common')

  const isEditMode = Boolean(category)

  // Utilise le schéma approprié selon le mode (création/édition)
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ProductCategoryFormData | UpdateProductCategoryFormData>({
    resolver: zodResolver(
      isEditMode ? updateProductCategorySchema : productCategorySchema
    ),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      isActive: true,
    },
  })

  const isActive = watch('isActive')

  // Charge les données en mode édition
  useEffect(() => {
    if (category && open) {
      reset({
        code: category.code,
        name: category.name,
        description: category.description || '',
        isActive: category.isActive ?? true,
        ...(isEditMode && { version: category.version || 1 }),
      } as UpdateProductCategoryFormData)
    } else if (!category && open) {
      // Réinitialise en mode création
      reset({
        code: '',
        name: '',
        description: '',
        isActive: true,
      })
    }
  }, [category, open, reset, isEditMode])

  const handleFormSubmission = async (
    data: ProductCategoryFormData | UpdateProductCategoryFormData
  ) => {
    await onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('actions.edit') : t('actions.create')}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleFormSubmit(handleFormSubmission)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4">
            {/* Code */}
            <div>
              <Label htmlFor="code">
                {t('fields.code')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                {...register('code')}
                placeholder="ANTIB"
                className={errors.code ? 'border-destructive' : ''}
                disabled={loading}
              />
              {errors.code && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.code.message as string)}
                </p>
              )}
            </div>

            {/* Nom */}
            <div>
              <Label htmlFor="name">
                {t('fields.name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder={tc('placeholders.name')}
                className={errors.name ? 'border-destructive' : ''}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.name.message as string)}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">{t('fields.description')}</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder={tc('placeholders.description')}
                rows={3}
                className={errors.description ? 'border-destructive' : ''}
                disabled={loading}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.description.message as string)}
                </p>
              )}
            </div>

            {/* Statut Actif */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) =>
                  setValue('isActive', checked as boolean)
                }
                disabled={loading}
              />
              <Label
                htmlFor="isActive"
                className="text-sm font-normal cursor-pointer"
              >
                {t('fields.isActive')}
              </Label>
            </div>

            {/* Version (caché en mode édition) */}
            {isEditMode && (
              <input type="hidden" {...register('version')} />
            )}
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
            <Button type="submit" disabled={loading}>
              {loading
                ? tc('actions.saving')
                : isEditMode
                  ? tc('actions.save')
                  : tc('actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
