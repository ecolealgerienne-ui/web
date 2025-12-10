'use client'

import { AlertItem } from './alert-item'
import type { FarmAlert } from '@/lib/types/farm-alert'

interface AlertsListProps {
  alerts: FarmAlert[]
  onMarkAsRead: (alertId: string) => void
  onDismiss: (alertId: string) => void
}

/**
 * Alerts List Component
 * Displays a list of alerts with actions
 */
export function AlertsList({ alerts, onMarkAsRead, onDismiss }: AlertsListProps) {
  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertItem
          key={alert.id}
          alert={alert}
          onMarkAsRead={onMarkAsRead}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}
