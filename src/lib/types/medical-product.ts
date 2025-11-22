/**
 * Types pour les produits médicaux (Medical Products)
 */

import { ApiResource } from '@/lib/types/api';

export interface MedicalProduct extends ApiResource {
  id: string;
  farmId: string;
  name: string;
  commercialName?: string;
  category: string;
  activeIngredient?: string;
  manufacturer?: string;
  dosage?: number;
  withdrawalPeriodMeat: number; // en jours
  withdrawalPeriodMilk: number; // en jours
  currentStock?: number;
  minStock?: number;
  stockUnit: string;
  unitPrice?: number;
  type?: string;
  targetSpecies?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalProductDto {
  name: string;
  commercialName?: string;
  category: string;
  activeIngredient?: string;
  manufacturer?: string;
  dosage?: number;
  withdrawalPeriodMeat: number;
  withdrawalPeriodMilk: number;
  currentStock?: number;
  minStock?: number;
  stockUnit: string;
  unitPrice?: number;
  type?: string;
  targetSpecies?: string;
  isActive?: boolean;
}

export interface UpdateMedicalProductDto {
  name?: string;
  commercialName?: string;
  category?: string;
  activeIngredient?: string;
  manufacturer?: string;
  dosage?: number;
  withdrawalPeriodMeat?: number;
  withdrawalPeriodMilk?: number;
  currentStock?: number;
  minStock?: number;
  stockUnit?: string;
  unitPrice?: number;
  type?: string;
  targetSpecies?: string;
  isActive?: boolean;
}
