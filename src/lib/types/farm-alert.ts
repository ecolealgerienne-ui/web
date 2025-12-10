/**
 * Farm Alert Types
 *
 * Types for dynamically generated farm alerts.
 * These alerts are farm-scoped and NOT admin entities.
 */

import type { AlertCategory, AlertPriority } from './admin/alert-template'

/**
 * Status of a generated alert
 */
export type FarmAlertStatus = 'pending' | 'read' | 'dismissed' | 'resolved'

/**
 * Platform where the alert was read
 */
export type ReadPlatform = 'web' | 'mobile' | 'email'

/**
 * Dynamic metadata for an alert
 * Contains variable data depending on alert type
 */
export interface FarmAlertMetadata {
  daysUntilDue?: number
  daysOverdue?: number
  vaccineName?: string
  treatmentName?: string
  lastWeighingDate?: string
  currentWeight?: number
  expectedWeight?: number
  customMessage?: string
  [key: string]: unknown
}

/**
 * Generated alert for a farm
 * Note: Does NOT extend BaseEntity as this is not an admin entity
 */
export interface FarmAlert {
  id: string
  farmId: string
  alertTemplateId: string
  alertPreferenceId?: string

  // Context
  animalId?: string
  lotId?: string
  treatmentId?: string

  // Dates
  triggeredAt: string
  dueDate?: string
  expiresAt?: string

  // Status
  status: FarmAlertStatus
  readAt?: string
  readOn?: ReadPlatform
  resolvedAt?: string

  // Dynamic data
  metadata: FarmAlertMetadata

  // Relations (included in API responses)
  alertTemplate?: {
    id: string
    code: string
    nameFr: string
    nameEn?: string
    nameAr?: string
    category: AlertCategory
    priority: AlertPriority
    descriptionFr?: string
  }
  animal?: {
    id: string
    visualId?: string
    officialNumber?: string
  }
  lot?: {
    id: string
    name: string
  }

  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Summary of alerts (for badge/counters)
 */
export interface FarmAlertsSummary {
  total: number
  unread: number
  byStatus: Record<FarmAlertStatus, number>
  byCategory: Record<AlertCategory, number>
  byPriority: Record<AlertPriority, number>
}

/**
 * Filter parameters for alerts list
 */
export interface FarmAlertsFilterParams {
  status?: FarmAlertStatus | FarmAlertStatus[]
  category?: AlertCategory | AlertCategory[]
  priority?: AlertPriority | AlertPriority[]
  animalId?: string
  lotId?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
  orderBy?: 'triggeredAt' | 'dueDate' | 'priority' | 'status'
  order?: 'ASC' | 'DESC'
}

/**
 * DTO for updating alert status
 */
export interface UpdateFarmAlertDto {
  status: FarmAlertStatus
  readOn?: ReadPlatform
}

/**
 * Paginated response for alerts
 * Follows standard PaginatedResponse pattern
 */
export interface FarmAlertsResponse {
  data: FarmAlert[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
