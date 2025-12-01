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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ageCategorySchema,
  type AgeCategoryFormData,
} from '@/lib/validation/schemas/admin/age-category.schema'
import type { AgeCategory } from '@/lib/types/admin/age-category'
import { useTranslations } from 'next-intl'
import { speciesService } from '@/lib/services/admin/species.service'
import type { Species } from '@/lib/types/admin/species'

interface AgeCategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ageCategory?: AgeCategory | null
  onSubmit: (
    data: AgeCategoryFormData
  ) => Promise<void>
  loading?: boolean
  /** ID de l'espèce pré-sélectionnée (pour mode création depuis liste filtrée) */
  preSelectedSpeciesId?: string
}

/**
 * Formulaire de création/édition de catégorie d'âge
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur (i18n)
 * ✅ RÈGLE #6 : i18n complet
 * ✅ RÈGLE #14.8 : Suit le modèle SpeciesFormDialog
 *
 * Utilise react-hook-form + Zod pour la validation côté client
 * Charge la liste des espèces pour le dropdown de sélection
 *
 * @example
 * ```tsx
 * <AgeCategoryFormDialog
 *   open={formOpen}
 *   onOpenChange={setFormOpen}
 *   ageCategory={editingAgeCategory}
 *   onSubmit={handleSubmit}
 *   loading={loading}
 *   preSelectedSpeciesId={selectedSpeciesId}
 * />
 * ```
 */
export function AgeCategoryFormDialog({
  open,
  onOpenChange,
  ageCategory,
  onSubmit,
  loading = false,
  preSelectedSpeciesId,
}: AgeCategoryFormDialogProps) {
  const t = useTranslations('ageCategory')
  const tc = useTranslations('common')

  const isEditMode = Boolean(ageCategory)

  // État local pour la liste des espèces
  const [species, setSpecies] = useState<Species[]>([])
  const [loadingSpecies, setLoadingSpecies] = useState(false)

  // Utilise le schéma de base pour le formulaire (version gérée séparément)
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AgeCategoryFormData>({
    resolver: zodResolver(ageCategorySchema),
    defaultValues: {
      code: '',
      nameFr: '',
      nameEn: '',
      nameAr: '',
      speciesId: preSelectedSpeciesId || '',
      ageMinDays: 0,
      ageMaxDays: undefined,
      displayOrder: 0,
      isActive: true,
    },
  })

  const selectedSpeciesId = watch('speciesId')

  // Charger la liste des espèces au montage
  useEffect(() => {
    const fetchSpecies = async () => {
      setLoadingSpecies(true)
      try {
        const response = await speciesService.getAll({
          page: 1,
          limit: 100, // Charger toutes les espèces
          sortBy: 'name',
          sortOrder: 'asc',
        })
        setSpecies(response.data.filter((s) => s.isActive))
      } catch (error) {
        console.error('Failed to load species', error)
      } finally {
        setLoadingSpecies(false)
      }
    }

    if (open) {
      fetchSpecies()
    }
  }, [open])

  // Charge les données en mode édition
  useEffect(() => {
    if (ageCategory && open) {
      reset({
        code: ageCategory.code,
        nameFr: ageCategory.nameFr,
        nameEn: ageCategory.nameEn,
        nameAr: ageCategory.nameAr || '',
        speciesId: ageCategory.speciesId,
        ageMinDays: ageCategory.ageMinDays,
        ageMaxDays: ageCategory.ageMaxDays ?? undefined,
        displayOrder: ageCategory.displayOrder || 0,
        isActive: ageCategory.isActive ?? true,
      })
    } else if (!ageCategory && open) {
      // Réinitialise en mode création
      reset({
        code: '',
        nameFr: '',
        nameEn: '',
        nameAr: '',
        speciesId: preSelectedSpeciesId || '',
        ageMinDays: 0,
        ageMaxDays: undefined,
        displayOrder: 0,
        isActive: true,
      })
    }
  }, [ageCategory, open, reset, isEditMode, preSelectedSpeciesId])

  const handleFormSubmission = async (
    data: AgeCategoryFormData
  ) => {
    await onSubmit(data)
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
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Espèce (Dropdown) */}
            <div>
              <Label htmlFor="speciesId">
                {t('fields.speciesId')} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedSpeciesId}
                onValueChange={(value) => setValue('speciesId', value)}
                disabled={loading || loadingSpecies || isEditMode}
              >
                <SelectTrigger className={errors.speciesId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={t('placeholders.selectSpecies')} />
                </SelectTrigger>
                <SelectContent>
                  {species.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.name} ({sp.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.speciesId && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.speciesId.message as string)}
                </p>
              )}
            </div>

            {/* Nom FR */}
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

            {/* Nom EN */}
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

            {/* Nom AR (optionnel) */}
            <div>
              <Label htmlFor="nameAr">{t('fields.nameAr')}</Label>
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

            {/* Âge Min (jours) */}
            <div>
              <Label htmlFor="ageMinDays">
                {t('fields.ageMinDays')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ageMinDays"
                type="number"
                min="0"
                {...register('ageMinDays')}
                placeholder="0"
                className={errors.ageMinDays ? 'border-destructive' : ''}
                disabled={loading}
              />
              {errors.ageMinDays && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.ageMinDays.message as string)}
                </p>
              )}
            </div>

            {/* Âge Max (jours) - optionnel */}
            <div>
              <Label htmlFor="ageMaxDays">{t('fields.ageMaxDays')}</Label>
              <Input
                id="ageMaxDays"
                type="number"
                min="0"
                {...register('ageMaxDays')}
                placeholder={t('placeholders.ageMaxDays')}
                className={errors.ageMaxDays ? 'border-destructive' : ''}
                disabled={loading}
              />
              {errors.ageMaxDays && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.ageMaxDays.message as string)}
                </p>
              )}
            </div>

            {/* Ordre d'affichage */}
            <div>
              <Label htmlFor="displayOrder">{t('fields.displayOrder')}</Label>
              <Input
                id="displayOrder"
                type="number"
                min="0"
                {...register('displayOrder')}
                placeholder="0"
                className={errors.displayOrder ? 'border-destructive' : ''}
                disabled={loading}
              />
              {errors.displayOrder && (
                <p className="text-sm text-destructive mt-1">
                  {t(errors.displayOrder.message as string)}
                </p>
              )}
            </div>

            {/* Actif */}
            <div className="flex items-center space-x-2 pt-6">
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
