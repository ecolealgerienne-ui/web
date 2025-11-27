'use client'

import { MapPin, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'
import type { OnboardingData } from '@/app/onboarding/page'

interface StepIdentityProps {
  data: OnboardingData
  onDataChange: (data: OnboardingData) => void
}

// Liste des pays (pour l'instant, focus sur l'Algérie et quelques pays voisins)
const COUNTRIES = [
  { code: 'DZ', name: 'Algérie' },
  { code: 'TN', name: 'Tunisie' },
  { code: 'MA', name: 'Maroc' },
  { code: 'FR', name: 'France' },
]

// Régions par pays
const REGIONS: Record<string, { code: string; name: string }[]> = {
  DZ: [
    { code: 'ALG', name: 'Alger' },
    { code: 'ORA', name: 'Oran' },
    { code: 'CON', name: 'Constantine' },
    { code: 'BLI', name: 'Blida' },
    { code: 'SET', name: 'Sétif' },
    { code: 'BAT', name: 'Batna' },
    { code: 'TIP', name: 'Tipaza' },
    { code: 'TIZ', name: 'Tizi Ouzou' },
    { code: 'BEJ', name: 'Béjaïa' },
    { code: 'MSI', name: 'M\'Sila' },
    { code: 'MED', name: 'Médéa' },
    { code: 'TLE', name: 'Tlemcen' },
  ],
  TN: [
    { code: 'TUN', name: 'Tunis' },
    { code: 'SFA', name: 'Sfax' },
    { code: 'SOU', name: 'Sousse' },
  ],
  MA: [
    { code: 'CAS', name: 'Casablanca' },
    { code: 'RAB', name: 'Rabat' },
    { code: 'MAR', name: 'Marrakech' },
  ],
  FR: [
    { code: 'IDF', name: 'Île-de-France' },
    { code: 'ARA', name: 'Auvergne-Rhône-Alpes' },
    { code: 'NAQ', name: 'Nouvelle-Aquitaine' },
  ],
}

export function StepIdentity({ data, onDataChange }: StepIdentityProps) {
  const t = useTranslations('onboarding.step1')

  const handleChange = (field: keyof OnboardingData, value: string) => {
    const updates: Partial<OnboardingData> = { [field]: value }

    // Si le pays change, réinitialiser la région
    if (field === 'country') {
      updates.region = ''
    }

    onDataChange({ ...data, ...updates })
  }

  const availableRegions = data.country ? REGIONS[data.country] || [] : []

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Nom de l'exploitation */}
        <div className="space-y-2">
          <Label htmlFor="farmName">{t('farmName')} *</Label>
          <Input
            id="farmName"
            placeholder={t('farmNamePlaceholder')}
            value={data.farmName}
            onChange={(e) => handleChange('farmName', e.target.value)}
            className="h-12"
          />
        </div>

        {/* Pays */}
        <div className="space-y-2">
          <Label htmlFor="country">{t('country')} *</Label>
          <select
            id="country"
            value={data.country}
            onChange={(e) => handleChange('country', e.target.value)}
            className="w-full h-12 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t('selectCountry')}</option>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Région */}
        <div className="space-y-2">
          <Label htmlFor="region" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {t('region')} *
          </Label>
          <select
            id="region"
            value={data.region}
            onChange={(e) => handleChange('region', e.target.value)}
            disabled={!data.country}
            className="w-full h-12 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {data.country ? t('selectRegion') : t('selectCountryFirst')}
            </option>
            {availableRegions.map((region) => (
              <option key={region.code} value={region.code}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>{t('whyInfo')}</strong>
          <br />
          {t('whyInfoText')}
        </p>
      </div>
    </div>
  )
}
