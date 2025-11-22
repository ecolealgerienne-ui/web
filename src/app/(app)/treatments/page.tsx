'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TreatmentsFilters } from '@/components/treatments/treatments-filters';
import { TreatmentsTable } from '@/components/treatments/treatments-table';
import { mockTreatments } from '@/lib/data/treatments.mock';
import { TreatmentFilters } from '@/lib/types/treatment';

export default function TreatmentsPage() {
  const [filters, setFilters] = useState<TreatmentFilters>({
    search: '',
    status: 'all',
    type: 'all',
    targetType: 'all',
  });

  // Filtrage des traitements
  const filteredTreatments = useMemo(() => {
    return mockTreatments.filter((treatment) => {
      // Recherche
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch =
          treatment.productName.toLowerCase().includes(search) ||
          treatment.reason.toLowerCase().includes(search) ||
          treatment.veterinarianName?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Filtre par statut
      if (filters.status !== 'all' && treatment.status !== filters.status) {
        return false;
      }

      // Filtre par type
      if (filters.type !== 'all' && treatment.treatmentType !== filters.type) {
        return false;
      }

      // Filtre par type de cible
      if (filters.targetType !== 'all' && treatment.targetType !== filters.targetType) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // Statistiques
  const stats = useMemo(() => {
    const totalCost = mockTreatments
      .filter((t) => t.cost)
      .reduce((sum, t) => sum + (t.cost || 0), 0);

    return {
      total: mockTreatments.length,
      in_progress: mockTreatments.filter((t) => t.status === 'in_progress').length,
      completed: mockTreatments.filter((t) => t.status === 'completed').length,
      cost: totalCost,
    };
  }, []);

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
