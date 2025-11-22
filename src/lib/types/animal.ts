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
