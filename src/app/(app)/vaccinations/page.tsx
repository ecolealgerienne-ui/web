'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { VaccinationsFilters } from '@/components/vaccinations/vaccinations-filters';
import { VaccinationsTable } from '@/components/vaccinations/vaccinations-table';
import { useVaccinations } from '@/lib/hooks/useVaccinations';
import { VaccinationFilters } from '@/lib/types/vaccination';

export default function VaccinationsPage() {
  const [filters, setFilters] = useState<VaccinationFilters>({
    search: '',
    status: 'all',
    targetType: 'all',
  });

  // Fetch vaccinations with real API
  const { vaccinations, loading, error } = useVaccinations({
    search: filters.search || undefined,
    status: filters.status,
    targetType: filters.targetType,
  });

  const filteredVaccinations = vaccinations;

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: vaccinations.length,
      scheduled: vaccinations.filter((v) => v.status === 'scheduled').length,
      completed: vaccinations.filter((v) => v.status === 'completed').length,
      overdue: vaccinations.filter((v) => v.status === 'overdue').length,
    };
  }, [vaccinations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vaccinations</h1>
          <p className="text-muted-foreground">
            Gérez le calendrier vaccinal de votre cheptel
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Programmer une vaccination
        </Button>
      </div>

      {/* Filtres */}
      <VaccinationsFilters filters={filters} onFiltersChange={setFilters} />

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Total vaccinations</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          <p className="text-xs text-muted-foreground">Programmées</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <p className="text-xs text-muted-foreground">Effectuées</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <p className="text-xs text-muted-foreground">En retard</p>
        </div>
      </div>

      {/* Table */}
      <VaccinationsTable vaccinations={filteredVaccinations} />
    </div>
  );
}
