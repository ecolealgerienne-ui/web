// Types pour les animaux basés sur les specs backend

export type AnimalSpecies = "sheep" | "goat" | "cattle";
export type AnimalSex = "male" | "female";
export type AnimalStatus = "active" | "sold" | "dead" | "slaughtered";

export interface Animal {
  id: string;
  eid: string; // Electronic ID
  internalId?: string; // ID interne
  name?: string;
  species: AnimalSpecies;
  breed?: string; // Race
  sex: AnimalSex;
  birthDate: string;
  status: AnimalStatus;
  motherId?: string;
  fatherId?: string;
  lotId?: string;
  currentWeight?: number;
  acquisitionDate: string;
  acquisitionType: "birth" | "purchase";
  farmId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnimalDetail extends Animal {
  // Données supplémentaires pour la page détail
  weights: Weight[];
  treatments: Treatment[];
  vaccinations: Vaccination[];
  movements: Movement[];
}

export interface Weight {
  id: string;
  animalId: string;
  weight: number;
  date: string;
  note?: string;
}

export interface Treatment {
  id: string;
  animalId?: string;
  lotId?: string;
  product: string;
  date: string;
  administeredBy: string;
  withdrawalPeriod?: number;
  note?: string;
}

export interface Vaccination {
  id: string;
  animalId?: string;
  lotId?: string;
  vaccine: string;
  date: string;
  administeredBy: string;
  nextDate?: string;
  note?: string;
}

export interface Movement {
  id: string;
  animalId: string;
  type: "birth" | "purchase" | "sale" | "death" | "slaughter" | "transfer";
  date: string;
  fromLocation?: string;
  toLocation?: string;
  price?: number;
  note?: string;
}

// Filtres
export interface AnimalFilters {
  species?: AnimalSpecies;
  sex?: AnimalSex;
  status?: AnimalStatus;
  lotId?: string;
  minAge?: number;
  maxAge?: number;
  search?: string;
}
