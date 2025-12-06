'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { TransferList, TransferListItem } from '@/components/ui/transfer-list'
import { Button } from '@/components/ui/button'
import { Save, AlertCircle, Plus } from 'lucide-react'
import { useToast } from '@/lib/hooks/useToast'
import { useTranslations } from 'next-intl'
import { useBreedPreferences } from '@/lib/hooks/useBreedPreferences'
import { useGlobalBreeds } from '@/lib/hooks/useGlobalBreeds'
import { useSpeciesPreferences } from '@/lib/hooks/useSpeciesPreferences'
import { useAuth } from '@/contexts/auth-context'
import { Breed, CreateBreedDto } from '@/lib/types/admin/breed'
import { ApiBreedInPreference } from '@/lib/types/breed-preference'
import { handleApiError } from '@/lib/utils/api-error-handler'
import { breedPreferencesService } from '@/lib/services/breed-preferences.service'
import { BreedLocalFormDialog } from './breed-local-form-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

// Convertir une Breed globale en TransferListItem
function breedToTransferItem(breed: Breed): TransferListItem {
  return {
    id: breed.id,
    name: breed.nameFr,
    description: breed.code,
    metadata: {
      code: breed.code,
      speciesId: breed.speciesId,
      scope: 'global',
    },
  }
}

// Convertir une ApiBreedInPreference en TransferListItem
function apiBreedToTransferItem(breed: ApiBreedInPreference): TransferListItem {
  return {
    id: breed.id,
    name: breed.nameFr,
    description: breed.code,
    metadata: {
      code: breed.code,
      speciesId: breed.speciesId,
      scope: 'global',
    },
  }
}

export function MyBreeds() {
  const t = useTranslations('settings.breeds')
  const ta = useTranslations('settings.actions')
  const tc = useTranslations('common')
  const toast = useToast()
  const { user } = useAuth()

  // Charger les espèces sélectionnées par la ferme (pour les onglets)
  const {
    preferences: speciesPreferences,
    loading: loadingSpeciesPrefs,
  } = useSpeciesPreferences(user?.farmId)

  // Espèce active (premier onglet par défaut)
  const [activeSpeciesId, setActiveSpeciesId] = useState<string | null>(null)

  // Initialiser l'espèce active quand les préférences sont chargées
  useEffect(() => {
    if (speciesPreferences.length > 0 && !activeSpeciesId) {
      const sorted = [...speciesPreferences].sort((a, b) => a.displayOrder - b.displayOrder)
      setActiveSpeciesId(sorted[0]?.speciesId || null)
    }
  }, [speciesPreferences, activeSpeciesId])

  // Charger les races globales pour l'espèce active
  const {
    breeds: globalBreeds,
    loading: loadingBreeds,
    error: errorBreeds,
    refetch: refetchBreeds,
  } = useGlobalBreeds(activeSpeciesId || undefined)

  // Charger les préférences de races pour cette ferme
  const {
    preferences: breedPreferences,
    preferencesBySpecies,
    loading: loadingBreedPrefs,
    error: errorBreedPrefs,
    savePreferences,
    refetch: refetchBreedPreferences,
  } = useBreedPreferences(user?.farmId)

  const loading = loadingSpeciesPrefs || loadingBreeds || loadingBreedPrefs
  const error = errorBreeds || errorBreedPrefs

  // Convertir les races globales en items de liste (liste gauche)
  const availableItems = useMemo(() => {
    return globalBreeds.map(breedToTransferItem)
  }, [globalBreeds])

  // Items sélectionnés pour l'espèce active (initialisés depuis les préférences)
  const [selectedItems, setSelectedItems] = useState<TransferListItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Modal de confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<TransferListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Modal d'ajout de race locale
  const [localBreedDialogOpen, setLocalBreedDialogOpen] = useState(false)
  const [isSavingLocalBreed, setIsSavingLocalBreed] = useState(false)

  // Initialiser les sélections depuis les préférences quand l'espèce change
  useEffect(() => {
    if (activeSpeciesId && breedPreferences.length > 0) {
      const prefsForSpecies = preferencesBySpecies(activeSpeciesId)
      const sortedPrefs = [...prefsForSpecies].sort((a, b) => a.displayOrder - b.displayOrder)
      const initialSelected = sortedPrefs
        .map(pref => pref.breed)
        .filter(Boolean)
        .map(apiBreedToTransferItem)
      setSelectedItems(initialSelected)
      setHasChanges(false)
    } else if (activeSpeciesId) {
      setSelectedItems([])
      setHasChanges(false)
    }
  }, [activeSpeciesId, breedPreferences, preferencesBySpecies])

  // Obtenir le nom de l'espèce active
  const activeSpeciesName = useMemo(() => {
    const pref = speciesPreferences.find(p => p.speciesId === activeSpeciesId)
    return pref?.species?.nameFr || ''
  }, [speciesPreferences, activeSpeciesId])

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
      const preference = breedPreferences.find(p => p.breedId === deletingItem.id)

      if (preference) {
        await breedPreferencesService.delete(user.farmId, preference.id)
        toast.success(tc('messages.success'), t('removedFromPreferences'))
      }

      setSelectedItems((prev) => prev.filter((item) => item.id !== deletingItem.id))

      await Promise.all([
        refetchBreeds(),
        refetchBreedPreferences(),
      ])

      setDeleteDialogOpen(false)
      setDeletingItem(null)
    } catch (error) {
      handleApiError(error, 'delete breed preference', toast)
    } finally {
      setIsDeleting(false)
    }
  }, [deletingItem, user?.farmId, breedPreferences, toast, t, tc, refetchBreeds, refetchBreedPreferences])

  const handleSave = async () => {
    if (!user?.farmId) {
      toast.error(tc('error.title'), tc('messages.error'))
      return
    }

    setIsSaving(true)
    try {
      // Récupérer toutes les préférences actuelles des autres espèces
      const currentPrefs = breedPreferences.filter(p => p.breed?.speciesId !== activeSpeciesId)
      const currentBreedIds = currentPrefs.map(p => p.breedId)

      // Ajouter les nouvelles sélections pour l'espèce active
      const selectedIds = selectedItems.map((item) => item.id)
      const allBreedIds = [...currentBreedIds, ...selectedIds]

      await savePreferences(allBreedIds)

      setHasChanges(false)
      toast.success(t('saved'), t('savedMessage'))
    } catch (error) {
      handleApiError(error, 'save breed preferences', toast)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddLocalBreed = () => {
    setLocalBreedDialogOpen(true)
  }

  const handleSubmitLocalBreed = async (data: CreateBreedDto) => {
    if (!user?.farmId) {
      toast.error(tc('error.title'), tc('messages.error'))
      return
    }

    setIsSavingLocalBreed(true)
    try {
      // TODO: Implémenter la création de race locale quand l'API sera disponible
      toast.success(tc('messages.success'), t('form.createSuccess'))

      await Promise.all([
        refetchBreeds(),
        refetchBreedPreferences(),
      ])

      setLocalBreedDialogOpen(false)
    } catch (error) {
      handleApiError(error, 'save local breed', toast)
    } finally {
      setIsSavingLocalBreed(false)
    }
  }

  // Si aucune espèce n'est sélectionnée
  if (!loadingSpeciesPrefs && speciesPreferences.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-muted-foreground" />
          <span className="text-muted-foreground">{t('noSpeciesSelected')}</span>
        </div>
      </div>
    )
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

  // Trier les espèces par displayOrder
  const sortedSpeciesPreferences = [...speciesPreferences].sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        {activeSpeciesId && (
          <Button onClick={handleAddLocalBreed} variant="outline" size="sm">
            <Plus className="w-4 h-4 me-2" />
            {t('addLocal')}
          </Button>
        )}
      </div>

      {/* Onglets par espèce */}
      <div className="flex flex-wrap gap-2">
        {sortedSpeciesPreferences.map((speciesPref) => {
          const count = preferencesBySpecies(speciesPref.speciesId).length
          const isActive = activeSpeciesId === speciesPref.speciesId
          return (
            <Button
              key={speciesPref.speciesId}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSpeciesId(speciesPref.speciesId)}
              className="gap-2"
            >
              {speciesPref.species?.nameFr || speciesPref.speciesId}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive
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

      {activeSpeciesId && (
        <>
          <TransferList
            availableItems={availableItems}
            selectedItems={selectedItems}
            onSelect={handleSelect}
            onDeselect={handleDeselect}
            availableTitle={`${t('available')} - ${activeSpeciesName}`}
            selectedTitle={t('selected')}
            searchPlaceholder={t('searchPlaceholder')}
            emptySelectedMessage={t('emptySelected')}
            emptyAvailableMessage={t('emptyAvailable')}
            isLoading={loading}
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
        </>
      )}

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

      {/* Dialog d'ajout de race locale */}
      {activeSpeciesId && (
        <BreedLocalFormDialog
          open={localBreedDialogOpen}
          onOpenChange={setLocalBreedDialogOpen}
          onSubmit={handleSubmitLocalBreed}
          speciesId={activeSpeciesId}
          speciesName={activeSpeciesName}
          loading={isSavingLocalBreed}
        />
      )}
    </div>
  )
}
