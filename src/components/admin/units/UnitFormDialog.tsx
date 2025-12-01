'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  unitSchema,
  updateUnitSchema,
  type UnitFormData,
  type UpdateUnitFormData,
} from '@/lib/validation/schemas/admin/unit.schema'
import { UnitType, type Unit } from '@/lib/types/admin/unit'

interface UnitFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit?: Unit | null
  onSubmit: (data: UnitFormData | UpdateUnitFormData) => Promise<void>
  loading?: boolean
}

/**
 * Formulaire de création/édition d'unité de mesure
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur (i18n)
 * ✅ RÈGLE #6 : i18n complet
 *
 * Utilise react-hook-form + Zod pour la validation côté client
 */
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

  // Utilise le schéma approprié selon le mode (création/édition)
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UnitFormData | UpdateUnitFormData>({
    resolver: zodResolver(
      isEditMode ? updateUnitSchema : unitSchema
    ),
    defaultValues: {
      code: '',
      name: '',
      symbol: '',
      type: UnitType.WEIGHT,
      isActive: true,
    },
  })

  const isActive = watch('isActive')
  const selectedType = watch('type')

  // Charge les données en mode édition
  useEffect(() => {
    if (unit && open) {
      reset({
        code: unit.code,
        name: unit.name,
        symbol: unit.symbol,
        type: unit.type,
        isActive: unit.isActive ?? true,
        ...(isEditMode && { version: unit.version || 1 }),
      } as UpdateUnitFormData)
    } else if (!unit && open) {
      // Réinitialise en mode création
      reset({
        code: '',
        name: '',
        symbol: '',
        type: UnitType.WEIGHT,
        isActive: true,
      })
    }
  }, [unit, open, reset, isEditMode])

  const handleFormSubmission = async (
    data: UnitFormData | UpdateUnitFormData
  ) => {
    await onSubmit(data)
  }

  // Options pour le select du type
  const unitTypeOptions = [
    { value: UnitType.WEIGHT, label: t('types.WEIGHT') },
    { value: UnitType.VOLUME, label: t('types.VOLUME') },
    { value: UnitType.CONCENTRATION, label: t('types.CONCENTRATION') },
  ]

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

            {/* Symbole */}
            <div>
              <Label htmlFor="symbol">
                {t('fields.symbol')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="symbol"
                {...register('symbol')}
                placeholder={t('placeholders.symbol')}
                className={errors.symbol ? 'border-destructive' : ''}
                disabled={loading}
              />
              {errors.symbol && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.symbol.message as string)}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="type">
                {t('fields.type')} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedType}
                onValueChange={(value) => setValue('type', value as UnitType)}
                disabled={loading}
              >
                <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                  <SelectValue placeholder={t('placeholders.name')} />
                </SelectTrigger>
                <SelectContent>
                  {unitTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive mt-1">
                  {String(errors.type.message)}
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
