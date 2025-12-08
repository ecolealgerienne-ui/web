/**
 * Types pour les lots basés sur le schéma API
 * Endpoint: POST/PUT /api/v1/farms/{farmId}/lots
 */

export type LotType =
  | 'treatment'
  | 'vaccination'
  | 'sale'
  | 'slaughter'
  | 'purchase'
  | 'breeding'
  | 'reproduction'
  | 'fattening'    // Engraissement
  | 'quarantine'   // Quarantaine
  | 'weaning'      // Sevrage
  | 'gestation'    // Gestation
  | 'lactation'    // Lactation
  | 'birth'        // Naissance
  | 'production'   // Production
  | 'other';       // Autre

export type LotStatus = 'open' | 'closed' | 'archived' | 'completed';

export interface Lot {
  id: string;
  farmId: string;
  name: string;
  type: LotType;
  status: LotStatus;
  description?: string | null;
  notes?: string | null;
  isActive: boolean;

  // Animaux (API uses animalIds array)
  animalIds?: string[];

  // Nombre d'animaux (retourné par l'API via _count)
  _count?: {
    lotAnimals: number;
  };

  // Traitement/Vaccination
  productId?: string | null;
  productName?: string | null;
  treatmentDate?: string | null;
  withdrawalEndDate?: string | null;
  veterinarianId?: string | null;
  veterinarianName?: string | null;

  // Vente/Achat
  priceTotal?: number | null;
  buyerName?: string | null;
  sellerName?: string | null;

  // Champs supplémentaires de l'API
  completed?: boolean;
  completedAt?: string | null;
  version?: number;
  deletedAt?: string | null;

  // Métadonnées
  createdAt?: string;
  updatedAt?: string;
}

// L'API retourne les données de l'animal directement (pas imbriquées)
export interface LotAnimal {
  id: string;
  visualId?: string | null;
  currentEid?: string | null;
  officialNumber?: string | null;
  sex: string;
  birthDate?: string | null;
  status: string;
  breed?: {
    id: string;
    name: string;
  } | null;
  species?: {
    id: string;
    name: string;
  } | null;
  joinedAt: string;
}

export interface CreateLotDto {
  name: string;
  type: LotType;
  status?: LotStatus;
  description?: string;
  notes?: string;
  isActive?: boolean;
  completed?: boolean;
  animalIds?: string[];

  // Traitement/Vaccination
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

  // Sync offline-first
  version?: number;
}

export interface UpdateLotDto {
  name?: string;
  type?: LotType;
  status?: LotStatus;
  description?: string;
  notes?: string;
  isActive?: boolean;
  completed?: boolean;
  animalIds?: string[];

  // Traitement/Vaccination
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

  // Sync offline-first
  version?: number;
}

export interface LotFilters {
  search?: string;
  type?: LotType | 'all';
  status?: LotStatus | 'all';
  isActive?: boolean;
}
