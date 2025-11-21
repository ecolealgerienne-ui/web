'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { TreatmentFilters, TREATMENT_STATUS_LABELS, TREATMENT_TYPE_LABELS, TREATMENT_TARGET_LABELS } from '@/lib/types/treatment';
import { Search } from 'lucide-react';

interface TreatmentsFiltersProps {
  filters: TreatmentFilters;
  onFiltersChange: (filters: TreatmentFilters) => void;
}

export function TreatmentsFilters({ filters, onFiltersChange }: TreatmentsFiltersProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <Label htmlFor="search">Recherche</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Produit, raison..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="status">Statut</Label>
          <Select
            id="status"
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as any })}
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(TREATMENT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <Select
            id="type"
            value={filters.type}
            onChange={(e) => onFiltersChange({ ...filters, type: e.target.value as any })}
          >
            <option value="all">Tous les types</option>
            {Object.entries(TREATMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="targetType">Cible</Label>
          <Select
            id="targetType"
            value={filters.targetType}
            onChange={(e) => onFiltersChange({ ...filters, targetType: e.target.value as any })}
          >
            <option value="all">Toutes les cibles</option>
            {Object.entries(TREATMENT_TARGET_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
