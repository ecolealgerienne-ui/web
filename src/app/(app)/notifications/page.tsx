'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Bell, Filter, CheckCheck, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFarmAlerts } from '@/lib/hooks/useFarmAlerts'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/contexts/toast-context'
import { handleApiError } from '@/lib/utils/api-error-handler'
import { AlertsList } from '@/components/notifications/alerts-list'
import { Pagination } from '@/components/data/common/Pagination'
import type { FarmAlertStatus } from '@/lib/types/farm-alert'
import type { AlertCategory, AlertPriority } from '@/lib/types/admin/alert-template'

// Constant for "all" filter value (Radix UI requires non-empty value)
const ALL_FILTER = '__all__'

const STATUS_OPTIONS: FarmAlertStatus[] = ['pending', 'read', 'dismissed', 'resolved']
const CATEGORY_OPTIONS: AlertCategory[] = [
  'health',
  'vaccination',
  'treatment',
  'reproduction',
  'nutrition',
  'administrative',
  'other',
]
const PRIORITY_OPTIONS: AlertPriority[] = ['urgent', 'high', 'medium', 'low']

export default function NotificationsPage() {
  const t = useTranslations('notifications')
  const tc = useTranslations('common')
  const { user } = useAuth()
  const toast = useToast()

  // Local filters
  const [statusFilter, setStatusFilter] = useState<string>(ALL_FILTER)
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_FILTER)
  const [priorityFilter, setPriorityFilter] = useState<string>(ALL_FILTER)

  const {
    alerts,
    summary,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    markAsRead,
    dismiss,
    markAllAsRead,
    refetch,
  } = useFarmAlerts(user?.farmId, {
    defaultFilters: {
      page: 1,
      limit: 20,
      orderBy: 'triggeredAt',
      order: 'desc',
    },
  })

  // Apply filters
  const handleFilterChange = () => {
    setFilters({
      ...filters,
      page: 1,
      status: statusFilter === ALL_FILTER ? undefined : (statusFilter as FarmAlertStatus),
      category: categoryFilter === ALL_FILTER ? undefined : (categoryFilter as AlertCategory),
      priority: priorityFilter === ALL_FILTER ? undefined : (priorityFilter as AlertPriority),
    })
  }

  // Actions
  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAsRead(alertId)
      toast.success(t('messages.markedAsRead'))
    } catch (err) {
      handleApiError(err, 'mark as read', toast)
    }
  }

  const handleDismiss = async (alertId: string) => {
    try {
      await dismiss(alertId)
      toast.success(t('messages.dismissed'))
    } catch (err) {
      handleApiError(err, 'dismiss', toast)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast.success(t('messages.allMarkedAsRead'))
    } catch (err) {
      handleApiError(err, 'mark all as read', toast)
    }
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">
              {summary
                ? t('subtitle', { total: summary.total, unread: summary.unread })
                : t('subtitleLoading')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {tc('actions.refresh')}
          </Button>
          {summary && summary.unread > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              {t('actions.markAllRead')}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('filters.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('filters.status')}:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>{t('filters.all')}</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`status.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('filters.category')}:</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>{t('filters.all')}</SelectItem>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {t(`categories.${cat}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('filters.priority')}:</span>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>{t('filters.all')}</SelectItem>
                  {PRIORITY_OPTIONS.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {t(`priorities.${priority}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button size="sm" onClick={handleFilterChange}>
              {t('filters.apply')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('messages.loadError')}
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('messages.noAlerts')}
            </div>
          ) : (
            <AlertsList
              alerts={alerts}
              onMarkAsRead={handleMarkAsRead}
              onDismiss={handleDismiss}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}
