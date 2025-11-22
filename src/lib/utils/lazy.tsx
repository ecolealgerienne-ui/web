import React, { Suspense, ComponentType } from 'react'

/**
 * Wrapper pour le lazy loading avec Suspense
 *
 * Usage:
 * import { lazy } from '@/lib/utils/lazy'
 * const HeavyComponent = lazy(() => import('./HeavyComponent'))
 */

interface LazyOptions {
  fallback?: React.ReactNode
}

export function lazy<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyOptions = {}
) {
  const LazyComponent = React.lazy(importFunc)

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={options.fallback || <ComponentSkeleton />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Skeleton de chargement par défaut
function ComponentSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded w-1/4" />
      <div className="h-32 bg-muted rounded" />
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-1/2" />
    </div>
  )
}

// Skeleton pour les tableaux
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-10 bg-muted rounded" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-muted/50 rounded" />
      ))}
    </div>
  )
}

// Skeleton pour les cartes
export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border p-6 space-y-4">
      <div className="h-6 bg-muted rounded w-1/3" />
      <div className="h-4 bg-muted rounded w-full" />
      <div className="h-4 bg-muted rounded w-2/3" />
    </div>
  )
}

// Skeleton pour les graphiques
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="animate-pulse rounded-lg border bg-muted/20"
      style={{ height: `${height}px` }}
    >
      <div className="flex items-end justify-around h-full p-8 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted rounded-t w-full"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </div>
  )
}
