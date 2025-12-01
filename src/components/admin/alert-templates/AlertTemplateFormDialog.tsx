/**
 * AlertTemplateFormDialog Component
 *
 * Dialog form for creating and editing alert templates
 */

'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  createAlertTemplateSchema,
  type AlertTemplateFormData,
} from '@/lib/validation/schemas/admin/alert-template.schema'
import type { AlertTemplate } from '@/lib/types/admin/alert-template'

interface AlertTemplateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: AlertTemplate | null
  onSubmit: (data: AlertTemplateFormData) => Promise<void>
  loading?: boolean
}

const categories = [
  'health',
  'vaccination',
  'treatment',
  'reproduction',
  'nutrition',
  'administrative',
  'other',
] as const

const priorities = ['low', 'medium', 'high', 'urgent'] as const

export function AlertTemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
  loading = false,
}: AlertTemplateFormDialogProps) {
  const t = useTranslations('alertTemplate')
  const tc = useTranslations('common')

  const isEditMode = !!template

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AlertTemplateFormData>({
    resolver: zodResolver(createAlertTemplateSchema) as any,
    defaultValues: {
      code: '',
      nameFr: '',
      nameEn: '',
      nameAr: '',
      category: 'health',
      priority: 'medium',
      description: '',
      messageTemplateFr: '',
      messageTemplateEn: '',
      messageTemplateAr: '',
      isActive: true,
    },
  })

  // Load data in edit mode
  useEffect(() => {
    if (template && open) {
      reset({
        code: template.code,
        nameFr: template.nameFr,
        nameEn: template.nameEn,
        nameAr: template.nameAr,
        category: template.category,
        priority: template.priority,
        description: template.description || '',
        messageTemplateFr: template.messageTemplateFr || '',
        messageTemplateEn: template.messageTemplateEn || '',
        messageTemplateAr: template.messageTemplateAr || '',
        isActive: template.isActive,
      })
    } else if (!open) {
      reset({
        code: '',
        nameFr: '',
        nameEn: '',
        nameAr: '',
        category: 'health',
        priority: 'medium',
        description: '',
        messageTemplateFr: '',
        messageTemplateEn: '',
        messageTemplateAr: '',
        isActive: true,
      })
    }
  }, [template, open, reset])

  const handleFormSubmit = async (data: AlertTemplateFormData) => {
    await onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('actions.edit') : t('actions.create')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Section: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              {tc('sections.basicInfo')}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">{t('fields.code')} *</Label>
                <Input
                  id="code"
                  {...register('code')}
                  disabled={loading || isEditMode}
                  placeholder={t('placeholders.code')}
                  className={errors.code ? 'border-destructive' : ''}
                />
                {errors.code && (
                  <p className="text-sm text-destructive">
                    {errors.code.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">{t('fields.category')} *</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <SelectTrigger
                        className={errors.category ? 'border-destructive' : ''}
                      >
                        <SelectValue placeholder={tc('placeholders.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {t(`categories.${category}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-sm text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">{t('fields.priority')} *</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loading}
                  >
                    <SelectTrigger
                      className={errors.priority ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder={tc('placeholders.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {t(`priorities.${priority}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && (
                <p className="text-sm text-destructive">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          {/* Section: Multilingual Names */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              {t('sections.names')}
            </h3>

            {/* Name FR */}
            <div className="space-y-2">
              <Label htmlFor="nameFr">{t('fields.nameFr')} *</Label>
              <Input
                id="nameFr"
                {...register('nameFr')}
                disabled={loading}
                placeholder={t('placeholders.nameFr')}
                className={errors.nameFr ? 'border-destructive' : ''}
              />
              {errors.nameFr && (
                <p className="text-sm text-destructive">
                  {errors.nameFr.message}
                </p>
              )}
            </div>

            {/* Name EN */}
            <div className="space-y-2">
              <Label htmlFor="nameEn">{t('fields.nameEn')} *</Label>
              <Input
                id="nameEn"
                {...register('nameEn')}
                disabled={loading}
                placeholder={t('placeholders.nameEn')}
                className={errors.nameEn ? 'border-destructive' : ''}
              />
              {errors.nameEn && (
                <p className="text-sm text-destructive">
                  {errors.nameEn.message}
                </p>
              )}
            </div>

            {/* Name AR */}
            <div className="space-y-2">
              <Label htmlFor="nameAr">{t('fields.nameAr')} *</Label>
              <Input
                id="nameAr"
                {...register('nameAr')}
                disabled={loading}
                placeholder={t('placeholders.nameAr')}
                dir="rtl"
                className={errors.nameAr ? 'border-destructive' : ''}
              />
              {errors.nameAr && (
                <p className="text-sm text-destructive">
                  {errors.nameAr.message}
                </p>
              )}
            </div>
          </div>

          {/* Section: Description */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              {tc('sections.additionalInfo')}
            </h3>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t('fields.description')}</Label>
              <Textarea
                id="description"
                {...register('description')}
                disabled={loading}
                placeholder={t('placeholders.description')}
                rows={3}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Message Template FR */}
            <div className="space-y-2">
              <Label htmlFor="messageTemplateFr">
                {t('fields.messageTemplateFr')}
              </Label>
              <Textarea
                id="messageTemplateFr"
                {...register('messageTemplateFr')}
                disabled={loading}
                placeholder={t('placeholders.messageTemplateFr')}
                rows={2}
                className={
                  errors.messageTemplateFr ? 'border-destructive' : ''
                }
              />
              {errors.messageTemplateFr && (
                <p className="text-sm text-destructive">
                  {errors.messageTemplateFr.message}
                </p>
              )}
            </div>

            {/* Message Template EN */}
            <div className="space-y-2">
              <Label htmlFor="messageTemplateEn">
                {t('fields.messageTemplateEn')}
              </Label>
              <Textarea
                id="messageTemplateEn"
                {...register('messageTemplateEn')}
                disabled={loading}
                placeholder={t('placeholders.messageTemplateEn')}
                rows={2}
                className={
                  errors.messageTemplateEn ? 'border-destructive' : ''
                }
              />
              {errors.messageTemplateEn && (
                <p className="text-sm text-destructive">
                  {errors.messageTemplateEn.message}
                </p>
              )}
            </div>

            {/* Message Template AR */}
            <div className="space-y-2">
              <Label htmlFor="messageTemplateAr">
                {t('fields.messageTemplateAr')}
              </Label>
              <Textarea
                id="messageTemplateAr"
                {...register('messageTemplateAr')}
                disabled={loading}
                placeholder={t('placeholders.messageTemplateAr')}
                dir="rtl"
                rows={2}
                className={
                  errors.messageTemplateAr ? 'border-destructive' : ''
                }
              />
              {errors.messageTemplateAr && (
                <p className="text-sm text-destructive">
                  {errors.messageTemplateAr.message}
                </p>
              )}
            </div>
          </div>

          {/* Section: Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold border-b pb-2">
              {tc('sections.options')}
            </h3>

            {/* Active Status */}
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
