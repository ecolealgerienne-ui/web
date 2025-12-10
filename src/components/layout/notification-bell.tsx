'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { useUnreadAlertsCount } from '@/lib/hooks/useUnreadAlertsCount'
import { useFarmAlerts } from '@/lib/hooks/useFarmAlerts'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { AlertPriority } from '@/lib/types/admin/alert-template'

/**
 * Badge color by max priority
 */
function getBadgeColor(priority?: AlertPriority): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500'
    case 'high':
      return 'bg-orange-500'
    case 'medium':
      return 'bg-yellow-500'
    default:
      return 'bg-blue-500'
  }
}

/**
 * Header Notification Bell
 * Displays unread alerts count with badge and navigates to notifications page
 */
export function NotificationBell() {
  const t = useTranslations('notifications')
  const router = useRouter()
  const { user } = useAuth()

  const { count } = useUnreadAlertsCount(user?.farmId)
  const { alerts } = useFarmAlerts(user?.farmId, {
    defaultFilters: { status: 'pending', limit: 5 },
  })

  // Max priority for badge color
  const maxPriority = alerts.reduce<AlertPriority | undefined>((max, alert) => {
    const priority = alert.alertTemplate?.priority
    if (!priority) return max
    if (!max) return priority
    const order: AlertPriority[] = ['urgent', 'high', 'medium', 'low']
    return order.indexOf(priority) < order.indexOf(max) ? priority : max
  }, undefined)

  const handleClick = () => {
    router.push('/notifications')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={handleClick}
      title={t('title')}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span
          className={cn(
            'absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs text-white flex items-center justify-center font-medium',
            getBadgeColor(maxPriority)
          )}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
      <span className="sr-only">{t('title')}</span>
    </Button>
  )
}
