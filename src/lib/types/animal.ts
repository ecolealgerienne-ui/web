/**
 * Types pour la gestion des animaux
 */

export type AnimalSex = 'male' | 'female';
export type AnimalStatus = 'alive' | 'sold' | 'dead'; // 'missing' not supported by backend API

export interface Animal {
  id: string;
  farmId: string;
  currentEid: string | null;
  officialNumber: string | null;
  visualId: string | null;
  speciesId: string | null;
  breedId?: string | null;
  sex: AnimalSex;
  birthDate: string;
  status: AnimalStatus;
  motherId?: string | null;
  photoUrl?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  // Relations (when included)
  species?: { id: string; name: string };
  breed?: { id: string; name: string };
  mother?: Animal;
  // Deprecated fields (for backward compatibility, will be removed)
  identificationNumber?: string;
  name?: string;
  motherIdentificationNumber?: string;
  fatherIdentificationNumber?: string;
  acquisitionDate?: string;
  acquisitionPrice?: number;
  currentWeight?: number;
  currentLocation?: string;
  healthStatus?: string;
  isActive?: boolean;
}

export interface CreateAnimalDto {
  birthDate: string;
  sex: AnimalSex;
  currentEid?: string;
  officialNumber?: string;
  visualId?: string;
  speciesId?: string;
  breedId?: string;
  motherId?: string;
  status?: AnimalStatus;
  photoUrl?: string;
  notes?: string;
}

export interface UpdateAnimalDto {
  birthDate?: string;
  sex?: AnimalSex;
  currentEid?: string;
  officialNumber?: string;
  visualId?: string;
  speciesId?: string;
  breedId?: string;
  motherId?: string;
  status?: AnimalStatus;
  photoUrl?: string;
  notes?: string;
}

// Helper types for animal details and related data
export interface Weight {
  id: string;
  animalId: string;
  weight: number;
  weighDate: string;
  notes?: string;
  createdAt: string;
}

export interface Movement {
  id: string;
  animalId: string;
  fromLocation: string;
  toLocation: string;
  movementDate: string;
  reason?: string;
  notes?: string;
  createdAt: string;
}

export interface AnimalDetail extends Animal {
  weights?: Weight[];
  treatments?: any[]; // Import from treatment.ts in components
  vaccinations?: any[]; // Import from vaccination.ts in components
  movements?: Movement[];
}

export interface AnimalFilters {
  search: string;
  species: string;
  status: AnimalStatus | 'all';
  sex: AnimalSex | 'all';
}
