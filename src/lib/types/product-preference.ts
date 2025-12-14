/**
 * Types pour les préférences de produits par ferme
 */

import type { FarmerProductLot } from './farmer-product-lot'

/**
 * Structure du produit retourné par l'API dans les préférences
 * Correspond au ProductResponseDto simplifié
 */
export interface ApiProductInPreference {
  id: string
  code: string | null
  nameFr: string
  commercialName: string | null
  manufacturer?: string | null
  therapeuticForm?: string | null
  dosage?: string | null
  composition?: string | null
  administrationRoute?: string | null
  targetSpecies?: string[]
  withdrawalMeatDays?: number | null
  withdrawalMilkHours?: number | null
  prescriptionRequired?: boolean
  categoryCode?: string | null
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
