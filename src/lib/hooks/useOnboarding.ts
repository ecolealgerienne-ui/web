'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'

interface OnboardingState {
  isLoading: boolean
  needsOnboarding: boolean
  isConfigured: boolean
}

const ONBOARDING_COMPLETE_KEY = 'anitra_onboarding_complete'

export function useOnboarding(): OnboardingState {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [state, setState] = useState<OnboardingState>({
    isLoading: true,
    needsOnboarding: false,
    isConfigured: false,
  })

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user) {
      setState({
        isLoading: false,
        needsOnboarding: false,
        isConfigured: false,
      })
      return
    }

    // Vérifier si l'onboarding a déjà été complété (stocké localement pour le MVP)
    const onboardingComplete = localStorage.getItem(ONBOARDING_COMPLETE_KEY)

    // En production, vérifier user.isFirstLogin et farm.isConfigured depuis l'API
    const needsOnboarding = !onboardingComplete && (user.isFirstLogin !== false)

    setState({
      isLoading: false,
      needsOnboarding,
      isConfigured: !!onboardingComplete,
    })
  }, [user, isAuthenticated, authLoading])

  return state
}

// Fonction pour marquer l'onboarding comme terminé
export function completeOnboarding() {
  localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')
}

// Fonction pour réinitialiser l'onboarding (utile pour les tests)
export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_COMPLETE_KEY)
}
