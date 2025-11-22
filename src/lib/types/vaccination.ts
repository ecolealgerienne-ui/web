// Types pour les vaccinations basés sur les specs backend

export type VaccinationStatus = 'scheduled' | 'completed' | 'overdue' | 'cancelled';
export type VaccinationTarget = 'individual' | 'lot';

export interface Vaccination {
  id: string;
  farmId: string;

  // Cible
  animalId?: string;
  lotId?: string;
  targetType: VaccinationTarget;

  // Détails vaccination
  vaccineId?: string;
  vaccineName: string;
  diseaseTarget: string;
  manufacturer?: string;
  batchNumber?: string;

  // Dates
  scheduledDate: string;
  administeredDate?: string;
  nextDueDate?: string;

  // Administration
  administeredBy?: string;
  veterinarianId?: string;
  veterinarianName?: string;
  dosage?: string;
  administrationRoute?: string; // IM, SC, oral, etc.

  // Statut
  status: VaccinationStatus;

  // Métadonnées
  notes?: string;
  siteOfInjection?: string;
  adverseReactions?: string;
  certificateNumber?: string;

  // Traçabilité
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface VaccinationWithDetails extends Vaccination {
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

export interface VaccinationFilters {
  search: string;
  status: VaccinationStatus | 'all';
  targetType: VaccinationTarget | 'all';
  dateFrom?: string;
  dateTo?: string;
}

export const VACCINATION_STATUS_LABELS: Record<VaccinationStatus, string> = {
  scheduled: 'Programmée',
  completed: 'Effectuée',
  overdue: 'En retard',
  cancelled: 'Annulée',
};

export const VACCINATION_TARGET_LABELS: Record<VaccinationTarget, string> = {
  individual: 'Individuel',
  lot: 'Lot',
};
