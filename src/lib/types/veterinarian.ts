/**
 * Types pour les vétérinaires (données de référence avec CRUD)
 */

export interface Veterinarian {
  id: string
  farmId: string
  firstName: string
  lastName: string
  title?: string
  licenseNumber: string
  specialties?: string[] // Array in API response
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
  isActive: boolean
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
