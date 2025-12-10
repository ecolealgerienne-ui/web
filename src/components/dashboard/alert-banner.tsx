'use client'

import { AlertTriangle, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/lib/i18n'
import { useFarmAlerts } from '@/lib/hooks/useFarmAlerts'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import { useState } from 'react'

/**
 * Alert Banner Component
 * Displays a prominent banner when urgent alerts exist
 */
export function AlertBanner() {
  const t = useTranslations('dashboard')
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  const { summary, loading } = useFarmAlerts(user?.farmId, {
    pollingInterval: 60000,
  })

  // Don't show if loading, dismissed, or no urgent alerts
  if (loading || dismissed) return null

  const urgentCount = summary?.byPriority?.urgent ?? 0
  const highCount = summary?.byPriority?.high ?? 0
  const criticalCount = urgentCount + highCount

  if (criticalCount === 0) return null

  return (
    <div className="relative rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50 p-4">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {urgentCount > 0 && highCount > 0 ? (
              t('alertBanner.urgentAndHigh', { urgent: urgentCount, high: highCount })
            ) : urgentCount > 0 ? (
              t('alertBanner.urgent', { count: urgentCount })
            ) : (
              t('alertBanner.high', { count: highCount })
            )}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
            {t('alertBanner.actionRequired')}
          </p>
        </div>

        {/* Action */}
        <div className="flex items-center gap-2">
          <Link href="/notifications?priority=urgent,high">
            <Button
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900"
            >
              {t('alertBanner.viewAlerts')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t('alertBanner.dismiss')}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
