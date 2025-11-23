'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LotsFilters } from '@/components/lots/lots-filters';
import { LotsTable } from '@/components/lots/lots-table';
import { useLots } from '@/lib/hooks/useLots';
import { LotFilters } from '@/lib/types/lot';
import { useTranslations } from '@/lib/i18n';

export default function LotsPage() {
  const t = useTranslations('lots');
  const [filters, setFilters] = useState<LotFilters>({
    search: '',
    type: 'all',
    status: 'all',
  });

  // Utiliser le hook pour récupérer les lots depuis l'API
  const { lots, loading } = useLots(filters);

  // Statistiques basées sur les données réelles
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
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('newLot')}
        </Button>
      </div>

      {/* Filtres */}
      <LotsFilters filters={filters} onFiltersChange={setFilters} />

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">{t('stats.total')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold text-green-600">{stats.open}</div>
          <p className="text-xs text-muted-foreground">{t('stats.open')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold text-blue-600">{stats.closed}</div>
          <p className="text-xs text-muted-foreground">{t('stats.closed')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{stats.totalAnimals}</div>
          <p className="text-xs text-muted-foreground">{t('stats.totalAnimals')}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          {t('loading')}
        </div>
      ) : lots.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t('noLots')}
        </div>
      ) : (
        <LotsTable lots={lots} />
      )}
    </div>
  );
}
