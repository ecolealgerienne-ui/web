'use client'

import { CheckCircle2, MapPin, Building2, Stethoscope } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { OnboardingData } from '@/app/onboarding/page'
import { Species } from '@/lib/types/farm'

interface StepSummaryProps {
  data: OnboardingData
}

// Mapping des icônes pour les espèces
const SPECIES_ICONS: Record<Species, string> = {
  bovine: '🐮',
  ovine: '🐑',
  caprine: '🐐',
  poultry: '🐔',
  equine: '🐴',
  camelid: '🐪',
}

// Mapping des pays
const COUNTRY_NAMES: Record<string, string> = {
  DZ: 'Algérie',
  TN: 'Tunisie',
  MA: 'Maroc',
  FR: 'France',
}

// Mapping des régions (simplifié)
const REGION_NAMES: Record<string, string> = {
  ALG: 'Alger',
  ORA: 'Oran',
  CON: 'Constantine',
  BLI: 'Blida',
  SET: 'Sétif',
  BAT: 'Batna',
  TIP: 'Tipaza',
  TIZ: 'Tizi Ouzou',
  BEJ: 'Béjaïa',
  MSI: 'M\'Sila',
  MED: 'Médéa',
  TLE: 'Tlemcen',
  TUN: 'Tunis',
  SFA: 'Sfax',
  SOU: 'Sousse',
  CAS: 'Casablanca',
  RAB: 'Rabat',
  MAR: 'Marrakech',
  IDF: 'Île-de-France',
  ARA: 'Auvergne-Rhône-Alpes',
  NAQ: 'Nouvelle-Aquitaine',
}

export function StepSummary({ data }: StepSummaryProps) {
  const t = useTranslations('onboarding.step4')
  const tSpecies = useTranslations('onboarding.step2')

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Exploitation */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('farmInfo')}</p>
              <p className="font-semibold">{data.farmName}</p>
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('locationInfo')}</p>
              <p className="font-semibold">
                {REGION_NAMES[data.region] || data.region}, {COUNTRY_NAMES[data.country] || data.country}
              </p>
            </div>
          </div>
        </div>

        {/* Espèces */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
            {t('speciesInfo')} ({data.species.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {data.species.map((species) => (
              <span
                key={species}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-sm"
              >
                <span>{SPECIES_ICONS[species]}</span>
                <span>{tSpecies(species)}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Vétérinaires */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('veterinariansInfo')}</p>
              <p className="font-semibold">
                {data.veterinarians.length > 0
                  ? data.veterinarians.length > 1
                    ? t('vetsSelected', { count: data.veterinarians.length })
                    : t('vetSelected', { count: data.veterinarians.length })
                  : t('noVetSelected')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message de bienvenue */}
      <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800">
        <p className="text-center">
          <span className="text-2xl mb-2 block">🎉</span>
          <strong className="text-lg">{t('readyTitle')}</strong>
          <br />
          <span className="text-muted-foreground text-sm mt-2 block">
            {t('readyMessage')}
          </span>
        </p>
      </div>
    </div>
  )
}
