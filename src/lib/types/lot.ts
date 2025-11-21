// Types pour les lots basés sur les specs backend

export type LotType = 'treatment' | 'vaccination' | 'sale' | 'slaughter' | 'purchase' | 'breeding';
export type LotStatus = 'open' | 'closed' | 'archived';

export interface Lot {
  id: string;
  farmId: string;
  name: string;
  type: LotType;
  status: LotStatus;
  description?: string;
  completed: boolean;
  completedAt?: string;

  // Traitement
  productId?: string;
  productName?: string;
  treatmentDate?: string;
  withdrawalEndDate?: string;
  veterinarianId?: string;
  veterinarianName?: string;

  // Vente/Achat
  priceTotal?: number;
  buyerName?: string;
  sellerName?: string;

  notes?: string;
  isActive: boolean;

  // Métadonnées
  animalCount: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface LotAnimal {
  id: string;
  lotId: string;
  animalId: string;
  farmId: string;
  joinedAt: string;
  leftAt?: string;

  // Données de l'animal (pour affichage)
  animal: {
    id: string;
    visualId?: string;
    currentEid?: string;
    sex: string;
    status: string;
    birthDate: string;
    speciesId?: string;
  };
}

export interface LotFilters {
  search: string;
  type: LotType | 'all';
  status: LotStatus | 'all';
  completed?: boolean;
}

export const LOT_TYPE_LABELS: Record<LotType, string> = {
  treatment: 'Traitement',
  vaccination: 'Vaccination',
  sale: 'Vente',
  slaughter: 'Abattage',
  purchase: 'Achat',
  breeding: 'Reproduction',
};

export const LOT_STATUS_LABELS: Record<LotStatus, string> = {
  open: 'Ouvert',
  closed: 'Fermé',
  archived: 'Archivé',
};
