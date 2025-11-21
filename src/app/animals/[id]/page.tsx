"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimalInfoCard } from "@/components/animals/animal-info-card";
import { AnimalWeightsCard } from "@/components/animals/animal-weights-card";
import { AnimalTreatmentsCard } from "@/components/animals/animal-treatments-card";
import { AnimalVaccinationsCard } from "@/components/animals/animal-vaccinations-card";
import { mockAnimals, mockAnimalDetail } from "@/lib/data/animals.mock";

interface AnimalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AnimalDetailPage({ params }: AnimalDetailPageProps) {
  const { id } = use(params);

  // Simuler le fetch de l'animal
  // Dans la vraie app, on ferait un fetch vers l'API
  const animal = mockAnimals.find((a) => a.id === id);

  if (!animal) {
    return (
      <div className="space-y-6">
        <Link href="/animals">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </Link>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Animal non trouvé</h2>
          <p className="text-muted-foreground">
            L'animal demandé n'existe pas ou a été supprimé.
          </p>
        </div>
      </div>
    );
  }

  // Pour la démo, on utilise les données détaillées mockées
  const animalDetail = animal.id === "1" ? mockAnimalDetail : {
    ...animal,
    weights: [],
    treatments: [],
    vaccinations: [],
    movements: [],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/animals">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {animal.name || `Animal ${animal.internalId || animal.eid}`}
            </h1>
            <p className="text-muted-foreground font-mono">{animal.eid}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Modifier</Button>
          <Button>Ajouter une pesée</Button>
        </div>
      </div>

      {/* Informations générales */}
      <AnimalInfoCard animal={animal} />

      {/* Grid 2 colonnes pour les autres infos */}
      <div className="grid gap-6 md:grid-cols-2">
        <AnimalWeightsCard weights={animalDetail.weights} />
        <div className="space-y-6">
          <AnimalTreatmentsCard treatments={animalDetail.treatments} />
          <AnimalVaccinationsCard vaccinations={animalDetail.vaccinations} />
        </div>
      </div>
    </div>
  );
}
