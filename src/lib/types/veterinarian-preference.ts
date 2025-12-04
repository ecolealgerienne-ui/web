/**
 * Types pour les préférences de vétérinaires par ferme
 */

import { Veterinarian } from './veterinarian'

export interface VeterinarianPreference {
  id: string
  farmId: string
  veterinarianId: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  veterinarian: Veterinarian
}

export interface CreateVeterinarianPreferenceDto {
  veterinarianId: string
  displayOrder?: number
  isActive?: boolean
}

export interface UpdateVeterinarianPreferenceDto {
  displayOrder?: number
  isActive?: boolean
}

export interface VeterinarianPreferenceResponse {
  success: boolean
  data: VeterinarianPreference[]
}
