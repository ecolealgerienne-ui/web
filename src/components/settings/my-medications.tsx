'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { TransferList, TransferListItem } from '@/components/ui/transfer-list'
import { Button } from '@/components/ui/button'
import { Save, AlertCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/lib/hooks/useToast'
import { useTranslations } from 'next-intl'
import { useGlobalProducts } from '@/lib/hooks/useGlobalProducts'
import { useProductCategories } from '@/lib/hooks/useProductCategories'
import { useProductPreferences } from '@/lib/hooks/useProductPreferences'
import { useAuth } from '@/contexts/auth-context'
import { Product } from '@/lib/types/admin/product'
import { ApiProductInPreference } from '@/lib/types/product-preference'
import { handleApiError } from '@/lib/utils/api-error-handler'
import { productPreferencesService } from '@/lib/services/product-preferences.service'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

// Convertir un Product global en TransferListItem
function productToTransferItem(product: Product): TransferListItem {
  const parts = [
    product.laboratoryName,
    product.dosage,
    product.therapeuticForm,
  ].filter(Boolean)

  return {
    id: product.id,
    name: product.commercialName,
    description: parts.join(' | '),
    metadata: {
      code: product.code,
      laboratoryName: product.laboratoryName,
      therapeuticForm: product.therapeuticForm,
      dosage: product.dosage,
      scope: 'global',
    },
  }
}

// Convertir un ApiProductInPreference en TransferListItem
function apiProductToTransferItem(product: ApiProductInPreference): TransferListItem {
  const parts = [
    product.laboratoryName,
    product.dosage,
    product.therapeuticForm,
  ].filter(Boolean)

  return {
    id: product.id,
    name: product.commercialName,
    description: parts.join(' | '),
    metadata: {
      code: product.code,
      laboratoryName: product.laboratoryName,
      therapeuticForm: product.therapeuticForm,
      dosage: product.dosage,
      categoryId: product.categoryId,
      scope: 'global',
    },
  }
}

export function MyMedications() {
  const t = useTranslations('settings.medications')
  const ta = useTranslations('settings.actions')
  const tc = useTranslations('common')
  const toast = useToast()
  const { user } = useAuth()

  // Filtre par catégorie
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all')

  // Charger les catégories depuis l'API
  const {
    categories,
    loading: loadingCategories,
  } = useProductCategories()

  // Charger les produits globaux depuis l'API
  const {
    products: globalProducts,
    loading: loadingProducts,
    error: errorProducts,
    refetch: refetchProducts,
  } = useGlobalProducts()

  // Charger les préférences de produits pour cette ferme
  const {
    preferences,
    loading: loadingPrefs,
    error: errorPrefs,
    savePreferences,
    refetch: refetchPreferences,
  } = useProductPreferences(user?.farmId)

  const loading = loadingCategories || loadingProducts || loadingPrefs
  const error = errorProducts || errorPrefs

  // Convertir les produits globaux en items de liste
  const availableItems = useMemo(() => {
    return globalProducts.map(productToTransferItem)
  }, [globalProducts])

  // Filtrer par catégorie (côté client)
  const filteredAvailableItems = useMemo(() => {
    if (activeCategoryId === 'all') return availableItems
    // Note: Le filtrage par categoryId sera implémenté quand les produits auront ce champ
    return availableItems
  }, [availableItems, activeCategoryId])

  // Items sélectionnés (initialisés depuis les préférences)
  const [selectedItems, setSelectedItems] = useState<TransferListItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Modal de confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<TransferListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Initialiser les sélections depuis les préférences
  useEffect(() => {
    if (preferences.length > 0) {
      const sortedPrefs = [...preferences].sort((a, b) => a.displayOrder - b.displayOrder)
      const initialSelected = sortedPrefs
        .map(pref => pref.product)
        .filter(Boolean)
        .map(apiProductToTransferItem)
      setSelectedItems(initialSelected)
    }
  }, [preferences])

  const handleSelect = useCallback((item: TransferListItem) => {
    const alreadyExists = selectedItems.some((selected) => selected.id === item.id)
    if (alreadyExists) {
      toast.warning(t('alreadyInList'), t('alreadyInListMessage', { name: item.name }))
      return
    }
    setSelectedItems((prev) => [...prev, item])
    setHasChanges(true)
  }, [selectedItems, toast, t])

  const handleDeselect = useCallback((itemId: string) => {
    const itemToRemove = selectedItems.find((item) => item.id === itemId)
    if (!itemToRemove) return

    setDeletingItem(itemToRemove)
    setDeleteDialogOpen(true)
  }, [selectedItems])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingItem || !user?.farmId) return

    setIsDeleting(true)
    try {
      const preference = preferences.find(p => p.productId === deletingItem.id)

      if (preference) {
        await productPreferencesService.delete(user.farmId, preference.id)
        toast.success(tc('messages.success'), t('removedFromPreferences'))
      }

      setSelectedItems((prev) => prev.filter((item) => item.id !== deletingItem.id))

      await Promise.all([
        refetchProducts(),
        refetchPreferences(),
      ])

      setDeleteDialogOpen(false)
      setDeletingItem(null)
    } catch (error) {
      handleApiError(error, 'delete product preference', toast)
    } finally {
      setIsDeleting(false)
    }
  }, [deletingItem, user?.farmId, preferences, toast, t, tc, refetchProducts, refetchPreferences])

  const handleSave = async () => {
    if (!user?.farmId) {
      toast.error(tc('error.title'), tc('messages.error'))
      return
    }

    setIsSaving(true)
    try {
      const selectedIds = selectedItems.map((item) => item.id)
      await savePreferences(selectedIds)

      setHasChanges(false)
      toast.success(t('saved'), t('savedMessage'))
    } catch (error) {
      handleApiError(error, 'save product preferences', toast)
    } finally {
      setIsSaving(false)
    }
  }

  // Afficher l'erreur si le chargement a échoué
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>{t('loadError')}</span>
        </div>
      </div>
    )
  }

  // Composant de filtres
  const categoryFilters = (
    <div className="flex items-center gap-2">
      <Select value={activeCategoryId} onValueChange={setActiveCategoryId}>
        <SelectTrigger className="w-[200px] h-8">
          <SelectValue placeholder={t('filters.allCategories')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allCategories')}</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <TransferList
        availableItems={filteredAvailableItems}
        selectedItems={selectedItems}
        onSelect={handleSelect}
        onDeselect={handleDeselect}
        availableTitle={t('available')}
        selectedTitle={t('selected')}
        searchPlaceholder={t('searchPlaceholder')}
        emptySelectedMessage={t('emptySelected')}
        emptyAvailableMessage={t('emptyAvailable')}
        isLoading={loading}
        filters={categoryFilters}
        showCreateLocal={false}
      />

      <div className="flex justify-end gap-2">
        <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin me-2" />
              {ta('saving')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 me-2" />
              {ta('save')}
            </>
          )}
        </Button>
      </div>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmDelete')}</DialogTitle>
            <DialogDescription>
              {deletingItem && t('confirmDeleteMessage', { name: deletingItem.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              {tc('actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? tc('actions.deleting') : tc('actions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
