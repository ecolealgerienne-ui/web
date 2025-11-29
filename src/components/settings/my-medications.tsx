'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { TransferList, TransferListItem } from '@/components/ui/transfer-list'
import { Button } from '@/components/ui/button'
import { Save, AlertCircle } from 'lucide-react'
import { useToast } from '@/lib/hooks/useToast'
import { useTranslations } from 'next-intl'
import { useMedicalProducts } from '@/lib/hooks/useMedicalProducts'
import { MedicalProduct, CreateMedicalProductDto, MedicalProductCategory } from '@/lib/types/medical-product'

// Catégories de produits médicaux
const CATEGORIES: { code: MedicalProductCategory | 'all'; key: string }[] = [
  { code: 'all', key: 'all' },
  { code: 'antiparasitic', key: 'antiparasitic' },
  { code: 'antibiotic', key: 'antibiotic' },
  { code: 'anti_inflammatory', key: 'anti_inflammatory' },
  { code: 'vitamin_mineral', key: 'vitamin_mineral' },
  { code: 'hormone', key: 'hormone' },
  { code: 'antiseptic', key: 'antiseptic' },
  { code: 'other', key: 'other' },
]

interface MyMedicationsProps {
  initialSelectedIds?: string[]
  onSave?: (selectedIds: string[], localItems: TransferListItem[]) => Promise<void>
}

// Convertir un MedicalProduct API en TransferListItem
function productToTransferItem(product: MedicalProduct): TransferListItem {
  return {
    id: product.id,
    name: product.nameFr,
    description: product.description || product.commercialName || '',
    metadata: {
      category: product.category,
      activeIngredient: product.activeIngredient,
      manufacturer: product.manufacturer,
      scope: product.scope,
    },
  }
}

export function MyMedications({ initialSelectedIds = [], onSave }: MyMedicationsProps) {
  const t = useTranslations('settings.medications')
  const ta = useTranslations('settings.actions')
  const toast = useToast()

  // Filtre par catégorie
  const [activeCategory, setActiveCategory] = useState<MedicalProductCategory | 'all'>('all')

  // Charger les produits médicaux depuis l'API
  const { medicalProducts, loading, error, createMedicalProduct } = useMedicalProducts({
    isActive: true,
  })

  // Convertir les produits API en items de transfert
  const availableItems = useMemo(() => {
    return medicalProducts.map(productToTransferItem)
  }, [medicalProducts])

  // Items sélectionnés
  const [selectedItems, setSelectedItems] = useState<TransferListItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialiser les sélections depuis initialSelectedIds
  useEffect(() => {
    if (initialSelectedIds.length > 0 && medicalProducts.length > 0) {
      const initialSelected = medicalProducts
        .filter(p => initialSelectedIds.includes(p.id))
        .map(productToTransferItem)
      setSelectedItems(initialSelected)
    }
  }, [initialSelectedIds, medicalProducts])

  // Filtrer les items disponibles par catégorie
  const filteredAvailableItems = useMemo(() => {
    if (activeCategory === 'all') return availableItems
    return availableItems.filter(item => {
      const category = item.metadata?.category as string | undefined
      return category === activeCategory
    })
  }, [availableItems, activeCategory])

  const handleSelect = useCallback((item: TransferListItem) => {
    setSelectedItems((prev) => [...prev, item])
    setHasChanges(true)
  }, [])

  const handleDeselect = useCallback((itemId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId))
    setHasChanges(true)
  }, [])

  const handleCreateLocal = useCallback(async (name: string) => {
    try {
      // Créer le produit via l'API
      const createDto: CreateMedicalProductDto = {
        nameFr: name,
        nameEn: name,
        nameAr: name,
        description: t('localNote'),
        isActive: true,
      }

      const newProduct = await createMedicalProduct(createDto)
      const newItem = productToTransferItem(newProduct)
      newItem.isLocal = true

      setSelectedItems((prev) => [...prev, newItem])
      setHasChanges(true)
      toast.success(t('added'), `${name} ${t('addedTo')}`)
    } catch {
      // Fallback: créer localement si l'API échoue
      const newItem: TransferListItem = {
        id: `local-med-${Date.now()}`,
        name: name,
        description: t('localNote'),
        isLocal: true,
      }
      setSelectedItems((prev) => [...prev, newItem])
      setHasChanges(true)
      toast.success(t('added'), `${name} ${t('addedTo')}`)
    }
  }, [createMedicalProduct, toast, t])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const localItems = selectedItems.filter((item) => item.isLocal)
      const selectedIds = selectedItems.map((item) => item.id)

      if (onSave) {
        await onSave(selectedIds, localItems)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500))
        console.log('Saved medications:', selectedIds)
      }

      setHasChanges(false)
      toast.success(t('saved'), t('savedMessage'))
    } catch {
      toast.error(
        t('saveFailed'),
        t('saveFailedMessage'),
        {
          label: t('retry'),
          onClick: handleSave,
        }
      )
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

  // Composant de filtres par catégorie
  const categoryFilters = (
    <div className="flex flex-wrap gap-1">
      {CATEGORIES.map((cat) => (
        <Button
          key={cat.code}
          variant={activeCategory === cat.code ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory(cat.code)}
          className="h-7 text-xs"
        >
          {t(`categories.${cat.key}`)}
        </Button>
      ))}
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
        onCreateLocal={handleCreateLocal}
        availableTitle={t('available')}
        selectedTitle={t('selected')}
        searchPlaceholder={t('searchPlaceholder')}
        createLocalLabel={t('addLocal')}
        emptySelectedMessage={t('emptySelected')}
        emptyAvailableMessage={t('emptyAvailable')}
        isLoading={loading}
        filters={categoryFilters}
      />

      <div className="flex justify-end">
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
    </div>
  )
}
