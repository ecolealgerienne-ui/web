/**
 * Types pour les préférences de races par ferme
 */

/**
 * Structure de la race retournée par l'API dans les préférences
 */
export interface ApiBreedInPreference {
  id: string
  code: string
  nameFr: string
  nameEn?: string
  nameAr?: string
  speciesId: string
}

export interface BreedPreference {
  id: string
  farmId: string
  breedId: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  breed: ApiBreedInPreference
}

export interface CreateBreedPreferenceDto {
  breedId: string
  // Note: displayOrder et isActive sont gérés automatiquement par le backend
}

export interface UpdateBreedPreferenceDto {
  displayOrder?: number
  isActive?: boolean
}
