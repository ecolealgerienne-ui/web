"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            species: value as any || undefined,
          })
        }
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Toutes espèces" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Toutes espèces</SelectItem>
          <SelectItem value="sheep">Moutons</SelectItem>
          <SelectItem value="goat">Chèvres</SelectItem>
          <SelectItem value="cattle">Bovins</SelectItem>
        </SelectContent>
      </Select>

      {/* Filtre Sexe */}
      <Select
        value={filters.sex || ""}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            sex: value as any || undefined,
          })
        }
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Tous sexes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tous sexes</SelectItem>
          <SelectItem value="male">Mâles</SelectItem>
          <SelectItem value="female">Femelles</SelectItem>
        </SelectContent>
      </Select>

      {/* Filtre Statut */}
      <Select
        value={filters.status || ""}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            status: value as any || undefined,
          })
        }
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Tous statuts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tous statuts</SelectItem>
          <SelectItem value="active">Actifs</SelectItem>
          <SelectItem value="sold">Vendus</SelectItem>
          <SelectItem value="dead">Décédés</SelectItem>
          <SelectItem value="slaughtered">Abattus</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
