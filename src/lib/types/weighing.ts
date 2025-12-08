// Types pour les pesées basés sur l'API backend

export type WeightSource = 'manual' | 'scale' | 'estimated' | 'automatic' | 'weighbridge';

export interface Weighing {
  id: string;
  farmId: string;
  animalId: string;

  // Données de pesée
  weight: number;
  weightDate: string;
  source?: WeightSource;
  notes?: string;

  // Suivi de croissance (calculé par l'API history)
  previousWeight?: number;
  weightGain?: number;
  dailyGain?: number; // kg/jour

  // Animal (inclus dans la réponse)
  animal?: {
    id: string;
    visualId?: string;
    officialNumber?: string;
    currentEid?: string;
  };

  // Traçabilité
  created_at?: string;
  updated_at?: string;
  version?: number;
}

export interface WeightHistory {
  id: string;
  animalId: string;
  weight: number;
  weightDate: string;
  source?: WeightSource;
  notes?: string;
  dailyGain?: number; // Calculé par l'API
}

export interface QueryWeightDto {
  animalId?: string;
  source?: WeightSource;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CreateWeightDto {
  id?: string;
  animalId: string;
  weight: number;
  weightDate: string;
  source?: WeightSource;
  notes?: string;
  farmId?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateWeightDto {
  animalId?: string;
  weight?: number;
  weightDate?: string;
  source?: WeightSource;
  notes?: string;
  version?: number;
  farmId?: string;
  created_at?: string;
  updated_at?: string;
}

export const WEIGHT_SOURCE_LABELS: Record<WeightSource, string> = {
  manual: 'Manuel',
  scale: 'Balance',
  estimated: 'Estimé',
  automatic: 'Automatique',
  weighbridge: 'Pont-bascule',
};

// Legacy aliases for compatibility
export type WeighingFilters = QueryWeightDto & { search?: string };
export type CreateWeighingDto = CreateWeightDto;
export type UpdateWeighingDto = UpdateWeightDto;
