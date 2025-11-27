'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { ChevronDown, Search, Plus, Star, Settings, Home, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from './dialog'
import { Input } from './input'
import { Label } from './label'

export interface SmartSelectItem {
  id: string
  name: string
  description?: string
  isLocal?: boolean
  isFavorite?: boolean
  usageCount?: number
}

interface SmartSelectProps {
  // Données
  items: SmartSelectItem[]
  value?: string
  placeholder?: string

  // Callbacks
  onChange: (value: string) => void
  onCreateLocal?: (name: string) => Promise<SmartSelectItem | null>
  onToggleFavorite?: (itemId: string) => void

  // Configuration
  label?: string
  disabled?: boolean
  className?: string
  showFavorites?: boolean
  showCreateOption?: boolean
  createLabel?: string
  createDialogTitle?: string
  createInputPlaceholder?: string

  // Pour le formulaire simplifié de création
  createFormFields?: {
    key: string
    label: string
    placeholder?: string
    required?: boolean
  }[]
}

export function SmartSelect({
  items,
  value,
  placeholder = 'Sélectionner...',
  onChange,
  onCreateLocal,
  onToggleFavorite,
  label,
  disabled = false,
  className,
  showFavorites = true,
  showCreateOption = true,
  createLabel = 'Ajouter...',
  createDialogTitle = 'Ajouter un nouvel élément',
  createInputPlaceholder = 'Nom...',
  createFormFields,
}: SmartSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Focus sur l'input de recherche à l'ouverture
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Sélection actuelle
  const selectedItem = useMemo(() => {
    return items.find((item) => item.id === value)
  }, [items, value])

  // Filtrer et trier les items
  const { favorites, recentItems, otherItems } = useMemo(() => {
    let filtered = items

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      )
    }

    // Séparer favoris et autres
    const favs = filtered.filter((item) => item.isFavorite)
    const nonFavs = filtered.filter((item) => !item.isFavorite)

    // Trier par usage (les plus utilisés en premier)
    const sortedNonFavs = [...nonFavs].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))

    // Séparer "récents" (usage > 0) des autres
    const recent = sortedNonFavs.filter((item) => (item.usageCount || 0) > 0).slice(0, 5)
    const others = sortedNonFavs.filter((item) => !recent.includes(item))

    return {
      favorites: favs,
      recentItems: recent,
      otherItems: others,
    }
  }, [items, searchQuery])

  const handleSelect = useCallback(
    (itemId: string) => {
      onChange(itemId)
      setIsOpen(false)
      setSearchQuery('')
    },
    [onChange]
  )

  const handleCreateClick = useCallback(() => {
    setShowCreateDialog(true)
    setIsOpen(false)
  }, [])

  const handleCreate = async () => {
    if (!newItemName.trim() || !onCreateLocal) return

    setIsCreating(true)
    try {
      const newItem = await onCreateLocal(newItemName.trim())
      if (newItem) {
        onChange(newItem.id)
      }
      setShowCreateDialog(false)
      setNewItemName('')
      setFormValues({})
    } finally {
      setIsCreating(false)
    }
  }

  const renderItem = (item: SmartSelectItem, showFavoriteStar = true) => {
    const isSelected = item.id === value
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleSelect(item.id)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition-colors',
          isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {item.isLocal && <Home className="w-3 h-3 text-amber-500 flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.name}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {showFavoriteStar && onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(item.id)
              }}
              className={cn(
                'p-1 rounded hover:bg-muted-foreground/10',
                item.isFavorite ? 'text-yellow-500' : 'text-muted-foreground opacity-0 group-hover:opacity-100'
              )}
            >
              <Star className={cn('w-3 h-3', item.isFavorite && 'fill-current')} />
            </button>
          )}
          {isSelected && <Check className="w-4 h-4 text-primary" />}
        </div>
      </button>
    )
  }

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {label && <Label className="mb-2 block">{label}</Label>}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isOpen && 'ring-2 ring-ring ring-offset-2'
        )}
      >
        <span className={cn('truncate', !selectedItem && 'text-muted-foreground')}>
          {selectedItem ? (
            <span className="flex items-center gap-2">
              {selectedItem.isLocal && <Home className="w-3 h-3 text-amber-500" />}
              {selectedItem.name}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          {/* Search */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Items List */}
          <div className="max-h-60 overflow-y-auto p-1">
            {/* Favoris */}
            {showFavorites && favorites.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  Favoris
                </p>
                <div className="space-y-0.5">
                  {favorites.map((item) => renderItem(item, true))}
                </div>
              </div>
            )}

            {/* Récents */}
            {recentItems.length > 0 && (
              <div className="mb-2">
                {(showFavorites && favorites.length > 0) && (
                  <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Récents
                  </p>
                )}
                <div className="space-y-0.5">
                  {recentItems.map((item) => (
                    <div key={item.id} className="group">
                      {renderItem(item)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Autres */}
            {otherItems.length > 0 && (
              <div>
                {(favorites.length > 0 || recentItems.length > 0) && (
                  <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Tous
                  </p>
                )}
                <div className="space-y-0.5">
                  {otherItems.map((item) => (
                    <div key={item.id} className="group">
                      {renderItem(item)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {favorites.length === 0 && recentItems.length === 0 && otherItems.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Aucun résultat
              </div>
            )}
          </div>

          {/* Sticky Footer - Create Option */}
          {showCreateOption && onCreateLocal && (
            <div className="border-t p-2">
              <button
                type="button"
                onClick={handleCreateClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors"
              >
                <Settings className="w-4 h-4" />
                <Plus className="w-3 h-3" />
                {createLabel}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="mx-4">
          <DialogClose onClose={() => setShowCreateDialog(false)} />
          <DialogHeader>
            <DialogTitle>{createDialogTitle}</DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-0 space-y-4">
            <div>
              <Label htmlFor="newItemName">Nom *</Label>
              <Input
                id="newItemName"
                placeholder={createInputPlaceholder}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>

            {createFormFields?.map((field) => (
              <div key={field.key}>
                <Label htmlFor={field.key}>
                  {field.label} {field.required && '*'}
                </Label>
                <Input
                  id={field.key}
                  placeholder={field.placeholder}
                  value={formValues[field.key] || ''}
                  onChange={(e) => setFormValues({ ...formValues, [field.key]: e.target.value })}
                />
              </div>
            ))}

            <p className="text-xs text-muted-foreground">
              Cette entrée sera ajoutée comme donnée locale visible uniquement par vous.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={!newItemName.trim() || isCreating}>
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
