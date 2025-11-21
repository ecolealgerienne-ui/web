'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LotsFilters } from '@/components/lots/lots-filters';
import { LotsTable } from '@/components/lots/lots-table';
import { mockLots } from '@/lib/data/lots.mock';
import { LotFilters } from '@/lib/types/lot';

export default function LotsPage() {
  const [filters, setFilters] = useState<LotFilters>({
    search: '',
    type: 'all',
    status: 'all',
  });

  // Filtrage des lots
  const filteredLots = useMemo(() => {
    return mockLots.filter((lot) => {
      // Recherche par nom ou description
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch =
          lot.name.toLowerCase().includes(search) ||
          lot.description?.toLowerCase().includes(search) ||
          lot.productName?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Filtre par type
      if (filters.type !== 'all' && lot.type !== filters.type) {
        return false;
      }

      // Filtre par statut
      if (filters.status !== 'all' && lot.status !== filters.status) {
        return false;
      }

      // Filtre par complétion
      if (filters.completed !== undefined && lot.completed !== filters.completed) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: mockLots.length,
      open: mockLots.filter((l) => l.status === 'open').length,
      closed: mockLots.filter((l) => l.status === 'closed').length,
      totalAnimals: mockLots.reduce((sum, l) => sum + l.animalCount, 0),
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lots</h1>
          <p className="text-muted-foreground">
            Gérez vos groupes d'animaux par activité
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Créer un lot
        </Button>
      </div>

      {/* Filtres */}
      <LotsFilters filters={filters} onFiltersChange={setFilters} />

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Lots totaux</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold text-green-600">{stats.open}</div>
          <p className="text-xs text-muted-foreground">Lots ouverts</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold text-blue-600">{stats.closed}</div>
          <p className="text-xs text-muted-foreground">Lots fermés</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{stats.totalAnimals}</div>
          <p className="text-xs text-muted-foreground">Animaux concernés</p>
        </div>
      </div>

      {/* Table */}
      <LotsTable lots={filteredLots} />
    </div>
  );
}
