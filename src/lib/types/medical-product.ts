/**
 * Types pour les produits médicaux (medical products)
 * Système Master Table avec scope global/local
 */

export type MedicalProductCategory =
  | 'antiparasitic'
  | 'antibiotic'
  | 'anti_inflammatory'
  | 'vitamin_mineral'
  | 'hormone'
  | 'antiseptic'
  | 'other';

export type MedicalProductScope = 'global' | 'local';

export interface MedicalProduct {
  id: string;
  farmId?: string; // NULL pour scope=global
  scope: MedicalProductScope;

  // Noms multilingues (pattern i18n)
  nameFr: string;
  nameEn?: string;
  nameAr?: string;

  commercialName?: string;
  code?: string;
  description?: string;
  category?: MedicalProductCategory;
  activeIngredient?: string; // Principe actif
  manufacturer?: string; // Laboratoire

  // Délais d'attente (withdrawal periods)
  withdrawalPeriodMeat?: number; // jours
  withdrawalPeriodMilk?: number; // jours

  // Gestion de stock
  currentStock?: number;
  minStock?: number;
  stockUnit?: string; // ml, flacon, comprimé, etc.
  unitPrice?: number;

  // Informations du lot
  batchNumber?: string;
  expiryDate?: string; // ISO 8601

  type?: string; // treatment, prevention, etc.
  targetSpecies?: string; // bovine, ovine, etc.
  isActive: boolean;

  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalProductDto {
  nameFr: string;
  nameEn?: string;
  nameAr?: string;
  commercialName?: string;
  code?: string;
  description?: string;
  category?: MedicalProductCategory;
  activeIngredient?: string;
  manufacturer?: string;
  withdrawalPeriodMeat?: number;
  withdrawalPeriodMilk?: number;
  currentStock?: number;
  minStock?: number;
  stockUnit?: string;
  unitPrice?: number;
  batchNumber?: string;
  expiryDate?: string;
  type?: string;
  targetSpecies?: string;
  isActive?: boolean;
}

export interface UpdateMedicalProductDto {
  nameFr?: string;
  nameEn?: string;
  nameAr?: string;
  commercialName?: string;
  code?: string;
  description?: string;
  category?: MedicalProductCategory;
  activeIngredient?: string;
  manufacturer?: string;
  withdrawalPeriodMeat?: number;
  withdrawalPeriodMilk?: number;
  currentStock?: number;
  minStock?: number;
  stockUnit?: string;
  unitPrice?: number;
  batchNumber?: string;
  expiryDate?: string;
  type?: string;
  targetSpecies?: string;
  isActive?: boolean;
}

export interface MedicalProductFilters {
  search?: string;
  scope?: MedicalProductScope | 'all';
  category?: MedicalProductCategory;
  isActive?: boolean;
}

export const MEDICAL_PRODUCT_CATEGORY_LABELS: Record<MedicalProductCategory, string> = {
  antiparasitic: 'Antiparasitaire',
  antibiotic: 'Antibiotique',
  anti_inflammatory: 'Anti-inflammatoire',
  vitamin_mineral: 'Vitamine/Minéral',
  hormone: 'Hormone',
  antiseptic: 'Antiseptique',
  other: 'Autre',
};

export const MEDICAL_PRODUCT_SCOPE_LABELS: Record<MedicalProductScope, string> = {
  global: 'Global',
  local: 'Local (Ferme)',
};
