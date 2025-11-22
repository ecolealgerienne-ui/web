/**
 * Types pour les races d'animaux (données de référence READ ONLY)
 */

export interface Breed {
  id: string
  name: string
  nameFr: string
  nameEn: string
  nameAr: string
  speciesId: string
  description?: string
}
