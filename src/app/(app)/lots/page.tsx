'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { LotsFilters } from '@/components/lots/lots-filters';
import { LotsTable } from '@/components/lots/lots-table';
import { useLots } from '@/lib/hooks/useLots';
import { LotFilters } from '@/lib/types/lot';

export default function LotsPage() {
  const [filters, setFilters] = useState<LotFilters>({
    search: '',
    type: 'all',
    status: 'all',
  });

  // Fetch lots using API hook
  const { lots, loading, error } = useLots({
    search: filters.search || undefined,
    type: filters.type !== 'all' ? filters.type : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    completed: filters.completed,
  });

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: lots.length,
      open: lots.filter((l) => l.status === 'open').length,
      closed: lots.filter((l) => l.status === 'closed').length,
      totalAnimals: lots.reduce((sum, l) => sum + l.animalCount, 0),
    };
  }, [lots]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lots</h1>
          <p className="text-muted-foreground">
            Gérez vos groupes d&apos;animaux par activité
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
      {loading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Chargement des lots...
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-destructive">
          Erreur lors du chargement : {error.message}
        </div>
      )}

      {!loading && !error && <LotsTable lots={lots} />}
    </div>
  );
}
