/**
 * Types pour la gestion des vaccins (données de référence)
 */

import { ApiResource } from './api';

/**
 * Vaccin (données de référence administrées)
 */
export interface Vaccine extends ApiResource {
  id: string;
  // Noms multilingues
  name: string; // Nom affiché (basé sur la locale)
  nameFr: string;
  nameEn: string;
  nameAr: string;
  // Détails
  description?: string;
  manufacturer?: string; // Fabricant
  diseaseTarget?: string; // Maladie ciblée
  // Métadonnées
  displayOrder?: number;
  isActive: boolean;
}

/**
 * DTO pour créer un vaccin
 */
export interface CreateVaccineDto {
  id: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  description?: string;
  manufacturer?: string;
  diseaseTarget?: string;
  displayOrder?: number;
  isActive?: boolean;
}

/**
 * DTO pour mettre à jour un vaccin
 */
export interface UpdateVaccineDto {
  nameFr?: string;
  nameEn?: string;
  nameAr?: string;
  description?: string;
  manufacturer?: string;
  diseaseTarget?: string;
  displayOrder?: number;
  isActive?: boolean;
}
