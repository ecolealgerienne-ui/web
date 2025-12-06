/**
 * Types pour les préférences de produits par ferme
 */

import { Product } from './admin/product'

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
  categoryId?: string
  category?: {
    id: string
    code: string
    name: string
  }
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
