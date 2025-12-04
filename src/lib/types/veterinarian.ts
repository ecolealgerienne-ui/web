/**
 * Types pour les vétérinaires (données de référence avec CRUD)
 */

export type VeterinarianScope = 'global' | 'local'

export interface Veterinarian {
  id: string
  scope: VeterinarianScope
  farmId: string
  firstName: string
  lastName: string
  title?: string
  licenseNumber: string
  specialties: string
  clinic?: string
  department?: string
  commune?: string
  phone: string
  mobile?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  isAvailable?: boolean
  emergencyService?: boolean
  workingHours?: string
  consultationFee?: number
  emergencyFee?: number
  currency?: string
  notes?: string
  isPreferred?: boolean
  isDefault?: boolean
  rating?: number
  totalInterventions?: number
  lastInterventionDate?: string
  isActive: boolean
  version?: number
  deletedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateVeterinarianDto {
  firstName: string
  lastName: string
  title?: string
  licenseNumber: string
  specialties: string
  clinic?: string
  phone: string
  mobile?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  isAvailable?: boolean
  emergencyService?: boolean
  workingHours?: string
  consultationFee?: number
  emergencyFee?: number
  currency?: string
  isPreferred?: boolean
  isDefault?: boolean
  isActive?: boolean
}

export interface UpdateVeterinarianDto {
  firstName?: string
  lastName?: string
  title?: string
  licenseNumber?: string
  specialties?: string
  clinic?: string
  phone?: string
  mobile?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  isAvailable?: boolean
  emergencyService?: boolean
  workingHours?: string
  consultationFee?: number
  emergencyFee?: number
  currency?: string
  isPreferred?: boolean
  isDefault?: boolean
  isActive?: boolean
}
