'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
          <Label htmlFor="search">{t('filters.search')}</Label>
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
          <Label htmlFor="type">{t('filters.type')}</Label>
          <Select
            value={filters.type}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, type: value as any })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filters.typePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
              {Object.keys(LOT_TYPE_LABELS).map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`type.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtre Statut */}
        <div>
          <Label htmlFor="status">{t('filters.status')}</Label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, status: value as any })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filters.statusPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
              {Object.keys(LOT_STATUS_LABELS).map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`status.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
