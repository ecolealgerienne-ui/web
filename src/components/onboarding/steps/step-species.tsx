'use client'

import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Species } from '@/lib/types/farm'
import type { OnboardingData } from '@/app/onboarding/page'

interface StepSpeciesProps {
  data: OnboardingData
  onDataChange: (data: OnboardingData) => void
}

interface SpeciesOption {
  id: Species
  nameKey: string
  descKey: string
  icon: string
}

const SPECIES_OPTIONS: SpeciesOption[] = [
  { id: 'bovine', nameKey: 'bovine', descKey: 'bovineDesc', icon: '🐮' },
  { id: 'ovine', nameKey: 'ovine', descKey: 'ovineDesc', icon: '🐑' },
  { id: 'caprine', nameKey: 'caprine', descKey: 'caprineDesc', icon: '🐐' },
  { id: 'poultry', nameKey: 'poultry', descKey: 'poultryDesc', icon: '🐔' },
  { id: 'equine', nameKey: 'equine', descKey: 'equineDesc', icon: '🐴' },
  { id: 'camelid', nameKey: 'camelid', descKey: 'camelidDesc', icon: '🐪' },
]

export function StepSpecies({ data, onDataChange }: StepSpeciesProps) {
  const t = useTranslations('onboarding.step2')

  const toggleSpecies = (speciesId: Species) => {
    const isSelected = data.species.includes(speciesId)
    const newSpecies = isSelected
      ? data.species.filter((s) => s !== speciesId)
      : [...data.species, speciesId]

    onDataChange({ ...data, species: newSpecies })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🐄</span>
        </div>
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('selectSpecies')}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {SPECIES_OPTIONS.map((species) => {
          const isSelected = data.species.includes(species.id)
          return (
            <button
              key={species.id}
              type="button"
              onClick={() => toggleSpecies(species.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                flex flex-col items-center text-center
                hover:border-primary/50 hover:bg-primary/5
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-muted bg-background'
                }
              `}
            >
              {/* Check indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}

              {/* Icon */}
              <span className="text-4xl mb-2">{species.icon}</span>

              {/* Name */}
              <span className="font-semibold text-sm">{t(species.nameKey)}</span>

              {/* Description */}
              <span className="text-xs text-muted-foreground mt-1">
                {t(species.descKey)}
              </span>
            </button>
          )
        })}
      </div>

      {data.species.length === 0 && (
        <p className="text-center text-sm text-amber-600 dark:text-amber-400">
          {t('selectAtLeast')}
        </p>
      )}

      {data.species.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300">
            <strong>
              {data.species.length > 1
                ? t('speciesSelectedPlural', { count: data.species.length })
                : t('speciesSelected', { count: data.species.length })}
            </strong>
            <br />
            {t('canModifyLater')}
          </p>
        </div>
      )}
    </div>
  )
}
