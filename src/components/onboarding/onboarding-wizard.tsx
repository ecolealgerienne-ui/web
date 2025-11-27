'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { StepIdentity } from './steps/step-identity'
import { StepSpecies } from './steps/step-species'
import { StepVeterinarians } from './steps/step-veterinarians'
import { StepSummary } from './steps/step-summary'
import type { OnboardingData } from '@/app/onboarding/page'

interface OnboardingWizardProps {
  data: OnboardingData
  onDataChange: (data: OnboardingData) => void
  onComplete: (data: OnboardingData) => Promise<void>
  onSkip: () => void
}

type StepKey = 'identity' | 'species' | 'veterinarians' | 'summary'

const STEP_KEYS: StepKey[] = ['identity', 'species', 'veterinarians', 'summary']

export function OnboardingWizard({
  data,
  onDataChange,
  onComplete,
  onSkip,
}: OnboardingWizardProps) {
  const t = useTranslations('onboarding')
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return data.farmName.trim() !== '' && data.country !== '' && data.region !== ''
      case 2:
        return data.species.length > 0
      case 3:
        return true // Les vétérinaires sont optionnels
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < STEP_KEYS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      await onComplete(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepIdentity data={data} onDataChange={onDataChange} />
      case 2:
        return <StepSpecies data={data} onDataChange={onDataChange} />
      case 3:
        return <StepVeterinarians data={data} onDataChange={onDataChange} />
      case 4:
        return <StepSummary data={data} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">A</span>
          </div>
          <span className="font-semibold text-lg hidden sm:inline">AniTra</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4 me-1" />
          <span className="hidden sm:inline">{t('skipConfig')}</span>
        </Button>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {t('stepOf', { current: currentStep, total: STEP_KEYS.length })}
            </span>
            <span className="text-sm font-medium">
              {t(`steps.${STEP_KEYS[currentStep - 1]}`)}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / STEP_KEYS.length) * 100}%` }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-3">
            {STEP_KEYS.map((stepKey, index) => {
              const stepId = index + 1
              return (
                <div
                  key={stepKey}
                  className={`flex flex-col items-center ${
                    stepId <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      stepId < currentStep
                        ? 'bg-primary text-primary-foreground'
                        : stepId === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {stepId < currentStep ? '✓' : stepId}
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">{t(`steps.${stepKey}`)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-background rounded-xl shadow-lg border p-6 sm:p-8">
          {renderStep()}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="p-4 border-t bg-background/80 backdrop-blur">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            {t('navigation.previous')}
          </Button>

          {currentStep < STEP_KEYS.length ? (
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="gap-1"
            >
              {t('navigation.next')}
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="gap-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('configuring')}
                </>
              ) : (
                <>
                  {t('step4.launchApp')}
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </>
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
