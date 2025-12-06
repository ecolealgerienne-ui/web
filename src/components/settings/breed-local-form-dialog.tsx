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
import { useTranslations } from 'next-intl'
import { CreateBreedDto } from '@/lib/types/admin/breed'

interface BreedLocalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateBreedDto) => Promise<void>
  speciesId: string
  speciesName: string
  loading?: boolean
}

export function BreedLocalFormDialog({
  open,
  onOpenChange,
  onSubmit,
  speciesId,
  speciesName,
  loading = false,
}: BreedLocalFormDialogProps) {
  const t = useTranslations('settings.breeds.form')
  const tc = useTranslations('common')

  const [formData, setFormData] = useState({
    code: '',
    nameFr: '',
    nameEn: '',
    description: '',
  })

  // Réinitialiser le formulaire quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      setFormData({
        code: '',
        nameFr: '',
        nameEn: '',
        description: '',
      })
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const submitData: CreateBreedDto = {
      code: formData.code.trim().toUpperCase(),
      nameFr: formData.nameFr.trim(),
      nameEn: formData.nameEn.trim() || formData.nameFr.trim(),
      description: formData.description.trim() || undefined,
      speciesId,
      isActive: true,
    }

    await onSubmit(submitData)
  }

  const isValid = formData.code.trim() && formData.nameFr.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addTitle')}</DialogTitle>
          <DialogDescription>
            {t('addDescription', { species: speciesName })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              {t('code')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder={t('codePlaceholder')}
              maxLength={20}
              required
            />
          </div>

          {/* Nom FR */}
          <div className="space-y-2">
            <Label htmlFor="nameFr">
              {t('nameFr')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nameFr"
              value={formData.nameFr}
              onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
              placeholder={t('nameFrPlaceholder')}
              required
            />
          </div>

          {/* Nom EN */}
          <div className="space-y-2">
            <Label htmlFor="nameEn">
              {t('nameEn')} <span className="text-muted-foreground text-xs">({tc('optional')})</span>
            </Label>
            <Input
              id="nameEn"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              placeholder={t('nameEnPlaceholder')}
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
