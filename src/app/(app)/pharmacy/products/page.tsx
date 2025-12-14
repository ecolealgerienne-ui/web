'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  ArrowLeft,
  Plus,
  Minus,
  Search,
  Loader2,
  Filter,
  X,
  Star,
  Milk,
  Beef,
  ChevronDown,
  Info,
} from 'lucide-react'
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
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

function useFavorites(key: string): [Set<string>, (id: string) => void] {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)))
      }
    } catch {
      // Ignore
    }
  }, [key])

  const toggleFavorite = useCallback(
    (id: string) => {
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
          // Ignore
        }
        return next
      })
    },
    [key]
  )

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

// Mapping categoryCode -> type pour les quick filters
const CATEGORY_CODE_TO_TYPE: Record<string, ProductType> = {
  antibiotics: 'antibiotic',
  antibiotiques: 'antibiotic',
  vaccines: 'vaccine',
  vaccins: 'vaccine',
  antiparasitics: 'antiparasitic',
  antiparasitaires: 'antiparasitic',
  'anti-inflammatoires': 'anti_inflammatory',
  'anti_inflammatory': 'anti_inflammatory',
  vitamins: 'vitamin',
  vitamines: 'vitamin',
}

// Nombre de produits par page
const ITEMS_PER_PAGE = 50

// === Types ===

type WithdrawalFilter = 'all' | 'noMilk' | 'shortMeat' | 'none'
type QuickFilter = 'favorites' | 'noMilk' | 'antibiotics' | 'vaccines'

// === Helper functions ===

function getProductType(product: Product): ProductType | null {
  // D'abord utiliser le type si défini
  if (product.type) return product.type

  // Sinon déduire du categoryCode
  if (product.categoryCode) {
    const code = product.categoryCode.toLowerCase()
    return CATEGORY_CODE_TO_TYPE[code] || null
  }

  return null
}

function isAntibiotic(product: Product): boolean {
  const type = getProductType(product)
  if (type === 'antibiotic') return true

  // Fallback: chercher dans le nom ou la composition
  const searchText = `${product.nameFr} ${product.commercialName || ''} ${product.categoryCode || ''} ${product.composition || ''}`.toLowerCase()
  return (
    searchText.includes('antibioti') ||
    searchText.includes('antimicrobi') ||
    searchText.includes('amoxicil') ||
    searchText.includes('pénicil') ||
    searchText.includes('oxytétracycl')
  )
}

function isVaccine(product: Product): boolean {
  const type = getProductType(product)
  if (type === 'vaccine') return true

  // Fallback: chercher dans le nom ou la composition
  const searchText = `${product.nameFr} ${product.commercialName || ''} ${product.categoryCode || ''}`.toLowerCase()
  return (
    searchText.includes('vaccin') ||
    searchText.includes('vaccine') ||
    searchText.includes('lyophilisat')
  )
}

/**
 * Page Catalogue - Sélection des produits pour la pharmacie
 */
export default function CatalogPage() {
  const t = useTranslations('pharmacy')
  const tc = useTranslations('common')
  const tp = useTranslations('product')
  const toast = useToast()
  const { user } = useAuth()

  // === États de filtres ===
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<ProductType | 'all'>('all')
  const [formFilter, setFormFilter] = useState<string>('all')
  const [rxFilter, setRxFilter] = useState<'all' | 'required' | 'notRequired'>('all')
  const [speciesFilter, setSpeciesFilter] = useState<string>('all')
  const [withdrawalFilter, setWithdrawalFilter] = useState<WithdrawalFilter>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null)

  // Pagination
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)

  // Quick filters
  const [activeQuickFilters, setActiveQuickFilters] = useState<Set<QuickFilter>>(new Set())

  // Favoris
  const [favorites, toggleFavorite] = useFavorites('pharmacy-favorites')

  // Detail sheet
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Debounce
  const debouncedSearch = useDebounce(searchQuery, 300)

  // === Data fetching ===
  const { products: globalProducts, loading: loadingProducts } = useGlobalProducts()
  const {
    preferences,
    loading: loadingPrefs,
    refetch: refetchPreferences,
  } = useProductPreferences(user?.farmId)

  const { preferences: speciesPrefs, loading: loadingSpecies } = useSpeciesPreferences(user?.farmId)

  const loading = loadingProducts || loadingPrefs || loadingSpecies

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
    // Reset pagination when filter changes
    setDisplayCount(ITEMS_PER_PAGE)
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

  const matchesSpecies = useCallback(
    (product: Product, speciesId: string): boolean => {
      if (speciesId === 'all') return true
      if (!product.targetSpecies || product.targetSpecies.length === 0) return true // Pas d'info = tous

      const selectedSpecies = speciesPrefs.find((sp) => sp.speciesId === speciesId)
      if (!selectedSpecies) return true

      const speciesName = selectedSpecies.species.nameFr.toLowerCase()
      const targetSpeciesLower = product.targetSpecies.map((s) => s.toLowerCase())

      return targetSpeciesLower.some(
        (ts) => ts.includes(speciesName) || speciesName.includes(ts.split(' ')[0])
      )
    },
    [speciesPrefs]
  )

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

      // Quick filter: antibiotics (using helper function)
      if (activeQuickFilters.has('antibiotics') && !isAntibiotic(p)) {
        return false
      }

      // Quick filter: vaccines (using helper function)
      if (activeQuickFilters.has('vaccines') && !isVaccine(p)) {
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
      if (typeFilter !== 'all') {
        const productType = getProductType(p)
        if (productType !== typeFilter) return false
      }

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

  // Stats for quick filters
  const filterStats = useMemo(() => {
    return {
      antibiotics: globalProducts.filter(isAntibiotic).length,
      vaccines: globalProducts.filter(isVaccine).length,
    }
  }, [globalProducts])

  // Selected products
  const selectedProducts = useMemo(() => {
    return preferences
      .map((pref) => filteredProducts.find((p) => p.id === pref.productId))
      .filter(Boolean) as Product[]
  }, [preferences, filteredProducts])

  // Available products (paginated)
  const availableProducts = useMemo(() => {
    return filteredProducts.filter((p) => !selectedProductIds.has(p.id))
  }, [filteredProducts, selectedProductIds])

  const displayedProducts = useMemo(() => {
    return availableProducts.slice(0, displayCount)
  }, [availableProducts, displayCount])

  const hasMore = displayCount < availableProducts.length

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

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setDetailOpen(true)
  }

  const clearFilters = () => {
    setTypeFilter('all')
    setFormFilter('all')
    setRxFilter('all')
    setSpeciesFilter('all')
    setWithdrawalFilter('all')
    setActiveQuickFilters(new Set())
    setDisplayCount(ITEMS_PER_PAGE)
  }

  const loadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE)
  }

  // === Render ===
  return (
    <div className="container mx-auto py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/pharmacy" className={cn(buttonVariants('ghost', 'icon'), 'h-10 w-10')}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{t('catalog.title')}</h1>
          <p className="text-muted-foreground">
            {t('catalog.subtitle')} • {globalProducts.length} produits disponibles
          </p>
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
          <Star
            className={cn('h-3.5 w-3.5', activeQuickFilters.has('favorites') && 'fill-yellow-500')}
          />
          {t('catalog.quickFilters.favorites')}
          {favorites.size > 0 && <span className="text-xs opacity-70">({favorites.size})</span>}
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
          <span className="text-xs opacity-70">({filterStats.antibiotics})</span>
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
          <span className="text-xs opacity-70">({filterStats.vaccines})</span>
        </button>
      </div>

      {/* Search + Filter button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('catalog.search')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setDisplayCount(ITEMS_PER_PAGE)
            }}
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
                {speciesPrefs.length > 0 && (
                  <div>
                    <label className="text-xs font-medium mb-1 block text-muted-foreground">
                      Espèce
                    </label>
                    <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
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
                )}

                {/* Type filter */}
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">
                    Type
                  </label>
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
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">
                    Forme
                  </label>
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
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">
                    Prescription
                  </label>
                  <Select
                    value={rxFilter}
                    onValueChange={(v) => setRxFilter(v as 'all' | 'required' | 'notRequired')}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('catalog.prescriptionFilter.all')}</SelectItem>
                      <SelectItem value="required">
                        {t('catalog.prescriptionFilter.required')}
                      </SelectItem>
                      <SelectItem value="notRequired">
                        {t('catalog.prescriptionFilter.notRequired')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Withdrawal filter */}
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">
                    Délais
                  </label>
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
                      <SelectItem value="shortMeat">
                        {t('catalog.withdrawalFilter.shortMeat')}
                      </SelectItem>
                      <SelectItem value="none">{t('catalog.withdrawalFilter.none')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear button */}
                <div className="flex items-end">
                  {(activeFiltersCount > 0 || activeQuickFilters.size > 0) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-9 gap-1 w-full"
                    >
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
                    onClick={() => handleProductClick(product)}
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
              {displayedProducts.length === 0 ? (
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
                <>
                  {displayedProducts.map((product) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      isSelected={false}
                      isFavorite={favorites.has(product.id)}
                      isLoading={loadingProductId === product.id}
                      onAction={() => handleAddProduct(product.id)}
                      onToggleFavorite={() => toggleFavorite(product.id)}
                      onClick={() => handleProductClick(product)}
                      t={t}
                    />
                  ))}

                  {/* Load more button */}
                  {hasMore && (
                    <div className="pt-4 text-center">
                      <Button variant="outline" onClick={loadMore} className="gap-2">
                        <ChevronDown className="h-4 w-4" />
                        Afficher plus ({availableProducts.length - displayCount} restants)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Product Detail Sheet */}
      <ProductDetailSheet
        product={selectedProduct}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        isFavorite={selectedProduct ? favorites.has(selectedProduct.id) : false}
        isSelected={selectedProduct ? selectedProductIds.has(selectedProduct.id) : false}
        onToggleFavorite={() => selectedProduct && toggleFavorite(selectedProduct.id)}
        onAdd={() => selectedProduct && handleAddProduct(selectedProduct.id)}
        onRemove={() => selectedProduct && handleRemoveProduct(selectedProduct.id)}
        loading={loadingProductId === selectedProduct?.id}
        t={t}
        tp={tp}
      />
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
  onClick: () => void
  t: ReturnType<typeof useTranslations<'pharmacy'>>
}

function ProductItem({
  product,
  isSelected,
  isFavorite,
  isLoading,
  onAction,
  onToggleFavorite,
  onClick,
  t,
}: ProductItemProps) {
  const productType = getProductType(product)
  const typeColor = productType ? TYPE_COLORS[productType] || TYPE_COLORS.other : null

  const getTherapeuticFormDisplay = (form: string | null | undefined) => {
    if (!form) return null
    if (THERAPEUTIC_FORMS.includes(form)) {
      return t(`catalog.therapeuticForms.${form}`)
    }
    return form
  }

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg border bg-card gap-2 hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
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
          <p className="font-medium text-sm truncate">{product.commercialName || product.nameFr}</p>
          {typeColor && (
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0',
                typeColor
              )}
            >
              {t(`catalog.productTypes.${productType}`)}
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
        onClick={(e) => {
          e.stopPropagation()
          onAction()
        }}
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

// === Product Detail Sheet Component ===

interface ProductDetailSheetProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isFavorite: boolean
  isSelected: boolean
  onToggleFavorite: () => void
  onAdd: () => void
  onRemove: () => void
  loading: boolean
  t: ReturnType<typeof useTranslations<'pharmacy'>>
  tp: ReturnType<typeof useTranslations<'product'>>
}

function ProductDetailSheet({
  product,
  open,
  onOpenChange,
  isFavorite,
  isSelected,
  onToggleFavorite,
  onAdd,
  onRemove,
  loading,
  t,
  tp,
}: ProductDetailSheetProps) {
  if (!product) return null

  const productType = getProductType(product)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <SheetTitle className="text-left">
                {product.commercialName || product.nameFr}
              </SheetTitle>
              {product.code && (
                <SheetDescription className="text-left font-mono">{product.code}</SheetDescription>
              )}
            </div>
            <button
              onClick={onToggleFavorite}
              className="shrink-0 p-2 hover:bg-muted rounded-full transition-colors"
            >
              <Star
                className={cn(
                  'h-5 w-5',
                  isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                )}
              />
            </button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {productType && (
              <Badge
                className={cn(
                  TYPE_COLORS[productType] || TYPE_COLORS.other,
                  'border'
                )}
              >
                {t(`catalog.productTypes.${productType}`)}
              </Badge>
            )}
            {product.prescriptionRequired && <Badge variant="destructive">Rx requis</Badge>}
            {product.therapeuticForm && <Badge variant="secondary">{product.therapeuticForm}</Badge>}
          </div>

          {/* Info sections */}
          <div className="space-y-4">
            {/* Fabricant & Dosage */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{tp('fields.manufacturer')}</p>
                <p className="text-sm font-medium">{product.manufacturer || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{tp('fields.dosage')}</p>
                <p className="text-sm font-medium">{product.dosage || '-'}</p>
              </div>
            </div>

            {/* Composition */}
            {product.composition && (
              <div>
                <p className="text-xs text-muted-foreground">{tp('fields.composition')}</p>
                <p className="text-sm">{product.composition}</p>
              </div>
            )}

            {/* Voie d'administration */}
            {product.administrationRoute && (
              <div>
                <p className="text-xs text-muted-foreground">{tp('fields.administrationRoute')}</p>
                <p className="text-sm">{product.administrationRoute}</p>
              </div>
            )}

            {/* Espèces cibles */}
            {product.targetSpecies && product.targetSpecies.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">{tp('fields.targetSpecies')}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.targetSpecies.map((species, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {species}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Délais d'attente */}
            {(product.withdrawalMeatDays || product.withdrawalMilkHours) && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Délais d'attente</p>
                <div className="flex gap-4">
                  {product.withdrawalMeatDays !== null && (
                    <div className="flex items-center gap-2">
                      <Beef className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{product.withdrawalMeatDays} jours</p>
                        <p className="text-xs text-muted-foreground">Viande</p>
                      </div>
                    </div>
                  )}
                  {product.withdrawalMilkHours !== null && (
                    <div className="flex items-center gap-2">
                      <Milk className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{product.withdrawalMilkHours} heures</p>
                        <p className="text-xs text-muted-foreground">Lait</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {product.notes && (
              <div>
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{product.notes}</p>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="pt-4 border-t">
            <Button
              variant={isSelected ? 'destructive' : 'default'}
              className="w-full"
              onClick={isSelected ? onRemove : onAdd}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : isSelected ? (
                <>
                  <Minus className="h-4 w-4 mr-2" />
                  {t('catalog.remove')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('catalog.add')}
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
