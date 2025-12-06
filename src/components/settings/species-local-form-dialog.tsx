'use client'

import { useState } from 'react'
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
import { CreateSpeciesDto } from '@/lib/types/admin/species'

interface SpeciesLocalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateSpeciesDto) => Promise<void>
  loading?: boolean
}

export function SpeciesLocalFormDialog({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
}: SpeciesLocalFormDialogProps) {
  const t = useTranslations('settings.species.form')
  const tc = useTranslations('common')

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const submitData: CreateSpeciesDto = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      isActive: true,
    }

    await onSubmit(submitData)

    // Réinitialiser le formulaire
    setFormData({
      code: '',
      name: '',
      description: '',
    })
  }

  const isValid = formData.code.trim() && formData.name.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addTitle')}</DialogTitle>
          <DialogDescription>{t('addDescription')}</DialogDescription>
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
              maxLength={10}
              required
            />
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

          {/* Note pour espèce locale */}
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
