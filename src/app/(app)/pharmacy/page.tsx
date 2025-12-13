'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Package, AlertTriangle, XCircle, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useProductPreferences } from '@/lib/hooks/useProductPreferences'
import { useAuth } from '@/contexts/auth-context'
import { getLotExpiryStatus } from '@/lib/types/farmer-product-lot'
import type { ProductPreference } from '@/lib/types/product-preference'
import type { FarmerProductLot } from '@/lib/types/farmer-product-lot'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Page Pharmacie - Vue du stock de médicaments par ferme
 *
 * Affiche les produits sélectionnés par la ferme avec leurs lots.
 * Permet d'ajouter des lots, configurer les produits et lancer des traitements.
 */
export default function PharmacyPage() {
  const t = useTranslations('pharmacy')
  const tc = useTranslations('common')
  const { user } = useAuth()

  const { preferences, loading, error } = useProductPreferences(user?.farmId)

  // Calcul des KPIs
  const kpis = useMemo(() => {
    let totalProducts = 0
    let totalLots = 0
    let expiredLots = 0
    let expiringLots = 0

    preferences.forEach((pref) => {
      totalProducts++
      const lots = pref.farmerLots || []
      lots.forEach((lot) => {
        totalLots++
        const status = getLotExpiryStatus(lot.expiryDate)
        if (status === 'expired') {
          expiredLots++
        } else if (status === 'expiring_soon') {
          expiringLots++
        }
      })
    })

    return { totalProducts, totalLots, expiredLots, expiringLots }
  }, [preferences])

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertTriangle className="h-5 w-5" />
          <span>{tc('messages.error')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Link href="/pharmacy/products" className={cn(buttonVariants())}>
          <Plus className="h-4 w-4 mr-2" />
          {t('actions.addProduct')}
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title={t('kpis.totalProducts')}
          value={loading ? null : kpis.totalProducts}
          icon={<Package className="h-4 w-4" />}
        />
        <KPICard
          title={t('kpis.expiringWithin30Days')}
          value={loading ? null : kpis.expiringLots}
          icon={<AlertTriangle className="h-4 w-4" />}
          variant={kpis.expiringLots > 0 ? 'warning' : 'default'}
        />
        <KPICard
          title={t('kpis.expired')}
          value={loading ? null : kpis.expiredLots}
          icon={<XCircle className="h-4 w-4" />}
          variant={kpis.expiredLots > 0 ? 'destructive' : 'default'}
        />
        <KPICard
          title="Lots actifs"
          value={loading ? null : kpis.totalLots - kpis.expiredLots}
          icon={<Package className="h-4 w-4" />}
        />
      </div>

      {/* Liste des produits avec leurs lots */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : preferences.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('empty.title')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('empty.description')}
            </p>
            <Link href="/pharmacy/products" className={cn(buttonVariants())}>
              <Plus className="h-4 w-4 mr-2" />
              {t('actions.addProduct')}
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {preferences.map((preference) => (
            <ProductCard key={preference.id} preference={preference} />
          ))}
        </div>
      )}
    </div>
  )
}

// Composant KPI Card
interface KPICardProps {
  title: string
  value: number | null
  icon: React.ReactNode
  variant?: 'default' | 'warning' | 'destructive'
}

function KPICard({ title, value, icon, variant = 'default' }: KPICardProps) {
  const variantClasses = {
    default: '',
    warning: 'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20',
    destructive: 'border-destructive/50 bg-destructive/10',
  }

  return (
    <Card className={variantClasses[variant]}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs font-medium">{title}</span>
        </div>
        {value === null ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

// Composant Product Card avec lots
interface ProductCardProps {
  preference: ProductPreference
}

function ProductCard({ preference }: ProductCardProps) {
  const t = useTranslations('pharmacy')
  const product = preference.product
  const lots = preference.farmerLots || []

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{product.commercialName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {product.laboratoryName}
              {product.dosage && ` • ${product.dosage}`}
              {product.therapeuticForm && ` • ${product.therapeuticForm}`}
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {lots.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground text-sm">
            {t('lot.emptyState')}
          </div>
        ) : (
          lots.map((lot) => <LotCard key={lot.id} lot={lot} />)
        )}
        <Button variant="outline" size="sm" className="w-full mt-2">
          <Plus className="h-4 w-4 mr-2" />
          {t('actions.addLot')}
        </Button>
      </CardContent>
    </Card>
  )
}

// Composant Lot Card
interface LotCardProps {
  lot: FarmerProductLot
}

function LotCard({ lot }: LotCardProps) {
  const t = useTranslations('pharmacy')
  const status = getLotExpiryStatus(lot.expiryDate)

  const statusConfig = {
    valid: { variant: 'default' as const, label: t('lot.active'), color: 'bg-green-500' },
    expiring_soon: {
      variant: 'warning' as const,
      label: t('lot.expiresSoon'),
      color: 'bg-yellow-500',
    },
    expired: { variant: 'destructive' as const, label: t('lot.expired'), color: 'bg-red-500' },
  }

  const config = statusConfig[status]
  const expiryDate = new Date(lot.expiryDate).toLocaleDateString('fr-FR')

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <div>
          <p className="font-medium text-sm">{lot.nickname || lot.officialLotNumber}</p>
          <p className="text-xs text-muted-foreground">
            N° {lot.officialLotNumber} • Exp: {expiryDate}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status !== 'valid' && <Badge variant={config.variant}>{config.label}</Badge>}
        <Button variant="outline" size="sm">
          {t('actions.treat')}
        </Button>
      </div>
    </div>
  )
}
