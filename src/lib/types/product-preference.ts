/**
 * Types pour les préférences de produits par ferme
 */

import type { FarmerProductLot } from './farmer-product-lot'

/**
 * Structure du produit retourné par l'API dans les préférences
 */
export interface ApiProductInPreference {
  id: string
  code: string
  commercialName: string
  laboratoryName?: string
  therapeuticForm?: string
  dosage?: string
  /** Catégorie en texte libre (simplifié) */
  category?: string
}

export interface ProductPreference {
  id: string
  farmId: string
  productId: string
  displayOrder: number
  isActive: boolean
  packagingId?: string
  userDefinedDose?: number
  userDefinedDoseUnit?: string
  userDefinedMeatWithdrawal?: number
  userDefinedMilkWithdrawal?: number
  createdAt: string
  updatedAt: string
  product: ApiProductInPreference
  /** Lots associés à cette préférence */
  farmerLots?: FarmerProductLot[]
}

export interface CreateProductPreferenceDto {
  productId: string
  // Note: displayOrder et isActive sont optionnels, gérés par le backend
}

export interface UpdateProductPreferenceDto {
  displayOrder?: number
  isActive?: boolean
  packagingId?: string
  userDefinedDose?: number
  userDefinedDoseUnit?: string
  userDefinedMeatWithdrawal?: number
  userDefinedMilkWithdrawal?: number
}
