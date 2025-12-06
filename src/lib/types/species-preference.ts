/**
 * Types pour les préférences d'espèces par ferme
 */

/**
 * Structure de l'espèce retournée par l'API dans les préférences
 * (différente du type Species admin)
 */
export interface ApiSpeciesInPreference {
  id: string
  nameFr: string
  nameEn?: string
  nameAr?: string
  icon?: string
}

export interface SpeciesPreference {
  id: string
  farmId: string
  speciesId: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  species: ApiSpeciesInPreference
}

export interface CreateSpeciesPreferenceDto {
  speciesId: string
  // Note: displayOrder et isActive sont gérés automatiquement par le backend
}

export interface UpdateSpeciesPreferenceDto {
  displayOrder?: number
  isActive?: boolean
}
