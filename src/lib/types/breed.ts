/**
 * Types pour la gestion des races d'animaux
 */

export interface Breed {
  id: string
  name: string
  species: 'sheep' | 'goat' | 'cattle'
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBreedDto {
  name: string
  species: 'sheep' | 'goat' | 'cattle'
  description?: string
}

export interface UpdateBreedDto extends Partial<CreateBreedDto> {}
