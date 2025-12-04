/**
 * Types pour les fermes (gestion multi-tenant)
 */

export interface FarmStats {
  totalAnimals: number
  animalsBySpecies: Record<string, number>
  animalsByStatus: Record<string, number>
}

export type Species = 'bovine' | 'ovine' | 'caprine' | 'poultry' | 'equine' | 'camelid'

export type CountryCode = 'FR' | 'DZ' | 'TN' | 'MA'

export interface Farm {
  id: string
  name: string
  address?: string
  postalCode?: string
  city?: string
  country?: CountryCode
  department?: string
  commune?: string
  latitude?: number
  longitude?: number
  location?: string
  ownerId: string
  cheptelNumber?: string
  groupId?: string
  groupName?: string
  isDefault: boolean
  isActive: boolean
  version: number
  // Legacy fields for compatibility
  region?: string
  species?: Species[]
  isConfigured?: boolean
  stats?: FarmStats
  createdAt?: string
  updatedAt?: string
}

export interface CreateFarmDto {
  id: string
  name: string
  address?: string
  postalCode?: string
  city?: string
  country?: CountryCode
  department?: string
  commune?: string
  latitude?: number
  longitude?: number
  location?: string
  ownerId: string
  cheptelNumber?: string
  groupId?: string
  groupName?: string
  isDefault?: boolean
  isActive?: boolean
}

export interface UpdateFarmDto {
  name?: string
  address?: string
  postalCode?: string
  city?: string
  country?: CountryCode
  department?: string
  commune?: string
  latitude?: number
  longitude?: number
  location?: string
  cheptelNumber?: string
  groupId?: string
  groupName?: string
  isDefault?: boolean
  isActive?: boolean
  version: number
}
