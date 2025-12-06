'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslations } from 'next-intl'
import { CreateBreedDto } from '@/lib/types/admin/breed'
import { SpeciesPreference } from '@/lib/types/species-preference'

interface BreedLocalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateBreedDto) => Promise<void>
  speciesPreferences: SpeciesPreference[]
  loading?: boolean
}

export function BreedLocalFormDialog({
  open,
  onOpenChange,
  onSubmit,
  speciesPreferences,
  loading = false,
}: BreedLocalFormDialogProps) {
  const t = useTranslations('settings.breeds.form')
  const tc = useTranslations('common')

  const [formData, setFormData] = useState({
    speciesId: '',
    name: '',
    description: '',
  })

  // Réinitialiser le formulaire quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      // Sélectionner la première espèce par défaut
      const sortedPrefs = [...speciesPreferences].sort((a, b) => a.displayOrder - b.displayOrder)
      setFormData({
        speciesId: sortedPrefs[0]?.speciesId || '',
        name: '',
        description: '',
      })
    }
  }, [open, speciesPreferences])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Générer un code à partir du nom
    const generatedCode = formData.name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10)

    const submitData: CreateBreedDto = {
      code: generatedCode || `LOCAL-${Date.now()}`,
      nameFr: formData.name.trim(),
      nameEn: formData.name.trim(),
      description: formData.description.trim() || undefined,
      speciesId: formData.speciesId,
      isActive: true,
    }

    await onSubmit(submitData)
  }

  const isValid = formData.speciesId && formData.name.trim()

  // Trier les espèces par displayOrder
  const sortedSpecies = [...speciesPreferences].sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addTitle')}</DialogTitle>
          <DialogDescription>
            {t('addDescriptionSimple')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Espèce */}
          <div className="space-y-2">
            <Label htmlFor="speciesId">
              {t('species')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.speciesId}
              onValueChange={(value) => setFormData({ ...formData, speciesId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectSpecies')} />
              </SelectTrigger>
              <SelectContent>
                {sortedSpecies.map((pref) => (
                  <SelectItem key={pref.speciesId} value={pref.speciesId}>
                    {pref.species?.nameFr || pref.speciesId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {t('name')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('namePlaceholder')}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t('description')} <span className="text-muted-foreground text-xs">({tc('optional')})</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('descriptionPlaceholder')}
              rows={3}
            />
          </div>

          {/* Note pour race locale */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {t('localNote')}
            </p>
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
            <Button type="submit" disabled={!isValid || loading}>
              {loading ? tc('actions.saving') : t('addButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
