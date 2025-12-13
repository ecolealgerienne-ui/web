import type { BaseEntity } from '../common/api'

/**
 * Substance active simplifiée (inline)
 */
export interface ProductActiveSubstance {
  id: string
  code: string
  name: string
  description?: string
}

/**
 * Produit vétérinaire (médicament)
 *
 * ✅ RÈGLE #4 : Étend BaseEntity (Phase 1)
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

  /** Liste des substances actives (simplifié) */
  activeSubstances?: ProductActiveSubstance[]

  /** Composition en texte libre */
  composition?: string

  /** Catégorie (simplifié - string au lieu de FK) */
  category?: string

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

  /** Délai d'attente viande (jours) */
  withdrawalMeatDays?: number

  /** Délai d'attente lait (heures) */
  withdrawalMilkHours?: number
}

/**
 * DTO pour créer un nouveau produit
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

  /** Composition (texte libre) */
  composition?: string

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

  /** Composition (texte libre) */
  composition?: string

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
