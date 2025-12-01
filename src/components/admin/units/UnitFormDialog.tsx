'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select } from '@/components/ui/select'
import { unitSchema, updateUnitSchema } from '@/lib/validation/schemas/admin/unit.schema'
import { UnitType, type Unit, type CreateUnitDto, type UpdateUnitDto } from '@/lib/types/admin/unit'

/**
 * Dialog pour créer ou éditer une unité de mesure
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur (i18n)
 * ✅ RÈGLE #6 : Tous les textes via i18n
 *
 * @example
 * ```tsx
 * <UnitFormDialog
 *   open={formOpen}
 *   onOpenChange={setFormOpen}
 *   unit={editingUnit}
 *   onSubmit={handleSubmit}
 *   loading={loading}
 * />
 * ```
 */
interface UnitFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit?: Unit | null
  onSubmit: (data: CreateUnitDto | UpdateUnitDto) => Promise<void>
  loading?: boolean
}

export function UnitFormDialog({
  open,
  onOpenChange,
  unit,
  onSubmit,
  loading = false,
}: UnitFormDialogProps) {
  const t = useTranslations('unit')
  const tc = useTranslations('common')

  const isEditMode = Boolean(unit)

  // Utiliser le bon schéma selon le mode (create/edit)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateUnitDto | UpdateUnitDto>({
    resolver: zodResolver(isEditMode ? updateUnitSchema : unitSchema),
    defaultValues: {
      code: '',
      name: '',
      symbol: '',
      type: UnitType.WEIGHT,
      isActive: true,
    },
  })

  const isActive = watch('isActive')

  // Charger les données en mode édition
  useEffect(() => {
    if (unit && open) {
      reset({
        code: unit.code,
        name: unit.name,
        symbol: unit.symbol,
        type: unit.type,
        isActive: unit.isActive ?? true,
        ...(isEditMode && { version: unit.version || 1 }),
      })
    } else if (!open) {
      // Reset quand la dialog se ferme
      reset({
        code: '',
        name: '',
        symbol: '',
        type: UnitType.WEIGHT,
        isActive: true,
      })
    }
  }, [unit, open, reset, isEditMode])

  const handleFormSubmit = async (data: CreateUnitDto | UpdateUnitDto) => {
    await onSubmit(data)
    onOpenChange(false)
  }

  // Options pour le select du type
  const unitTypeOptions = [
    { value: UnitType.WEIGHT, label: t('types.WEIGHT') },
    { value: UnitType.VOLUME, label: t('types.VOLUME') },
    { value: UnitType.CONCENTRATION, label: t('types.CONCENTRATION') },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-card rounded-lg shadow-lg w-full max-w-md p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {isEditMode ? t('actions.edit') : t('actions.create')}
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
              type="button"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Code */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-1">
                {t('fields.code')} *
              </label>
              <Input
                id="code"
                {...register('code')}
                placeholder={t('placeholders.code')}
                disabled={loading}
                error={errors.code?.message ? t(errors.code.message as any) : undefined}
              />
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                {t('fields.name')} *
              </label>
              <Input
                id="name"
                {...register('name')}
                placeholder={t('placeholders.name')}
                disabled={loading}
                error={errors.name?.message ? t(errors.name.message as any) : undefined}
              />
            </div>

            {/* Symbol */}
            <div>
              <label htmlFor="symbol" className="block text-sm font-medium mb-1">
                {t('fields.symbol')} *
              </label>
              <Input
                id="symbol"
                {...register('symbol')}
                placeholder={t('placeholders.symbol')}
                disabled={loading}
                error={errors.symbol?.message ? t(errors.symbol.message as any) : undefined}
              />
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                {t('fields.type')} *
              </label>
              <Select
                id="type"
                {...register('type')}
                options={unitTypeOptions}
                disabled={loading}
                error={errors.type?.message ? t(errors.type.message as any) : undefined}
              />
            </div>

            {/* IsActive */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', checked as boolean)}
                disabled={loading}
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                {t('fields.isActive')}
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
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
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}
