'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, Eye, Clock, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { FarmAlert } from '@/lib/types/farm-alert'
import type { AlertPriority } from '@/lib/types/admin/alert-template'

interface AlertItemProps {
  alert: FarmAlert
  onMarkAsRead: (alertId: string) => void
  onDismiss: (alertId: string) => void
}

/**
 * Badge variants by priority
 */
const PRIORITY_VARIANTS: Record<AlertPriority, 'destructive' | 'warning' | 'default' | 'success'> = {
  urgent: 'destructive',
  high: 'warning',
  medium: 'default',
  low: 'success',
}

/**
 * Icons by priority
 */
const PRIORITY_ICONS: Record<AlertPriority, typeof AlertTriangle> = {
  urgent: AlertCircle,
  high: AlertTriangle,
  medium: Info,
  low: Info,
}

/**
 * Format relative date
 */
function formatRelativeDate(dateString: string, t: ReturnType<typeof useTranslations>): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 60) {
    return t('time.minutesAgo', { count: diffMinutes })
  }
  if (diffHours < 24) {
    return t('time.hoursAgo', { count: diffHours })
  }
  if (diffDays < 7) {
    return t('time.daysAgo', { count: diffDays })
  }
  return date.toLocaleDateString()
}

/**
 * Alert Item Component
 * Displays a single alert with actions
 */
export function AlertItem({ alert, onMarkAsRead, onDismiss }: AlertItemProps) {
  const t = useTranslations('notifications')
  const priority = alert.alertTemplate?.priority ?? 'medium'
  const category = alert.alertTemplate?.category ?? 'other'
  const PriorityIcon = PRIORITY_ICONS[priority]
  const isUnread = alert.status === 'pending'

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 border rounded-lg transition-colors',
        isUnread ? 'bg-primary/5 border-primary/20' : 'bg-background'
      )}
    >
      {/* Priority Icon */}
      <div className="flex-shrink-0 mt-1">
        <PriorityIcon
          className={cn(
            'h-5 w-5',
            priority === 'urgent' && 'text-red-500',
            priority === 'high' && 'text-orange-500',
            priority === 'medium' && 'text-yellow-500',
            priority === 'low' && 'text-blue-500'
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={PRIORITY_VARIANTS[priority]} className="text-xs">
            {t(`priorities.${priority}`)}
          </Badge>
          <Badge variant="default" className="text-xs">
            {t(`categories.${category}`)}
          </Badge>
          {isUnread && (
            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
          )}
        </div>

        {/* Title */}
        <h4 className="font-medium text-sm mb-1">
          {alert.alertTemplate?.nameFr ?? t('unknownAlert')}
        </h4>

        {/* Description */}
        {alert.alertTemplate?.descriptionFr && (
          <p className="text-sm text-muted-foreground mb-2">
            {alert.alertTemplate.descriptionFr}
          </p>
        )}

        {/* Context: Animal or Lot */}
        {(alert.animal || alert.lot) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            {alert.animal && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {alert.animal.officialNumber || alert.animal.visualId}
              </span>
            )}
            {alert.lot && (
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground">•</span>
                {alert.lot.name}
              </span>
            )}
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatRelativeDate(alert.triggeredAt, t)}
          {alert.dueDate && (
            <>
              <span className="mx-1">•</span>
              <span>
                {t('dueDate')}: {new Date(alert.dueDate).toLocaleDateString()}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      {isUnread && (
        <div className="flex-shrink-0 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkAsRead(alert.id)}
            title={t('actions.markAsRead')}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(alert.id)}
            title={t('actions.dismiss')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Read status indicator */}
      {!isUnread && (
        <div className="flex-shrink-0">
          <Badge variant="default" className="text-xs">
            {t(`status.${alert.status}`)}
          </Badge>
        </div>
      )}
    </div>
  )
}
