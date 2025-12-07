/**
 * Types pour les lots basés sur le schéma API
 * Endpoint: POST/PUT /api/v1/farms/{farmId}/lots
 */

export type LotType = 'treatment' | 'vaccination' | 'sale' | 'slaughter' | 'purchase' | 'breeding' | 'reproduction';
export type LotStatus = 'open' | 'closed' | 'archived';

export interface Lot {
  id: string;
  farmId: string;
  name: string;
  type: LotType;
  status: LotStatus;
  description?: string;
  notes?: string;
  isActive: boolean;

  // Animaux (API uses animalIds array)
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

  // Métadonnées
  createdAt?: string;
  updatedAt?: string;
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
    officialNumber?: string;
    visualId?: string;
    currentEid?: string;
    sex: string;
    status: string;
    birthDate: string;
    speciesId?: string;
    species?: {
      id: string;
      name: string;
    };
    breed?: {
      id: string;
      name: string;
    };
  };
}

export interface CreateLotDto {
  name: string;
  type: LotType;
  status?: LotStatus;
  description?: string;
  notes?: string;
  isActive?: boolean;
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
}

export interface UpdateLotDto extends Partial<CreateLotDto> {}

export interface LotFilters {
  search?: string;
  type?: LotType | 'all';
  status?: LotStatus | 'all';
  isActive?: boolean;
}
