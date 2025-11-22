"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimalsFilters } from "@/components/animals/animals-filters";
import { AnimalsTable } from "@/components/animals/animals-table";
import { useAnimals } from "@/lib/hooks/useAnimals";
import { AnimalFilters } from "@/lib/types/animal";

export default function AnimalsPage() {
  const [filters, setFilters] = useState<AnimalFilters>({});

  // Utiliser le hook pour charger les animaux depuis l'API
  const { animals, loading, pagination } = useAnimals(filters);

  // Afficher un état de chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <div className="h-4 bg-muted rounded w-1/2 mb-2 animate-pulse" />
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

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
          <p className="text-2xl font-bold">{animals.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Moutons</p>
          <p className="text-2xl font-bold">
            {animals.filter((a) => a.species === "sheep").length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Chèvres</p>
          <p className="text-2xl font-bold">
            {animals.filter((a) => a.species === "goat").length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Bovins</p>
          <p className="text-2xl font-bold">
            {animals.filter((a) => a.species === "cattle").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <AnimalsTable animals={animals} />
    </div>
  );
}
