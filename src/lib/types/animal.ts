/**
 * Types pour la gestion des animaux
 */

export type AnimalSex = 'male' | 'female';
export type AnimalStatus = 'alive' | 'sold' | 'dead' | 'missing';

export interface Animal {
  id: string;
  farmId: string;
  identificationNumber: string;
  name?: string;
  speciesId: string;
  breedId?: string;
  sex: AnimalSex;
  birthDate?: string;
  status: AnimalStatus;
  motherIdentificationNumber?: string;
  fatherIdentificationNumber?: string;
  acquisitionDate?: string;
  acquisitionPrice?: number;
  currentWeight?: number;
  currentLocation?: string;
  healthStatus?: string;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAnimalDto {
  identificationNumber: string;
  name?: string;
  speciesId: string;
  breedId?: string;
  sex: AnimalSex;
  birthDate?: string;
  status: AnimalStatus;
  motherIdentificationNumber?: string;
  fatherIdentificationNumber?: string;
  acquisitionDate?: string;
  acquisitionPrice?: number;
  currentWeight?: number;
  currentLocation?: string;
  healthStatus?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateAnimalDto {
  identificationNumber?: string;
  name?: string;
  speciesId?: string;
  breedId?: string;
  sex?: AnimalSex;
  birthDate?: string;
  status?: AnimalStatus;
  motherIdentificationNumber?: string;
  fatherIdentificationNumber?: string;
  acquisitionDate?: string;
  acquisitionPrice?: number;
  currentWeight?: number;
  currentLocation?: string;
  healthStatus?: string;
  notes?: string;
  isActive?: boolean;
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
