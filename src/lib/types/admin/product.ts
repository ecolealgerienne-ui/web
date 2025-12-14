import type { BaseEntity } from '../common/api'

/**
 * Type de produit vétérinaire
 */
export type ProductType =
  | 'antibiotic'
  | 'vaccine'
  | 'antiparasitic'
  | 'anti_inflammatory'
  | 'vitamin'
  | 'other'

/**
 * Scope du produit (global = catalogue ANMV, local = créé par la ferme)
 */
export type ProductScope = 'global' | 'local'

/**
 * Info catégorie simplifiée (incluse dans la réponse)
 */
export interface ProductCategoryInfo {
  id: string
  code: string
  nameFr: string
}

/**
 * Info substance active simplifiée (incluse dans la réponse)
 */
export interface ActiveSubstanceInfo {
  id: string
  code: string
  nameFr: string
}

/**
 * Produit vétérinaire (médicament)
 *
 * Correspond à ProductResponseDto du backend
 * ✅ RÈGLE #4 : Étend BaseEntity (Phase 1)
 */
export interface Product extends BaseEntity {
  /** Scope: global (ANMV) ou local (ferme) */
  scope: ProductScope

  /** ID de la ferme (null si global) */
  farmId: string | null

  /** Code produit (ex: amm_468) */
  code: string | null

  // === Identification ===
  /** Nom en français (principal) */
  nameFr: string

  /** Nom en anglais */
  nameEn: string | null

  /** Nom en arabe */
  nameAr: string | null

  /** Nom commercial */
  commercialName: string | null

  /** Description */
  description: string | null

  // === Classification ===
  /** Type de produit */
  type: ProductType | null

  /** ID catégorie */
  categoryId: string | null

  /** ID substance active principale */
  substanceId: string | null

  /** Code ATC vétérinaire */
  atcVetCode: string | null

  // === Données AMM enrichies ===
  /** Code catégorie simplifié (ex: "antibiotics") */
  categoryCode: string | null

  /** Composition / Substances actives (texte) */
  composition: string | null

  /** Forme thérapeutique (ex: "suspension injectable") */
  therapeuticForm: string | null

  /** Dosage (ex: "100 mg/ml") */
  dosage: string | null

  /** Voie d'administration (ex: "intramusculaire, sous-cutanée") */
  administrationRoute: string | null

  /** Espèces cibles */
  targetSpecies: string[]

  /** Délai d'attente viande (jours) */
  withdrawalMeatDays: number | null

  /** Délai d'attente lait (heures) */
  withdrawalMilkHours: number | null

  /** Prescription vétérinaire obligatoire */
  prescriptionRequired: boolean

  // === Fabrication ===
  /** Fabricant (ex: "VIRBAC") */
  manufacturer: string | null

  /** Forme (legacy - utiliser therapeuticForm) */
  form: string | null

  // === Vaccins ===
  /** Maladie ciblée (pour vaccins) */
  targetDisease: string | null

  /** Durée d'immunité en jours (pour vaccins) */
  immunityDurationDays: number | null

  // === Métadonnées ===
  /** Notes (contient lien RCP si disponible) */
  notes: string | null

  // === Relations incluses ===
  /** Catégorie (si incluse) */
  category?: ProductCategoryInfo | null

  /** Substance active (si incluse) */
  substance?: ActiveSubstanceInfo | null
}

/**
 * DTO pour créer un nouveau produit (local)
 */
export interface CreateProductDto {
  /** Nom en français */
  nameFr: string

  /** Nom commercial (optionnel) */
  commercialName?: string

  /** Type de produit */
  type?: ProductType

  /** Composition (texte libre) */
  composition?: string

  /** Forme thérapeutique */
  therapeuticForm?: string

  /** Dosage */
  dosage?: string

  /** Voie d'administration */
  administrationRoute?: string

  /** Espèces cibles */
  targetSpecies?: string[]

  /** Fabricant */
  manufacturer?: string

  /** Délai viande (jours) */
  withdrawalMeatDays?: number

  /** Délai lait (heures) */
  withdrawalMilkHours?: number

  /** Prescription obligatoire */
  prescriptionRequired?: boolean

  /** Description */
  description?: string

  /** Notes */
  notes?: string
}

/**
 * DTO pour mettre à jour un produit (local uniquement)
 *
 * ✅ RÈGLE #4 : Inclut version pour optimistic locking
 */
export interface UpdateProductDto {
  nameFr?: string
  commercialName?: string
  type?: ProductType
  composition?: string
  therapeuticForm?: string
  dosage?: string
  administrationRoute?: string
  targetSpecies?: string[]
  manufacturer?: string
  withdrawalMeatDays?: number
  withdrawalMilkHours?: number
  prescriptionRequired?: boolean
  description?: string
  notes?: string
  isActive?: boolean

  /** Version pour optimistic locking (obligatoire) */
  version: number
}

/**
 * Filtres de recherche pour les produits
 */
export interface ProductFilters {
  /** Recherche dans les noms */
  search?: string

  /** Filtrer par scope */
  scope?: 'global' | 'local' | 'all'

  /** Filtrer par type */
  type?: ProductType

  /** Filtrer par catégorie (ID) */
  categoryId?: string

  /** Filtrer vaccins uniquement */
  vaccinesOnly?: boolean

  /** Filtrer par statut actif */
  isActive?: boolean
}

// === Helpers pour la rétrocompatibilité ===

/**
 * Obtient le nom d'affichage d'un produit
 */
export function getProductDisplayName(product: Product): string {
  return product.commercialName || product.nameFr
}

/**
 * Obtient le nom du fabricant (alias pour manufacturer)
 */
export function getProductManufacturer(product: Product): string | null {
  return product.manufacturer
}
