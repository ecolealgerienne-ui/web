'use client'

import { useState, useEffect, useCallback } from 'react'
import { SmartSelectItem } from '@/components/ui/smart-select'

// Clé localStorage pour stocker les préférences
const PREFERENCES_KEY = 'anitra_farmer_preferences'

export interface FarmerPreferencesData {
  selectedVeterinarians: string[]
  selectedVaccines: string[]
  selectedMedications: string[]
  selectedBreeds: string[]
  favorites: {
    veterinarians: string[]
    vaccines: string[]
    medications: string[]
    breeds: string[]
  }
  usageCount: {
    veterinarians: Record<string, number>
    vaccines: Record<string, number>
    medications: Record<string, number>
    breeds: Record<string, number>
  }
  localItems: {
    veterinarians: SmartSelectItem[]
    vaccines: SmartSelectItem[]
    medications: SmartSelectItem[]
    breeds: SmartSelectItem[]
  }
}

const defaultPreferences: FarmerPreferencesData = {
  selectedVeterinarians: [],
  selectedVaccines: [],
  selectedMedications: [],
  selectedBreeds: [],
  favorites: {
    veterinarians: [],
    vaccines: [],
    medications: [],
    breeds: [],
  },
  usageCount: {
    veterinarians: {},
    vaccines: {},
    medications: {},
    breeds: {},
  },
  localItems: {
    veterinarians: [],
    vaccines: [],
    medications: [],
    breeds: [],
  },
}

type ItemCategory = 'veterinarians' | 'vaccines' | 'medications' | 'breeds'

export function useFarmerPreferences() {
  const [preferences, setPreferences] = useState<FarmerPreferencesData>(defaultPreferences)
  const [isLoaded, setIsLoaded] = useState(false)

  // Charger les préférences au montage
  useEffect(() => {
    const stored = localStorage.getItem(PREFERENCES_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setPreferences({ ...defaultPreferences, ...parsed })
      } catch (e) {
        console.error('Failed to parse preferences:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Sauvegarder les préférences
  const savePreferences = useCallback((newPrefs: FarmerPreferencesData) => {
    setPreferences(newPrefs)
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs))
  }, [])

  // Ajouter un favori
  const addFavorite = useCallback((category: ItemCategory, itemId: string) => {
    setPreferences((prev) => {
      const currentFavorites = prev.favorites[category]
      // Max 5 favoris par catégorie
      if (currentFavorites.length >= 5 || currentFavorites.includes(itemId)) {
        return prev
      }
      const newPrefs = {
        ...prev,
        favorites: {
          ...prev.favorites,
          [category]: [...currentFavorites, itemId],
        },
      }
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs))
      return newPrefs
    })
  }, [])

  // Supprimer un favori
  const removeFavorite = useCallback((category: ItemCategory, itemId: string) => {
    setPreferences((prev) => {
      const newPrefs = {
        ...prev,
        favorites: {
          ...prev.favorites,
          [category]: prev.favorites[category].filter((id) => id !== itemId),
        },
      }
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs))
      return newPrefs
    })
  }, [])

  // Toggle favori
  const toggleFavorite = useCallback((category: ItemCategory, itemId: string) => {
    setPreferences((prev) => {
      const isFavorite = prev.favorites[category].includes(itemId)
      if (isFavorite) {
        const newPrefs = {
          ...prev,
          favorites: {
            ...prev.favorites,
            [category]: prev.favorites[category].filter((id) => id !== itemId),
          },
        }
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs))
        return newPrefs
      } else {
        // Max 5 favoris
        if (prev.favorites[category].length >= 5) {
          return prev
        }
        const newPrefs = {
          ...prev,
          favorites: {
            ...prev.favorites,
            [category]: [...prev.favorites[category], itemId],
          },
        }
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs))
        return newPrefs
      }
    })
  }, [])

  // Incrémenter le compteur d'usage
  const incrementUsage = useCallback((category: ItemCategory, itemId: string) => {
    setPreferences((prev) => {
      const currentCount = prev.usageCount[category][itemId] || 0
      const newPrefs = {
        ...prev,
        usageCount: {
          ...prev.usageCount,
          [category]: {
            ...prev.usageCount[category],
            [itemId]: currentCount + 1,
          },
        },
      }
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs))
      return newPrefs
    })
  }, [])

  // Ajouter un item local
  const addLocalItem = useCallback((category: ItemCategory, item: SmartSelectItem) => {
    setPreferences((prev) => {
      const newPrefs = {
        ...prev,
        localItems: {
          ...prev.localItems,
          [category]: [...prev.localItems[category], { ...item, isLocal: true }],
        },
      }
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs))
      return newPrefs
    })
    return item
  }, [])

  // Vérifier si un item est favori
  const isFavorite = useCallback((category: ItemCategory, itemId: string) => {
    return preferences.favorites[category].includes(itemId)
  }, [preferences.favorites])

  // Obtenir le compteur d'usage
  const getUsageCount = useCallback((category: ItemCategory, itemId: string) => {
    return preferences.usageCount[category][itemId] || 0
  }, [preferences.usageCount])

  // Enrichir les items avec les données de favoris et usage
  const enrichItems = useCallback((category: ItemCategory, items: SmartSelectItem[]): SmartSelectItem[] => {
    // Combiner avec les items locaux
    const localItems = preferences.localItems[category] || []
    const allItems = [...items, ...localItems]

    return allItems.map((item) => ({
      ...item,
      isFavorite: preferences.favorites[category].includes(item.id),
      usageCount: preferences.usageCount[category][item.id] || 0,
    }))
  }, [preferences])

  return {
    preferences,
    isLoaded,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    incrementUsage,
    addLocalItem,
    isFavorite,
    getUsageCount,
    enrichItems,
    savePreferences,
  }
}
