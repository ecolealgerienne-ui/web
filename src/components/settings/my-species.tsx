'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { TransferList, TransferListItem } from '@/components/ui/transfer-list'
import { Button } from '@/components/ui/button'
import { Save, AlertCircle, Plus } from 'lucide-react'
import { useToast } from '@/lib/hooks/useToast'
import { useTranslations } from 'next-intl'
import { useSpeciesPreferences } from '@/lib/hooks/useSpeciesPreferences'
import { useGlobalSpecies } from '@/lib/hooks/useGlobalSpecies'
import { useAuth } from '@/contexts/auth-context'
import { Species, CreateSpeciesDto } from '@/lib/types/admin/species'
import { handleApiError } from '@/lib/utils/api-error-handler'
import { speciesPreferencesService } from '@/lib/services/species-preferences.service'
import { SpeciesLocalFormDialog } from './species-local-form-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

// Convertir une Species API en TransferListItem
function speciesToTransferItem(species: Species): TransferListItem {
  return {
    id: species.id,
    name: species.name,
    description: species.description || species.code,
    metadata: {
      code: species.code,
      scope: (species as any).scope || 'global',
    },
  }
}

export function MySpecies() {
  const t = useTranslations('settings.species')
  const ta = useTranslations('settings.actions')
  const tc = useTranslations('common')
  const toast = useToast()
  const { user } = useAuth()

  // Charger les préférences d'espèces pour cette ferme (liste de droite)
  const {
    preferences,
    loading: loadingPrefs,
    error: errorPrefs,
    savePreferences,
    refetch: refetchPreferences,
  } = useSpeciesPreferences(user?.farmId)

  // Charger toutes les espèces globales (liste de gauche)
  const {
    species: globalSpecies,
    loading: loadingSpecies,
    error: errorSpecies,
    refetch: refetchSpecies,
  } = useGlobalSpecies()

  const loading = loadingPrefs || loadingSpecies
  const error = errorPrefs || errorSpecies

  // Convertir les espèces globales en items de liste (liste gauche)
  const availableItems = useMemo(() => {
    return globalSpecies.map(speciesToTransferItem)
  }, [globalSpecies])

  // Liste combinée de toutes les espèces (globales + locales depuis préférences)
  const allSpecies = useMemo(() => {
    const speciesFromPrefs = preferences
      .map(p => p.species)
      .filter((s): s is Species => s !== null && s !== undefined)

    // Combiner avec les globales, en évitant les doublons
    const allSpecs = [...globalSpecies]
    speciesFromPrefs.forEach(spec => {
      if (!allSpecs.some(s => s.id === spec.id)) {
        allSpecs.push(spec)
      }
    })
    return allSpecs
  }, [globalSpecies, preferences])

  // Items sélectionnés (initialisés depuis les préférences)
  const [selectedItems, setSelectedItems] = useState<TransferListItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Modal de confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<TransferListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Modal d'ajout d'espèce locale
  const [localSpeciesDialogOpen, setLocalSpeciesDialogOpen] = useState(false)
  const [isSavingLocalSpecies, setIsSavingLocalSpecies] = useState(false)

  // Initialiser les sélections depuis les préférences
  useEffect(() => {
    if (preferences.length > 0) {
      const sortedPrefs = [...preferences].sort((a, b) => a.displayOrder - b.displayOrder)
      const initialSelected = sortedPrefs
        .map(pref => pref.species)
        .filter(Boolean)
        .map(speciesToTransferItem)
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
      const scope = deletingItem.metadata?.scope as string | undefined
      const isLocal = scope === 'local'

      const preference = preferences.find(p => p.speciesId === deletingItem.id)

      if (isLocal) {
        // Espèce locale : soft delete
        // TODO: Implémenter le delete d'espèce locale quand l'API sera disponible
        toast.success(tc('messages.success'), t('deleteSuccess'))
      } else {
        // Espèce globale : supprimer uniquement la préférence
        if (preference) {
          await speciesPreferencesService.delete(user.farmId, preference.id)
          toast.success(tc('messages.success'), t('removedFromPreferences'))
        }
      }

      setSelectedItems((prev) => prev.filter((item) => item.id !== deletingItem.id))

      await Promise.all([
        refetchSpecies(),
        refetchPreferences(),
      ])

      setDeleteDialogOpen(false)
      setDeletingItem(null)
    } catch (error) {
      handleApiError(error, 'delete species', toast)
    } finally {
      setIsDeleting(false)
    }
  }, [deletingItem, user?.farmId, preferences, toast, t, tc, refetchSpecies, refetchPreferences])

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
      handleApiError(error, 'save species preferences', toast)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddLocalSpecies = () => {
    setLocalSpeciesDialogOpen(true)
  }

  const handleSubmitLocalSpecies = async (data: CreateSpeciesDto) => {
    if (!user?.farmId) {
      toast.error(tc('error.title'), tc('messages.error'))
      return
    }

    setIsSavingLocalSpecies(true)
    try {
      // TODO: Implémenter la création d'espèce locale quand l'API sera disponible
      // Pour l'instant on simule l'ajout
      toast.success(tc('messages.success'), t('form.createSuccess'))

      await Promise.all([
        refetchSpecies(),
        refetchPreferences(),
      ])

      setLocalSpeciesDialogOpen(false)
    } catch (error) {
      handleApiError(error, 'save local species', toast)
    } finally {
      setIsSavingLocalSpecies(false)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={handleAddLocalSpecies} variant="outline" size="sm">
          <Plus className="w-4 h-4 me-2" />
          {t('addLocal')}
        </Button>
      </div>

      <TransferList
        availableItems={availableItems}
        selectedItems={selectedItems}
        onSelect={handleSelect}
        onDeselect={handleDeselect}
        availableTitle={t('available')}
        selectedTitle={t('selected')}
        searchPlaceholder={t('searchPlaceholder')}
        emptySelectedMessage={t('emptySelected')}
        emptyAvailableMessage={t('noSpecies')}
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

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmDelete')}</DialogTitle>
            <DialogDescription>
              {deletingItem && (
                <>
                  {deletingItem.metadata?.scope === 'local'
                    ? t('confirmDeleteLocal', { name: deletingItem.name })
                    : t('confirmDeleteGlobal', { name: deletingItem.name })
                  }
                </>
              )}
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

      {/* Dialog d'ajout d'espèce locale */}
      <SpeciesLocalFormDialog
        open={localSpeciesDialogOpen}
        onOpenChange={setLocalSpeciesDialogOpen}
        onSubmit={handleSubmitLocalSpecies}
        loading={isSavingLocalSpecies}
      />
    </div>
  )
}
