'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Trash2, Home, GripVertical, Phone, MapPin, Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export interface TransferListItem {
  id: string
  name: string
  description?: string
  region?: string
  phone?: string
  isLocal?: boolean
  metadata?: Record<string, unknown>
}

interface Region {
  code: string
  name: string
}

interface LocalFormLabels {
  name: string
  region: string
  phone: string
  optional: string
  note: string
}

interface TransferListProps {
  // Données
  availableItems: TransferListItem[]
  selectedItems: TransferListItem[]

  // Callbacks
  onSelect: (item: TransferListItem) => void
  onDeselect: (itemId: string) => void
  onEdit?: (item: TransferListItem) => void
  onItemClick?: (item: TransferListItem) => void
  onCreateLocal?: (name: string) => void
  onCreateLocalWithDetails?: (name: string, region?: string, phone?: string) => void

  // Labels
  availableTitle?: string
  selectedTitle?: string
  searchPlaceholder?: string
  createLocalLabel?: string
  emptyAvailableMessage?: string
  emptySelectedMessage?: string

  // Options
  showCreateLocal?: boolean
  showLocalFormWithDetails?: boolean
  filters?: React.ReactNode
  isLoading?: boolean
  regions?: Region[]
  localFormLabels?: LocalFormLabels
}

// Mapping région code -> nom pour la recherche
const REGION_NAMES: Record<string, string> = {
  ALG: 'Alger',
  ORA: 'Oran',
  CON: 'Constantine',
  BLI: 'Blida',
  SET: 'Sétif',
  BAT: 'Batna',
  TIP: 'Tipaza',
  TIZ: 'Tizi Ouzou',
  BEJ: 'Béjaïa',
  MSI: 'M\'Sila',
  MED: 'Médéa',
  TLE: 'Tlemcen',
}

export function TransferList({
  availableItems,
  selectedItems,
  onSelect,
  onDeselect,
  onEdit,
  onItemClick,
  onCreateLocal,
  onCreateLocalWithDetails,
  availableTitle = 'Catalogue disponible',
  selectedTitle = 'Ma sélection',
  searchPlaceholder = 'Rechercher...',
  createLocalLabel = 'Créer une entrée locale',
  emptyAvailableMessage = 'Aucun élément disponible',
  emptySelectedMessage = 'Aucun élément sélectionné',
  showCreateLocal = true,
  showLocalFormWithDetails = false,
  filters,
  isLoading = false,
  regions = [],
  localFormLabels,
}: TransferListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemRegion, setNewItemRegion] = useState('')
  const [newItemPhone, setNewItemPhone] = useState('')

  // Filtrer les items disponibles (exclure ceux déjà sélectionnés)
  const selectedIds = useMemo(() => new Set(selectedItems.map((item) => item.id)), [selectedItems])

  const filteredAvailableItems = useMemo(() => {
    return availableItems.filter((item) => {
      // Exclure les items déjà sélectionnés
      if (selectedIds.has(item.id)) return false

      // Filtrer par recherche (nom, description, région)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const regionName = item.region ? REGION_NAMES[item.region]?.toLowerCase() || '' : ''
        return (
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          regionName.includes(query) ||
          item.region?.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [availableItems, selectedIds, searchQuery])

  const handleCreateLocal = () => {
    if (!newItemName.trim()) return

    if (showLocalFormWithDetails && onCreateLocalWithDetails) {
      onCreateLocalWithDetails(
        newItemName.trim(),
        newItemRegion || undefined,
        newItemPhone.trim() || undefined
      )
    } else if (onCreateLocal) {
      onCreateLocal(newItemName.trim())
    }

    setNewItemName('')
    setNewItemRegion('')
    setNewItemPhone('')
    setShowCreateForm(false)
  }

  const defaultLabels: LocalFormLabels = {
    name: 'Nom',
    region: 'Région',
    phone: 'Téléphone',
    optional: 'optionnel',
    note: 'Cette entrée sera privée et visible uniquement par vous.',
  }

  const labels = localFormLabels || defaultLabels

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Colonne gauche - Catalogue disponible */}
      <div className="border rounded-lg bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
            {availableTitle}
          </h3>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9"
            />
          </div>

          {/* Filtres additionnels */}
          {filters && <div className="mt-3">{filters}</div>}
        </div>

        {/* Liste des items disponibles */}
        <div className="max-h-80 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : filteredAvailableItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {searchQuery ? 'Aucun résultat pour cette recherche' : emptyAvailableMessage}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredAvailableItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors group"
                >
                  <button
                    onClick={() => onItemClick?.(item)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {item.description && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {item.description}
                          </span>
                        )}
                        {item.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <span dir="ltr">{item.phone}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect(item)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zone création locale */}
        {showCreateLocal && (onCreateLocal || onCreateLocalWithDetails) && (
          <div className="p-3 border-t bg-muted/30">
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed rounded-md text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                {createLocalLabel}
              </button>
            ) : (
              <div className="space-y-3">
                {/* Nom */}
                <div className="space-y-1">
                  <Label className="text-sm">{labels.name} *</Label>
                  <Input
                    placeholder={`${labels.name}...`}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateLocal()}
                    autoFocus
                  />
                </div>

                {/* Région et Téléphone (si formulaire détaillé) */}
                {showLocalFormWithDetails && regions.length > 0 && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-sm">
                        {labels.region} <span className="text-muted-foreground text-xs">({labels.optional})</span>
                      </Label>
                      <select
                        value={newItemRegion}
                        onChange={(e) => setNewItemRegion(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">{labels.region}...</option>
                        {regions.map((region) => (
                          <option key={region.code} value={region.code}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm">
                        {labels.phone} <span className="text-muted-foreground text-xs">({labels.optional})</span>
                      </Label>
                      <Input
                        placeholder={`${labels.phone}...`}
                        value={newItemPhone}
                        onChange={(e) => setNewItemPhone(e.target.value)}
                        type="tel"
                        dir="ltr"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleCreateLocal} disabled={!newItemName.trim()} size="sm" className="flex-1">
                    Ajouter
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowCreateForm(false)
                    setNewItemName('')
                    setNewItemRegion('')
                    setNewItemPhone('')
                  }}>
                    ✕
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {labels.note}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Colonne droite - Ma sélection */}
      <div className="border rounded-lg bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            {selectedTitle} ({selectedItems.length})
          </h3>
        </div>

        {/* Liste des items sélectionnés */}
        <div className="max-h-96 overflow-y-auto p-2">
          {selectedItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {emptySelectedMessage}
            </div>
          ) : (
            <div className="space-y-1">
              {selectedItems.map((item) => {
                const isLocal = item.metadata?.scope === 'local'
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50 group"
                  >
                    <button
                      onClick={() => onItemClick?.(item)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-50 cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          {isLocal && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                              <Home className="w-3 h-3" />
                              Local
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {item.description && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              {item.description}
                            </span>
                          )}
                          {item.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 flex-shrink-0" />
                              <span dir="ltr">{item.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isLocal && onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(item)
                          }}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeselect(item.id)
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
