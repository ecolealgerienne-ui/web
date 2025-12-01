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

import { useEffect, useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X } from 'lucide-react'
import { Controller } from 'react-hook-form'
import {
  veterinarianSchema,
  updateVeterinarianSchema,
  type VeterinarianFormData,
  type UpdateVeterinarianFormData,
  MAX_SPECIALTIES,
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

  // Gestion manuelle des spécialités avec useState (évite les problèmes de typage avec useFieldArray)
  const [specialties, setSpecialties] = useState<string[]>([''])

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<VeterinarianFormData>({
    resolver: zodResolver(veterinarianSchema) as any,
    defaultValues: {
      code: '',
      firstName: '',
      lastName: '',
      licenseNumber: '',
      specialties: [''],
      clinic: '',
      scope: 'global',
      department: '',
      isAvailable: true,
      emergencyService: false,
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

  // Synchroniser specialties avec react-hook-form
  useEffect(() => {
    setValue('specialties', specialties)
  }, [specialties, setValue])

  // Fonctions pour gérer les spécialités
  const addSpecialty = () => {
    if (specialties.length < MAX_SPECIALTIES) {
      setSpecialties([...specialties, ''])
    }
  }

  const removeSpecialty = (index: number) => {
    if (specialties.length > 1) {
      setSpecialties(specialties.filter((_, i) => i !== index))
    }
  }

  const updateSpecialty = (index: number, value: string) => {
    const updated = [...specialties]
    updated[index] = value
    setSpecialties(updated)
  }

  // Charge les données en mode édition
  useEffect(() => {
    if (veterinarian && open) {
      const specs = veterinarian.specialties.length ? veterinarian.specialties : ['']
      setSpecialties(specs)

      reset({
        code: veterinarian.code,
        firstName: veterinarian.firstName,
        lastName: veterinarian.lastName,
        licenseNumber: veterinarian.licenseNumber,
        specialties: specs,
        clinic: veterinarian.clinic || '',
        scope: veterinarian.scope || 'global',
        department: veterinarian.department || '',
        isAvailable: veterinarian.isAvailable ?? true,
        emergencyService: veterinarian.emergencyService ?? false,
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
        // Version sera géré par le hidden input
        version: veterinarian.version || 1,
      } as any)
    } else if (!veterinarian && open) {
      setSpecialties([''])
      // Réinitialise en mode création
      reset({
        code: '',
        firstName: '',
        lastName: '',
        licenseNumber: '',
        specialties: [''],
        clinic: '',
        scope: 'global',
        department: '',
        isAvailable: true,
        emergencyService: false,
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

  const handleFormSubmission = async (data: any) => {
    // Filtrer les spécialités vides
    const cleanedData = {
      ...data,
      specialties: data.specialties?.filter((s: string) => s.trim() !== '') || [],
    }

    // En mode édition, s'assurer que version est présente
    if (isEditMode && veterinarian) {
      cleanedData.version = data.version || veterinarian.version || 1
    }

    await onSubmit(cleanedData as VeterinarianFormData | UpdateVeterinarianFormData)
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

              {/* Scope */}
              <div>
                <Label htmlFor="scope">
                  {t('fields.scope')} <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="scope"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <SelectTrigger className={errors.scope ? 'border-destructive' : ''}>
                        <SelectValue placeholder={t('placeholders.scope')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">{t('scope.global')}</SelectItem>
                        <SelectItem value="local">{t('scope.local')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.scope && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.scope.message as string)}
                  </p>
                )}
              </div>

              {/* Department (optionnel) */}
              <div>
                <Label htmlFor="department">{t('fields.department')}</Label>
                <Input
                  id="department"
                  {...register('department')}
                  placeholder={t('placeholders.department')}
                  className={errors.department ? 'border-destructive' : ''}
                  disabled={loading}
                />
                {errors.department && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.department.message as string)}
                  </p>
                )}
              </div>

              {/* isAvailable */}
              <div className="flex items-center space-x-2">
                <Controller
                  name="isAvailable"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isAvailable"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  )}
                />
                <Label htmlFor="isAvailable" className="cursor-pointer">
                  {t('fields.isAvailable')}
                </Label>
              </div>

              {/* emergencyService */}
              <div className="flex items-center space-x-2">
                <Controller
                  name="emergencyService"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="emergencyService"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  )}
                />
                <Label htmlFor="emergencyService" className="cursor-pointer">
                  {t('fields.emergencyService')}
                </Label>
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
                onClick={addSpecialty}
                disabled={loading || specialties.length >= MAX_SPECIALTIES}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('actions.addSpecialty')}
              </Button>
            </div>

            <div className="space-y-2">
              {specialties.map((specialty, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={specialty}
                    onChange={(e) => updateSpecialty(index, e.target.value)}
                    placeholder={t('placeholders.specialties')}
                    className={
                      errors.specialties?.[index]
                        ? 'border-destructive'
                        : ''
                    }
                    disabled={loading}
                  />
                  {specialties.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSpecialty(index)}
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
