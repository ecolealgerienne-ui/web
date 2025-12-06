/**
 * Types pour les Vétérinaires (Admin Reference Data)
 *
 * Entité de référence administrative pour les vétérinaires du système.
 * Différent de /lib/types/veterinarian.ts qui est pour la gestion farm-scoped.
 *
 * Sprint 1 - Entité indépendante (pas de dépendances sur d'autres entités)
 */

import type { BaseEntity } from '@/lib/types/common/api'

/**
 * Vétérinaire (Admin Reference Data)
 *
 * Représente un vétérinaire dans le catalogue de référence du système.
 * Utilisé pour maintenir la liste des professionnels vétérinaires.
 */
export interface Veterinarian extends BaseEntity {
  /**
   * Code unique du vétérinaire (ex: "VET001", "VET-DZ-123")
   * Format: lettres majuscules, chiffres, tirets et underscores
   */
  code: string

  /**
   * Prénom du vétérinaire
   */
  firstName: string

  /**
   * Nom de famille du vétérinaire
   */
  lastName: string

  /**
   * Numéro de licence professionnelle (unique)
   * Requis pour exercer la profession vétérinaire
   */
  licenseNumber: string

  /**
   * Spécialités du vétérinaire
   * Ex: ["Chirurgie", "Dermatologie", "Médecine Interne"]
   */
  specialties: string[]

  /**
   * Nom de la clinique vétérinaire (optionnel)
   */
  clinic?: string

  /**
   * Scope du vétérinaire
   * - global: Vétérinaire disponible pour tous
   * - local: Vétérinaire local/régional
   */
  scope: 'global' | 'local'

  /**
   * Code du département (optionnel)
   * Ex: "01", "75", "DZ-16"
   */
  department?: string

  /**
   * Disponibilité du vétérinaire
   * Indique si le vétérinaire accepte de nouveaux patients
   */
  isAvailable?: boolean

  /**
   * Service d'urgence disponible
   * Indique si le vétérinaire propose un service d'urgence
   */
  emergencyService?: boolean

  /**
   * Informations de contact
   */
  contactInfo: {
    /**
     * Numéro de téléphone principal
     */
    phone: string

    /**
     * Numéro de téléphone mobile (optionnel)
     */
    mobile?: string

    /**
     * Adresse email professionnelle (optionnel)
     */
    email?: string

    /**
     * Adresse postale complète (optionnel)
     */
    address?: string

    /**
     * Ville (optionnel)
     */
    city?: string

    /**
     * Code postal (optionnel)
     */
    postalCode?: string

    /**
     * Pays (code ISO ou nom, optionnel)
     */
    country?: string
  }
}

/**
 * DTO pour la création d'un vétérinaire
 */
export interface CreateVeterinarianDto {
  code: string
  firstName: string
  lastName: string
  licenseNumber: string
  specialties: string[]
  clinic?: string
  scope: 'global' | 'local'
  department?: string
  isAvailable?: boolean
  emergencyService?: boolean
  contactInfo: {
    phone: string
    mobile?: string
    email?: string
    address?: string
    city?: string
    postalCode?: string
    country?: string
  }
  isActive?: boolean
}

/**
 * DTO pour la mise à jour d'un vétérinaire
 * Inclut le champ version pour l'optimistic locking
 */
export interface UpdateVeterinarianDto {
  code?: string
  firstName?: string
  lastName?: string
  licenseNumber?: string
  specialties?: string[]
  clinic?: string
  scope?: 'global' | 'local'
  department?: string
  isAvailable?: boolean
  emergencyService?: boolean
  contactInfo?: {
    phone?: string
    mobile?: string
    email?: string
    address?: string
    city?: string
    postalCode?: string
    country?: string
  }
  isActive?: boolean
  version: number
}

/**
 * Paramètres de filtrage spécifiques aux vétérinaires
 * Étend PaginationParams avec des filtres métier
 */
export interface VeterinarianFilterParams {
  /** Numéro de page (1-indexed, défaut: 1) */
  page?: number

  /** Nombre d'éléments par page (défaut: 50, max: 100) */
  limit?: number

  /** Recherche dans les noms (firstName, lastName) */
  search?: string

  /** Filtrer par scope */
  scope?: 'global' | 'local' | 'all'

  /** Filtrer par code département */
  department?: string

  /** Filtrer par statut actif */
  isActive?: boolean

  /** Filtrer par disponibilité */
  isAvailable?: boolean

  /** Filtrer par service d'urgence */
  emergencyService?: boolean

  /** Champ de tri (défaut: lastName) */
  sort?: string

  /** Ordre de tri (défaut: asc) */
  order?: 'asc' | 'desc'
}
