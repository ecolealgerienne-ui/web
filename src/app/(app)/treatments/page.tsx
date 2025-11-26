'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TreatmentsFilters } from '@/components/treatments/treatments-filters';
import { TreatmentsTable } from '@/components/treatments/treatments-table';
import { useTreatments } from '@/lib/hooks/useTreatments';
import { TreatmentFilters } from '@/lib/types/treatment';

export default function TreatmentsPage() {
  const [filters, setFilters] = useState<TreatmentFilters>({
    search: '',
    status: 'all',
    type: 'all',
    targetType: 'all',
  });

  // Fetch treatments with real API
  const { treatments, loading, error } = useTreatments({
    search: filters.search || undefined,
    status: filters.status,
    type: filters.type,
    targetType: filters.targetType,
  });

  const filteredTreatments = treatments;

  // Statistiques
  const stats = useMemo(() => {
    const totalCost = treatments
      .filter((t) => t.cost)
      .reduce((sum, t) => sum + (t.cost || 0), 0);

    return {
      total: treatments.length,
      in_progress: treatments.filter((t) => t.status === 'in_progress').length,
      completed: treatments.filter((t) => t.status === 'completed').length,
      cost: totalCost,
    };
  }, [treatments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Traitements</h1>
          <p className="text-muted-foreground">
            Suivez les soins médicaux et vétérinaires
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau traitement
        </Button>
      </div>

      {/* Filtres */}
      <TreatmentsFilters filters={filters} onFiltersChange={setFilters} />

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Total traitements</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold text-orange-600">{stats.in_progress}</div>
          <p className="text-xs text-muted-foreground">En cours</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <p className="text-xs text-muted-foreground">Terminés</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{stats.cost.toLocaleString()} DA</div>
          <p className="text-xs text-muted-foreground">Coût total</p>
        </div>
      </div>

      {/* Table */}
      <TreatmentsTable treatments={filteredTreatments} />
    </div>
  );
}
