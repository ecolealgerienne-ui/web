'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { TransferList, TransferListItem } from '@/components/ui/transfer-list'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, AlertCircle, Bell, Settings } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/lib/hooks/useToast'
import { useTranslations } from 'next-intl'
import { useGlobalAlerts } from '@/lib/hooks/useGlobalAlerts'
import { useAlertPreferences } from '@/lib/hooks/useAlertPreferences'
import { useAuth } from '@/contexts/auth-context'
import { AlertTemplate, AlertCategory, AlertPriority } from '@/lib/types/admin/alert-template'
import { ApiAlertInPreference } from '@/lib/types/alert-preference'
import { handleApiError } from '@/lib/utils/api-error-handler'
import { alertPreferencesService } from '@/lib/services/alert-preferences.service'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

// Catégories d'alertes
const ALERT_CATEGORIES: AlertCategory[] = [
  'health',
  'vaccination',
  'treatment',
  'reproduction',
  'nutrition',
  'administrative',
  'other',
]

// Convertir un AlertTemplate global en TransferListItem
function alertToTransferItem(alert: AlertTemplate): TransferListItem {
  return {
    id: alert.id,
    name: alert.nameFr,
    description: alert.descriptionFr || '',
    metadata: {
      code: alert.code,
      category: alert.category,
      priority: alert.priority,
      descriptionFr: alert.descriptionFr,
      scope: 'global',
    },
  }
}

// Convertir un ApiAlertInPreference en TransferListItem
function apiAlertToTransferItem(alert: ApiAlertInPreference): TransferListItem {
  return {
    id: alert.id,
    name: alert.nameFr,
    description: alert.descriptionFr || '',
    metadata: {
      code: alert.code,
      category: alert.category,
      priority: alert.priority,
      descriptionFr: alert.descriptionFr,
      scope: 'global',
    },
  }
}

// Obtenir la couleur du badge de priorité
function getPriorityVariant(priority: string): 'default' | 'destructive' | 'warning' | 'success' {
  switch (priority) {
    case 'urgent':
      return 'destructive'
    case 'high':
      return 'warning'
    case 'medium':
      return 'default'
    case 'low':
      return 'success'
    default:
      return 'default'
  }
}

export function MyAlerts() {
  const t = useTranslations('settings.alerts')
  const ta = useTranslations('settings.actions')
  const tc = useTranslations('common')
  const toast = useToast()
  const { user } = useAuth()

  // Filtres
  const [activeCategory, setActiveCategory] = useState<string>('all')

  // Charger les alertes globales depuis l'API
  const {
    alerts: globalAlerts,
    loading: loadingAlerts,
    error: errorAlerts,
    refetch: refetchAlerts,
  } = useGlobalAlerts()

  // Charger les préférences d'alertes pour cette ferme
  const {
    preferences,
    loading: loadingPrefs,
    error: errorPrefs,
    savePreferences,
    refetch: refetchPreferences,
  } = useAlertPreferences(user?.farmId)

  const loading = loadingAlerts || loadingPrefs
  const error = errorAlerts || errorPrefs

  // Convertir les alertes globales en items de liste
  const availableItems = useMemo(() => {
    return globalAlerts.map(alertToTransferItem)
  }, [globalAlerts])

  // Filtrer par catégorie (côté client)
  const filteredAvailableItems = useMemo(() => {
    if (activeCategory === 'all') {
      return availableItems
    }
    return availableItems.filter(item => item.metadata?.category === activeCategory)
  }, [availableItems, activeCategory])

  // Items sélectionnés (initialisés depuis les préférences)
  const [selectedItems, setSelectedItems] = useState<TransferListItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Modal de confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<TransferListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Modal de détails de l'alerte
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<TransferListItem | null>(null)

  // Modal de configuration
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false)
  const [configuringItem, setConfiguringItem] = useState<TransferListItem | null>(null)
  const [reminderDays, setReminderDays] = useState<number>(7)
  const [isConfiguring, setIsConfiguring] = useState(false)

  // Initialiser les sélections depuis les préférences
  useEffect(() => {
    if (preferences.length > 0) {
      const sortedPrefs = [...preferences].sort((a, b) => a.displayOrder - b.displayOrder)
      const initialSelected = sortedPrefs
        .map(pref => pref.alertTemplate)
        .filter(Boolean)
        .map(apiAlertToTransferItem)
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

  const handleItemClick = useCallback((item: TransferListItem) => {
    setSelectedAlert(item)
    setDetailDialogOpen(true)
  }, [])

  const handleConfigure = useCallback((item: TransferListItem) => {
    // Trouver la préférence existante pour récupérer reminderDays
    const preference = preferences.find(p => p.alertTemplateId === item.id)
    setReminderDays(preference?.reminderDays ?? 7)
    setConfiguringItem(item)
    setConfigureDialogOpen(true)
  }, [preferences])

  const handleConfigureConfirm = useCallback(async () => {
    if (!configuringItem || !user?.farmId) return

    setIsConfiguring(true)
    try {
      const preference = preferences.find(p => p.alertTemplateId === configuringItem.id)

      if (preference) {
        await alertPreferencesService.update(user.farmId, preference.id, {
          reminderDays,
          version: preference.version,
        })
        toast.success(t('configure.saved'), t('configure.savedMessage'))
        await refetchPreferences()
      }

      setConfigureDialogOpen(false)
      setConfiguringItem(null)
    } catch (error) {
      handleApiError(error, 'configure alert preference', toast)
    } finally {
      setIsConfiguring(false)
    }
  }, [configuringItem, user?.farmId, preferences, reminderDays, toast, t, refetchPreferences])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingItem || !user?.farmId) return

    setIsDeleting(true)
    try {
      const preference = preferences.find(p => p.alertTemplateId === deletingItem.id)

      if (preference) {
        await alertPreferencesService.delete(user.farmId, preference.id)
        toast.success(tc('messages.success'), t('removedFromPreferences'))
      }

      setSelectedItems((prev) => prev.filter((item) => item.id !== deletingItem.id))

      await Promise.all([
        refetchAlerts(),
        refetchPreferences(),
      ])

      setDeleteDialogOpen(false)
      setDeletingItem(null)
    } catch (error) {
      handleApiError(error, 'delete alert preference', toast)
    } finally {
      setIsDeleting(false)
    }
  }, [deletingItem, user?.farmId, preferences, toast, t, tc, refetchAlerts, refetchPreferences])

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
      handleApiError(error, 'save alert preferences', toast)
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
  const categoryFilters = (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={activeCategory} onValueChange={setActiveCategory}>
        <SelectTrigger className="w-[180px] h-8">
          <SelectValue placeholder={t('filters.allCategories')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allCategories')}</SelectItem>
          {ALERT_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {t(`categories.${cat}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
        onItemClick={handleItemClick}
        onConfigure={handleConfigure}
        isConfigurable={(item) => preferences.some(p => p.alertTemplateId === item.id)}
        availableTitle={t('available')}
        selectedTitle={t('selected')}
        searchPlaceholder={t('searchPlaceholder')}
        emptySelectedMessage={t('emptySelected')}
        emptyAvailableMessage={t('emptyAvailable')}
        isLoading={loading}
        filters={categoryFilters}
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

      {/* Dialog de détails de l'alerte */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              {selectedAlert?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              {/* Code */}
              {!!selectedAlert.metadata?.code && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t('details.code')}</span>
                  <p className="font-mono text-sm">{String(selectedAlert.metadata.code)}</p>
                </div>
              )}

              {/* Catégorie */}
              {!!selectedAlert.metadata?.category && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t('details.category')}</span>
                  <div className="mt-1">
                    <Badge>{t(`categories.${selectedAlert.metadata.category}`)}</Badge>
                  </div>
                </div>
              )}

              {/* Priorité */}
              {!!selectedAlert.metadata?.priority && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t('details.priority')}</span>
                  <div className="mt-1">
                    <Badge variant={getPriorityVariant(String(selectedAlert.metadata.priority))}>
                      {t(`priorities.${selectedAlert.metadata.priority}`)}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Description */}
              {!!selectedAlert.metadata?.descriptionFr && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t('details.description')}</span>
                  <p className="text-sm">{String(selectedAlert.metadata.descriptionFr)}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              {tc('actions.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de configuration */}
      <Dialog open={configureDialogOpen} onOpenChange={setConfigureDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              {t('configure.title')}
            </DialogTitle>
            <DialogDescription>
              {configuringItem?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reminderDays">{t('configure.reminderDays')}</Label>
              <Input
                id="reminderDays"
                type="number"
                min={1}
                max={365}
                value={reminderDays}
                onChange={(e) => setReminderDays(parseInt(e.target.value) || 7)}
              />
              <p className="text-sm text-muted-foreground">
                {t('configure.reminderDaysDescription')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfigureDialogOpen(false)}
              disabled={isConfiguring}
            >
              {tc('actions.cancel')}
            </Button>
            <Button onClick={handleConfigureConfirm} disabled={isConfiguring}>
              {isConfiguring ? tc('actions.saving') : tc('actions.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
