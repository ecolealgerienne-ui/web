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

interface LotsFiltersProps {
  filters: LotFilters;
  onFiltersChange: (filters: LotFilters) => void;
}

export function LotsFilters({ filters, onFiltersChange }: LotsFiltersProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="grid gap-4 md:grid-cols-4">
        {/* Recherche */}
        <div className="md:col-span-2">
          <Label htmlFor="search">Recherche</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Nom, description, produit..."
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
          <Label htmlFor="type">Type de lot</Label>
          <Select
            value={filters.type}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, type: value as any })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(LOT_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtre Statut */}
        <div>
          <Label htmlFor="status">Statut</Label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, status: value as any })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(LOT_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
