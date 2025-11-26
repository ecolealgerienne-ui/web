import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  )
}

// Skeleton pour une carte KPI
export function SkeletonKpiCard() {
  return (
    <div className="p-6 rounded-lg border bg-card">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  )
}

// Skeleton pour un graphique
export function SkeletonChart() {
  return (
    <div className="p-6 rounded-lg border bg-card">
      <Skeleton className="h-6 w-48 mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

// Skeleton pour une carte de liste
export function SkeletonListCard() {
  return (
    <div className="p-6 rounded-lg border bg-card">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

// Skeleton pour le tableau de ligne
export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24 ml-auto" />
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

// Skeleton pour le dashboard complet
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SkeletonKpiCard />
        <SkeletonKpiCard />
        <SkeletonKpiCard />
        <SkeletonKpiCard />
      </div>

      {/* Chart */}
      <SkeletonChart />

      {/* Bottom Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonListCard />
        <SkeletonListCard />
      </div>
    </div>
  )
}
