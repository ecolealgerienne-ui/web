'use client'

import { Bell } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from '@/lib/i18n'
import { useFarmAlerts } from '@/lib/hooks/useFarmAlerts'
import { useAuth } from '@/contexts/auth-context'

/**
 * Alert KPI Card Component
 * Displays alert count with urgent indicator in KPI format
 */
export function AlertKpiCard() {
  const t = useTranslations('dashboard')
  const { user } = useAuth()

  const { summary, loading } = useFarmAlerts(user?.farmId, {
    pollingInterval: 60000,
  })

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const total = summary?.total ?? 0
  const unread = summary?.unread ?? 0
  const urgentCount = summary?.byPriority?.urgent ?? 0
  const highCount = summary?.byPriority?.high ?? 0
  const criticalCount = urgentCount + highCount

  // Determine card style based on alerts
  const hasUrgent = urgentCount > 0
  const hasHigh = highCount > 0 && !hasUrgent

  const iconBgColor = hasUrgent
    ? 'bg-red-100 dark:bg-red-900'
    : hasHigh
      ? 'bg-orange-100 dark:bg-orange-900'
      : 'bg-primary/10'

  const iconColor = hasUrgent
    ? 'text-red-600 dark:text-red-400'
    : hasHigh
      ? 'text-orange-600 dark:text-orange-400'
      : 'text-primary'

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={`p-3 rounded-lg ${iconBgColor}`}>
            <Bell className={`h-6 w-6 ${iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">{total}</p>
              {criticalCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {criticalCount} {t('alertKpi.urgent')}
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium text-foreground">
              {t('alertKpi.title')}
            </p>
            {unread > 0 && (
              <p className="text-xs text-muted-foreground">
                {t('alertKpi.unread', { count: unread })}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
