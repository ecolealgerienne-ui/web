/**
 * Types pour les configurations d'alertes
 */

export type AlertType = 'urgent' | 'important' | 'routine'
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical'

export interface AlertConfiguration {
  id: string
  farmId: string
  evaluationType: string
  type: AlertType
  category: string
  titleKey: string
  messageKey: string
  severity: number
  iconName: string
  colorHex: string
  enabled: boolean
  daysBeforeDue?: number
  priority: AlertPriority
  createdAt?: string
  updatedAt?: string
}

export interface CreateAlertConfigurationDto {
  farmId: string
  evaluationType: string
  type: AlertType
  category: string
  titleKey: string
  messageKey: string
  severity: number
  iconName: string
  colorHex: string
  enabled?: boolean
  daysBeforeDue?: number
  priority: AlertPriority
}

export interface UpdateAlertConfigurationDto {
  evaluationType?: string
  type?: AlertType
  category?: string
  titleKey?: string
  messageKey?: string
  severity?: number
  iconName?: string
  colorHex?: string
  enabled?: boolean
  daysBeforeDue?: number
  priority?: AlertPriority
}
