import type { BaseEntity } from '../common/api'
import type { ActiveSubstance } from './active-substance'

/**
 * Produit vétérinaire (médicament)
 *
 * Un produit contient une ou plusieurs substances actives et représente
 * un médicament vétérinaire commercialisé.
 *
 * ✅ RÈGLE #4 : Étend BaseEntity (Phase 1)
 *
 * @example
 * ```typescript
 * const product: Product = {
 *   id: '123',
 *   code: 'AMOX-500-INJ',
 *   commercialName: 'Amoxival 500',
 *   laboratoryName: 'Virbac',
 *   therapeuticForm: 'injectable',
 *   dosage: '500mg/ml',
 *   packaging: 'Flacon 100ml',
 *   activeSubstances: [{ id: '1', code: 'AMOX', name: 'Amoxicilline', ... }],
 *   isVeterinaryPrescriptionRequired: true,
 *   isActive: true,
 *   version: 1,
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * }
 * ```
 */
export interface Product extends BaseEntity {
  /** Code produit unique (ex: AMOX-500-INJ) */
  code: string

  /** Nom commercial du produit */
  commercialName: string

  /** Nom du laboratoire pharmaceutique */
  laboratoryName: string

  /** Forme thérapeutique (injectable, oral, topique, etc.) */
  therapeuticForm: string

  /** Dosage (ex: 500mg/ml, 10%, etc.) */
  dosage: string

  /** Conditionnement (ex: Flacon 100ml, Boîte 20 comprimés) */
  packaging: string

  /** Liste des substances actives (relation many-to-many) */
  activeSubstances: ActiveSubstance[]

  /** ID de la catégorie (ex: Antibiotiques, Antiparasitaires) */
  categoryId?: string

  /** Catégorie avec détails */
  category?: {
    id: string
    code: string
    name: string
  }

  /** Description détaillée du produit */
  description?: string

  /** Instructions d'utilisation */
  usageInstructions?: string

  /** Contre-indications */
  contraindications?: string

  /** Conditions de stockage */
  storageConditions?: string

  /** Prescription vétérinaire obligatoire */
  isVeterinaryPrescriptionRequired: boolean
}

/**
 * DTO pour créer un nouveau produit
 *
 * ⚠️ Utilise activeSubstanceIds au lieu de activeSubstances[]
 * car on envoie seulement les IDs au backend
 */
export interface CreateProductDto {
  /** Code produit unique */
  code: string

  /** Nom commercial */
  commercialName: string

  /** Laboratoire */
  laboratoryName: string

  /** Forme thérapeutique */
  therapeuticForm: string

  /** Dosage */
  dosage: string

  /** Conditionnement */
  packaging: string

  /** IDs des substances actives */
  activeSubstanceIds: string[]

  /** Description (optionnel) */
  description?: string

  /** Instructions (optionnel) */
  usageInstructions?: string

  /** Contre-indications (optionnel) */
  contraindications?: string

  /** Stockage (optionnel) */
  storageConditions?: string

  /** Prescription obligatoire */
  isVeterinaryPrescriptionRequired?: boolean

  /** Actif (défaut: true) */
  isActive?: boolean
}

/**
 * DTO pour mettre à jour un produit
 *
 * ✅ RÈGLE #4 : Inclut version pour optimistic locking
 */
export interface UpdateProductDto {
  /** Code produit */
  code?: string

  /** Nom commercial */
  commercialName?: string

  /** Laboratoire */
  laboratoryName?: string

  /** Forme thérapeutique */
  therapeuticForm?: string

  /** Dosage */
  dosage?: string

  /** Conditionnement */
  packaging?: string

  /** IDs des substances actives */
  activeSubstanceIds?: string[]

  /** Description */
  description?: string

  /** Instructions */
  usageInstructions?: string

  /** Contre-indications */
  contraindications?: string

  /** Stockage */
  storageConditions?: string

  /** Prescription obligatoire */
  isVeterinaryPrescriptionRequired?: boolean

  /** Actif */
  isActive?: boolean

  /**
   * Version pour optimistic locking (obligatoire)
   * Le backend retourne 409 Conflict si mismatch
   */
  version: number
}

/**
 * Filtres de recherche pour les produits
 */
export interface ProductFilters {
  /** Recherche dans code, nom commercial, laboratoire */
  search?: string

  /** Filtrer par laboratoire */
  laboratoryName?: string

  /** Filtrer par forme thérapeutique */
  therapeuticForm?: string

  /** Filtrer par substance active (ID) */
  activeSubstanceId?: string

  /** Prescription requise uniquement */
  prescriptionRequired?: boolean

  /** Inclure les inactifs */
  includeInactive?: boolean
}
