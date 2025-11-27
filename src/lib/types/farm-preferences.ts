/**
 * Types pour les préférences fermier (Configuration)
 */

export interface AlertSettings {
  vaccinationReminders: boolean
  treatmentOverdue: boolean
  withdrawalPeriod: boolean
  missingWeights: boolean
  pendingMovements: boolean
  expiredDocuments: boolean
}

export interface WarningException {
  productId: string
  speciesId: string
  createdAt: string
}

export interface FarmPreferences {
  id: string
  farmId: string

  // Données sélectionnées par le fermier
  selectedBreeds: string[]
  selectedVeterinarians: string[]
  selectedVaccines: string[]
  selectedMedications: string[]

  // Favoris (max 5 par catégorie)
  favorites: {
    breeds: string[]
    veterinarians: string[]
    vaccines: string[]
    medications: string[]
  }

  // Exceptions de warning (ne plus afficher)
  warningExceptions: WarningException[]

  // Configuration des alertes
  alertSettings: AlertSettings

  createdAt: string
  updatedAt: string
}

export interface CreateFarmPreferencesDto {
  farmId: string
  selectedBreeds?: string[]
  selectedVeterinarians?: string[]
  selectedVaccines?: string[]
  selectedMedications?: string[]
  alertSettings?: Partial<AlertSettings>
}

export interface UpdateFarmPreferencesDto {
  selectedBreeds?: string[]
  selectedVeterinarians?: string[]
  selectedVaccines?: string[]
  selectedMedications?: string[]
  favorites?: {
    breeds?: string[]
    veterinarians?: string[]
    vaccines?: string[]
    medications?: string[]
  }
  warningExceptions?: WarningException[]
  alertSettings?: Partial<AlertSettings>
}

// Valeurs par défaut pour les alertes
export const defaultAlertSettings: AlertSettings = {
  vaccinationReminders: true,
  treatmentOverdue: true,
  withdrawalPeriod: true,
  missingWeights: false,
  pendingMovements: true,
  expiredDocuments: false,
}
