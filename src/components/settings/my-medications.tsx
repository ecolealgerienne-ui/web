'use client'

import { useState, useCallback, useMemo } from 'react'
import { TransferList, TransferListItem } from '@/components/ui/transfer-list'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

// Catégories de produits
type MedicationCategory = 'antibiotic' | 'antiparasitic' | 'anti_inflammatory' | 'vitamin' | 'other'

const CATEGORY_LABELS: Record<MedicationCategory, string> = {
  antibiotic: 'Antibiotiques',
  antiparasitic: 'Antiparasitaires',
  anti_inflammatory: 'Anti-inflammatoires',
  vitamin: 'Vitamines & Compléments',
  other: 'Autres',
}

// Mock des produits médicaux du catalogue global
const MOCK_CATALOG_MEDICATIONS: TransferListItem[] = [
  // Antibiotiques
  { id: 'med-1', name: 'Oxytétracycline 20%', description: 'Antibiotique', metadata: { category: 'antibiotic' } },
  { id: 'med-2', name: 'Pénicilline-Streptomycine', description: 'Antibiotique', metadata: { category: 'antibiotic' } },
  { id: 'med-3', name: 'Amoxicilline', description: 'Antibiotique', metadata: { category: 'antibiotic' } },
  { id: 'med-4', name: 'Enrofloxacine', description: 'Antibiotique', metadata: { category: 'antibiotic' } },

  // Antiparasitaires
  { id: 'med-5', name: 'Ivermectine 1%', description: 'Antiparasitaire', metadata: { category: 'antiparasitic' } },
  { id: 'med-6', name: 'Albendazole', description: 'Antiparasitaire', metadata: { category: 'antiparasitic' } },
  { id: 'med-7', name: 'Fenbendazole', description: 'Antiparasitaire', metadata: { category: 'antiparasitic' } },
  { id: 'med-8', name: 'Lévamisole', description: 'Antiparasitaire', metadata: { category: 'antiparasitic' } },

  // Anti-inflammatoires
  { id: 'med-9', name: 'Méloxicam', description: 'Anti-inflammatoire', metadata: { category: 'anti_inflammatory' } },
  { id: 'med-10', name: 'Flunixine', description: 'Anti-inflammatoire', metadata: { category: 'anti_inflammatory' } },
  { id: 'med-11', name: 'Dexaméthasone', description: 'Corticoïde', metadata: { category: 'anti_inflammatory' } },

  // Vitamines
  { id: 'med-12', name: 'Vitamine AD3E', description: 'Vitamine', metadata: { category: 'vitamin' } },
  { id: 'med-13', name: 'Complexe B', description: 'Vitamine', metadata: { category: 'vitamin' } },
  { id: 'med-14', name: 'Calcium Borogluconate', description: 'Minéral', metadata: { category: 'vitamin' } },

  // Autres
  { id: 'med-15', name: 'Ocytocine', description: 'Hormone', metadata: { category: 'other' } },
  { id: 'med-16', name: 'Atropine', description: 'Antispasmodique', metadata: { category: 'other' } },
]

interface MyMedicationsProps {
  onSave?: (selectedIds: string[], localItems: TransferListItem[]) => Promise<void>
}

export function MyMedications({ onSave }: MyMedicationsProps) {
  const [activeCategory, setActiveCategory] = useState<MedicationCategory | 'all'>('all')
  const [selectedItems, setSelectedItems] = useState<TransferListItem[]>([
    { id: 'med-1', name: 'Oxytétracycline 20%', description: 'Antibiotique' },
    { id: 'med-5', name: 'Ivermectine 1%', description: 'Antiparasitaire' },
    { id: 'med-12', name: 'Vitamine AD3E', description: 'Vitamine' },
  ])
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const filteredCatalog = useMemo(() => {
    if (activeCategory === 'all') {
      return MOCK_CATALOG_MEDICATIONS
    }
    return MOCK_CATALOG_MEDICATIONS.filter(
      (item) => item.metadata?.category === activeCategory
    )
  }, [activeCategory])

  const handleSelect = useCallback((item: TransferListItem) => {
    setSelectedItems((prev) => [...prev, item])
    setHasChanges(true)
  }, [])

  const handleDeselect = useCallback((itemId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId))
    setHasChanges(true)
  }, [])

  const handleCreateLocal = useCallback((name: string) => {
    const newItem: TransferListItem = {
      id: `local-med-${Date.now()}`,
      name: name,
      description: 'Produit local',
      isLocal: true,
    }
    setSelectedItems((prev) => [...prev, newItem])
    setHasChanges(true)
  }, [])

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
    } finally {
      setIsSaving(false)
    }
  }

  const categoryFilters = (
    <div className="flex flex-wrap gap-1">
      <Button
        variant={activeCategory === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setActiveCategory('all')}
        className="h-7 text-xs"
      >
        Tous
      </Button>
      {(Object.keys(CATEGORY_LABELS) as MedicationCategory[]).map((cat) => (
        <Button
          key={cat}
          variant={activeCategory === cat ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory(cat)}
          className="h-7 text-xs"
        >
          {CATEGORY_LABELS[cat]}
        </Button>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Mes Produits Médicaux</h2>
        <p className="text-sm text-muted-foreground">
          Sélectionnez les médicaments et produits vétérinaires que vous utilisez.
          Ils apparaîtront en priorité lors de l'enregistrement des traitements.
        </p>
      </div>

      <TransferList
        availableItems={filteredCatalog}
        selectedItems={selectedItems}
        onSelect={handleSelect}
        onDeselect={handleDeselect}
        onCreateLocal={handleCreateLocal}
        availableTitle="Produits disponibles"
        selectedTitle="Ma pharmacie"
        searchPlaceholder="Rechercher un produit..."
        createLocalLabel="Ajouter un produit local"
        emptySelectedMessage="Sélectionnez vos produits habituels"
        filters={categoryFilters}
      />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer les modifications
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
