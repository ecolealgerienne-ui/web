'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { TransferList, TransferListItem } from '@/components/ui/transfer-list'
import { Button } from '@/components/ui/button'
import { Save, AlertCircle } from 'lucide-react'
import { useToast } from '@/lib/hooks/useToast'
import { useTranslations } from 'next-intl'
import { useBreeds } from '@/lib/hooks/useBreeds'
import { Breed, CreateBreedDto } from '@/lib/types/breed'
import { Species } from '@/lib/types/farm'

// Constantes pour les espèces
const ALL_SPECIES: Species[] = ['bovine', 'ovine', 'caprine', 'poultry', 'equine', 'camelid']

interface MyBreedsProps {
  farmSpecies?: Species[]
  initialSelectedIds?: string[]
  onSave?: (selectedIds: string[], localItems: TransferListItem[]) => Promise<void>
}

// Convertir une Breed API en TransferListItem
function breedToTransferItem(breed: Breed): TransferListItem {
  return {
    id: breed.id,
    name: breed.nameFr || breed.name,
    description: breed.description || '',
    metadata: {
      speciesId: breed.speciesId,
      nameFr: breed.nameFr,
      nameEn: breed.nameEn,
      nameAr: breed.nameAr,
    },
  }
}

export function MyBreeds({
  farmSpecies = ['ovine', 'caprine'],
  initialSelectedIds = [],
  onSave
}: MyBreedsProps) {
  const t = useTranslations('settings.breeds')
  const ta = useTranslations('settings.actions')
  const toast = useToast()

  // Espèce active (onglet sélectionné)
  const [activeSpecies, setActiveSpecies] = useState<Species>(farmSpecies[0] || 'bovine')

  // Charger les races depuis l'API pour l'espèce active
  const { breeds, loading, error, createBreed } = useBreeds(activeSpecies)

  // Items sélectionnés par espèce
  const [selectedItemsBySpecies, setSelectedItemsBySpecies] = useState<Record<Species, TransferListItem[]>>(() => {
    const initial: Record<Species, TransferListItem[]> = {} as Record<Species, TransferListItem[]>
    ALL_SPECIES.forEach(sp => { initial[sp] = [] })
    return initial
  })

  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Convertir les races API en items de transfert
  const availableBreeds = useMemo(() => {
    return breeds.map(breed => breedToTransferItem(breed))
  }, [breeds])

  // Items sélectionnés pour l'espèce active
  const selectedBreeds = useMemo(() => {
    return selectedItemsBySpecies[activeSpecies] || []
  }, [activeSpecies, selectedItemsBySpecies])

  // Initialiser les sélections depuis initialSelectedIds
  useEffect(() => {
    if (initialSelectedIds.length > 0 && breeds.length > 0) {
      const initialSelected = breeds
        .filter(b => initialSelectedIds.includes(b.id))
        .map(b => breedToTransferItem(b))

      if (initialSelected.length > 0) {
        setSelectedItemsBySpecies(prev => ({
          ...prev,
          [activeSpecies]: initialSelected,
        }))
      }
    }
  }, [initialSelectedIds, breeds, activeSpecies])

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

  const handleCreateLocal = useCallback(async (name: string) => {
    try {
      // Créer la race via l'API
      const createDto: CreateBreedDto = {
        id: `local-${activeSpecies}-${Date.now()}`,
        speciesId: activeSpecies,
        nameFr: name,
        nameEn: name,
        nameAr: name,
        description: t('breedTypes.local'),
        isActive: true,
      }

      const newBreed = await createBreed(createDto)
      const newItem = breedToTransferItem(newBreed)
      newItem.isLocal = true

      setSelectedItemsBySpecies((prev) => ({
        ...prev,
        [activeSpecies]: [...(prev[activeSpecies] || []), newItem],
      }))
      setHasChanges(true)
      toast.success(t('added'), `${name} ${t('addedTo')}`)
    } catch {
      // Fallback: créer localement si l'API échoue
      const newItem: TransferListItem = {
        id: `local-breed-${activeSpecies}-${Date.now()}`,
        name: name,
        description: t('breedTypes.local'),
        isLocal: true,
      }
      setSelectedItemsBySpecies((prev) => ({
        ...prev,
        [activeSpecies]: [...(prev[activeSpecies] || []), newItem],
      }))
      setHasChanges(true)
      toast.success(t('added'), `${name} ${t('addedTo')}`)
    }
  }, [activeSpecies, createBreed, toast, t])

  const handleSave = async () => {
    setIsSaving(true)
    try {
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

  // Compter le total des races sélectionnées
  const totalSelected = useMemo(() => {
    return Object.values(selectedItemsBySpecies).reduce((acc, items) => acc + items.length, 0)
  }, [selectedItemsBySpecies])

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('subtitle')}
          {totalSelected > 0 && ` (${totalSelected > 1 ? t('totalSelected_plural', { count: totalSelected }) : t('totalSelected', { count: totalSelected })})`}
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
              {t(`species.${species}`)}
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
        availableTitle={`${t('available')} - ${t(`species.${activeSpecies}`)}`}
        selectedTitle={t('selected')}
        searchPlaceholder={t('searchPlaceholder')}
        createLocalLabel={t('addLocal')}
        emptySelectedMessage={t('emptySelected')}
        emptyAvailableMessage={t('emptyAvailable')}
        isLoading={loading}
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
