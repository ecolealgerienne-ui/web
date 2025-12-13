'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Plus, Minus, Search, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useGlobalProducts } from '@/lib/hooks/useGlobalProducts'
import { useProductPreferences } from '@/lib/hooks/useProductPreferences'
import { productPreferencesService } from '@/lib/services/product-preferences.service'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/lib/hooks/useToast'
import { handleApiError } from '@/lib/utils/api-error-handler'
import type { Product } from '@/lib/types/admin/product'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Page Catalogue - Sélection des produits pour la pharmacie
 *
 * Affiche le catalogue global de produits et permet au fermier
 * d'ajouter/retirer des produits de sa pharmacie.
 */
export default function CatalogPage() {
  const t = useTranslations('pharmacy')
  const tc = useTranslations('common')
  const toast = useToast()
  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null)

  // Charger les produits globaux
  const { products: globalProducts, loading: loadingProducts } = useGlobalProducts()

  // Charger les préférences de la ferme
  const {
    preferences,
    loading: loadingPrefs,
    refetch: refetchPreferences,
  } = useProductPreferences(user?.farmId)

  const loading = loadingProducts || loadingPrefs

  // IDs des produits déjà sélectionnés
  const selectedProductIds = useMemo(() => {
    return new Set(preferences.map((p) => p.productId))
  }, [preferences])

  // Filtrer les produits par recherche
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return globalProducts
    const query = searchQuery.toLowerCase()
    return globalProducts.filter(
      (p) =>
        p.commercialName.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        p.laboratoryName.toLowerCase().includes(query)
    )
  }, [globalProducts, searchQuery])

  // Produits sélectionnés (avec infos complètes)
  const selectedProducts = useMemo(() => {
    return preferences
      .map((pref) => globalProducts.find((p) => p.id === pref.productId))
      .filter(Boolean) as Product[]
  }, [preferences, globalProducts])

  // Produits non sélectionnés
  const availableProducts = useMemo(() => {
    return filteredProducts.filter((p) => !selectedProductIds.has(p.id))
  }, [filteredProducts, selectedProductIds])

  const handleAddProduct = useCallback(
    async (productId: string) => {
      if (!user?.farmId) return
      setLoadingProductId(productId)

      try {
        await productPreferencesService.create(user.farmId, { productId })
        await refetchPreferences()
        toast.success(tc('messages.success'), t('messages.productAdded'))
      } catch (error) {
        handleApiError(error, 'add product to pharmacy', toast)
      } finally {
        setLoadingProductId(null)
      }
    },
    [user?.farmId, refetchPreferences, toast, tc, t]
  )

  const handleRemoveProduct = useCallback(
    async (productId: string) => {
      if (!user?.farmId) return
      setLoadingProductId(productId)

      try {
        const preference = preferences.find((p) => p.productId === productId)
        if (preference) {
          await productPreferencesService.delete(user.farmId, preference.id)
          await refetchPreferences()
          toast.success(tc('messages.success'), t('messages.productRemoved'))
        }
      } catch (error) {
        handleApiError(error, 'remove product from pharmacy', toast)
      } finally {
        setLoadingProductId(null)
      }
    },
    [user?.farmId, preferences, refetchPreferences, toast, tc, t]
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/pharmacy"
          className={cn(buttonVariants('ghost', 'icon'), 'h-10 w-10')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{t('catalog.title')}</h1>
          <p className="text-muted-foreground">{t('catalog.subtitle')}</p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('catalog.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <>
          {/* Produits sélectionnés */}
          {selectedProducts.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {t('catalog.myProducts')}
                  <Badge variant="secondary">{selectedProducts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedProducts.map((product) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    isSelected
                    isLoading={loadingProductId === product.id}
                    onAction={() => handleRemoveProduct(product.id)}
                    t={t}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Catalogue disponible */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {t('catalog.allProducts')}
                <Badge variant="secondary">{availableProducts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableProducts.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground text-sm">
                  {searchQuery ? t('catalog.noResults') : tc('messages.noData')}
                </p>
              ) : (
                availableProducts.map((product) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    isSelected={false}
                    isLoading={loadingProductId === product.id}
                    onAction={() => handleAddProduct(product.id)}
                    t={t}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

interface ProductItemProps {
  product: Product
  isSelected: boolean
  isLoading: boolean
  onAction: () => void
  t: ReturnType<typeof useTranslations<'pharmacy'>>
}

function ProductItem({ product, isSelected, isLoading, onAction, t }: ProductItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{product.commercialName}</p>
        <p className="text-xs text-muted-foreground truncate">
          {product.laboratoryName}
          {product.dosage && ` • ${product.dosage}`}
          {product.therapeuticForm && ` • ${product.therapeuticForm}`}
        </p>
        {(product.withdrawalMeatDays || product.withdrawalMilkHours) && (
          <p className="text-xs text-muted-foreground mt-1">
            {product.withdrawalMeatDays && `Viande: ${product.withdrawalMeatDays}j`}
            {product.withdrawalMeatDays && product.withdrawalMilkHours && ' | '}
            {product.withdrawalMilkHours && `Lait: ${product.withdrawalMilkHours}h`}
          </p>
        )}
      </div>
      <Button
        variant={isSelected ? 'destructive' : 'default'}
        size="sm"
        onClick={onAction}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSelected ? (
          <>
            <Minus className="h-4 w-4 mr-1" />
            {t('catalog.remove')}
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-1" />
            {t('catalog.add')}
          </>
        )}
      </Button>
    </div>
  )
}
