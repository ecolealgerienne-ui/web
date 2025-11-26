'use client'

import { useState, useCallback, useRef } from 'react'
import { TransferList, TransferListItem } from '@/components/ui/transfer-list'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { useToast } from '@/lib/hooks/useToast'
import { useUndo } from '@/lib/hooks/useUndo'

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
  const toast = useToast()
  const { markForDeletion, undoOperation, isPendingDeletion } = useUndo<TransferListItem>()

  const [selectedItems, setSelectedItems] = useState<TransferListItem[]>([
    { id: 'vet-1', name: 'Dr. Benali Ahmed', description: 'Alger Centre' },
    { id: 'vet-3', name: 'Dr. Mansouri Leila', description: 'Tipaza', isLocal: true },
  ])
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Ref pour stocker l'état avant suppression (pour undo)
  const deletedItemRef = useRef<TransferListItem | null>(null)

  const handleSelect = useCallback((item: TransferListItem) => {
    setSelectedItems((prev) => [...prev, item])
    setHasChanges(true)
  }, [])

  const handleDeselect = useCallback((itemId: string) => {
    const itemToRemove = selectedItems.find((item) => item.id === itemId)
    if (!itemToRemove) return

    // Soft delete - retirer de la liste visible
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId))
    setHasChanges(true)

    // Marquer pour suppression avec possibilité d'annuler
    const operationId = markForDeletion(
      itemId,
      itemToRemove,
      // Fonction de restauration
      () => {
        setSelectedItems((prev) => [...prev, itemToRemove])
      },
      // Fonction de suppression définitive
      () => {
        // La suppression est déjà faite visuellement
        console.log('Hard delete confirmed:', itemId)
      }
    )

    // Afficher le toast avec option Undo
    toast.undo(
      `${itemToRemove.name} retiré`,
      () => {
        undoOperation(operationId)
        toast.success('Restauré', `${itemToRemove.name} a été restauré`)
      },
      'Cliquez pour annuler'
    )
  }, [selectedItems, markForDeletion, undoOperation, toast])

  const handleCreateLocal = useCallback((name: string) => {
    const newItem: TransferListItem = {
      id: `local-vet-${Date.now()}`,
      name: name,
      description: 'Vétérinaire local',
      isLocal: true,
    }
    setSelectedItems((prev) => [...prev, newItem])
    setHasChanges(true)

    toast.success('Vétérinaire ajouté', `${name} a été ajouté à votre liste`)
  }, [toast])

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
      toast.success('Configuration sauvegardée', 'Vos vétérinaires ont été enregistrés')
    } catch (error) {
      toast.error(
        'Échec de sauvegarde',
        'Vérifiez votre connexion internet',
        {
          label: 'Réessayer',
          onClick: handleSave,
        }
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Filtrer les items en attente de suppression pour l'affichage
  const visibleSelectedItems = selectedItems.filter(
    (item) => !isPendingDeletion(item.id)
  )

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
