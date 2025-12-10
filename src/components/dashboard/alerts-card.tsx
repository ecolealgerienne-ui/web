'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, ChevronRight, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'
import { useFarmAlerts } from '@/lib/hooks/useFarmAlerts'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import type { AlertPriority } from '@/lib/types/admin/alert-template'

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
 * Dashboard Alerts Card
 * Displays a summary of farm alerts grouped by priority
 */
export function AlertsCard() {
  const t = useTranslations('dashboard')
  const { user } = useAuth()

  const { summary, loading, error } = useFarmAlerts(user?.farmId, {
    pollingInterval: 60000, // 1 minute
  })

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('alerts.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('alerts.loadError')}</p>
        </CardContent>
      </Card>
    )
  }

  // No alerts
  if (!summary || summary.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('alerts.title')} (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('alerts.noAlerts')}</p>
        </CardContent>
      </Card>
    )
  }

  // Alerts grouped by priority (dynamic)
  const priorityOrder: AlertPriority[] = ['urgent', 'high', 'medium', 'low']
  const alertsByPriority = priorityOrder
    .filter((priority) => (summary.byPriority[priority] ?? 0) > 0)
    .map((priority) => ({
      priority,
      count: summary.byPriority[priority] ?? 0,
      Icon: PRIORITY_ICONS[priority],
      variant: PRIORITY_VARIANTS[priority],
    }))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t('alerts.title')} ({summary.total})
          {summary.unread > 0 && (
            <Badge variant="destructive" className="ml-2">
              {summary.unread} {t('alerts.unread')}
            </Badge>
          )}
        </CardTitle>
        <Link href="/notifications">
          <Button variant="ghost" size="sm">
            {t('alerts.viewAll')}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alertsByPriority.map(({ priority, count, Icon, variant }) => (
            <div
              key={priority}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="text-sm">{t(`alerts.priorities.${priority}`)}</span>
              </div>
              <Badge variant={variant}>{count}</Badge>
            </div>
          ))}
        </div>

        {/* Summary by category (optional, if > 5 alerts) */}
        {summary.total > 5 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">{t('alerts.byCategory')}</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(summary.byCategory)
                .filter(([, count]) => count > 0)
                .map(([category, count]) => (
                  <Badge key={category} variant="default" className="text-xs">
                    {t(`alerts.categories.${category}`)}: {count}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
