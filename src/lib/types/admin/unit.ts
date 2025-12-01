import type { BaseEntity } from '@/lib/types/common/api'

/**
 * Type d'unité de mesure
 *
 * ✅ RÈGLE #1 : Enum TypeScript (pas de valeurs en dur dans l'UI)
 */
export enum UnitType {
  WEIGHT = 'WEIGHT',
  VOLUME = 'VOLUME',
  CONCENTRATION = 'CONCENTRATION',
}

/**
 * Entité Unité de Mesure
 *
 * ✅ RÈGLE #4 : Étend BaseEntity
 *
 * @example
 * ```typescript
 * const unit: Unit = {
 *   id: 'uuid-1',
 *   code: 'MG',
 *   name: 'Milligramme',
 *   symbol: 'mg',
 *   type: UnitType.WEIGHT,
 *   isActive: true,
 *   version: 1,
 *   createdAt: '2025-11-30T10:00:00.000Z',
 *   updatedAt: '2025-11-30T10:00:00.000Z',
 * }
 * ```
 */
export interface Unit extends BaseEntity {
  /** Code unique (ex: "MG", "ML", "KG") */
  code: string

  /** Nom (ex: "Milligramme", "Millilitre") */
  name: string

  /** Symbole (ex: "mg", "ml", "kg") */
  symbol: string

  /** Type d'unité */
  type: UnitType

  // Hérite de BaseEntity:
  // - id: string
  // - createdAt: string
  // - updatedAt: string
  // - deletedAt?: string
  // - version: number
  // - isActive: boolean
}

/**
 * DTO pour création d'unité
 *
 * ✅ RÈGLE #4 : Omit<Unit, BaseEntity fields>
 */
export interface CreateUnitDto {
  /** Code unique (ex: "MG", "ML", "KG") */
  code: string

  /** Nom (ex: "Milligramme", "Millilitre") */
  name: string

  /** Symbole (ex: "mg", "ml", "kg") */
  symbol: string

  /** Type d'unité */
  type: UnitType

  /** Statut actif/inactif (optionnel, défaut: true) */
  isActive?: boolean
}

/**
 * DTO pour mise à jour d'unité
 *
 * ✅ RÈGLE #4 : Partial + version obligatoire (optimistic locking)
 */
export interface UpdateUnitDto {
  /** Code unique (optionnel en update) */
  code?: string

  /** Nom (optionnel en update) */
  name?: string

  /** Symbole (optionnel en update) */
  symbol?: string

  /** Type d'unité (optionnel en update) */
  type?: UnitType

  /** Statut actif/inactif (optionnel en update) */
  isActive?: boolean

  /** Version pour optimistic locking (obligatoire) */
  version: number
}
