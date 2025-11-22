/**
 * Types pour les races d'animaux (données de référence avec CRUD Admin)
 */

export interface Breed {
  id: string
  name: string
  nameFr: string
  nameEn: string
  nameAr: string
  speciesId: string
  description?: string | null
  displayOrder?: number
  isActive?: boolean
}

export interface CreateBreedDto {
  id: string
  speciesId: string
  nameFr: string
  nameEn: string
  nameAr: string
  description?: string
  displayOrder?: number
  isActive?: boolean
}

export interface UpdateBreedDto {
  speciesId?: string
  nameFr?: string
  nameEn?: string
  nameAr?: string
  description?: string
  displayOrder?: number
  isActive?: boolean
}
