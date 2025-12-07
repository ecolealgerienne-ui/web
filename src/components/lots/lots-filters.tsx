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
import { LotFilters, LotType, LotStatus } from '@/lib/types/lot';
import { Search } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

const LOT_TYPES: LotType[] = ['treatment', 'vaccination', 'sale', 'slaughter', 'purchase', 'breeding', 'reproduction'];
const LOT_STATUSES: LotStatus[] = ['open', 'closed', 'archived'];

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
              value={filters.search || ''}
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
            value={filters.type || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, type: value as LotType | 'all' })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filters.typePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
              {LOT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`type.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtre Statut */}
        <div>
          <Label htmlFor="status">{t('filters.status')}</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, status: value as LotStatus | 'all' })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filters.statusPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
              {LOT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`status.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
