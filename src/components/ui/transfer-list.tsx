'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Trash2, Home, GripVertical } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export interface TransferListItem {
  id: string
  name: string
  description?: string
  isLocal?: boolean
  metadata?: Record<string, unknown>
}

interface TransferListProps {
  // Données
  availableItems: TransferListItem[]
  selectedItems: TransferListItem[]

  // Callbacks
  onSelect: (item: TransferListItem) => void
  onDeselect: (itemId: string) => void
  onCreateLocal?: (name: string) => void

  // Labels
  availableTitle?: string
  selectedTitle?: string
  searchPlaceholder?: string
  createLocalLabel?: string
  emptyAvailableMessage?: string
  emptySelectedMessage?: string

  // Options
  showCreateLocal?: boolean
  filters?: React.ReactNode
  isLoading?: boolean
}

export function TransferList({
  availableItems,
  selectedItems,
  onSelect,
  onDeselect,
  onCreateLocal,
  availableTitle = 'Catalogue disponible',
  selectedTitle = 'Ma sélection',
  searchPlaceholder = 'Rechercher...',
  createLocalLabel = 'Créer une entrée locale',
  emptyAvailableMessage = 'Aucun élément disponible',
  emptySelectedMessage = 'Aucun élément sélectionné',
  showCreateLocal = true,
  filters,
  isLoading = false,
}: TransferListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newItemName, setNewItemName] = useState('')

  // Filtrer les items disponibles (exclure ceux déjà sélectionnés)
  const selectedIds = useMemo(() => new Set(selectedItems.map((item) => item.id)), [selectedItems])

  const filteredAvailableItems = useMemo(() => {
    return availableItems.filter((item) => {
      // Exclure les items déjà sélectionnés
      if (selectedIds.has(item.id)) return false

      // Filtrer par recherche
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [availableItems, selectedIds, searchQuery])

  const handleCreateLocal = () => {
    if (newItemName.trim() && onCreateLocal) {
      onCreateLocal(newItemName.trim())
      setNewItemName('')
      setShowCreateForm(false)
    }
  }

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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
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
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="w-full flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zone création locale */}
        {showCreateLocal && onCreateLocal && (
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
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nom..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateLocal()}
                    className="flex-1"
                    autoFocus
                  />
                  <Button onClick={handleCreateLocal} disabled={!newItemName.trim()} size="sm">
                    Ajouter
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                    ✕
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cette entrée sera privée et visible uniquement par vous.
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
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50 group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-50 cursor-grab" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        {item.isLocal && (
                          <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                            <Home className="w-3 h-3" />
                            Local
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeselect(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
