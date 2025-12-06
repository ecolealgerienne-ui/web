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
  activeSubstanceSchema,
  updateActiveSubstanceSchema,
  type ActiveSubstanceFormData,
  type UpdateActiveSubstanceFormData,
} from '@/lib/validation/schemas/admin/active-substance.schema'
import type { ActiveSubstance } from '@/lib/types/admin/active-substance'
import { useTranslations } from 'next-intl'

interface ActiveSubstanceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  substance?: ActiveSubstance | null
  onSubmit: (
    data: ActiveSubstanceFormData | UpdateActiveSubstanceFormData
  ) => Promise<void>
  loading?: boolean
}

/**
 * Formulaire de création/édition de substance active
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur (i18n)
 * ✅ RÈGLE #6 : i18n complet
 *
 * Utilise react-hook-form + Zod pour la validation côté client
 *
 * @example
 * ```tsx
 * <ActiveSubstanceFormDialog
 *   open={formOpen}
 *   onOpenChange={setFormOpen}
 *   substance={editingSubstance}
 *   onSubmit={handleSubmit}
 *   loading={loading}
 * />
 * ```
 */
export function ActiveSubstanceFormDialog({
  open,
  onOpenChange,
  substance,
  onSubmit,
  loading = false,
}: ActiveSubstanceFormDialogProps) {
  const t = useTranslations('activeSubstance')
  const tc = useTranslations('common')

  const isEditMode = Boolean(substance)

  // Utilise le schéma approprié selon le mode (création/édition)
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
  } = useForm<ActiveSubstanceFormData | UpdateActiveSubstanceFormData>({
    resolver: zodResolver(
      isEditMode ? updateActiveSubstanceSchema : activeSubstanceSchema
    ),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      isActive: true,
    },
  })

  // Charge les données en mode édition
  useEffect(() => {
    if (substance && open) {
      reset({
        code: substance.code,
        name: substance.name,
        description: substance.description || '',
        isActive: substance.isActive ?? true,
        ...(isEditMode && { version: substance.version || 1 }),
      } as UpdateActiveSubstanceFormData)
    } else if (!substance && open) {
      // Réinitialise en mode création
      reset({
        code: '',
        name: '',
        description: '',
        isActive: true,
      })
    }
  }, [substance, open, reset, isEditMode])

  const handleFormSubmission = async (
    data: ActiveSubstanceFormData | UpdateActiveSubstanceFormData
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
                placeholder="AMOX"
                className={errors.code ? 'border-destructive' : ''}
                disabled={loading}
              />
              {errors.code && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.code.message as string)}
                </p>
              )}
            </div>

            {/* Nom International (DCI) */}
            <div>
              <Label htmlFor="name">
                {t('fields.name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Amoxicilline"
                className={errors.name ? 'border-destructive' : ''}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.name.message as string)}
                </p>
              )}
            </div>

            {/* Description (optionnel) */}
            <div>
              <Label htmlFor="description">{t('fields.description')}</Label>
              <textarea
                id="description"
                {...register('description')}
                className={`flex min-h-[80px] w-full rounded-md border ${
                  errors.description ? 'border-destructive' : 'border-input'
                } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                placeholder="Antibiotique à large spectre..."
                disabled={loading}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.description.message as string)}
                </p>
              )}
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
              <Label htmlFor="isActive" className="cursor-pointer">
                {t('fields.isActive')}
              </Label>
            </div>

            {/* Version (hidden field for edit mode) */}
            {isEditMode && (
              <input type="hidden" {...register('version' as any)} />
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
                  ? tc('actions.update')
                  : tc('actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
