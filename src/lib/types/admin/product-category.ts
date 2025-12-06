import type { BaseEntity } from '@/lib/types/common/api'

/**
 * Catégorie de produit vétérinaire
 *
 * ✅ RÈGLE #4 : Étend BaseEntity (Phase 1)
 *
 * Utilisée pour classifier les produits vétérinaires par type thérapeutique.
 * Exemples : Antibiotiques, Anti-inflammatoires, Antiparasitaires, etc.
 *
 * @example
 * ```typescript
 * const category: ProductCategory = {
 *   id: 'uuid',
 *   code: 'ANTIB',
 *   name: 'Antibiotiques',
 *   description: 'Médicaments pour traiter les infections bactériennes',
 *   isActive: true,
 *   version: 1,
 *   createdAt: '2024-01-01T00:00:00Z',
 *   updatedAt: '2024-01-01T00:00:00Z',
 *   deletedAt: null
 * }
 * ```
 */
export interface ProductCategory extends BaseEntity {
  /**
   * Code unique de la catégorie (majuscules, chiffres, tirets, underscores)
   * @example "ANTIB", "ANTINF", "ANTIPAR"
   */
  code: string

  /**
   * Nom de la catégorie en français
   * @example "Antibiotiques", "Anti-inflammatoires", "Antiparasitaires"
   */
  nameFr: string

  /**
   * Nom de la catégorie en anglais
   */
  nameEn?: string

  /**
   * Nom de la catégorie en arabe
   */
  nameAr?: string

  /**
   * Description optionnelle de la catégorie
   * @example "Médicaments destinés à combattre les infections bactériennes"
   */
  description?: string | null

  /**
   * Ordre d'affichage
   */
  displayOrder?: number

  // Hérité de BaseEntity :
  // - id: string
  // - createdAt?: string
  // - updatedAt?: string
  // - deletedAt?: string | null
  // - version?: number
  // - isActive?: boolean
}

/**
 * DTO pour création d'une catégorie de produit
 *
 * Version minimale sans les champs auto-générés (id, dates, version)
 */
export interface CreateProductCategoryDto {
  /** Code unique (requis) */
  code: string

  /** Nom de la catégorie (requis) */
  name: string

  /** Description (optionnel) */
  description?: string

  /** Statut actif/inactif (défaut: true) */
  isActive?: boolean
}

/**
 * DTO pour mise à jour d'une catégorie de produit
 *
 * ✅ RÈGLE #4 : version obligatoire pour optimistic locking
 *
 * Tous les champs sont optionnels sauf `version` qui est requis
 * pour gérer les conflits de version (optimistic locking)
 */
export interface UpdateProductCategoryDto {
  /** Code unique (optionnel) */
  code?: string

  /** Nom de la catégorie (optionnel) */
  name?: string

  /** Description (optionnel) */
  description?: string

  /** Statut actif/inactif (optionnel) */
  isActive?: boolean

  /**
   * Version actuelle (OBLIGATOIRE pour optimistic locking)
   * Si la version ne correspond pas, l'API retourne 409 Conflict
   */
  version: number
}
