'use client'

import { useState, useCallback } from 'react'
import { TransferList, TransferListItem } from '@/components/ui/transfer-list'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { useToast } from '@/lib/hooks/useToast'
import { useUndo } from '@/lib/hooks/useUndo'
import { useTranslations } from 'next-intl'

// Mock des vétérinaires du catalogue global avec région
const MOCK_CATALOG_VETERINARIANS: TransferListItem[] = [
  { id: 'vet-1', name: 'Dr. Benali Ahmed', description: 'Alger Centre', region: 'ALG', phone: '0555 12 34 56' },
  { id: 'vet-2', name: 'Dr. Kaci Farid', description: 'Blida', region: 'BLI', phone: '0555 23 45 67' },
  { id: 'vet-3', name: 'Dr. Mansouri Leila', description: 'Tipaza', region: 'TIP', phone: '0555 34 56 78' },
  { id: 'vet-4', name: 'Dr. Hamdi Sara', description: 'Oran', region: 'ORA', phone: '0555 45 67 89' },
  { id: 'vet-5', name: 'Dr. Boudjema Karim', description: 'Alger Est', region: 'ALG' },
  { id: 'vet-6', name: 'Dr. Taleb Nadia', description: 'Blida', region: 'BLI', phone: '0555 56 78 90' },
  { id: 'vet-7', name: 'Dr. Cherif Mohamed', description: 'Tizi Ouzou', region: 'TIZ' },
  { id: 'vet-8', name: 'Dr. Amrani Fatima', description: 'Béjaïa', region: 'BEJ', phone: '0555 67 89 01' },
  { id: 'vet-9', name: 'Dr. Belkacem Omar', description: 'Sétif', region: 'SET' },
  { id: 'vet-10', name: 'Dr. Hadjadj Kamel', description: 'Constantine', region: 'CON', phone: '0555 78 90 12' },
]

// Régions disponibles
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

interface MyVeterinariansProps {
  onSave?: (selectedIds: string[], localItems: TransferListItem[]) => Promise<void>
}

export function MyVeterinarians({ onSave }: MyVeterinariansProps) {
  const t = useTranslations('settings.veterinarians')
  const ta = useTranslations('settings.actions')
  const toast = useToast()
  const { markForDeletion, undoOperation, isPendingDeletion } = useUndo<TransferListItem>()

  const [selectedItems, setSelectedItems] = useState<TransferListItem[]>([
    { id: 'vet-1', name: 'Dr. Benali Ahmed', description: 'Alger Centre', region: 'ALG', phone: '0555 12 34 56' },
    { id: 'vet-3', name: 'Dr. Mansouri Leila', description: 'Tipaza', region: 'TIP', isLocal: true },
  ])
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

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
        console.log('Hard delete confirmed:', itemId)
      }
    )

    // Afficher le toast avec option Undo
    toast.undo(
      `${itemToRemove.name} ${t('removed')}`,
      () => {
        undoOperation(operationId)
        toast.success(t('added'), `${itemToRemove.name} ${t('restored')}`)
      },
      t('clickToUndo')
    )
  }, [selectedItems, markForDeletion, undoOperation, toast, t])

  const handleCreateLocal = useCallback((name: string, region?: string, phone?: string) => {
    const regionName = region ? REGIONS.find(r => r.code === region)?.name : undefined
    const newItem: TransferListItem = {
      id: `local-vet-${Date.now()}`,
      name: name,
      description: regionName || t('emptySelected'),
      region: region,
      phone: phone,
      isLocal: true,
    }
    setSelectedItems((prev) => [...prev, newItem])
    setHasChanges(true)

    toast.success(t('added'), `${name} ${t('addedTo')}`)
  }, [toast, t])

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

  // Filtrer les items en attente de suppression pour l'affichage
  const visibleSelectedItems = selectedItems.filter(
    (item) => !isPendingDeletion(item.id)
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <TransferList
        availableItems={MOCK_CATALOG_VETERINARIANS}
        selectedItems={selectedItems}
        onSelect={handleSelect}
        onDeselect={handleDeselect}
        onCreateLocalWithDetails={handleCreateLocal}
        availableTitle={t('available')}
        selectedTitle={t('selected')}
        searchPlaceholder={t('searchPlaceholder')}
        createLocalLabel={t('addLocal')}
        emptySelectedMessage={t('emptySelected')}
        regions={REGIONS}
        showLocalFormWithDetails={true}
        localFormLabels={{
          name: t('name'),
          region: t('region'),
          phone: t('phone'),
          optional: t('optional'),
          note: t('localNote'),
        }}
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
