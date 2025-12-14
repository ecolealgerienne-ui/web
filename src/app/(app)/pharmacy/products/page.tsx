'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Plus, Minus, Search, Loader2, Filter, X, Pill } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useGlobalProducts } from '@/lib/hooks/useGlobalProducts'
import { useProductPreferences } from '@/lib/hooks/useProductPreferences'
import { productPreferencesService } from '@/lib/services/product-preferences.service'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/lib/hooks/useToast'
import { handleApiError } from '@/lib/utils/api-error-handler'
import type { Product, ProductType } from '@/lib/types/admin/product'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Types de produits disponibles pour le filtre
const PRODUCT_TYPES: (ProductType | 'all')[] = [
  'all',
  'antibiotic',
  'vaccine',
  'antiparasitic',
  'anti_inflammatory',
  'vitamin',
  'other',
]

// Formes thérapeutiques disponibles
const THERAPEUTIC_FORMS = [
  'all',
  'injectable',
  'oral',
  'topical',
  'intramammary',
  'pour-on',
  'bolus',
  'powder',
  'suspension',
  'tablet',
]

// Mapping des couleurs par type de produit
const TYPE_COLORS: Record<string, string> = {
  antibiotic: 'bg-orange-100 text-orange-800 border-orange-200',
  vaccine: 'bg-blue-100 text-blue-800 border-blue-200',
  antiparasitic: 'bg-green-100 text-green-800 border-green-200',
  anti_inflammatory: 'bg-purple-100 text-purple-800 border-purple-200',
  vitamin: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
}

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

  // États de recherche et filtres
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<ProductType | 'all'>('all')
  const [formFilter, setFormFilter] = useState<string>('all')
  const [rxFilter, setRxFilter] = useState<'all' | 'required' | 'notRequired'>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null)

  // Debounce la recherche pour éviter trop de filtrage
  const debouncedSearch = useDebounce(searchQuery, 300)

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

  // Compter le nombre de filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (typeFilter !== 'all') count++
    if (formFilter !== 'all') count++
    if (rxFilter !== 'all') count++
    return count
  }, [typeFilter, formFilter, rxFilter])

  // Filtrer les produits par recherche et filtres
  const filteredProducts = useMemo(() => {
    return globalProducts.filter((p) => {
      // Filtre par recherche textuelle
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase()
        const matchesSearch =
          (p.commercialName || p.nameFr).toLowerCase().includes(query) ||
          (p.code || '').toLowerCase().includes(query) ||
          (p.manufacturer || '').toLowerCase().includes(query) ||
          (p.composition || '').toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Filtre par type de produit
      if (typeFilter !== 'all' && p.type !== typeFilter) {
        return false
      }

      // Filtre par forme thérapeutique
      if (formFilter !== 'all' && p.therapeuticForm !== formFilter) {
        return false
      }

      // Filtre par prescription
      if (rxFilter === 'required' && !p.prescriptionRequired) {
        return false
      }
      if (rxFilter === 'notRequired' && p.prescriptionRequired) {
        return false
      }

      return true
    })
  }, [globalProducts, debouncedSearch, typeFilter, formFilter, rxFilter])

  // Produits sélectionnés (avec infos complètes)
  const selectedProducts = useMemo(() => {
    return preferences
      .map((pref) => filteredProducts.find((p) => p.id === pref.productId))
      .filter(Boolean) as Product[]
  }, [preferences, filteredProducts])

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

  const clearFilters = () => {
    setTypeFilter('all')
    setFormFilter('all')
    setRxFilter('all')
  }

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

      {/* Barre de recherche + Bouton filtres */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('catalog.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      {/* Panneau de filtres */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap gap-4 items-end">
                {/* Filtre par type */}
                <div className="flex-1 min-w-[150px]">
                  <label className="text-sm font-medium mb-1.5 block">Type</label>
                  <Select
                    value={typeFilter}
                    onValueChange={(v) => setTypeFilter(v as ProductType | 'all')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`catalog.productTypes.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtre par forme */}
                <div className="flex-1 min-w-[150px]">
                  <label className="text-sm font-medium mb-1.5 block">Forme</label>
                  <Select value={formFilter} onValueChange={setFormFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {THERAPEUTIC_FORMS.map((form) => (
                        <SelectItem key={form} value={form}>
                          {t(`catalog.therapeuticForms.${form}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtre Rx */}
                <div className="flex-1 min-w-[120px]">
                  <label className="text-sm font-medium mb-1.5 block">Prescription</label>
                  <Select
                    value={rxFilter}
                    onValueChange={(v) => setRxFilter(v as 'all' | 'required' | 'notRequired')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('catalog.prescriptionFilter.all')}</SelectItem>
                      <SelectItem value="required">{t('catalog.prescriptionFilter.required')}</SelectItem>
                      <SelectItem value="notRequired">{t('catalog.prescriptionFilter.notRequired')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bouton effacer */}
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                    <X className="h-4 w-4" />
                    {t('catalog.clearFilters')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

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
                  {debouncedSearch || activeFiltersCount > 0
                    ? t('catalog.noResults')
                    : tc('messages.noData')}
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
  const typeColor = product.type ? TYPE_COLORS[product.type] || TYPE_COLORS.other : null

  // Helper to get therapeutic form display - use translation if available, else raw value
  const getTherapeuticFormDisplay = (form: string | null | undefined) => {
    if (!form) return null
    // Only translate if it's one of our predefined forms
    if (THERAPEUTIC_FORMS.includes(form)) {
      return t(`catalog.therapeuticForms.${form}`)
    }
    // Otherwise return raw value (backend sends full text descriptions)
    return form
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm truncate">
            {product.commercialName || product.nameFr}
          </p>
          {/* Badge Type */}
          {typeColor && (
            <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0', typeColor)}>
              {t(`catalog.productTypes.${product.type}`)}
            </span>
          )}
          {/* Badge Rx */}
          {product.prescriptionRequired && (
            <Badge variant="destructive" className="text-xs shrink-0 px-1.5">
              Rx
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {product.manufacturer || '-'}
          {product.dosage && ` • ${product.dosage}`}
          {product.therapeuticForm && ` • ${getTherapeuticFormDisplay(product.therapeuticForm)}`}
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
        className="shrink-0 ml-2"
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
