"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AnimalFilters } from "@/lib/types/animal";

interface AnimalsFiltersProps {
  filters: AnimalFilters;
  onFiltersChange: (filters: AnimalFilters) => void;
}

export function AnimalsFilters({ filters, onFiltersChange }: AnimalsFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Recherche */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par EID, nom, ID interne..."
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
        <option value="">Toutes espèces</option>
        <option value="sheep">Moutons</option>
        <option value="goat">Chèvres</option>
        <option value="cattle">Bovins</option>
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
        <option value="">Tous sexes</option>
        <option value="male">Mâles</option>
        <option value="female">Femelles</option>
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
        <option value="">Tous statuts</option>
        <option value="active">Actifs</option>
        <option value="sold">Vendus</option>
        <option value="dead">Décédés</option>
        <option value="slaughtered">Abattus</option>
      </Select>
    </div>
  );
}
