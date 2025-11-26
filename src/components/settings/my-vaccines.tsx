'use client'

import { useState, useCallback } from 'react'
import { TransferList, TransferListItem } from '@/components/ui/transfer-list'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

// Mock des vaccins du catalogue global
const MOCK_CATALOG_VACCINES: TransferListItem[] = [
  { id: 'vac-1', name: 'Vaccin Fièvre Aphteuse', description: 'Bovins, Ovins, Caprins' },
  { id: 'vac-2', name: 'Vaccin Clavelée', description: 'Ovins' },
  { id: 'vac-3', name: 'Vaccin Charbon Symptomatique', description: 'Bovins' },
  { id: 'vac-4', name: 'Vaccin Rage', description: 'Tous animaux' },
  { id: 'vac-5', name: 'Vaccin Brucellose', description: 'Bovins, Ovins, Caprins' },
  { id: 'vac-6', name: 'Vaccin Entérotoxémie', description: 'Ovins, Caprins' },
  { id: 'vac-7', name: 'Vaccin Newcastle', description: 'Volaille' },
  { id: 'vac-8', name: 'Vaccin Gumboro', description: 'Volaille' },
  { id: 'vac-9', name: 'Vaccin Bronchite Infectieuse', description: 'Volaille' },
  { id: 'vac-10', name: 'Vaccin PPR', description: 'Ovins, Caprins' },
  { id: 'vac-11', name: 'Vaccin BVD', description: 'Bovins' },
  { id: 'vac-12', name: 'Vaccin IBR', description: 'Bovins' },
]

interface MyVaccinesProps {
  onSave?: (selectedIds: string[], localItems: TransferListItem[]) => Promise<void>
}

export function MyVaccines({ onSave }: MyVaccinesProps) {
  const [selectedItems, setSelectedItems] = useState<TransferListItem[]>([
    { id: 'vac-1', name: 'Vaccin Fièvre Aphteuse', description: 'Bovins, Ovins, Caprins' },
    { id: 'vac-2', name: 'Vaccin Clavelée', description: 'Ovins' },
    { id: 'vac-6', name: 'Vaccin Entérotoxémie', description: 'Ovins, Caprins' },
  ])
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

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
      id: `local-vac-${Date.now()}`,
      name: name,
      description: 'Vaccin local',
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
        console.log('Saved vaccines:', selectedIds)
      }

      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Mes Vaccins</h2>
        <p className="text-sm text-muted-foreground">
          Sélectionnez les vaccins que vous utilisez habituellement.
          Ils apparaîtront en priorité lors de l'enregistrement des vaccinations.
        </p>
      </div>

      <TransferList
        availableItems={MOCK_CATALOG_VACCINES}
        selectedItems={selectedItems}
        onSelect={handleSelect}
        onDeselect={handleDeselect}
        onCreateLocal={handleCreateLocal}
        availableTitle="Vaccins disponibles"
        selectedTitle="Mes vaccins"
        searchPlaceholder="Rechercher un vaccin..."
        createLocalLabel="Ajouter un vaccin local"
        emptySelectedMessage="Sélectionnez vos vaccins habituels"
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
