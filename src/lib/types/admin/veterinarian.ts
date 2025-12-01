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
