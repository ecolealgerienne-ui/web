/**
 * Formulaire de création/édition de campagne nationale (Admin Reference Data)
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur (i18n)
 * ✅ RÈGLE #6 : i18n complet
 *
 * Utilise react-hook-form + Zod pour la validation côté client.
 * Gère les champs dates (startDate, endDate) avec validation.
 *
 * @example
 * ```tsx
 * <NationalCampaignFormDialog
 *   open={formOpen}
 *   onOpenChange={setFormOpen}
 *   campaign={editingCampaign}
 *   onSubmit={handleSubmit}
 *   loading={loading}
 * />
 * ```
 */

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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  nationalCampaignSchema,
  updateNationalCampaignSchema,
  type NationalCampaignFormData,
  type UpdateNationalCampaignFormData,
} from '@/lib/validation/schemas/admin/national-campaign.schema'
import type { NationalCampaign } from '@/lib/types/admin/national-campaign'
import { useTranslations } from 'next-intl'

interface NationalCampaignFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign?: NationalCampaign | null
  onSubmit: (
    data: NationalCampaignFormData | UpdateNationalCampaignFormData
  ) => Promise<void>
  loading?: boolean
}

export function NationalCampaignFormDialog({
  open,
  onOpenChange,
  campaign,
  onSubmit,
  loading = false,
}: NationalCampaignFormDialogProps) {
  const t = useTranslations('nationalCampaign')
  const tc = useTranslations('common')

  const isEditMode = Boolean(campaign)

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<NationalCampaignFormData>({
    resolver: zodResolver(nationalCampaignSchema) as any,
    defaultValues: {
      code: '',
      nameFr: '',
      nameEn: '',
      nameAr: '',
      type: 'vaccination',
      startDate: '',
      endDate: '',
      description: '',
      isActive: true,
    },
  })

  // Charge les données en mode édition
  useEffect(() => {
    if (campaign && open) {
      reset({
        code: campaign.code,
        nameFr: campaign.nameFr,
        nameEn: campaign.nameEn,
        nameAr: campaign.nameAr,
        type: campaign.type,
        startDate: campaign.startDate.split('T')[0], // Extract YYYY-MM-DD
        endDate: campaign.endDate.split('T')[0],
        description: campaign.description || '',
        isActive: campaign.isActive ?? true,
        version: campaign.version || 1,
      } as any)
    } else if (!campaign && open) {
      // Réinitialise en mode création
      reset({
        code: '',
        nameFr: '',
        nameEn: '',
        nameAr: '',
        type: 'vaccination',
        startDate: '',
        endDate: '',
        description: '',
        isActive: true,
      })
    }
  }, [campaign, open, reset, isEditMode])

  const handleFormSubmission = async (data: any) => {
    // Convertir dates en ISO 8601 format
    const formattedData = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    }

    // En mode édition, s'assurer que version est présente
    if (isEditMode && campaign) {
      formattedData.version = data.version || campaign.version || 1
    }

    await onSubmit(
      formattedData as
        | NationalCampaignFormData
        | UpdateNationalCampaignFormData
    )
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
          {/* Section: Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {tc('sections.basicInfo')}
            </h3>

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

            {/* Type de campagne */}
            <div>
              <Label htmlFor="type">
                {t('fields.type')} <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loading}
                  >
                    <SelectTrigger
                      className={errors.type ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder={t('placeholders.type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vaccination">
                        {t('types.vaccination')}
                      </SelectItem>
                      <SelectItem value="deworming">
                        {t('types.deworming')}
                      </SelectItem>
                      <SelectItem value="screening">
                        {t('types.screening')}
                      </SelectItem>
                      <SelectItem value="treatment">
                        {t('types.treatment')}
                      </SelectItem>
                      <SelectItem value="census">
                        {t('types.census')}
                      </SelectItem>
                      <SelectItem value="other">
                        {t('types.other')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.type.message as string)}
                </p>
              )}
            </div>
          </div>

          {/* Section: Noms multilingues */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('sections.names')}</h3>

            {/* Nom français */}
            <div>
              <Label htmlFor="nameFr">
                {t('fields.nameFr')}{' '}
                <span className="text-destructive">*</span>
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

            {/* Nom anglais */}
            <div>
              <Label htmlFor="nameEn">
                {t('fields.nameEn')}{' '}
                <span className="text-destructive">*</span>
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

            {/* Nom arabe */}
            <div>
              <Label htmlFor="nameAr">
                {t('fields.nameAr')}{' '}
                <span className="text-destructive">*</span>
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
          </div>

          {/* Section: Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('sections.dates')}</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Date de début */}
              <div>
                <Label htmlFor="startDate">
                  {t('fields.startDate')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  className={errors.startDate ? 'border-destructive' : ''}
                  disabled={loading}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.startDate.message as string)}
                  </p>
                )}
              </div>

              {/* Date de fin */}
              <div>
                <Label htmlFor="endDate">
                  {t('fields.endDate')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                  className={errors.endDate ? 'border-destructive' : ''}
                  disabled={loading}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive mt-1">
                    {t(errors.endDate.message as string)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t('sections.description')}
            </h3>

            <div>
              <Label htmlFor="description">{t('fields.description')}</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder={t('placeholders.description')}
                className={errors.description ? 'border-destructive' : ''}
                disabled={loading}
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.description.message as string)}
                </p>
              )}
            </div>
          </div>

          {/* isActive checkbox */}
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
            <Label htmlFor="isActive" className="cursor-pointer">
              {tc('fields.isActive')}
            </Label>
          </div>

          {/* Actions */}
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
              {loading ? tc('actions.saving') : tc('actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
