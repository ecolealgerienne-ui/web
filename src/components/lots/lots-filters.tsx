'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { LotFilters, LOT_TYPE_LABELS, LOT_STATUS_LABELS } from '@/lib/types/lot';
import { Search } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

interface LotsFiltersProps {
  filters: LotFilters;
  onFiltersChange: (filters: LotFilters) => void;
}

export function LotsFilters({ filters, onFiltersChange }: LotsFiltersProps) {
  const t = useTranslations('lots');

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="grid gap-4 md:grid-cols-4">
        {/* Recherche */}
        <div className="md:col-span-2">
          <Label htmlFor="search">{t('filters.searchLabel')}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder={t('filters.searchPlaceholder')}
              className="pl-9"
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
            />
          </div>
        </div>

        {/* Filtre Type */}
        <div>
          <Label htmlFor="type">{t('filters.typeLabel')}</Label>
          <Select
            id="type"
            value={filters.type}
            onChange={(e) =>
              onFiltersChange({ ...filters, type: e.target.value as any })
            }
          >
            <option value="all">{t('filters.allTypes')}</option>
            {Object.entries(LOT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        {/* Filtre Statut */}
        <div>
          <Label htmlFor="status">{t('filters.statusLabel')}</Label>
          <Select
            id="status"
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value as any })
            }
          >
            <option value="all">{t('filters.allStatus')}</option>
            {Object.entries(LOT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
