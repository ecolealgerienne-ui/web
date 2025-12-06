/**
 * Types pour les préférences d'espèces par ferme
 */

import { Species } from './admin/species'

export interface SpeciesPreference {
  id: string
  farmId: string
  speciesId: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  species: Species
}

export interface CreateSpeciesPreferenceDto {
  speciesId: string
  displayOrder?: number
  isActive?: boolean
}

export interface UpdateSpeciesPreferenceDto {
  displayOrder?: number
  isActive?: boolean
}
