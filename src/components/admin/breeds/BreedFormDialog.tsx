'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { breedSchema, type BreedFormData } from '@/lib/validation/schemas/admin/breed.schema'
import type { Breed } from '@/lib/types/admin/breed'
import type { Species } from '@/lib/types/admin/species'
import { speciesService } from '@/lib/services/admin/species.service'

/**
 * Props du composant BreedFormDialog
 */
interface BreedFormDialogProps {
  /**
   * Contrôle l'ouverture du dialog
   */
  open: boolean

  /**
   * Callback quand le dialog se ferme/ouvre
   */
  onOpenChange: (open: boolean) => void

  /**
   * Race à éditer (undefined pour création)
   */
  breed?: Breed | null

  /**
   * Callback de soumission du formulaire
   */
  onSubmit: (data: BreedFormData) => Promise<void>

  /**
   * État de chargement lors de la soumission
   */
  loading?: boolean

  /**
   * ID d'espèce pré-sélectionné (pour création depuis filtre)
   */
  preSelectedSpeciesId?: string
}

/**
 * Dialog de formulaire pour créer/éditer une Race
 *
 * ✅ RÈGLE #3 : Composant réutilisable pour création ET édition
 * ✅ RÈGLE #6 : i18n complet via useTranslations
 * ✅ RÈGLE #9 : react-hook-form + zodResolver
 * ✅ RÈGLE Section 5.3 : valueAsNumber: true pour displayOrder
 * ✅ RÈGLE Section 7.5 : Pas de value="" dans SelectItem
 *
 * Pattern: Scoped Reference Data (Scope: Species)
 */
export function BreedFormDialog({
  open,
  onOpenChange,
  breed,
  onSubmit,
  loading = false,
  preSelectedSpeciesId,
}: BreedFormDialogProps) {
  const t = useTranslations('breed')
  const tc = useTranslations('common')
  const ts = useTranslations('species')

  // État local pour liste des espèces
  const [species, setSpecies] = useState<Species[]>([])
  const [loadingSpecies, setLoadingSpecies] = useState(false)

  // Initialisation du formulaire
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BreedFormData>({
    resolver: zodResolver(breedSchema),
    defaultValues: {
      code: '',
      nameFr: '',
      nameEn: '',
      nameAr: '',
      description: '',
      speciesId: preSelectedSpeciesId || '',
      displayOrder: undefined,
      isActive: true,
    },
  })

  /**
   * Charger les espèces au montage
   */
  useEffect(() => {
    const fetchSpecies = async () => {
      setLoadingSpecies(true)
      try {
        const response = await speciesService.list({ limit: 100, isActive: true })
        setSpecies(response.data)
      } catch (error) {
        console.error('Failed to load species:', error)
      } finally {
        setLoadingSpecies(false)
      }
    }

    fetchSpecies()
  }, [])

  /**
   * Pré-remplir le formulaire en mode édition
   * ✅ RÈGLE Section 7.4 : Dépendances exhaustives
   */
  useEffect(() => {
    if (breed) {
      // Mode édition
      reset({
        code: breed.code,
        nameFr: breed.nameFr,
        nameEn: breed.nameEn,
        nameAr: breed.nameAr || '',
        description: breed.description || '',
        speciesId: breed.speciesId,
        displayOrder: breed.displayOrder || undefined,
        isActive: breed.isActive,
      })
    } else if (preSelectedSpeciesId) {
      // Mode création avec espèce pré-sélectionnée
      reset({
        code: '',
        nameFr: '',
        nameEn: '',
        nameAr: '',
        description: '',
        speciesId: preSelectedSpeciesId,
        displayOrder: undefined,
        isActive: true,
      })
    } else {
      // Mode création sans pré-sélection
      reset({
        code: '',
        nameFr: '',
        nameEn: '',
        nameAr: '',
        description: '',
        speciesId: '',
        displayOrder: undefined,
        isActive: true,
      })
    }
  }, [breed, preSelectedSpeciesId, reset])

  /**
   * Soumettre le formulaire
   */
  const handleFormSubmit = async (data: BreedFormData) => {
    await onSubmit(data)
    if (!loading) {
      // Fermer le dialog seulement si pas d'erreur
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {breed ? t('form.editTitle') : t('form.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Espèce (Select) */}
          <div className="space-y-2">
            <Label htmlFor="speciesId">
              {t('fields.species')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('speciesId')}
              onValueChange={(value) => setValue('speciesId', value, { shouldValidate: true })}
              disabled={loadingSpecies || loading}
            >
              <SelectTrigger id="speciesId">
                <SelectValue placeholder={t('form.selectSpecies')} />
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
              <p className="text-sm text-destructive">{t(errors.speciesId.message!)}</p>
            )}
          </div>

          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              {t('fields.code')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              {...register('code')}
              placeholder={t('form.codePlaceholder')}
              disabled={loading}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{t(errors.code.message!)}</p>
            )}
          </div>

          {/* Nom FR */}
          <div className="space-y-2">
            <Label htmlFor="nameFr">
              {t('fields.nameFr')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nameFr"
              {...register('nameFr')}
              placeholder={t('form.nameFrPlaceholder')}
              disabled={loading}
            />
            {errors.nameFr && (
              <p className="text-sm text-destructive">{t(errors.nameFr.message!)}</p>
            )}
          </div>

          {/* Nom EN */}
          <div className="space-y-2">
            <Label htmlFor="nameEn">
              {t('fields.nameEn')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nameEn"
              {...register('nameEn')}
              placeholder={t('form.nameEnPlaceholder')}
              disabled={loading}
            />
            {errors.nameEn && (
              <p className="text-sm text-destructive">{t(errors.nameEn.message!)}</p>
            )}
          </div>

          {/* Nom AR (optionnel) */}
          <div className="space-y-2">
            <Label htmlFor="nameAr">{t('fields.nameAr')}</Label>
            <Input
              id="nameAr"
              {...register('nameAr')}
              placeholder={t('form.nameArPlaceholder')}
              disabled={loading}
              dir="rtl"
            />
            {errors.nameAr && (
              <p className="text-sm text-destructive">{t(errors.nameAr.message!)}</p>
            )}
          </div>

          {/* Description (optionnel) */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('fields.description')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('form.descriptionPlaceholder')}
              disabled={loading}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{t(errors.description.message!)}</p>
            )}
          </div>

          {/* Ordre d'affichage (optionnel) */}
          <div className="space-y-2">
            <Label htmlFor="displayOrder">{t('fields.displayOrder')}</Label>
            <Input
              id="displayOrder"
              type="number"
              {...register('displayOrder', { valueAsNumber: true })}
              placeholder={t('form.displayOrderPlaceholder')}
              disabled={loading}
              min={0}
            />
            {errors.displayOrder && (
              <p className="text-sm text-destructive">{t(errors.displayOrder.message!)}</p>
            )}
          </div>

          {/* Statut actif */}
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
                : breed
                  ? tc('actions.save')
                  : tc('actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
