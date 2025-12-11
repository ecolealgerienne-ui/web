'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Animal } from '@/lib/types/animal';
import { cn } from '@/lib/utils';

interface AnimalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animals: Animal[];
  onSelect: (animal: Animal | null) => void;
  title: string;
  filterSex?: 'male' | 'female';
  excludeId?: string;
  selectedId?: string | null;
}

export function AnimalSearchDialog({
  open,
  onOpenChange,
  animals,
  onSelect,
  title,
  filterSex,
  excludeId,
  selectedId,
}: AnimalSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Reset search when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery('');
    }
  }, [open]);

  // Filter animals
  const filteredAnimals = useMemo(() => {
    let result = animals;

    // Filter by sex if specified
    if (filterSex) {
      result = result.filter(a => a.sex === filterSex);
    }

    // Exclude specific animal (e.g., the current animal being edited)
    if (excludeId) {
      result = result.filter(a => a.id !== excludeId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a =>
        (a.officialNumber?.toLowerCase().includes(query)) ||
        (a.visualId?.toLowerCase().includes(query)) ||
        (a.currentEid?.toLowerCase().includes(query)) ||
        (a.breed?.nameFr?.toLowerCase().includes(query)) ||
        (a.species?.nameFr?.toLowerCase().includes(query))
      );
    }

    return result;
  }, [animals, filterSex, excludeId, searchQuery]);

  const handleSelect = useCallback((animal: Animal) => {
    onSelect(animal);
    onOpenChange(false);
  }, [onSelect, onOpenChange]);

  const handleClear = useCallback(() => {
    onSelect(null);
    onOpenChange(false);
  }, [onSelect, onOpenChange]);

  const getAnimalDisplayName = (animal: Animal) => {
    return animal.officialNumber || animal.visualId || animal.currentEid || animal.id.substring(0, 8);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro, identifiant, race..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        {/* Clear selection button */}
        {selectedId && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="w-full text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-2" />
            Retirer la sélection
          </Button>
        )}

        {/* Results list */}
        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[400px] border rounded-md">
          {filteredAnimals.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4">
              {searchQuery ? 'Aucun animal trouvé' : 'Aucun animal disponible'}
            </div>
          ) : (
            <div className="divide-y">
              {filteredAnimals.map((animal) => {
                const isSelected = animal.id === selectedId;
                return (
                  <button
                    key={animal.id}
                    type="button"
                    onClick={() => handleSelect(animal)}
                    className={cn(
                      'w-full text-left px-4 py-3 hover:bg-muted transition-colors',
                      isSelected && 'bg-primary/10 border-l-2 border-l-primary'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{getAnimalDisplayName(animal)}</p>
                        <p className="text-sm text-muted-foreground">
                          {animal.species?.nameFr || '-'}
                          {animal.breed?.nameFr && ` • ${animal.breed.nameFr}`}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {animal.birthDate && (
                          <p>{new Date(animal.birthDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-xs text-muted-foreground text-center pt-2">
          {filteredAnimals.length} animal{filteredAnimals.length !== 1 ? 'x' : ''} trouvé{filteredAnimals.length !== 1 ? 's' : ''}
        </div>
      </DialogContent>
    </Dialog>
  );
}
