/**
 * Types pour les traitements basés sur le schéma API
 * Endpoint: GET/POST/PUT /api/v1/farms/{farmId}/treatments
 */

export type TreatmentType = 'treatment' | 'vaccination';
export type TreatmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Treatment {
  id: string;
  farmId: string;
  type: TreatmentType;

  // Animal
  animalId: string;
  animalWeightKg?: number | null;
  animal?: {
    id: string;
    visualId?: string | null;
    currentEid?: string | null;
    officialNumber?: string | null;
  };

  // Produit
  packagingId?: string | null;
  productId?: string | null;
  indicationId?: string | null;
  routeId?: string | null;
  productName?: string | null;
  product?: {
    id: string;
    name: string;
  } | null;

  // Lot
  farmerLotId?: string | null;
  farmerLot?: {
    id: string;
    name: string;
  } | null;

  // Dates
  treatmentDate: string;
  withdrawalEndDate?: string | null;
  nextDueDate?: string | null;

  // Dosage
  quantityAdministered?: number | null;
  quantityUnitId?: string | null;
  dose?: number | null;
  dosage?: string | null;
  dosageUnit?: string | null;
  computedDoseMgPerKg?: number | null;

  // Délais d'attente calculés
  computedWithdrawalMeatDate?: string | null;
  computedWithdrawalMilkDate?: string | null;

  // Vétérinaire
  veterinarianId?: string | null;
  veterinarianName?: string | null;
  veterinarian?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;

  // Diagnostic et traitement
  diagnosis?: string | null;
  duration?: number | null;
  targetDisease?: string | null;

  // Vaccination spécifique
  vaccinationType?: string | null;
  protocolStep?: number | null;
  campaignId?: string | null;

  // Statut et coût
  status: TreatmentStatus;
  cost?: number | null;
  notes?: string | null;

  // Métadonnées
  version: number;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentFilters {
  search?: string;
  type?: TreatmentType | 'all';
  status?: TreatmentStatus | 'all';
  animalId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateTreatmentDto {
  type: TreatmentType;
  animalId: string;
  treatmentDate: string;

  // Optionnels
  animalWeightKg?: number;
  packagingId?: string;
  productId?: string;
  indicationId?: string;
  routeId?: string;
  productName?: string;
  farmerLotId?: string;

  quantityAdministered?: number;
  quantityUnitId?: string;
  dose?: number;
  dosage?: string;
  dosageUnit?: string;

  withdrawalEndDate?: string;
  veterinarianId?: string;
  veterinarianName?: string;
  diagnosis?: string;
  duration?: number;
  targetDisease?: string;

  vaccinationType?: string;
  protocolStep?: number;
  campaignId?: string;

  status?: TreatmentStatus;
  cost?: number;
  notes?: string;
}

export interface UpdateTreatmentDto {
  type?: TreatmentType;
  animalId?: string;
  treatmentDate?: string;

  animalWeightKg?: number;
  packagingId?: string;
  productId?: string;
  indicationId?: string;
  routeId?: string;
  productName?: string;
  farmerLotId?: string;

  quantityAdministered?: number;
  quantityUnitId?: string;
  dose?: number;
  dosage?: string;
  dosageUnit?: string;

  withdrawalEndDate?: string;
  veterinarianId?: string;
  veterinarianName?: string;
  diagnosis?: string;
  duration?: number;
  targetDisease?: string;

  vaccinationType?: string;
  protocolStep?: number;
  campaignId?: string;

  status?: TreatmentStatus;
  cost?: number;
  notes?: string;

  version?: number;
}
