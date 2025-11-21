// Types pour les traitements basés sur les specs backend

export type TreatmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type TreatmentType = 'antibiotic' | 'antiparasitic' | 'anti_inflammatory' | 'vitamin' | 'other';
export type TreatmentTarget = 'individual' | 'lot';

export interface Treatment {
  id: string;
  farmId: string;

  // Cible
  animalId?: string;
  lotId?: string;
  targetType: TreatmentTarget;

  // Détails traitement
  productId?: string;
  productName: string;
  treatmentType: TreatmentType;
  manufacturer?: string;
  batchNumber?: string;

  // Administration
  reason: string;
  diagnosis?: string;
  dosage: string;
  administrationRoute?: string; // IM, SC, oral, IV, etc.
  frequency?: string; // Ex: "2x par jour"
  duration?: number; // Nombre de jours

  // Dates
  startDate: string;
  endDate?: string;
  administeredDate?: string;

  // Responsable
  administeredBy?: string;
  veterinarianId?: string;
  veterinarianName?: string;
  prescriptionNumber?: string;

  // Délai d'attente
  withdrawalPeriodMeat?: number; // Jours
  withdrawalPeriodMilk?: number; // Jours
  withdrawalEndDate?: string;

  // Statut
  status: TreatmentStatus;

  // Métadonnées
  notes?: string;
  adverseReactions?: string;
  effectiveness?: string;
  cost?: number;

  // Traçabilité
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface TreatmentWithDetails extends Treatment {
  // Animal ou Lot
  animalDetails?: {
    id: string;
    visualId?: string;
    currentEid?: string;
    speciesId?: string;
  };
  lotDetails?: {
    id: string;
    name: string;
    animalCount: number;
  };
}

export interface TreatmentFilters {
  search: string;
  status: TreatmentStatus | 'all';
  type: TreatmentType | 'all';
  targetType: TreatmentTarget | 'all';
  dateFrom?: string;
  dateTo?: string;
}

export const TREATMENT_STATUS_LABELS: Record<TreatmentStatus, string> = {
  scheduled: 'Programmé',
  in_progress: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export const TREATMENT_TYPE_LABELS: Record<TreatmentType, string> = {
  antibiotic: 'Antibiotique',
  antiparasitic: 'Antiparasitaire',
  anti_inflammatory: 'Anti-inflammatoire',
  vitamin: 'Vitamine/Complément',
  other: 'Autre',
};

export const TREATMENT_TARGET_LABELS: Record<TreatmentTarget, string> = {
  individual: 'Individuel',
  lot: 'Lot',
};
