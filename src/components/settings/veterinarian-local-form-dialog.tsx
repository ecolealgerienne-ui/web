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
import { useTranslations } from 'next-intl'
import { Veterinarian, CreateVeterinarianDto } from '@/lib/types/veterinarian'

// Régions disponibles (Algérie)
const REGIONS = [
  { code: 'ALG', name: 'Alger' },
  { code: 'ORA', name: 'Oran' },
  { code: 'CON', name: 'Constantine' },
  { code: 'BLI', name: 'Blida' },
  { code: 'SET', name: 'Sétif' },
  { code: 'BAT', name: 'Batna' },
  { code: 'TIP', name: 'Tipaza' },
  { code: 'TIZ', name: 'Tizi Ouzou' },
  { code: 'BEJ', name: 'Béjaïa' },
]

// Spécialités vétérinaires
const SPECIALTIES = [
  { code: 'bovine', key: 'bovine' },
  { code: 'ovine', key: 'ovine' },
  { code: 'caprine', key: 'caprine' },
  { code: 'poultry', key: 'poultry' },
  { code: 'equine', key: 'equine' },
  { code: 'camelid', key: 'camelid' },
  { code: 'general', key: 'general' },
]

interface VeterinarianLocalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  veterinarian?: Veterinarian | null
  onSubmit: (data: CreateVeterinarianDto) => Promise<void>
  loading?: boolean
}

export function VeterinarianLocalFormDialog({
  open,
  onOpenChange,
  veterinarian,
  onSubmit,
  loading = false,
}: VeterinarianLocalFormDialogProps) {
  const t = useTranslations('settings.veterinarians.form')
  const tc = useTranslations('common')
  const ts = useTranslations('settings.veterinarians.specialties')

  const isEditMode = Boolean(veterinarian)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    mobile: '',
    email: '',
    department: '',
    city: '',
    clinic: '',
    specialties: 'general',
    licenseNumber: '',
  })

  // Initialiser le formulaire avec les données du vétérinaire à modifier
  useEffect(() => {
    if (veterinarian) {
      setFormData({
        firstName: veterinarian.firstName || '',
        lastName: veterinarian.lastName || '',
        phone: veterinarian.phone || '',
        mobile: veterinarian.mobile || '',
        email: veterinarian.email || '',
        department: veterinarian.department || '',
        city: veterinarian.city || '',
        clinic: veterinarian.clinic || '',
        specialties: veterinarian.specialties || 'general',
        licenseNumber: veterinarian.licenseNumber || '',
      })
    } else {
      // Réinitialiser le formulaire
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        mobile: '',
        email: '',
        department: '',
        city: '',
        clinic: '',
        specialties: 'general',
        licenseNumber: '',
      })
    }
  }, [veterinarian, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const submitData: CreateVeterinarianDto = {
      scope: 'local',
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
      mobile: formData.mobile.trim() || undefined,
      email: formData.email.trim() || undefined,
      department: formData.department || undefined,
      city: formData.city.trim() || undefined,
      clinic: formData.clinic.trim() || undefined,
      specialties: formData.specialties,
      licenseNumber: formData.licenseNumber.trim() || `LOCAL-${Date.now()}`,
      isActive: true,
    }

    await onSubmit(submitData)
  }

  const isValid = formData.firstName.trim() && formData.lastName.trim() && formData.phone.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('editTitle') : t('addTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? t('editDescription') : t('addDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom et Prénom */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                {t('firstName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder={t('firstNamePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                {t('lastName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder={t('lastNamePlaceholder')}
                required
              />
            </div>
          </div>

          {/* Téléphone et Mobile */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                {t('phone')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t('phonePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">
                {t('mobile')} <span className="text-muted-foreground text-xs">({tc('optional')})</span>
              </Label>
              <Input
                id="mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder={t('mobilePlaceholder')}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              {t('email')} <span className="text-muted-foreground text-xs">({tc('optional')})</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('emailPlaceholder')}
            />
          </div>

          {/* Spécialité */}
          <div className="space-y-2">
            <Label htmlFor="specialties">{t('specialties')}</Label>
            <select
              id="specialties"
              value={formData.specialties}
              onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SPECIALTIES.map((spec) => (
                <option key={spec.code} value={spec.code}>
                  {ts(spec.key)}
                </option>
              ))}
            </select>
          </div>

          {/* Département et Ville */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">
                {t('department')} <span className="text-muted-foreground text-xs">({tc('optional')})</span>
              </Label>
              <select
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t('departmentPlaceholder')}</option>
                {REGIONS.map((region) => (
                  <option key={region.code} value={region.code}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">
                {t('city')} <span className="text-muted-foreground text-xs">({tc('optional')})</span>
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder={t('cityPlaceholder')}
              />
            </div>
          </div>

          {/* Clinique et Numéro de licence */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinic">
                {t('clinic')} <span className="text-muted-foreground text-xs">({tc('optional')})</span>
              </Label>
              <Input
                id="clinic"
                value={formData.clinic}
                onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                placeholder={t('clinicPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">
                {t('licenseNumber')} <span className="text-muted-foreground text-xs">({tc('optional')})</span>
              </Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder={t('licenseNumberPlaceholder')}
              />
            </div>
          </div>

          {/* Note pour vétérinaire local */}
          {!isEditMode && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {t('localNote')}
              </p>
            </div>
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
            <Button type="submit" disabled={!isValid || loading}>
              {loading ? tc('actions.saving') : isEditMode ? tc('actions.save') : t('addButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
