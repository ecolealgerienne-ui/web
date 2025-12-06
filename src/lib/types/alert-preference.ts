/**
 * Types pour les préférences d'alertes d'une ferme
 * Endpoint: /api/v1/farms/{farmId}/alert-template-preferences
 */

import type { AlertTemplate } from './admin/alert-template'

/**
 * Interface pour l'alert template inclus dans la préférence
 */
export interface ApiAlertInPreference {
  id: string
  code: string
  nameFr: string
  nameEn?: string
  nameAr?: string
  category: string
  priority: string
  descriptionFr?: string | null
  descriptionEn?: string | null
  descriptionAr?: string | null
}

/**
 * Préférence d'alerte pour une ferme
 */
export interface AlertPreference {
  id: string
  farmId: string
  alertTemplateId: string
  displayOrder: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  alertTemplate: ApiAlertInPreference
}

/**
 * DTO pour créer une préférence d'alerte
 */
export interface CreateAlertPreferenceDto {
  alertTemplateId: string
  reminderDays?: number
}

/**
 * DTO pour mettre à jour une préférence d'alerte
 */
export interface UpdateAlertPreferenceDto {
  displayOrder?: number
  isActive?: boolean
}
