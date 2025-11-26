'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { Species } from '@/lib/types/farm'
import { completeOnboarding } from '@/lib/hooks/useOnboarding'

export interface OnboardingData {
  // Étape 1: Identité & Région
  farmName: string
  country: string
  region: string
  // Étape 2: Production
  species: Species[]
  // Étape 3: Partenaires
  veterinarians: string[]
}

const initialData: OnboardingData = {
  farmName: '',
  country: '',
  region: '',
  species: [],
  veterinarians: [],
}

export default function OnboardingPage() {
  const router = useRouter()
  const [data, setData] = useState<OnboardingData>(initialData)

  const handleComplete = async (finalData: OnboardingData) => {
    // TODO: Envoyer les données au backend
    console.log('Onboarding completed:', finalData)

    // Marquer l'onboarding comme terminé
    completeOnboarding()

    // Rediriger vers le dashboard
    router.push('/dashboard')
  }

  const handleSkip = () => {
    // L'utilisateur peut passer l'onboarding mais devra le compléter plus tard
    router.push('/dashboard')
  }

  return (
    <OnboardingWizard
      data={data}
      onDataChange={setData}
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  )
}
