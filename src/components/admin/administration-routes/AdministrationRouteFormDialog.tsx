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
  administrationRouteSchema,
  updateAdministrationRouteSchema,
  type AdministrationRouteFormData,
  type UpdateAdministrationRouteFormData,
} from '@/lib/validation/schemas/admin/administration-route.schema'
import type { AdministrationRoute } from '@/lib/types/admin/administration-route'
import { useTranslations } from 'next-intl'

interface AdministrationRouteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route?: AdministrationRoute | null
  onSubmit: (
    data: AdministrationRouteFormData | UpdateAdministrationRouteFormData
  ) => Promise<void>
  loading?: boolean
}

/**
 * Formulaire de création/édition de voie d'administration
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur (i18n)
 * ✅ RÈGLE #6 : i18n complet
 *
 * Utilise react-hook-form + Zod pour la validation côté client
 *
 * @example
 * ```tsx
 * <AdministrationRouteFormDialog
 *   open={formOpen}
 *   onOpenChange={setFormOpen}
 *   route={editingRoute}
 *   onSubmit={handleSubmit}
 *   loading={loading}
 * />
 * ```
 */
export function AdministrationRouteFormDialog({
  open,
  onOpenChange,
  route,
  onSubmit,
  loading = false,
}: AdministrationRouteFormDialogProps) {
  const t = useTranslations('administrationRoute')
  const tc = useTranslations('common')

  const isEditMode = Boolean(route)

  // Utilise le schéma approprié selon le mode (création/édition)
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
  } = useForm<AdministrationRouteFormData | UpdateAdministrationRouteFormData>({
    resolver: zodResolver(
      isEditMode ? updateAdministrationRouteSchema : administrationRouteSchema
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
    if (route && open) {
      reset({
        code: route.code,
        name: route.name,
        description: route.description || '',
        isActive: route.isActive ?? true,
        ...(isEditMode && { version: route.version || 1 }),
      } as UpdateAdministrationRouteFormData)
    } else if (!route && open) {
      // Réinitialise en mode création
      reset({
        code: '',
        name: '',
        description: '',
        isActive: true,
      })
    }
  }, [route, open, reset, isEditMode])

  const handleFormSubmission = async (
    data: AdministrationRouteFormData | UpdateAdministrationRouteFormData
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
                placeholder={t('placeholders.code')}
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
                placeholder={t('placeholders.name')}
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
                placeholder={t('placeholders.description')}
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
