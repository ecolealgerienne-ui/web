'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { TransferList, TransferListItem } from '@/components/ui/transfer-list'
import { Button } from '@/components/ui/button'
import { Save, AlertCircle } from 'lucide-react'
import { useToast } from '@/lib/hooks/useToast'
import { useTranslations } from 'next-intl'
import { useVaccines } from '@/lib/hooks/useVaccines'
import { Vaccine, CreateVaccineDto, VaccineTargetDisease } from '@/lib/types/vaccine'

// Maladies cibles pour les filtres
const TARGET_DISEASES: { code: VaccineTargetDisease; key: string }[] = [
  { code: 'enterotoxemia', key: 'enterotoxemia' },
  { code: 'brucellosis', key: 'brucellosis' },
  { code: 'bluetongue', key: 'bluetongue' },
  { code: 'foot_and_mouth', key: 'foot_and_mouth' },
  { code: 'rabies', key: 'rabies' },
  { code: 'anthrax', key: 'anthrax' },
  { code: 'lumpy_skin', key: 'lumpy_skin' },
  { code: 'ppr', key: 'ppr' },
  { code: 'sheep_pox', key: 'sheep_pox' },
  { code: 'pasteurellosis', key: 'pasteurellosis' },
  { code: 'other', key: 'other' },
]

interface MyVaccinesProps {
  initialSelectedIds?: string[]
  onSave?: (selectedIds: string[], localItems: TransferListItem[]) => Promise<void>
}

// Convertir un Vaccine API en TransferListItem
function vaccineToTransferItem(vaccine: Vaccine): TransferListItem {
  return {
    id: vaccine.id,
    name: vaccine.nameFr,
    description: vaccine.description || vaccine.targetDisease || '',
    metadata: {
      targetDisease: vaccine.targetDisease,
      laboratoire: vaccine.laboratoire,
      dosage: vaccine.dosage,
      scope: vaccine.scope,
    },
  }
}

export function MyVaccines({ initialSelectedIds = [], onSave }: MyVaccinesProps) {
  const t = useTranslations('settings.vaccines')
  const ta = useTranslations('settings.actions')
  const toast = useToast()

  // Filtre par maladie cible
  const [filterDisease, setFilterDisease] = useState<string>('')

  // Charger les vaccins depuis l'API
  const { vaccines, loading, error, createVaccine } = useVaccines({
    isActive: true,
  })

  // Convertir les vaccins API en items de transfert
  const availableItems = useMemo(() => {
    return vaccines.map(vaccineToTransferItem)
  }, [vaccines])

  // Items sélectionnés
  const [selectedItems, setSelectedItems] = useState<TransferListItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialiser les sélections depuis initialSelectedIds
  useEffect(() => {
    if (initialSelectedIds.length > 0 && vaccines.length > 0) {
      const initialSelected = vaccines
        .filter(v => initialSelectedIds.includes(v.id))
        .map(vaccineToTransferItem)
      setSelectedItems(initialSelected)
    }
  }, [initialSelectedIds, vaccines])

  // Filtrer les items disponibles par maladie cible
  const filteredAvailableItems = useMemo(() => {
    if (!filterDisease) return availableItems
    return availableItems.filter(item => {
      const targetDisease = item.metadata?.targetDisease as string | undefined
      return targetDisease === filterDisease
    })
  }, [availableItems, filterDisease])

  const handleSelect = useCallback((item: TransferListItem) => {
    setSelectedItems((prev) => [...prev, item])
    setHasChanges(true)
  }, [])

  const handleDeselect = useCallback((itemId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId))
    setHasChanges(true)
  }, [])

  const handleCreateLocal = useCallback(async (name: string) => {
    try {
      // Créer le vaccin via l'API
      const createDto: CreateVaccineDto = {
        nameFr: name,
        nameEn: name,
        nameAr: name,
        description: t('localNote'),
        isActive: true,
      }

      const newVaccine = await createVaccine(createDto)
      const newItem = vaccineToTransferItem(newVaccine)
      newItem.isLocal = true

      setSelectedItems((prev) => [...prev, newItem])
      setHasChanges(true)
      toast.success(t('added'), `${name} ${t('addedTo')}`)
    } catch {
      // Fallback: créer localement si l'API échoue
      const newItem: TransferListItem = {
        id: `local-vac-${Date.now()}`,
        name: name,
        description: t('localNote'),
        isLocal: true,
      }
      setSelectedItems((prev) => [...prev, newItem])
      setHasChanges(true)
      toast.success(t('added'), `${name} ${t('addedTo')}`)
    }
  }, [createVaccine, toast, t])

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
        value={filterDisease}
        onChange={(e) => setFilterDisease(e.target.value)}
        className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">{t('filters.allDiseases')}</option>
        {TARGET_DISEASES.map((disease) => (
          <option key={disease.code} value={disease.code}>
            {t(`targetDiseases.${disease.key}`)}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <TransferList
        availableItems={filteredAvailableItems}
        selectedItems={selectedItems}
        onSelect={handleSelect}
        onDeselect={handleDeselect}
        onCreateLocal={handleCreateLocal}
        availableTitle={t('available')}
        selectedTitle={t('selected')}
        searchPlaceholder={t('searchPlaceholder')}
        createLocalLabel={t('addLocal')}
        emptySelectedMessage={t('emptySelected')}
        emptyAvailableMessage={t('emptyAvailable')}
        isLoading={loading}
        filters={FiltersComponent}
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
