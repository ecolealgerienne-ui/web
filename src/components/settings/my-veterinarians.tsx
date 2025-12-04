'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { TransferList, TransferListItem } from '@/components/ui/transfer-list'
import { Button } from '@/components/ui/button'
import { Save, AlertCircle, Plus, Pencil } from 'lucide-react'
import { useToast } from '@/lib/hooks/useToast'
import { useUndo } from '@/lib/hooks/useUndo'
import { useTranslations } from 'next-intl'
import { useVeterinarianPreferences } from '@/lib/hooks/useVeterinarianPreferences'
import { useAvailableVeterinarians } from '@/lib/hooks/useAvailableVeterinarians'
import { useAuth } from '@/contexts/auth-context'
import { Veterinarian, CreateVeterinarianDto, UpdateVeterinarianDto } from '@/lib/types/veterinarian'
import { handleApiError } from '@/lib/utils/api-error-handler'
import { veterinarianPreferencesService } from '@/lib/services/veterinarian-preferences.service'
import { veterinariansService } from '@/lib/services/veterinarians.service'
import { VeterinarianLocalFormDialog } from './veterinarian-local-form-dialog'
import { VeterinarianDetailsDialog } from './veterinarian-details-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

// Régions disponibles (Algérie)
const REGIONS = [
  { code: 'ALG', name: 'Alger' },
  { code: 'ORA', name: 'Oran' },
  { code: 'CON', name: 'Constantine' },
  { code: 'BLI', name: 'Blida' },
  { code: 'SET', name: 'Sétif' },
  { code: 'BAT', name: 'Batna' },
  { code: 'TIP', name: 'Tipaza' },
  { code: 'TIZ', name: 'Tizi Ouzou' },
  { code: 'BEJ', name: 'Béjaïa' },
]

// Spécialités vétérinaires
const SPECIALTIES = [
  { code: 'bovine', key: 'bovine' },
  { code: 'ovine', key: 'ovine' },
  { code: 'caprine', key: 'caprine' },
  { code: 'poultry', key: 'poultry' },
  { code: 'equine', key: 'equine' },
  { code: 'camelid', key: 'camelid' },
  { code: 'general', key: 'general' },
  { code: 'other', key: 'other' },
]

interface MyVeterinariansProps {
  // Props removed - now uses auth context and preferences hook
}

// Convertir un Veterinarian API en TransferListItem
function vetToTransferItem(vet: Veterinarian): TransferListItem {
  return {
    id: vet.id,
    name: `Dr. ${vet.firstName} ${vet.lastName}`,
    description: vet.city || vet.clinic || '',
    region: vet.city?.substring(0, 3).toUpperCase(),
    phone: vet.phone,
    metadata: {
      specialties: vet.specialties,
      licenseNumber: vet.licenseNumber,
      email: vet.email,
      scope: vet.scope, // Ajouter le scope pour savoir si local ou global
    },
  }
}

export function MyVeterinarians() {
  const t = useTranslations('settings.veterinarians')
  const ta = useTranslations('settings.actions')
  const tc = useTranslations('common')
  const toast = useToast()
  const { user } = useAuth()
  const { markForDeletion, undoOperation, isPendingDeletion } = useUndo<TransferListItem>()

  // Filtres
  const [filterRegion, setFilterRegion] = useState<string>('')
  const [filterSpecialty, setFilterSpecialty] = useState<string>('')

  // Charger les préférences de vétérinaires pour cette ferme (liste de droite)
  const {
    preferences,
    loading: loadingPrefs,
    error: errorPrefs,
    savePreferences,
    refetch: refetchPreferences,
  } = useVeterinarianPreferences(user?.farmId)

  // Charger tous les vétérinaires disponibles pour cette ferme (liste de gauche)
  // Endpoint retourne automatiquement : globaux + locaux de la ferme
  const {
    veterinarians,
    loading: loadingVets,
    error: errorVets,
    refetch: refetchVeterinarians,
  } = useAvailableVeterinarians(user?.farmId)

  const loading = loadingPrefs || loadingVets
  const error = errorPrefs || errorVets

  // Convertir les vétérinaires disponibles en items de liste
  // (globaux de la plateforme + locaux créés par le fermier)
  const availableItems = useMemo(() => {
    return veterinarians.map(vetToTransferItem)
  }, [veterinarians])

  // Items sélectionnés (initialisés depuis les préférences)
  const [selectedItems, setSelectedItems] = useState<TransferListItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Modal de confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<TransferListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Modal d'ajout/modification de vétérinaire local
  const [localVetDialogOpen, setLocalVetDialogOpen] = useState(false)
  const [editingVeterinarian, setEditingVeterinarian] = useState<Veterinarian | null>(null)
  const [isSavingLocalVet, setIsSavingLocalVet] = useState(false)

  // Modal d'affichage des détails
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [viewingVeterinarian, setViewingVeterinarian] = useState<Veterinarian | null>(null)

  // Initialiser les sélections depuis les préférences
  useEffect(() => {
    if (preferences.length > 0) {
      // Trier par displayOrder
      const sortedPrefs = [...preferences].sort((a, b) => a.displayOrder - b.displayOrder)

      // Les vétérinaires sont déjà inclus dans les préférences (nested)
      const initialSelected = sortedPrefs
        .map(pref => pref.veterinarian)
        .filter(Boolean) // Filtrer les vétérinaires null/undefined
        .map(vetToTransferItem)

      setSelectedItems(initialSelected)
    }
  }, [preferences])

  // Filtrer les items disponibles
  const filteredAvailableItems = useMemo(() => {
    return availableItems.filter(item => {
      // Filtre par région
      if (filterRegion && item.region !== filterRegion) {
        return false
      }
      // Filtre par spécialité
      if (filterSpecialty) {
        const specialties = (item.metadata?.specialties as string) || ''
        if (!specialties.toLowerCase().includes(filterSpecialty.toLowerCase())) {
          return false
        }
      }
      return true
    })
  }, [availableItems, filterRegion, filterSpecialty])

  const handleSelect = useCallback((item: TransferListItem) => {
    setSelectedItems((prev) => [...prev, item])
    setHasChanges(true)
  }, [])

  const handleDeselect = useCallback((itemId: string) => {
    const itemToRemove = selectedItems.find((item) => item.id === itemId)
    if (!itemToRemove) return

    // Ouvrir la modal de confirmation
    setDeletingItem(itemToRemove)
    setDeleteDialogOpen(true)
  }, [selectedItems])

  const handleItemClick = useCallback((item: TransferListItem) => {
    // Trouver le vétérinaire complet depuis la liste
    const vet = veterinarians.find(v => v.id === item.id)
    if (vet) {
      setViewingVeterinarian(vet)
      setDetailsDialogOpen(true)
    }
  }, [veterinarians])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingItem || !user?.farmId) return

    setIsDeleting(true)
    try {
      const scope = deletingItem.metadata?.scope as string | undefined
      const isLocal = scope === 'local'

      // Trouver la préférence correspondante
      const preference = preferences.find(p => p.veterinarianId === deletingItem.id)

      if (isLocal) {
        // Vétérinaire local : soft delete du vétérinaire
        await veterinariansService.delete(user.farmId, deletingItem.id)
        toast.success(tc('messages.success'), t('deleteSuccess'))
      } else {
        // Vétérinaire global : supprimer uniquement la préférence
        if (preference) {
          await veterinarianPreferencesService.delete(user.farmId, preference.id)
          toast.success(tc('messages.success'), t('removedFromPreferences'))
        }
      }

      // Retirer l'item de la liste
      setSelectedItems((prev) => prev.filter((item) => item.id !== deletingItem.id))

      // Rafraîchir les données
      await Promise.all([
        refetchVeterinarians(),
        refetchPreferences(),
      ])

      setDeleteDialogOpen(false)
      setDeletingItem(null)
    } catch (error) {
      handleApiError(error, 'delete veterinarian', toast)
    } finally {
      setIsDeleting(false)
    }
  }, [deletingItem, user?.farmId, preferences, toast, t, tc, refetchVeterinarians, refetchPreferences])


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
      handleApiError(error, 'save veterinarian preferences', toast)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddLocalVet = () => {
    setEditingVeterinarian(null)
    setLocalVetDialogOpen(true)
  }

  const handleEditLocalVet = (item: TransferListItem) => {
    // Trouver le vétérinaire complet depuis la liste
    const vet = veterinarians.find(v => v.id === item.id)
    if (vet && vet.scope === 'local') {
      setEditingVeterinarian(vet)
      setLocalVetDialogOpen(true)
    }
  }

  const handleSubmitLocalVet = async (data: CreateVeterinarianDto) => {
    if (!user?.farmId) {
      toast.error(tc('error.title'), tc('messages.error'))
      return
    }

    setIsSavingLocalVet(true)
    try {
      let createdOrUpdatedVet: Veterinarian

      if (editingVeterinarian) {
        // Mode édition - convertir en UpdateVeterinarianDto (exclure scope, department)
        const updateData: UpdateVeterinarianDto = {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          mobile: data.mobile,
          email: data.email,
          city: data.city,
          clinic: data.clinic,
          specialties: data.specialties,
          licenseNumber: data.licenseNumber,
        }
        createdOrUpdatedVet = await veterinariansService.update(
          user.farmId,
          editingVeterinarian.id,
          updateData
        )
        toast.success(tc('messages.success'), t('form.updateSuccess'))
      } else {
        // Mode création
        createdOrUpdatedVet = await veterinariansService.create(user.farmId, data)

        // Ajouter automatiquement le nouveau vétérinaire aux sélections
        const newItem = vetToTransferItem(createdOrUpdatedVet)
        setSelectedItems(prev => [...prev, newItem])
        setHasChanges(true)

        toast.success(tc('messages.success'), t('form.createSuccess'))
      }

      // Rafraîchir les listes
      await Promise.all([
        refetchVeterinarians(),
        refetchPreferences(),
      ])

      setLocalVetDialogOpen(false)
      setEditingVeterinarian(null)
    } catch (error) {
      handleApiError(error, 'save local veterinarian', toast)
    } finally {
      setIsSavingLocalVet(false)
    }
  }

  const visibleSelectedItems = selectedItems.filter(
    (item) => !isPendingDeletion(item.id)
  )

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
  const FiltersComponent = (
    <div className="flex gap-2">
      <select
        value={filterRegion}
        onChange={(e) => setFilterRegion(e.target.value)}
        className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">{t('filters.allRegions')}</option>
        {REGIONS.map((region) => (
          <option key={region.code} value={region.code}>
            {region.name}
          </option>
        ))}
      </select>
      <select
        value={filterSpecialty}
        onChange={(e) => setFilterSpecialty(e.target.value)}
        className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">{t('filters.allSpecialties')}</option>
        {SPECIALTIES.map((spec) => (
          <option key={spec.code} value={spec.code}>
            {t(`specialties.${spec.key}`)}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={handleAddLocalVet} variant="outline" size="sm">
          <Plus className="w-4 h-4 me-2" />
          {t('addLocal')}
        </Button>
      </div>

      <TransferList
        availableItems={filteredAvailableItems}
        selectedItems={visibleSelectedItems}
        onSelect={handleSelect}
        onDeselect={handleDeselect}
        onEdit={handleEditLocalVet}
        onItemClick={handleItemClick}
        availableTitle={t('available')}
        selectedTitle={t('selected')}
        searchPlaceholder={t('searchPlaceholder')}
        emptySelectedMessage={t('emptySelected')}
        emptyAvailableMessage={t('noVeterinarians')}
        isLoading={loading}
        filters={FiltersComponent}
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

      {/* Dialog d'ajout/modification de vétérinaire local */}
      <VeterinarianLocalFormDialog
        open={localVetDialogOpen}
        onOpenChange={setLocalVetDialogOpen}
        veterinarian={editingVeterinarian}
        onSubmit={handleSubmitLocalVet}
        loading={isSavingLocalVet}
      />

      {/* Dialog d'affichage des détails */}
      <VeterinarianDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        veterinarian={viewingVeterinarian}
      />
    </div>
  )
}
