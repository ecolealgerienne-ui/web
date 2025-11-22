/**
 * Types pour les préférences de ferme (singleton par ferme)
 */

export interface FarmPreference {
  id: string
  farmId: string
  defaultVeterinarianId?: string
  defaultSpeciesId?: string
  defaultBreedId?: string
  weightUnit: string
  currency: string
  language: string
  dateFormat: string
  enableNotifications: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UpdateFarmPreferenceDto {
  defaultVeterinarianId?: string
  defaultSpeciesId?: string
  defaultBreedId?: string
  weightUnit?: string
  currency?: string
  language?: string
  dateFormat?: string
  enableNotifications?: boolean
}
