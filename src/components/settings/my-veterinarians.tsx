'use client'

import { useState, useCallback } from 'react'
import { TransferList, TransferListItem } from '@/components/ui/transfer-list'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

// Mock des vétérinaires du catalogue global
const MOCK_CATALOG_VETERINARIANS: TransferListItem[] = [
  { id: 'vet-1', name: 'Dr. Benali Ahmed', description: 'Alger Centre' },
  { id: 'vet-2', name: 'Dr. Kaci Farid', description: 'Blida' },
  { id: 'vet-3', name: 'Dr. Mansouri Leila', description: 'Tipaza' },
  { id: 'vet-4', name: 'Dr. Hamdi Sara', description: 'Oran' },
  { id: 'vet-5', name: 'Dr. Boudjema Karim', description: 'Alger Est' },
  { id: 'vet-6', name: 'Dr. Taleb Nadia', description: 'Blida' },
  { id: 'vet-7', name: 'Dr. Cherif Mohamed', description: 'Tizi Ouzou' },
  { id: 'vet-8', name: 'Dr. Amrani Fatima', description: 'Béjaïa' },
  { id: 'vet-9', name: 'Dr. Belkacem Omar', description: 'Sétif' },
  { id: 'vet-10', name: 'Dr. Hadjadj Kamel', description: 'Constantine' },
]

interface MyVeterinariansProps {
  onSave?: (selectedIds: string[], localItems: TransferListItem[]) => Promise<void>
}

export function MyVeterinarians({ onSave }: MyVeterinariansProps) {
  const [selectedItems, setSelectedItems] = useState<TransferListItem[]>([
    { id: 'vet-1', name: 'Dr. Benali Ahmed', description: 'Alger Centre' },
    { id: 'vet-3', name: 'Dr. Mansouri Leila', description: 'Tipaza', isLocal: true },
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
      id: `local-vet-${Date.now()}`,
      name: name,
      description: 'Vétérinaire local',
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
        // Simulation de sauvegarde
        await new Promise((resolve) => setTimeout(resolve, 500))
        console.log('Saved veterinarians:', selectedIds)
      }

      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Mes Vétérinaires</h2>
        <p className="text-sm text-muted-foreground">
          Sélectionnez les vétérinaires que vous consultez régulièrement.
          Ils apparaîtront en priorité dans vos formulaires de saisie.
        </p>
      </div>

      <TransferList
        availableItems={MOCK_CATALOG_VETERINARIANS}
        selectedItems={selectedItems}
        onSelect={handleSelect}
        onDeselect={handleDeselect}
        onCreateLocal={handleCreateLocal}
        availableTitle="Vétérinaires disponibles"
        selectedTitle="Mes vétérinaires"
        searchPlaceholder="Rechercher un vétérinaire..."
        createLocalLabel="Ajouter un vétérinaire local"
        emptySelectedMessage="Sélectionnez vos vétérinaires habituels"
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
