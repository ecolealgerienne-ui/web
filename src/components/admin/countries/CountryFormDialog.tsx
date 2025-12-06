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
  countrySchema,
  updateCountrySchema,
  type CountryFormData,
  type UpdateCountryFormData,
} from '@/lib/validation/schemas/admin/country.schema'
import type { Country } from '@/lib/types/admin/country'
import { useTranslations } from 'next-intl'

interface CountryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  country?: Country | null
  onSubmit: (data: CountryFormData | UpdateCountryFormData) => Promise<void>
  loading?: boolean
}

/**
 * Formulaire de création/édition de pays
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur (i18n)
 * ✅ RÈGLE #6 : i18n complet
 *
 * Utilise react-hook-form + Zod pour la validation côté client
 *
 * @example
 * ```tsx
 * <CountryFormDialog
 *   open={formOpen}
 *   onOpenChange={setFormOpen}
 *   country={editingCountry}
 *   onSubmit={handleSubmit}
 *   loading={loading}
 * />
 * ```
 */
export function CountryFormDialog({
  open,
  onOpenChange,
  country,
  onSubmit,
  loading = false,
}: CountryFormDialogProps) {
  const t = useTranslations('country')
  const tc = useTranslations('common')

  const isEditMode = Boolean(country)

  // Utilise le schéma approprié selon le mode (création/édition)
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
  } = useForm<CountryFormData | UpdateCountryFormData>({
    resolver: zodResolver(isEditMode ? updateCountrySchema : countrySchema),
    defaultValues: {
      code: '',
      nameFr: '',
      nameEn: '',
      nameAr: '',
      isoCode2: '',
      isoCode3: '',
      isActive: true,
    },
  })

  // Charge les données en mode édition
  useEffect(() => {
    if (country && open) {
      reset({
        code: country.code,
        nameFr: country.nameFr,
        nameEn: country.nameEn,
        nameAr: country.nameAr,
        isoCode2: country.isoCode2,
        isoCode3: country.isoCode3,
        isActive: country.isActive ?? true,
        ...(isEditMode && { version: country.version || 1 }),
      } as UpdateCountryFormData)
    } else if (!country && open) {
      // Réinitialise en mode création
      reset({
        code: '',
        nameFr: '',
        nameEn: '',
        nameAr: '',
        isoCode2: '',
        isoCode3: '',
        isActive: true,
      })
    }
  }, [country, open, reset, isEditMode])

  const handleFormSubmission = async (
    data: CountryFormData | UpdateCountryFormData
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

            {/* Nom Français */}
            <div>
              <Label htmlFor="nameFr">
                {t('fields.nameFr')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nameFr"
                {...register('nameFr')}
                placeholder={t('placeholders.nameFr')}
                className={errors.nameFr ? 'border-destructive' : ''}
                disabled={loading}
              />
              {errors.nameFr && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.nameFr.message as string)}
                </p>
              )}
            </div>

            {/* Nom Anglais */}
            <div>
              <Label htmlFor="nameEn">
                {t('fields.nameEn')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nameEn"
                {...register('nameEn')}
                placeholder={t('placeholders.nameEn')}
                className={errors.nameEn ? 'border-destructive' : ''}
                disabled={loading}
              />
              {errors.nameEn && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.nameEn.message as string)}
                </p>
              )}
            </div>

            {/* Nom Arabe */}
            <div>
              <Label htmlFor="nameAr">
                {t('fields.nameAr')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nameAr"
                {...register('nameAr')}
                placeholder={t('placeholders.nameAr')}
                className={errors.nameAr ? 'border-destructive' : ''}
                disabled={loading}
                dir="rtl"
              />
              {errors.nameAr && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.nameAr.message as string)}
                </p>
              )}
            </div>

            {/* Codes ISO */}
            <div className="grid grid-cols-2 gap-4">
              {/* ISO Code 2 */}
              <div>
                <Label htmlFor="isoCode2">
                  {t('fields.isoCode2')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="isoCode2"
                  {...register('isoCode2')}
                  placeholder={t('placeholders.isoCode2')}
                  className={errors.isoCode2 ? 'border-destructive' : ''}
                  disabled={loading}
                  maxLength={2}
                />
                {errors.isoCode2 && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.isoCode2.message as string)}
                  </p>
                )}
              </div>

              {/* ISO Code 3 */}
              <div>
                <Label htmlFor="isoCode3">
                  {t('fields.isoCode3')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="isoCode3"
                  {...register('isoCode3')}
                  placeholder={t('placeholders.isoCode3')}
                  className={errors.isoCode3 ? 'border-destructive' : ''}
                  disabled={loading}
                  maxLength={3}
                />
                {errors.isoCode3 && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.isoCode3.message as string)}
                  </p>
                )}
              </div>
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
            {isEditMode && <input type="hidden" {...register('version' as any)} />}
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
