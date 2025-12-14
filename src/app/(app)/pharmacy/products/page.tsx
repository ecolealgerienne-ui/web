'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Plus, Minus, Search, Loader2, Filter, X, Star, Milk, Beef } from 'lucide-react'
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
import { useSpeciesPreferences } from '@/lib/hooks/useSpeciesPreferences'
import { productPreferencesService } from '@/lib/services/product-preferences.service'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/lib/hooks/useToast'
import { handleApiError } from '@/lib/utils/api-error-handler'
import type { Product, ProductType } from '@/lib/types/admin/product'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// === Hooks ===

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// LocalStorage hook for favorites
function useFavorites(key: string): [Set<string>, (id: string) => void] {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [key])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      try {
        localStorage.setItem(key, JSON.stringify([...next]))
      } catch {
        // Ignore localStorage errors
      }
      return next
    })
  }, [key])

  return [favorites, toggleFavorite]
}

// === Constants ===

const PRODUCT_TYPES: (ProductType | 'all')[] = [
  'all',
  'antibiotic',
  'vaccine',
  'antiparasitic',
  'anti_inflammatory',
  'vitamin',
  'other',
]

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

const TYPE_COLORS: Record<string, string> = {
  antibiotic: 'bg-orange-100 text-orange-800 border-orange-200',
  vaccine: 'bg-blue-100 text-blue-800 border-blue-200',
  antiparasitic: 'bg-green-100 text-green-800 border-green-200',
  anti_inflammatory: 'bg-purple-100 text-purple-800 border-purple-200',
  vitamin: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
}

// === Types ===

type WithdrawalFilter = 'all' | 'noMilk' | 'shortMeat' | 'none'
type QuickFilter = 'favorites' | 'noMilk' | 'antibiotics' | 'vaccines'

/**
 * Page Catalogue - Sélection des produits pour la pharmacie
 */
export default function CatalogPage() {
  const t = useTranslations('pharmacy')
  const tc = useTranslations('common')
  const toast = useToast()
  const { user } = useAuth()

  // === États de filtres ===
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<ProductType | 'all'>('all')
  const [formFilter, setFormFilter] = useState<string>('all')
  const [rxFilter, setRxFilter] = useState<'all' | 'required' | 'notRequired'>('all')
  const [speciesFilter, setSpeciesFilter] = useState<string>('all') // 'all' ou speciesId
  const [withdrawalFilter, setWithdrawalFilter] = useState<WithdrawalFilter>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null)

  // Quick filters (chips)
  const [activeQuickFilters, setActiveQuickFilters] = useState<Set<QuickFilter>>(new Set())

  // Favoris (persistés en localStorage)
  const [favorites, toggleFavorite] = useFavorites('pharmacy-favorites')

  // Debounce la recherche
  const debouncedSearch = useDebounce(searchQuery, 300)

  // === Data fetching ===
  const { products: globalProducts, loading: loadingProducts } = useGlobalProducts()
  const {
    preferences,
    loading: loadingPrefs,
    refetch: refetchPreferences,
  } = useProductPreferences(user?.farmId)

  // Espèces configurées par le fermier
  const { preferences: speciesPrefs, loading: loadingSpecies } = useSpeciesPreferences(user?.farmId)

  const loading = loadingProducts || loadingPrefs || loadingSpecies

  // IDs des produits déjà sélectionnés
  const selectedProductIds = useMemo(() => {
    return new Set(preferences.map((p) => p.productId))
  }, [preferences])

  // === Quick filter handlers ===
  const toggleQuickFilter = (filter: QuickFilter) => {
    setActiveQuickFilters((prev) => {
      const next = new Set(prev)
      if (next.has(filter)) {
        next.delete(filter)
      } else {
        next.add(filter)
      }
      return next
    })
  }

  // === Filtering logic ===
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (typeFilter !== 'all') count++
    if (formFilter !== 'all') count++
    if (rxFilter !== 'all') count++
    if (speciesFilter !== 'all') count++
    if (withdrawalFilter !== 'all') count++
    return count
  }, [typeFilter, formFilter, rxFilter, speciesFilter, withdrawalFilter])

  // Helper: check if product matches species filter
  const matchesSpecies = useCallback((product: Product, speciesId: string): boolean => {
    if (speciesId === 'all') return true

    // Trouver l'espèce sélectionnée dans les préférences
    const selectedSpecies = speciesPrefs.find((sp) => sp.speciesId === speciesId)
    if (!selectedSpecies) return true

    // Vérifier si le produit cible cette espèce
    // On cherche le nom de l'espèce dans targetSpecies du produit
    const speciesName = selectedSpecies.species.nameFr.toLowerCase()
    const targetSpeciesLower = product.targetSpecies.map((s) => s.toLowerCase())

    return targetSpeciesLower.some((ts) =>
      ts.includes(speciesName) || speciesName.includes(ts)
    )
  }, [speciesPrefs])

  // Helper: check if product matches withdrawal filter
  const matchesWithdrawal = useCallback((product: Product, filter: WithdrawalFilter): boolean => {
    switch (filter) {
      case 'all':
        return true
      case 'noMilk':
        return !product.withdrawalMilkHours || product.withdrawalMilkHours === 0
      case 'shortMeat':
        return !product.withdrawalMeatDays || product.withdrawalMeatDays < 7
      case 'none':
        return (
          (!product.withdrawalMeatDays || product.withdrawalMeatDays === 0) &&
          (!product.withdrawalMilkHours || product.withdrawalMilkHours === 0)
        )
      default:
        return true
    }
  }, [])

  // Main filter function
  const filteredProducts = useMemo(() => {
    return globalProducts.filter((p) => {
      // Quick filter: favorites only
      if (activeQuickFilters.has('favorites') && !favorites.has(p.id)) {
        return false
      }

      // Quick filter: no milk withdrawal
      if (activeQuickFilters.has('noMilk')) {
        if (p.withdrawalMilkHours && p.withdrawalMilkHours > 0) return false
      }

      // Quick filter: antibiotics
      if (activeQuickFilters.has('antibiotics') && p.type !== 'antibiotic') {
        return false
      }

      // Quick filter: vaccines
      if (activeQuickFilters.has('vaccines') && p.type !== 'vaccine') {
        return false
      }

      // Text search
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase()
        const matchesSearch =
          (p.commercialName || p.nameFr).toLowerCase().includes(query) ||
          (p.code || '').toLowerCase().includes(query) ||
          (p.manufacturer || '').toLowerCase().includes(query) ||
          (p.composition || '').toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Type filter
      if (typeFilter !== 'all' && p.type !== typeFilter) return false

      // Form filter
      if (formFilter !== 'all' && p.therapeuticForm !== formFilter) return false

      // Rx filter
      if (rxFilter === 'required' && !p.prescriptionRequired) return false
      if (rxFilter === 'notRequired' && p.prescriptionRequired) return false

      // Species filter
      if (!matchesSpecies(p, speciesFilter)) return false

      // Withdrawal filter
      if (!matchesWithdrawal(p, withdrawalFilter)) return false

      return true
    })
  }, [
    globalProducts,
    debouncedSearch,
    typeFilter,
    formFilter,
    rxFilter,
    speciesFilter,
    withdrawalFilter,
    activeQuickFilters,
    favorites,
    matchesSpecies,
    matchesWithdrawal,
  ])

  // Selected products (with full info)
  const selectedProducts = useMemo(() => {
    return preferences
      .map((pref) => filteredProducts.find((p) => p.id === pref.productId))
      .filter(Boolean) as Product[]
  }, [preferences, filteredProducts])

  // Available products (not selected)
  const availableProducts = useMemo(() => {
    return filteredProducts.filter((p) => !selectedProductIds.has(p.id))
  }, [filteredProducts, selectedProductIds])

  // === Handlers ===
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
    setSpeciesFilter('all')
    setWithdrawalFilter('all')
    setActiveQuickFilters(new Set())
  }

  // === Render ===
  return (
    <div className="container mx-auto py-6 space-y-4">
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

      {/* Quick Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => toggleQuickFilter('favorites')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            activeQuickFilters.has('favorites')
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          <Star className={cn('h-3.5 w-3.5', activeQuickFilters.has('favorites') && 'fill-yellow-500')} />
          {t('catalog.quickFilters.favorites')}
          {favorites.size > 0 && (
            <span className="text-xs opacity-70">({favorites.size})</span>
          )}
        </button>

        <button
          onClick={() => toggleQuickFilter('noMilk')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            activeQuickFilters.has('noMilk')
              ? 'bg-blue-100 text-blue-800 border border-blue-300'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          <Milk className="h-3.5 w-3.5" />
          {t('catalog.quickFilters.noMilkWithdrawal')}
        </button>

        <button
          onClick={() => toggleQuickFilter('antibiotics')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            activeQuickFilters.has('antibiotics')
              ? 'bg-orange-100 text-orange-800 border border-orange-300'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {t('catalog.productTypes.antibiotic')}
        </button>

        <button
          onClick={() => toggleQuickFilter('vaccines')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            activeQuickFilters.has('vaccines')
              ? 'bg-blue-100 text-blue-800 border border-blue-300'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {t('catalog.productTypes.vaccine')}
        </button>
      </div>

      {/* Search + Filter button */}
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

      {/* Advanced Filters Panel */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Species filter */}
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Espèce</label>
                  <Select
                    value={speciesFilter}
                    onValueChange={setSpeciesFilter}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('catalog.speciesFilter.all')}</SelectItem>
                      {speciesPrefs.map((sp) => (
                        <SelectItem key={sp.speciesId} value={sp.speciesId}>
                          {sp.species.nameFr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type filter */}
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Type</label>
                  <Select
                    value={typeFilter}
                    onValueChange={(v) => setTypeFilter(v as ProductType | 'all')}
                  >
                    <SelectTrigger className="h-9">
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

                {/* Form filter */}
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Forme</label>
                  <Select value={formFilter} onValueChange={setFormFilter}>
                    <SelectTrigger className="h-9">
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

                {/* Rx filter */}
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Prescription</label>
                  <Select
                    value={rxFilter}
                    onValueChange={(v) => setRxFilter(v as 'all' | 'required' | 'notRequired')}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('catalog.prescriptionFilter.all')}</SelectItem>
                      <SelectItem value="required">{t('catalog.prescriptionFilter.required')}</SelectItem>
                      <SelectItem value="notRequired">{t('catalog.prescriptionFilter.notRequired')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Withdrawal filter */}
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Délais</label>
                  <Select
                    value={withdrawalFilter}
                    onValueChange={(v) => setWithdrawalFilter(v as WithdrawalFilter)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('catalog.withdrawalFilter.all')}</SelectItem>
                      <SelectItem value="noMilk">{t('catalog.withdrawalFilter.noMilk')}</SelectItem>
                      <SelectItem value="shortMeat">{t('catalog.withdrawalFilter.shortMeat')}</SelectItem>
                      <SelectItem value="none">{t('catalog.withdrawalFilter.none')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear button */}
                <div className="flex items-end">
                  {(activeFiltersCount > 0 || activeQuickFilters.size > 0) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1 w-full">
                      <X className="h-4 w-4" />
                      {t('catalog.clearFilters')}
                    </Button>
                  )}
                </div>
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
          {/* Selected products */}
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
                    isFavorite={favorites.has(product.id)}
                    isLoading={loadingProductId === product.id}
                    onAction={() => handleRemoveProduct(product.id)}
                    onToggleFavorite={() => toggleFavorite(product.id)}
                    t={t}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Available products */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {t('catalog.allProducts')}
                <Badge variant="secondary">{availableProducts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {activeQuickFilters.has('favorites') && favorites.size === 0 ? (
                    <div className="space-y-2">
                      <Star className="h-8 w-8 mx-auto opacity-50" />
                      <p className="text-sm">{t('catalog.favorites.empty')}</p>
                      <p className="text-xs">{t('catalog.favorites.emptyHint')}</p>
                    </div>
                  ) : debouncedSearch || activeFiltersCount > 0 || activeQuickFilters.size > 0 ? (
                    <p className="text-sm">{t('catalog.noResults')}</p>
                  ) : (
                    <p className="text-sm">{tc('messages.noData')}</p>
                  )}
                </div>
              ) : (
                availableProducts.map((product) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    isSelected={false}
                    isFavorite={favorites.has(product.id)}
                    isLoading={loadingProductId === product.id}
                    onAction={() => handleAddProduct(product.id)}
                    onToggleFavorite={() => toggleFavorite(product.id)}
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

// === Product Item Component ===

interface ProductItemProps {
  product: Product
  isSelected: boolean
  isFavorite: boolean
  isLoading: boolean
  onAction: () => void
  onToggleFavorite: () => void
  t: ReturnType<typeof useTranslations<'pharmacy'>>
}

function ProductItem({
  product,
  isSelected,
  isFavorite,
  isLoading,
  onAction,
  onToggleFavorite,
  t,
}: ProductItemProps) {
  const typeColor = product.type ? TYPE_COLORS[product.type] || TYPE_COLORS.other : null

  const getTherapeuticFormDisplay = (form: string | null | undefined) => {
    if (!form) return null
    if (THERAPEUTIC_FORMS.includes(form)) {
      return t(`catalog.therapeuticForms.${form}`)
    }
    return form
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card gap-2">
      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite()
        }}
        className="shrink-0 p-1 hover:bg-muted rounded transition-colors"
        title={isFavorite ? t('catalog.favorites.remove') : t('catalog.favorites.add')}
      >
        <Star
          className={cn(
            'h-4 w-4 transition-colors',
            isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
          )}
        />
      </button>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm truncate">
            {product.commercialName || product.nameFr}
          </p>
          {typeColor && (
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0',
                typeColor
              )}
            >
              {t(`catalog.productTypes.${product.type}`)}
            </span>
          )}
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
          <div className="flex items-center gap-2 mt-1">
            {product.withdrawalMeatDays && product.withdrawalMeatDays > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Beef className="h-3 w-3" />
                {product.withdrawalMeatDays}j
              </span>
            )}
            {product.withdrawalMilkHours && product.withdrawalMilkHours > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Milk className="h-3 w-3" />
                {product.withdrawalMilkHours}h
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action button */}
      <Button
        variant={isSelected ? 'destructive' : 'default'}
        size="sm"
        onClick={onAction}
        disabled={isLoading}
        className="shrink-0"
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
