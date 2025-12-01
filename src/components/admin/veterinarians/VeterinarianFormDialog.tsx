/**
 * Formulaire de création/édition de vétérinaire (Admin Reference Data)
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur (i18n)
 * ✅ RÈGLE #6 : i18n complet
 *
 * Utilise react-hook-form + Zod pour la validation côté client.
 * Gère les champs complexes: array (specialties), nested object (contactInfo)
 *
 * @example
 * ```tsx
 * <VeterinarianFormDialog
 *   open={formOpen}
 *   onOpenChange={setFormOpen}
 *   veterinarian={editingVeterinarian}
 *   onSubmit={handleSubmit}
 *   loading={loading}
 * />
 * ```
 */

'use client'

import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { Plus, X } from 'lucide-react'
import {
  veterinarianSchema,
  updateVeterinarianSchema,
  type VeterinarianFormData,
  type UpdateVeterinarianFormData,
} from '@/lib/validation/schemas/admin/veterinarian.schema'
import type { Veterinarian } from '@/lib/types/admin/veterinarian'
import { useTranslations } from 'next-intl'

interface VeterinarianFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  veterinarian?: Veterinarian | null
  onSubmit: (
    data: VeterinarianFormData | UpdateVeterinarianFormData
  ) => Promise<void>
  loading?: boolean
}

export function VeterinarianFormDialog({
  open,
  onOpenChange,
  veterinarian,
  onSubmit,
  loading = false,
}: VeterinarianFormDialogProps) {
  const t = useTranslations('veterinarian')
  const tc = useTranslations('common')

  const isEditMode = Boolean(veterinarian)

  // Utilise le schéma approprié selon le mode (création/édition)
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<VeterinarianFormData>({
    resolver: zodResolver(
      isEditMode ? updateVeterinarianSchema : veterinarianSchema
    ) as any,
    defaultValues: {
      code: '',
      firstName: '',
      lastName: '',
      licenseNumber: '',
      specialties: [''],
      clinic: '',
      contactInfo: {
        phone: '',
        mobile: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
      },
      isActive: true,
    },
  })

  // useFieldArray pour gérer les spécialités (array dynamique)
  const { fields, append, remove } = useFieldArray<VeterinarianFormData>({
    control,
    name: 'specialties',
  })

  // Charge les données en mode édition
  useEffect(() => {
    if (veterinarian && open) {
      reset({
        code: veterinarian.code,
        firstName: veterinarian.firstName,
        lastName: veterinarian.lastName,
        licenseNumber: veterinarian.licenseNumber,
        specialties: veterinarian.specialties.length
          ? veterinarian.specialties
          : [''],
        clinic: veterinarian.clinic || '',
        contactInfo: {
          phone: veterinarian.contactInfo.phone,
          mobile: veterinarian.contactInfo.mobile || '',
          email: veterinarian.contactInfo.email || '',
          address: veterinarian.contactInfo.address || '',
          city: veterinarian.contactInfo.city || '',
          postalCode: veterinarian.contactInfo.postalCode || '',
          country: veterinarian.contactInfo.country || '',
        },
        isActive: veterinarian.isActive ?? true,
        ...(isEditMode && { version: veterinarian.version || 1 }),
      } as UpdateVeterinarianFormData)
    } else if (!veterinarian && open) {
      // Réinitialise en mode création
      reset({
        code: '',
        firstName: '',
        lastName: '',
        licenseNumber: '',
        specialties: [''],
        clinic: '',
        contactInfo: {
          phone: '',
          mobile: '',
          email: '',
          address: '',
          city: '',
          postalCode: '',
          country: '',
        },
        isActive: true,
      })
    }
  }, [veterinarian, open, reset, isEditMode])

  const handleFormSubmission = async (data: VeterinarianFormData) => {
    // Filtrer les spécialités vides
    const cleanedData = {
      ...data,
      specialties: data.specialties?.filter((s) => s.trim() !== '') || [],
    }
    await onSubmit(cleanedData as any)
  }

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
          {/* Section: Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {tc('sections.basicInfo')}
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

              {/* Numéro de licence */}
              <div>
                <Label htmlFor="licenseNumber">
                  {t('fields.licenseNumber')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="licenseNumber"
                  {...register('licenseNumber')}
                  placeholder={t('placeholders.licenseNumber')}
                  className={errors.licenseNumber ? 'border-destructive' : ''}
                  disabled={loading}
                />
                {errors.licenseNumber && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.licenseNumber.message as string)}
                  </p>
                )}
              </div>

              {/* Prénom */}
              <div>
                <Label htmlFor="firstName">
                  {t('fields.firstName')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder={t('placeholders.firstName')}
                  className={errors.firstName ? 'border-destructive' : ''}
                  disabled={loading}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.firstName.message as string)}
                  </p>
                )}
              </div>

              {/* Nom */}
              <div>
                <Label htmlFor="lastName">
                  {t('fields.lastName')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder={t('placeholders.lastName')}
                  className={errors.lastName ? 'border-destructive' : ''}
                  disabled={loading}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.lastName.message as string)}
                  </p>
                )}
              </div>

              {/* Clinique (optionnel) */}
              <div className="col-span-2">
                <Label htmlFor="clinic">{t('fields.clinic')}</Label>
                <Input
                  id="clinic"
                  {...register('clinic')}
                  placeholder={t('placeholders.clinic')}
                  className={errors.clinic ? 'border-destructive' : ''}
                  disabled={loading}
                />
                {errors.clinic && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.clinic.message as string)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Spécialités (array dynamique) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {t('fields.specialties')}{' '}
                <span className="text-destructive">*</span>
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append('')}
                disabled={loading || fields.length >= 10}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('actions.addSpecialty')}
              </Button>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...register(`specialties.${index}` as const)}
                    placeholder={t('placeholders.specialties')}
                    className={
                      errors.specialties?.[index]
                        ? 'border-destructive'
                        : ''
                    }
                    disabled={loading}
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.specialties && (
                <p className="text-sm text-destructive">
                  {typeof errors.specialties === 'object' &&
                  'message' in errors.specialties
                    ? t(errors.specialties.message as string)
                    : ''}
                </p>
              )}
            </div>
          </div>

          {/* Section: Coordonnées (nested object) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t('fields.contactInfo')}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Téléphone */}
              <div>
                <Label htmlFor="contactInfo.phone">
                  {t('fields.phone')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactInfo.phone"
                  {...register('contactInfo.phone')}
                  placeholder={t('placeholders.phone')}
                  className={
                    errors.contactInfo?.phone ? 'border-destructive' : ''
                  }
                  disabled={loading}
                />
                {errors.contactInfo?.phone && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.contactInfo.phone.message as string)}
                  </p>
                )}
              </div>

              {/* Mobile (optionnel) */}
              <div>
                <Label htmlFor="contactInfo.mobile">{t('fields.mobile')}</Label>
                <Input
                  id="contactInfo.mobile"
                  {...register('contactInfo.mobile')}
                  placeholder={t('placeholders.mobile')}
                  className={
                    errors.contactInfo?.mobile ? 'border-destructive' : ''
                  }
                  disabled={loading}
                />
                {errors.contactInfo?.mobile && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.contactInfo.mobile.message as string)}
                  </p>
                )}
              </div>

              {/* Email (optionnel) */}
              <div className="col-span-2">
                <Label htmlFor="contactInfo.email">{t('fields.email')}</Label>
                <Input
                  id="contactInfo.email"
                  type="email"
                  {...register('contactInfo.email')}
                  placeholder={t('placeholders.email')}
                  className={
                    errors.contactInfo?.email ? 'border-destructive' : ''
                  }
                  disabled={loading}
                />
                {errors.contactInfo?.email && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.contactInfo.email.message as string)}
                  </p>
                )}
              </div>

              {/* Adresse (optionnel) */}
              <div className="col-span-2">
                <Label htmlFor="contactInfo.address">
                  {t('fields.address')}
                </Label>
                <Input
                  id="contactInfo.address"
                  {...register('contactInfo.address')}
                  placeholder={t('placeholders.address')}
                  className={
                    errors.contactInfo?.address ? 'border-destructive' : ''
                  }
                  disabled={loading}
                />
                {errors.contactInfo?.address && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.contactInfo.address.message as string)}
                  </p>
                )}
              </div>

              {/* Ville */}
              <div>
                <Label htmlFor="contactInfo.city">{t('fields.city')}</Label>
                <Input
                  id="contactInfo.city"
                  {...register('contactInfo.city')}
                  placeholder={t('placeholders.city')}
                  className={
                    errors.contactInfo?.city ? 'border-destructive' : ''
                  }
                  disabled={loading}
                />
                {errors.contactInfo?.city && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.contactInfo.city.message as string)}
                  </p>
                )}
              </div>

              {/* Code postal */}
              <div>
                <Label htmlFor="contactInfo.postalCode">
                  {t('fields.postalCode')}
                </Label>
                <Input
                  id="contactInfo.postalCode"
                  {...register('contactInfo.postalCode')}
                  placeholder={t('placeholders.postalCode')}
                  className={
                    errors.contactInfo?.postalCode ? 'border-destructive' : ''
                  }
                  disabled={loading}
                />
                {errors.contactInfo?.postalCode && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.contactInfo.postalCode.message as string)}
                  </p>
                )}
              </div>

              {/* Pays (optionnel) */}
              <div className="col-span-2">
                <Label htmlFor="contactInfo.country">
                  {t('fields.country')}
                </Label>
                <Input
                  id="contactInfo.country"
                  {...register('contactInfo.country')}
                  placeholder={t('placeholders.country')}
                  className={
                    errors.contactInfo?.country ? 'border-destructive' : ''
                  }
                  disabled={loading}
                />
                {errors.contactInfo?.country && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.contactInfo.country.message as string)}
                  </p>
                )}
              </div>
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
          {isEditMode && (
            <input type="hidden" {...register('version' as any)} />
          )}

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
