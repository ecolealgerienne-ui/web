/**
 * Types pour les vaccins
 * Système Master Table avec scope global/local
 */

export type VaccineTargetDisease =
  | 'enterotoxemia'
  | 'brucellosis'
  | 'bluetongue'
  | 'foot_and_mouth'
  | 'rabies'
  | 'anthrax'
  | 'lumpy_skin'
  | 'ppr' // Peste des Petits Ruminants
  | 'sheep_pox'
  | 'pasteurellosis'
  | 'other';

export type VaccineScope = 'global' | 'local';

export interface Vaccine {
  id: string;
  farmId?: string; // NULL pour scope=global
  scope: VaccineScope;

  // Noms multilingues (pattern i18n)
  nameFr: string;
  nameEn?: string;
  nameAr?: string;

  code?: string;
  description?: string;
  targetDisease?: VaccineTargetDisease;
  laboratoire?: string; // Manufacturer
  numeroAMM?: string; // Autorisation de Mise sur le Marché
  dosage?: string;
  dosageRecommande?: string; // Recommended dosage
  dureeImmunite?: number; // Durée d'immunité en jours
  isActive: boolean;

  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

export interface CreateVaccineDto {
  nameFr: string;
  nameEn?: string;
  nameAr?: string;
  code?: string;
  description?: string;
  targetDisease?: VaccineTargetDisease;
  laboratoire?: string;
  numeroAMM?: string;
  dosage?: string;
  dosageRecommande?: string;
  dureeImmunite?: number;
  isActive?: boolean;
}

export interface UpdateVaccineDto {
  nameFr?: string;
  nameEn?: string;
  nameAr?: string;
  code?: string;
  description?: string;
  targetDisease?: VaccineTargetDisease;
  laboratoire?: string;
  numeroAMM?: string;
  dosage?: string;
  dosageRecommande?: string;
  dureeImmunite?: number;
  isActive?: boolean;
}

export interface VaccineFilters {
  search?: string;
  scope?: VaccineScope | 'all';
  targetDisease?: VaccineTargetDisease;
  isActive?: boolean;
}

export const VACCINE_TARGET_DISEASE_LABELS: Record<VaccineTargetDisease, string> = {
  enterotoxemia: 'Entérotoxémie',
  brucellosis: 'Brucellose',
  bluetongue: 'Fièvre Catarrhale',
  foot_and_mouth: 'Fièvre Aphteuse',
  rabies: 'Rage',
  anthrax: 'Charbon',
  lumpy_skin: 'Dermatose Nodulaire',
  ppr: 'Peste des Petits Ruminants',
  sheep_pox: 'Variole Ovine',
  pasteurellosis: 'Pasteurellose',
  other: 'Autre',
};

export const VACCINE_SCOPE_LABELS: Record<VaccineScope, string> = {
  global: 'Global',
  local: 'Local (Ferme)',
};
