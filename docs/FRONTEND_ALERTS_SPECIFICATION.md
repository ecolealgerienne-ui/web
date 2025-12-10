# Spécification Frontend Web - Système d'Alertes Dynamiques

> Version: 1.0
> Date: 2024-12-09
> Statut: À implémenter
> Dépendance: [BACKEND_ALERTS_SPECIFICATION.md](./BACKEND_ALERTS_SPECIFICATION.md)

---

## 1. Vue d'Ensemble

### 1.1 Objectif
Implémenter les composants frontend pour afficher et gérer les alertes générées dynamiquement, en respectant les **normes de développement AniTra** (DEVELOPMENT_STANDARDS.md).

### 1.2 Composants à Créer

```
┌─────────────────────────────────────────────────────────────────┐
│                        COMPOSANTS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Dashboard      │  │  Header         │  │  Page           │ │
│  │  AlertsCard     │  │  NotificationBell│  │  /notifications │ │
│  │  (Résumé)       │  │  (Badge)        │  │  (Liste)        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│           │                   │                    │            │
│           └───────────────────┴────────────────────┘            │
│                              │                                   │
│                    ┌─────────────────┐                          │
│                    │  useFarmAlerts  │                          │
│                    │  (Hook partagé) │                          │
│                    └─────────────────┘                          │
│                              │                                   │
│                    ┌─────────────────┐                          │
│                    │farmAlertsService│                          │
│                    │  (Service API)  │                          │
│                    └─────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Structure des Fichiers

### 2.1 Organisation (Conforme DEVELOPMENT_STANDARDS.md §2.1)

```
src/
├── lib/
│   ├── types/
│   │   └── farm-alert.ts                    # Types alertes générées
│   ├── services/
│   │   └── farm-alerts.service.ts           # Service API alertes
│   └── hooks/
│       ├── useFarmAlerts.ts                 # Hook liste alertes
│       └── useUnreadAlertsCount.ts          # Hook compteur badge
├── components/
│   ├── dashboard/
│   │   └── alerts-card.tsx                  # Refonte dynamique
│   ├── layout/
│   │   └── notification-bell.tsx            # Nouveau composant
│   └── notifications/
│       ├── alerts-list.tsx                  # Liste des alertes
│       ├── alert-item.tsx                   # Item d'alerte
│       └── alerts-filters.tsx               # Filtres
└── app/(app)/
    └── notifications/
        └── page.tsx                         # Page notifications
```

---

## 3. Types TypeScript

### 3.1 Types Alertes (Conforme DEVELOPMENT_STANDARDS.md §6)

```typescript
// src/lib/types/farm-alert.ts

import type { AlertCategory, AlertPriority } from './admin/alert-template'

/**
 * Statut d'une alerte générée
 */
export type FarmAlertStatus = 'pending' | 'read' | 'dismissed' | 'resolved'

/**
 * Plateforme de lecture
 */
export type ReadPlatform = 'web' | 'mobile' | 'email'

/**
 * Alerte générée pour une ferme
 * ⚠️ Ne pas étendre BaseEntity car ce n'est pas une entité admin
 */
export interface FarmAlert {
  id: string
  farmId: string
  alertTemplateId: string
  alertPreferenceId?: string

  // Contexte
  animalId?: string
  lotId?: string
  treatmentId?: string

  // Dates
  triggeredAt: string
  dueDate?: string
  expiresAt?: string

  // Statut
  status: FarmAlertStatus
  readAt?: string
  readOn?: ReadPlatform
  resolvedAt?: string

  // Données dynamiques
  metadata: FarmAlertMetadata

  // Relations (incluses dans les réponses API)
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
 * Métadonnées dynamiques de l'alerte
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
 * Résumé des alertes (pour badge/compteurs)
 */
export interface FarmAlertsSummary {
  total: number
  unread: number
  byStatus: Record<FarmAlertStatus, number>
  byCategory: Record<AlertCategory, number>
  byPriority: Record<AlertPriority, number>
}

/**
 * Filtres pour la liste des alertes
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
 * DTO pour mettre à jour le statut d'une alerte
 */
export interface UpdateFarmAlertDto {
  status: FarmAlertStatus
  readOn?: ReadPlatform
}

/**
 * Réponse paginée des alertes
 * ⚠️ Utilise la structure standard PaginatedResponse
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
```

---

## 4. Service API

### 4.1 Service Alertes (Conforme DEVELOPMENT_STANDARDS.md §8)

```typescript
// src/lib/services/farm-alerts.service.ts

import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  FarmAlert,
  FarmAlertsSummary,
  FarmAlertsFilterParams,
  FarmAlertsResponse,
  UpdateFarmAlertDto,
  ReadPlatform,
} from '@/lib/types/farm-alert'

/**
 * Service pour la gestion des alertes générées d'une ferme
 * Endpoint: /api/v1/farms/{farmId}/alerts
 */
class FarmAlertsService {
  /**
   * Construit le chemin de base pour une ferme
   */
  private getBasePath(farmId: string): string {
    return `/api/v1/farms/${farmId}/alerts`
  }

  /**
   * Récupère les alertes avec filtres et pagination
   */
  async getAlerts(
    farmId: string,
    params?: FarmAlertsFilterParams
  ): Promise<FarmAlertsResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.status) {
        const statuses = Array.isArray(params.status) ? params.status : [params.status]
        queryParams.append('status', statuses.join(','))
      }
      if (params?.category) {
        const categories = Array.isArray(params.category) ? params.category : [params.category]
        queryParams.append('category', categories.join(','))
      }
      if (params?.priority) {
        const priorities = Array.isArray(params.priority) ? params.priority : [params.priority]
        queryParams.append('priority', priorities.join(','))
      }
      if (params?.animalId) queryParams.append('animalId', params.animalId)
      if (params?.lotId) queryParams.append('lotId', params.lotId)
      if (params?.fromDate) queryParams.append('fromDate', params.fromDate)
      if (params?.toDate) queryParams.append('toDate', params.toDate)
      if (params?.page) queryParams.append('page', String(params.page))
      if (params?.limit) queryParams.append('limit', String(params.limit))
      if (params?.orderBy) queryParams.append('orderBy', params.orderBy)
      if (params?.order) queryParams.append('order', params.order)

      const url = queryParams.toString()
        ? `${this.getBasePath(farmId)}?${queryParams}`
        : this.getBasePath(farmId)

      const response = await apiClient.get<FarmAlertsResponse>(url)
      logger.info('Farm alerts fetched', { farmId, count: response.data.length })
      return response
    } catch (error) {
      logger.error('Failed to fetch farm alerts', { error, farmId, params })
      throw error
    }
  }

  /**
   * Récupère le résumé des alertes (pour dashboard)
   */
  async getSummary(farmId: string): Promise<FarmAlertsSummary> {
    try {
      const response = await apiClient.get<FarmAlertsSummary>(
        `${this.getBasePath(farmId)}/summary`
      )
      logger.info('Farm alerts summary fetched', { farmId, total: response.total })
      return response
    } catch (error) {
      logger.error('Failed to fetch farm alerts summary', { error, farmId })
      throw error
    }
  }

  /**
   * Récupère le compteur d'alertes non lues (pour badge header)
   * Endpoint léger pour polling fréquent
   */
  async getUnreadCount(farmId: string): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>(
        `${this.getBasePath(farmId)}/unread-count`
      )
      return response.count
    } catch (error) {
      logger.error('Failed to fetch unread alerts count', { error, farmId })
      throw error
    }
  }

  /**
   * Récupère une alerte par son ID
   */
  async getById(farmId: string, alertId: string): Promise<FarmAlert> {
    try {
      const response = await apiClient.get<FarmAlert>(
        `${this.getBasePath(farmId)}/${alertId}`
      )
      logger.info('Farm alert fetched', { farmId, alertId })
      return response
    } catch (error) {
      logger.error('Failed to fetch farm alert', { error, farmId, alertId })
      throw error
    }
  }

  /**
   * Met à jour le statut d'une alerte
   */
  async updateStatus(
    farmId: string,
    alertId: string,
    data: UpdateFarmAlertDto
  ): Promise<FarmAlert> {
    try {
      const response = await apiClient.patch<FarmAlert>(
        `${this.getBasePath(farmId)}/${alertId}`,
        data
      )
      logger.info('Farm alert status updated', { farmId, alertId, status: data.status })
      return response
    } catch (error) {
      logger.error('Failed to update farm alert status', { error, farmId, alertId, data })
      throw error
    }
  }

  /**
   * Marque une alerte comme lue
   */
  async markAsRead(farmId: string, alertId: string): Promise<FarmAlert> {
    return this.updateStatus(farmId, alertId, { status: 'read', readOn: 'web' })
  }

  /**
   * Ignore une alerte (dismiss)
   */
  async dismiss(farmId: string, alertId: string): Promise<FarmAlert> {
    return this.updateStatus(farmId, alertId, { status: 'dismissed', readOn: 'web' })
  }

  /**
   * Marque toutes les alertes comme lues
   */
  async markAllAsRead(farmId: string): Promise<{ updatedCount: number }> {
    try {
      const response = await apiClient.post<{ updatedCount: number }>(
        `${this.getBasePath(farmId)}/mark-all-read`,
        { readOn: 'web' as ReadPlatform }
      )
      logger.info('All farm alerts marked as read', { farmId, count: response.updatedCount })
      return response
    } catch (error) {
      logger.error('Failed to mark all farm alerts as read', { error, farmId })
      throw error
    }
  }

  /**
   * Force la génération des alertes
   */
  async generateAlerts(farmId: string): Promise<{
    generated: number
    resolved: number
    unchanged: number
  }> {
    try {
      const response = await apiClient.post<{
        generated: number
        resolved: number
        unchanged: number
      }>(`${this.getBasePath(farmId)}/generate`)
      logger.info('Farm alerts generated', { farmId, ...response })
      return response
    } catch (error) {
      logger.error('Failed to generate farm alerts', { error, farmId })
      throw error
    }
  }
}

// Export singleton
export const farmAlertsService = new FarmAlertsService()
```

---

## 5. Hooks React

### 5.1 Hook Principal : useFarmAlerts

```typescript
// src/lib/hooks/useFarmAlerts.ts

import { useState, useEffect, useCallback } from 'react'
import { farmAlertsService } from '@/lib/services/farm-alerts.service'
import { logger } from '@/lib/utils/logger'
import type {
  FarmAlert,
  FarmAlertsFilterParams,
  FarmAlertsSummary,
} from '@/lib/types/farm-alert'

interface UseFarmAlertsOptions {
  /** Activer le polling automatique (intervalle en ms) */
  pollingInterval?: number
  /** Filtres par défaut */
  defaultFilters?: FarmAlertsFilterParams
}

interface UseFarmAlertsResult {
  /** Liste des alertes */
  alerts: FarmAlert[]
  /** Résumé des alertes */
  summary: FarmAlertsSummary | null
  /** Chargement en cours */
  loading: boolean
  /** Erreur éventuelle */
  error: Error | null
  /** Métadonnées de pagination */
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  /** Filtres actuels */
  filters: FarmAlertsFilterParams
  /** Mettre à jour les filtres */
  setFilters: (filters: FarmAlertsFilterParams) => void
  /** Marquer une alerte comme lue */
  markAsRead: (alertId: string) => Promise<void>
  /** Ignorer une alerte */
  dismiss: (alertId: string) => Promise<void>
  /** Marquer toutes comme lues */
  markAllAsRead: () => Promise<void>
  /** Rafraîchir les données */
  refetch: () => Promise<void>
}

export function useFarmAlerts(
  farmId: string | undefined,
  options?: UseFarmAlertsOptions
): UseFarmAlertsResult {
  const [alerts, setAlerts] = useState<FarmAlert[]>([])
  const [summary, setSummary] = useState<FarmAlertsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })
  const [filters, setFilters] = useState<FarmAlertsFilterParams>(
    options?.defaultFilters ?? { page: 1, limit: 20 }
  )

  // Fetch alertes
  const fetchAlerts = useCallback(async () => {
    if (!farmId) {
      setAlerts([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [alertsResponse, summaryResponse] = await Promise.all([
        farmAlertsService.getAlerts(farmId, filters),
        farmAlertsService.getSummary(farmId),
      ])

      setAlerts(alertsResponse.data)
      setPagination(alertsResponse.meta)
      setSummary(summaryResponse)

      logger.info('Farm alerts loaded', {
        farmId,
        count: alertsResponse.data.length,
        unread: summaryResponse.unread,
      })
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch farm alerts', { error, farmId })
    } finally {
      setLoading(false)
    }
  }, [farmId, filters])

  // Initial fetch
  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  // Polling optionnel
  useEffect(() => {
    if (!options?.pollingInterval || !farmId) return

    const interval = setInterval(() => {
      // Polling léger : uniquement le summary
      farmAlertsService.getSummary(farmId).then(setSummary).catch(() => {})
    }, options.pollingInterval)

    return () => clearInterval(interval)
  }, [farmId, options?.pollingInterval])

  // Actions
  const markAsRead = useCallback(
    async (alertId: string) => {
      if (!farmId) return
      await farmAlertsService.markAsRead(farmId, alertId)
      await fetchAlerts()
    },
    [farmId, fetchAlerts]
  )

  const dismiss = useCallback(
    async (alertId: string) => {
      if (!farmId) return
      await farmAlertsService.dismiss(farmId, alertId)
      await fetchAlerts()
    },
    [farmId, fetchAlerts]
  )

  const markAllAsRead = useCallback(async () => {
    if (!farmId) return
    await farmAlertsService.markAllAsRead(farmId)
    await fetchAlerts()
  }, [farmId, fetchAlerts])

  return {
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
    refetch: fetchAlerts,
  }
}
```

### 5.2 Hook Badge : useUnreadAlertsCount

```typescript
// src/lib/hooks/useUnreadAlertsCount.ts

import { useState, useEffect, useCallback } from 'react'
import { farmAlertsService } from '@/lib/services/farm-alerts.service'
import { logger } from '@/lib/utils/logger'

interface UseUnreadAlertsCountOptions {
  /** Intervalle de polling en ms (défaut: 30000 = 30s) */
  pollingInterval?: number
  /** Désactiver le polling */
  disablePolling?: boolean
}

interface UseUnreadAlertsCountResult {
  /** Nombre d'alertes non lues */
  count: number
  /** Chargement en cours */
  loading: boolean
  /** Rafraîchir manuellement */
  refetch: () => Promise<void>
}

/**
 * Hook léger pour le compteur de badge
 * Optimisé pour polling fréquent (endpoint léger)
 */
export function useUnreadAlertsCount(
  farmId: string | undefined,
  options?: UseUnreadAlertsCountOptions
): UseUnreadAlertsCountResult {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const pollingInterval = options?.pollingInterval ?? 30000 // 30 secondes par défaut

  const fetchCount = useCallback(async () => {
    if (!farmId) {
      setCount(0)
      setLoading(false)
      return
    }

    try {
      const unreadCount = await farmAlertsService.getUnreadCount(farmId)
      setCount(unreadCount)
    } catch (error) {
      // Silencieux pour le polling - ne pas bloquer l'UI
      logger.warn('Failed to fetch unread alerts count', { error, farmId })
    } finally {
      setLoading(false)
    }
  }, [farmId])

  // Initial fetch
  useEffect(() => {
    fetchCount()
  }, [fetchCount])

  // Polling
  useEffect(() => {
    if (options?.disablePolling || !farmId) return

    const interval = setInterval(fetchCount, pollingInterval)
    return () => clearInterval(interval)
  }, [farmId, pollingInterval, options?.disablePolling, fetchCount])

  return {
    count,
    loading,
    refetch: fetchCount,
  }
}
```

---

## 6. Composants UI

### 6.1 Dashboard AlertsCard (Refonte)

```typescript
// src/components/dashboard/alerts-card.tsx

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
import type { AlertCategory, AlertPriority } from '@/lib/types/admin/alert-template'

/**
 * Couleurs par priorité
 */
const PRIORITY_VARIANTS: Record<AlertPriority, 'destructive' | 'warning' | 'default' | 'success'> = {
  urgent: 'destructive',
  high: 'warning',
  medium: 'default',
  low: 'success',
}

/**
 * Icônes par priorité
 */
const PRIORITY_ICONS: Record<AlertPriority, typeof AlertTriangle> = {
  urgent: AlertCircle,
  high: AlertTriangle,
  medium: Info,
  low: Info,
}

export function AlertsCard() {
  const t = useTranslations('dashboard')
  const { user } = useAuth()

  const { summary, loading, error } = useFarmAlerts(user?.farmId, {
    pollingInterval: 60000, // 1 minute
  })

  // État de chargement
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

  // État d'erreur
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

  // Aucune alerte
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

  // Alertes groupées par priorité (dynamique)
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

        {/* Résumé par catégorie (optionnel, si > 5 alertes) */}
        {summary.total > 5 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">{t('alerts.byCategory')}</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(summary.byCategory)
                .filter(([_, count]) => count > 0)
                .map(([category, count]) => (
                  <Badge key={category} variant="outline" className="text-xs">
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
```

### 6.2 Header NotificationBell

```typescript
// src/components/layout/notification-bell.tsx

'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslations } from 'next-intl'
import { useUnreadAlertsCount } from '@/lib/hooks/useUnreadAlertsCount'
import { useFarmAlerts } from '@/lib/hooks/useFarmAlerts'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { AlertPriority } from '@/lib/types/admin/alert-template'

/**
 * Couleurs du badge par priorité max
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

export function NotificationBell() {
  const t = useTranslations('notifications')
  const router = useRouter()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const { count, loading } = useUnreadAlertsCount(user?.farmId)
  const { alerts, markAsRead, markAllAsRead } = useFarmAlerts(user?.farmId, {
    defaultFilters: { status: 'pending', limit: 5 },
  })

  // Priorité max pour la couleur du badge
  const maxPriority = alerts.reduce<AlertPriority | undefined>((max, alert) => {
    const priority = alert.alertTemplate?.priority
    if (!priority) return max
    if (!max) return priority
    const order: AlertPriority[] = ['urgent', 'high', 'medium', 'low']
    return order.indexOf(priority) < order.indexOf(max) ? priority : max
  }, undefined)

  const handleAlertClick = async (alertId: string) => {
    await markAsRead(alertId)
    setOpen(false)
    router.push('/notifications')
  }

  const handleViewAll = () => {
    setOpen(false)
    router.push('/notifications')
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span
              className={cn(
                'absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs text-white flex items-center justify-center',
                getBadgeColor(maxPriority)
              )}
            >
              {count > 99 ? '99+' : count}
            </span>
          )}
          <span className="sr-only">{t('title')}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t('title')}</span>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto py-1"
              onClick={handleMarkAllRead}
            >
              {t('markAllRead')}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t('loading')}
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t('noNotifications')}
          </div>
        ) : (
          <>
            {alerts.slice(0, 5).map((alert) => (
              <DropdownMenuItem
                key={alert.id}
                className="flex flex-col items-start gap-1 cursor-pointer"
                onClick={() => handleAlertClick(alert.id)}
              >
                <div className="flex items-center gap-2 w-full">
                  <Badge
                    variant={
                      alert.alertTemplate?.priority === 'urgent'
                        ? 'destructive'
                        : alert.alertTemplate?.priority === 'high'
                          ? 'warning'
                          : 'default'
                    }
                    className="text-xs"
                  >
                    {alert.alertTemplate?.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(alert.triggeredAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {alert.alertTemplate?.nameFr}
                </span>
                {alert.animal && (
                  <span className="text-xs text-muted-foreground">
                    {alert.animal.visualId || alert.animal.officialNumber}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center justify-center text-primary"
              onClick={handleViewAll}
            >
              {t('viewAll')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 6.3 Page Notifications

```typescript
// src/app/(app)/notifications/page.tsx

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
import { AlertsList } from '@/components/notifications/alerts-list'
import { Pagination } from '@/components/data/common/Pagination'
import type { FarmAlertStatus } from '@/lib/types/farm-alert'
import type { AlertCategory, AlertPriority } from '@/lib/types/admin/alert-template'

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

  // Filtres locaux
  const [statusFilter, setStatusFilter] = useState<FarmAlertStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<AlertCategory | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<AlertPriority | 'all'>('all')

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
      order: 'DESC',
    },
  })

  // Appliquer les filtres
  const handleFilterChange = () => {
    setFilters({
      ...filters,
      page: 1,
      status: statusFilter === 'all' ? undefined : statusFilter,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      priority: priorityFilter === 'all' ? undefined : priorityFilter,
    })
  }

  // Actions
  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAsRead(alertId)
      toast.success(t('messages.markedAsRead'))
    } catch {
      toast.error(tc('error.title'), t('messages.markReadError'))
    }
  }

  const handleDismiss = async (alertId: string) => {
    try {
      await dismiss(alertId)
      toast.success(t('messages.dismissed'))
    } catch {
      toast.error(tc('error.title'), t('messages.dismissError'))
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast.success(t('messages.allMarkedAsRead'))
    } catch {
      toast.error(tc('error.title'), t('messages.markAllReadError'))
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

      {/* Filtres */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('filters.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filtre Statut */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('filters.status')}:</span>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as FarmAlertStatus | 'all')}
              >
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.all')}</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`status.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre Catégorie */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('filters.category')}:</span>
              <Select
                value={categoryFilter}
                onValueChange={(v) => setCategoryFilter(v as AlertCategory | 'all')}
              >
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.all')}</SelectItem>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {t(`categories.${cat}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre Priorité */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('filters.priority')}:</span>
              <Select
                value={priorityFilter}
                onValueChange={(v) => setPriorityFilter(v as AlertPriority | 'all')}
              >
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.all')}</SelectItem>
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

      {/* Liste des alertes */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
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
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}
```

---

## 7. Traductions i18n

### 7.1 Clés à Ajouter (fr.json)

```json
{
  "notifications": {
    "title": "Notifications",
    "subtitle": "{total} alertes dont {unread} non lues",
    "subtitleLoading": "Chargement des alertes...",
    "loading": "Chargement...",
    "noNotifications": "Aucune notification",
    "viewAll": "Voir tout",
    "markAllRead": "Tout marquer comme lu",

    "filters": {
      "title": "Filtres",
      "status": "Statut",
      "category": "Catégorie",
      "priority": "Priorité",
      "all": "Tous",
      "apply": "Appliquer"
    },

    "status": {
      "pending": "En attente",
      "read": "Lu",
      "dismissed": "Ignoré",
      "resolved": "Résolu"
    },

    "categories": {
      "health": "Santé",
      "vaccination": "Vaccination",
      "treatment": "Traitement",
      "reproduction": "Reproduction",
      "nutrition": "Nutrition",
      "administrative": "Administratif",
      "other": "Autre"
    },

    "priorities": {
      "urgent": "Urgent",
      "high": "Élevée",
      "medium": "Moyenne",
      "low": "Faible"
    },

    "actions": {
      "markAsRead": "Marquer comme lu",
      "dismiss": "Ignorer",
      "markAllRead": "Tout marquer comme lu",
      "viewDetails": "Voir les détails"
    },

    "messages": {
      "markedAsRead": "Alerte marquée comme lue",
      "dismissed": "Alerte ignorée",
      "allMarkedAsRead": "Toutes les alertes marquées comme lues",
      "markReadError": "Erreur lors du marquage",
      "dismissError": "Erreur lors de l'ignorement",
      "markAllReadError": "Erreur lors du marquage",
      "loadError": "Erreur lors du chargement des alertes",
      "noAlerts": "Aucune alerte à afficher"
    }
  },

  "dashboard": {
    "alerts": {
      "title": "Alertes",
      "unread": "non lues",
      "viewAll": "Voir tout",
      "noAlerts": "Aucune alerte active",
      "loadError": "Erreur de chargement",
      "byCategory": "Par catégorie",
      "priorities": {
        "urgent": "Urgent",
        "high": "Priorité haute",
        "medium": "Priorité moyenne",
        "low": "Priorité basse"
      },
      "categories": {
        "health": "Santé",
        "vaccination": "Vaccination",
        "treatment": "Traitement",
        "reproduction": "Reproduction",
        "nutrition": "Nutrition",
        "administrative": "Administratif",
        "other": "Autre"
      }
    }
  }
}
```

---

## 8. Intégration dans le Layout

### 8.1 Ajout du NotificationBell dans le Header

```typescript
// Dans src/components/layout/header.tsx ou équivalent

import { NotificationBell } from './notification-bell'

// Dans le JSX du header, à côté du LanguageSwitcher
<div className="flex items-center gap-2">
  <NotificationBell />
  <LanguageSwitcher />
  {/* ... autres éléments */}
</div>
```

---

## 9. Checklist d'Implémentation

### Phase 1 : Base
- [ ] Créer `src/lib/types/farm-alert.ts`
- [ ] Créer `src/lib/services/farm-alerts.service.ts`
- [ ] Vérifier build : `npm run build`

### Phase 2 : Hooks
- [ ] Créer `src/lib/hooks/useFarmAlerts.ts`
- [ ] Créer `src/lib/hooks/useUnreadAlertsCount.ts`
- [ ] Vérifier build : `npm run build`

### Phase 3 : Composants
- [ ] Refondre `src/components/dashboard/alerts-card.tsx`
- [ ] Créer `src/components/layout/notification-bell.tsx`
- [ ] Créer `src/components/notifications/alerts-list.tsx`
- [ ] Créer `src/components/notifications/alert-item.tsx`
- [ ] Vérifier build : `npm run build`

### Phase 4 : Page
- [ ] Créer `src/app/(app)/notifications/page.tsx`
- [ ] Ajouter route dans sidebar si nécessaire
- [ ] Vérifier build : `npm run build`

### Phase 5 : Traductions
- [ ] Ajouter clés dans `fr.json`
- [ ] Vérifier build final : `npm run build`

### Phase 6 : Intégration
- [ ] Ajouter `NotificationBell` dans le header
- [ ] Tester l'ensemble du flux
- [ ] Commit et push

---

*Document généré pour l'équipe de développement AniTra*
