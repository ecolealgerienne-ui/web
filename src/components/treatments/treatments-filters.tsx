'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
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
            value={filters.status}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(TREATMENT_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <Select
            value={filters.type}
            onValueChange={(value) => onFiltersChange({ ...filters, type: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(TREATMENT_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="targetType">Cible</Label>
          <Select
            value={filters.targetType}
            onValueChange={(value) => onFiltersChange({ ...filters, targetType: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les cibles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les cibles</SelectItem>
              {Object.entries(TREATMENT_TARGET_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
