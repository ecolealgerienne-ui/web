// Types pour les pesées basés sur les specs backend

export type WeighingPurpose = 'routine' | 'medical' | 'sale' | 'growth_monitoring' | 'other';
export type WeightUnit = 'kg' | 'lbs';

export interface Weighing {
  id: string;
  farmId: string;
  animalId: string;

  // Données de pesée
  weight: number;
  unit: WeightUnit;
  weighingDate: string;
  weighingTime?: string;

  // Contexte
  purpose: WeighingPurpose;
  method?: string; // balance électronique, bascule, ruban
  location?: string;

  // Suivi de croissance
  previousWeight?: number;
  weightGain?: number; // kg
  growthRate?: number; // kg/jour
  age?: number; // jours

  // Métadonnées
  recordedBy?: string;
  notes?: string;
  conditions?: string; // à jeun, après repas, etc.

  // Traçabilité
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface WeighingWithDetails extends Weighing {
  animalDetails?: {
    id: string;
    visualId?: string;
    currentEid?: string;
    speciesId?: string;
    birthDate?: string;
  };
}

export interface WeighingFilters {
  search: string;
  purpose: WeighingPurpose | 'all';
  dateFrom?: string;
  dateTo?: string;
  minWeight?: number;
  maxWeight?: number;
  animalId?: string;
  source?: string;
}

export const WEIGHING_PURPOSE_LABELS: Record<WeighingPurpose, string> = {
  routine: 'Routine',
  medical: 'Médical',
  sale: 'Vente',
  growth_monitoring: 'Suivi croissance',
  other: 'Autre',
};

export interface CreateWeighingDto {
  animalId: string;
  weight: number;
  unit?: WeightUnit;
  weighingDate: string;
  weighingTime?: string;
  purpose: WeighingPurpose;
  method?: string;
  location?: string;
  recordedBy?: string;
  notes?: string;
  conditions?: string;
}

export interface UpdateWeighingDto {
  animalId?: string;
  weight?: number;
  unit?: WeightUnit;
  weighingDate?: string;
  weighingTime?: string;
  purpose?: WeighingPurpose;
  method?: string;
  location?: string;
  recordedBy?: string;
  notes?: string;
  conditions?: string;
}
