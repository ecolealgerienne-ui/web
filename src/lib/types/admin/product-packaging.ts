import type { BaseEntity } from '@/lib/types/common/api'
import type { Product } from './product'
import type { Unit } from './unit'

/**
 * Conditionnement de produit (Product Packaging)
 *
 * Représente un conditionnement spécifique d'un produit vétérinaire
 * dans un pays donné, avec son code GTIN/EAN et numéro AMM.
 *
 * ✅ RÈGLE #4 : Étend BaseEntity (Phase 1)
 * Pattern: Scoped Reference Data (Scope: Product)
 *
 * @example
 * ```typescript
 * const packaging: ProductPackaging = {
 *   id: '123',
 *   productId: 'prod-456',
 *   packagingLabel: 'Flacon 100ml',
 *   countryCode: 'DZ',
 *   gtinEan: '3760123456789',
 *   numeroAMM: 'DZ/VET/2023/001',
 *   concentration: '500mg/ml',
 *   unitId: 'unit-789',
 *   isActive: true,
 *   version: 1,
 *   createdAt: '2025-12-02T10:00:00.000Z',
 *   updatedAt: '2025-12-02T10:00:00.000Z',
 * }
 * ```
 */
export interface ProductPackaging extends BaseEntity {
  /** ID du produit (foreign key) */
  productId: string

  /** Label du conditionnement (ex: "Flacon 100ml", "Boîte 20 comprimés") */
  packagingLabel: string

  /** Code pays ISO (ex: "DZ", "FR", "MA") */
  countryCode: string

  /** Code GTIN/EAN (code barre international) */
  gtinEan?: string | null

  /** Numéro d'Autorisation de Mise sur le Marché */
  numeroAMM?: string | null

  /** Concentration du produit dans ce conditionnement */
  concentration?: string | null

  /** ID de l'unité de mesure (foreign key, optionnel) */
  unitId?: string | null

  /** Description additionnelle du conditionnement */
  description?: string | null

  /** Ordre d'affichage dans les listes */
  displayOrder?: number | null

  /** Relation : Produit associé */
  product?: Product

  /** Relation : Unité de mesure */
  unit?: Unit

  // Hérite de BaseEntity:
  // - id: string
  // - createdAt: string
  // - updatedAt: string
  // - deletedAt?: string | null
  // - version: number
  // - isActive: boolean
}

/**
 * DTO pour créer un nouveau conditionnement
 *
 * ✅ RÈGLE #4 : Omit<ProductPackaging, BaseEntity fields + relations>
 */
export interface CreateProductPackagingDto {
  /** ID du produit (obligatoire) */
  productId: string

  /** Label du conditionnement (obligatoire) */
  packagingLabel: string

  /** Code pays (obligatoire) */
  countryCode: string

  /** Code GTIN/EAN (optionnel) */
  gtinEan?: string

  /** Numéro AMM (optionnel) */
  numeroAMM?: string

  /** Concentration (optionnel) */
  concentration?: string

  /** ID de l'unité (optionnel) */
  unitId?: string

  /** Description (optionnel) */
  description?: string

  /** Ordre d'affichage (optionnel) */
  displayOrder?: number

  /** Statut actif/inactif (optionnel, défaut: true) */
  isActive?: boolean
}

/**
 * DTO pour mettre à jour un conditionnement
 *
 * ✅ RÈGLE #4 : Partial + version obligatoire (optimistic locking)
 */
export interface UpdateProductPackagingDto {
  /** ID du produit (optionnel en update) */
  productId?: string

  /** Label du conditionnement (optionnel en update) */
  packagingLabel?: string

  /** Code pays (optionnel en update) */
  countryCode?: string

  /** Code GTIN/EAN (optionnel en update) */
  gtinEan?: string

  /** Numéro AMM (optionnel en update) */
  numeroAMM?: string

  /** Concentration (optionnel en update) */
  concentration?: string

  /** ID de l'unité (optionnel en update) */
  unitId?: string

  /** Description (optionnel en update) */
  description?: string

  /** Ordre d'affichage (optionnel en update) */
  displayOrder?: number

  /** Statut actif/inactif (optionnel en update) */
  isActive?: boolean

  /**
   * Version pour optimistic locking (obligatoire)
   * Le backend retourne 409 Conflict si mismatch
   */
  version: number
}
