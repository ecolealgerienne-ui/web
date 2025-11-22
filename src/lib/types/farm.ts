/**
 * Types pour les fermes (gestion multi-tenant)
 */

export interface FarmStats {
  totalAnimals: number
  animalsBySpecies: Record<string, number>
  animalsByStatus: Record<string, number>
}

export interface Farm {
  id: string
  name: string
  location: string
  ownerId: string
  cheptelNumber?: string
  groupId?: string
  groupName?: string
  isDefault: boolean
  stats?: FarmStats
  createdAt?: string
  updatedAt?: string
}

export interface CreateFarmDto {
  id: string
  name: string
  location: string
  ownerId: string
  cheptelNumber?: string
  groupId?: string
  groupName?: string
  isDefault?: boolean
}

export interface UpdateFarmDto {
  name?: string
  location?: string
  cheptelNumber?: string
  groupId?: string
  groupName?: string
  isDefault?: boolean
}
