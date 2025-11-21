"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimalsFilters } from "@/components/animals/animals-filters";
import { AnimalsTable } from "@/components/animals/animals-table";
import { mockAnimals } from "@/lib/data/animals.mock";
import { AnimalFilters } from "@/lib/types/animal";

export default function AnimalsPage() {
  const [filters, setFilters] = useState<AnimalFilters>({});

  // Filtrer les animaux selon les critères
  const filteredAnimals = useMemo(() => {
    return mockAnimals.filter((animal) => {
      // Filtre par recherche (EID, nom, ID interne)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesEid = animal.eid.toLowerCase().includes(searchLower);
        const matchesName = animal.name?.toLowerCase().includes(searchLower);
        const matchesInternalId = animal.internalId
          ?.toLowerCase()
          .includes(searchLower);

        if (!matchesEid && !matchesName && !matchesInternalId) {
          return false;
        }
      }

      // Filtre par espèce
      if (filters.species && animal.species !== filters.species) {
        return false;
      }

      // Filtre par sexe
      if (filters.sex && animal.sex !== filters.sex) {
        return false;
      }

      // Filtre par statut
      if (filters.status && animal.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Animaux</h1>
          <p className="text-muted-foreground">
            Gérez votre cheptel et consultez les détails de chaque animal
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un animal
        </Button>
      </div>

      {/* Filtres */}
      <AnimalsFilters filters={filters} onFiltersChange={setFilters} />

      {/* Stats rapides */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{filteredAnimals.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Moutons</p>
          <p className="text-2xl font-bold">
            {filteredAnimals.filter((a) => a.species === "sheep").length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Chèvres</p>
          <p className="text-2xl font-bold">
            {filteredAnimals.filter((a) => a.species === "goat").length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Bovins</p>
          <p className="text-2xl font-bold">
            {filteredAnimals.filter((a) => a.species === "cattle").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <AnimalsTable animals={filteredAnimals} />
    </div>
  );
}
