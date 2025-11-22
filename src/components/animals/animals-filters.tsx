"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AnimalFilters } from "@/lib/types/animal";
import { useTranslations } from "@/lib/i18n";

interface AnimalsFiltersProps {
  filters: AnimalFilters;
  onFiltersChange: (filters: AnimalFilters) => void;
}

export function AnimalsFilters({ filters, onFiltersChange }: AnimalsFiltersProps) {
  const t = useTranslations('animals');

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Recherche */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('filters.searchPlaceholder')}
          value={filters.search || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="pl-9"
        />
      </div>

      {/* Filtre Espèce */}
      <Select
        value={filters.species || ""}
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            species: e.target.value as any || undefined,
          })
        }
        className="w-full md:w-[180px]"
      >
        <option value="">{t('filters.allSpecies')}</option>
        <option value="sheep">{t('filters.species.sheep')}</option>
        <option value="goat">{t('filters.species.goat')}</option>
        <option value="cattle">{t('filters.species.cattle')}</option>
      </Select>

      {/* Filtre Sexe */}
      <Select
        value={filters.sex || ""}
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            sex: e.target.value as any || undefined,
          })
        }
        className="w-full md:w-[180px]"
      >
        <option value="">{t('filters.allSex')}</option>
        <option value="male">{t('filters.sex.male')}</option>
        <option value="female">{t('filters.sex.female')}</option>
      </Select>

      {/* Filtre Statut */}
      <Select
        value={filters.status || ""}
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            status: e.target.value as any || undefined,
          })
        }
        className="w-full md:w-[180px]"
      >
        <option value="">{t('filters.allStatus')}</option>
        <option value="active">{t('filters.status.active')}</option>
        <option value="sold">{t('filters.status.sold')}</option>
        <option value="dead">{t('filters.status.dead')}</option>
        <option value="slaughtered">{t('filters.status.slaughtered')}</option>
      </Select>
    </div>
  );
}
