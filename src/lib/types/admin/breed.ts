import type { BaseEntity } from '@/lib/types/common/api'

/**
 * Type complet d'une Race
 *
 * ✅ RÈGLE #2 : Étend BaseEntity pour id, createdAt, updatedAt, deletedAt, version
 * ✅ RÈGLE #1 : Aucune valeur en dur
 *
 * Pattern: Scoped Reference Data (Scope: Species)
 * Dépend de: Species (speciesId)
 * Dépendances: Animals, BreedCountries, FarmBreedPreferences
 */
export interface Breed extends BaseEntity {
  /**
   * Code unique de la race
   * Format: Majuscules, max 50 caractères
   * Exemple: "PER" (Persan), "SIA" (Siamois), "HOL" (Holstein)
   */
  code: string

  /**
   * Nom de la race en français
   * Requis, max 200 caractères
   */
  nameFr: string

  /**
   * Nom de la race en anglais
   * Requis, max 200 caractères
   */
  nameEn: string

  /**
   * Nom de la race en arabe (optionnel)
   * Max 200 caractères
   */
  nameAr?: string | null

  /**
   * Description de la race (optionnel)
   * Caractéristiques, origines, etc.
   */
  description?: string | null

  /**
   * ID de l'espèce (foreign key)
   * Requis - Une race appartient à une seule espèce
   */
  speciesId: string

  /**
   * Ordre d'affichage (optionnel)
   * Permet de trier les races dans les listes
   */
  displayOrder?: number | null

  /**
   * Statut actif/inactif
   * Par défaut: true
   */
  isActive: boolean

  /**
   * Relation vers l'espèce (optionnel, pour affichage)
   */
  species?: {
    id: string
    code: string
    name: string
  }
}

/**
 * DTO pour la création d'une race
 * Tous les champs requis sauf les optionnels
 */
export interface CreateBreedDto {
  code: string
  nameFr: string
  nameEn: string
  nameAr?: string
  description?: string
  speciesId: string
  displayOrder?: number
  isActive?: boolean
}

/**
 * DTO pour la mise à jour d'une race
 * Inclut le champ version pour optimistic locking
 */
export interface UpdateBreedDto extends CreateBreedDto {
  version: number
}
