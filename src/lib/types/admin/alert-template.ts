/**
 * Alert Template Types
 *
 * Alert templates for notifications and reminders in the system
 */

import type { BaseEntity } from '../common/api'

/**
 * Alert category types
 */
export type AlertCategory =
  | 'health'
  | 'vaccination'
  | 'treatment'
  | 'reproduction'
  | 'nutrition'
  | 'administrative'
  | 'other'

/**
 * Alert priority levels
 */
export type AlertPriority = 'low' | 'medium' | 'high' | 'urgent'

/**
 * Alert Template entity
 */
export interface AlertTemplate extends BaseEntity {
  code: string
  nameFr: string
  nameEn: string
  nameAr: string
  category: AlertCategory
  priority: AlertPriority
  descriptionFr?: string | null
  descriptionEn?: string | null
  descriptionAr?: string | null
}

/**
 * DTO for creating an alert template
 */
export interface CreateAlertTemplateDto {
  code: string
  nameFr: string
  nameEn: string
  nameAr: string
  category: AlertCategory
  priority: AlertPriority
  description?: string
  messageTemplateFr?: string
  messageTemplateEn?: string
  messageTemplateAr?: string
  isActive?: boolean
}

/**
 * DTO for updating an alert template
 */
export interface UpdateAlertTemplateDto {
  code?: string
  nameFr?: string
  nameEn?: string
  nameAr?: string
  category?: AlertCategory
  priority?: AlertPriority
  description?: string
  messageTemplateFr?: string
  messageTemplateEn?: string
  messageTemplateAr?: string
  isActive?: boolean
  version: number
}

/**
 * Filter parameters for alert templates list
 */
export interface AlertTemplateFilterParams {
  page?: number
  limit?: number
  search?: string
  category?: AlertCategory
  priority?: AlertPriority
  isActive?: boolean
  orderBy?: 'nameFr' | 'nameEn' | 'code' | 'category' | 'priority' | 'createdAt'
  order?: 'ASC' | 'DESC'
}
