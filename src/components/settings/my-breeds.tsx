'use client'

import { useState, useCallback, useMemo } from 'react'
import { TransferList, TransferListItem } from '@/components/ui/transfer-list'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { Species } from '@/lib/types/farm'

// Mock des races du catalogue global par espèce
const MOCK_CATALOG_BREEDS: Record<Species, TransferListItem[]> = {
  bovine: [
    { id: 'breed-bov-1', name: 'Charolaise', description: 'Viande' },
    { id: 'breed-bov-2', name: 'Holstein', description: 'Lait' },
    { id: 'breed-bov-3', name: 'Montbéliarde', description: 'Mixte' },
    { id: 'breed-bov-4', name: 'Limousine', description: 'Viande' },
    { id: 'breed-bov-5', name: 'Blonde d\'Aquitaine', description: 'Viande' },
    { id: 'breed-bov-6', name: 'Brune des Alpes', description: 'Lait' },
  ],
  ovine: [
    { id: 'breed-ovi-1', name: 'Ouled Djellal', description: 'Viande' },
    { id: 'breed-ovi-2', name: 'Rembi', description: 'Viande' },
    { id: 'breed-ovi-3', name: 'Hamra', description: 'Viande' },
    { id: 'breed-ovi-4', name: 'Berbère', description: 'Mixte' },
    { id: 'breed-ovi-5', name: 'D\'man', description: 'Prolifique' },
    { id: 'breed-ovi-6', name: 'Sidaou', description: 'Désert' },
  ],
  caprine: [
    { id: 'breed-cap-1', name: 'Alpine', description: 'Lait' },
    { id: 'breed-cap-2', name: 'Saanen', description: 'Lait' },
    { id: 'breed-cap-3', name: 'Arbia', description: 'Mixte' },
    { id: 'breed-cap-4', name: 'M\'zabite', description: 'Désert' },
  ],
  poultry: [
    { id: 'breed-pou-1', name: 'Poulet de chair', description: 'Viande' },
    { id: 'breed-pou-2', name: 'Poule pondeuse', description: 'Oeufs' },
    { id: 'breed-pou-3', name: 'Dinde', description: 'Viande' },
    { id: 'breed-pou-4', name: 'Canard', description: 'Viande' },
  ],
  equine: [
    { id: 'breed-equ-1', name: 'Arabe-Barbe', description: 'Algérie' },
    { id: 'breed-equ-2', name: 'Pur-sang arabe', description: 'Sport' },
    { id: 'breed-equ-3', name: 'Barbe', description: 'Travail' },
  ],
  camelid: [
    { id: 'breed-cam-1', name: 'Méhari', description: 'Course' },
    { id: 'breed-cam-2', name: 'Sahraoui', description: 'Lait/Viande' },
    { id: 'breed-cam-3', name: 'Targui', description: 'Transport' },
  ],
}

const SPECIES_LABELS: Record<Species, string> = {
  bovine: 'Bovins',
  ovine: 'Ovins',
  caprine: 'Caprins',
  poultry: 'Volaille',
  equine: 'Équins',
  camelid: 'Camélidés',
}

interface MyBreedsProps {
  // Les espèces configurées par le fermier
  farmSpecies?: Species[]
  onSave?: (selectedIds: string[], localItems: TransferListItem[]) => Promise<void>
}

export function MyBreeds({ farmSpecies = ['ovine', 'caprine'], onSave }: MyBreedsProps) {
  const [activeSpecies, setActiveSpecies] = useState<Species>(farmSpecies[0] || 'bovine')
  const [selectedItemsBySpecies, setSelectedItemsBySpecies] = useState<Record<Species, TransferListItem[]>>({
    bovine: [],
    ovine: [
      { id: 'breed-ovi-1', name: 'Ouled Djellal', description: 'Viande' },
      { id: 'breed-ovi-3', name: 'Hamra', description: 'Viande' },
    ],
    caprine: [
      { id: 'breed-cap-1', name: 'Alpine', description: 'Lait' },
    ],
    poultry: [],
    equine: [],
    camelid: [],
  })
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const availableBreeds = useMemo(() => {
    return MOCK_CATALOG_BREEDS[activeSpecies] || []
  }, [activeSpecies])

  const selectedBreeds = useMemo(() => {
    return selectedItemsBySpecies[activeSpecies] || []
  }, [activeSpecies, selectedItemsBySpecies])

  const handleSelect = useCallback((item: TransferListItem) => {
    setSelectedItemsBySpecies((prev) => ({
      ...prev,
      [activeSpecies]: [...(prev[activeSpecies] || []), item],
    }))
    setHasChanges(true)
  }, [activeSpecies])

  const handleDeselect = useCallback((itemId: string) => {
    setSelectedItemsBySpecies((prev) => ({
      ...prev,
      [activeSpecies]: (prev[activeSpecies] || []).filter((item) => item.id !== itemId),
    }))
    setHasChanges(true)
  }, [activeSpecies])

  const handleCreateLocal = useCallback((name: string) => {
    const newItem: TransferListItem = {
      id: `local-breed-${activeSpecies}-${Date.now()}`,
      name: name,
      description: 'Race locale',
      isLocal: true,
    }
    setSelectedItemsBySpecies((prev) => ({
      ...prev,
      [activeSpecies]: [...(prev[activeSpecies] || []), newItem],
    }))
    setHasChanges(true)
  }, [activeSpecies])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Flatten all selected items
      const allSelected = Object.values(selectedItemsBySpecies).flat()
      const localItems = allSelected.filter((item) => item.isLocal)
      const selectedIds = allSelected.map((item) => item.id)

      if (onSave) {
        await onSave(selectedIds, localItems)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500))
        console.log('Saved breeds:', selectedIds)
      }

      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  // Compter le total des races sélectionnées
  const totalSelected = useMemo(() => {
    return Object.values(selectedItemsBySpecies).reduce((acc, items) => acc + items.length, 0)
  }, [selectedItemsBySpecies])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Mes Races</h2>
        <p className="text-sm text-muted-foreground">
          Sélectionnez les races que vous élevez.
          {totalSelected > 0 && ` (${totalSelected} race${totalSelected > 1 ? 's' : ''} sélectionnée${totalSelected > 1 ? 's' : ''})`}
        </p>
      </div>

      {/* Onglets par espèce */}
      <div className="flex flex-wrap gap-2">
        {farmSpecies.map((species) => {
          const count = (selectedItemsBySpecies[species] || []).length
          return (
            <Button
              key={species}
              variant={activeSpecies === species ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSpecies(species)}
              className="gap-2"
            >
              {SPECIES_LABELS[species]}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeSpecies === species
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {count}
                </span>
              )}
            </Button>
          )
        })}
      </div>

      <TransferList
        availableItems={availableBreeds}
        selectedItems={selectedBreeds}
        onSelect={handleSelect}
        onDeselect={handleDeselect}
        onCreateLocal={handleCreateLocal}
        availableTitle={`Races ${SPECIES_LABELS[activeSpecies].toLowerCase()} disponibles`}
        selectedTitle="Mes races"
        searchPlaceholder="Rechercher une race..."
        createLocalLabel="Ajouter une race locale"
        emptySelectedMessage="Sélectionnez vos races"
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
