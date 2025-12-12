import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Animal } from "@/lib/types/animal";
import {
  calculateAge,
  speciesLabels,
  sexLabels,
  statusLabels,
  getStatusVariant,
} from "@/lib/utils/animal-helpers";

interface AnimalInfoCardProps {
  animal: Animal;
}

export function AnimalInfoCard({ animal }: AnimalInfoCardProps) {
  const displayId = animal.currentEid || animal.officialNumber || animal.visualId || animal.id;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations Générales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {animal.currentEid && (
            <div>
              <p className="text-sm text-muted-foreground">EID</p>
              <p className="font-mono font-medium">{animal.currentEid}</p>
            </div>
          )}
          {animal.officialNumber && (
            <div>
              <p className="text-sm text-muted-foreground">N° Officiel</p>
              <p className="font-medium">{animal.officialNumber}</p>
            </div>
          )}
          {animal.visualId && (
            <div>
              <p className="text-sm text-muted-foreground">ID Visuel</p>
              <p className="font-medium">{animal.visualId}</p>
            </div>
          )}
          {animal.speciesId && (
            <div>
              <p className="text-sm text-muted-foreground">Espèce</p>
              <p className="font-medium">{animal.species?.nameFr || speciesLabels[animal.speciesId] || animal.speciesId}</p>
            </div>
          )}
          {animal.breedId && (
            <div>
              <p className="text-sm text-muted-foreground">Race</p>
              <p className="font-medium">{animal.breed?.nameFr || animal.breedId}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Sexe</p>
            <p className="font-medium">{sexLabels[animal.sex]}</p>
          </div>
          {animal.birthDate && (
            <div>
              <p className="text-sm text-muted-foreground">Date de Naissance</p>
              <p className="font-medium">
                {new Date(animal.birthDate).toLocaleDateString("fr-FR")}
              </p>
            </div>
          )}
          {animal.birthDate && (
            <div>
              <p className="text-sm text-muted-foreground">Âge</p>
              <p className="font-medium">{calculateAge(animal.birthDate)}</p>
            </div>
          )}
          {animal.currentWeight && (
            <div>
              <p className="text-sm text-muted-foreground">Poids Actuel</p>
              <p className="font-medium">{animal.currentWeight} kg</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Statut</p>
            <Badge variant={getStatusVariant(animal.status)}>
              {statusLabels[animal.status]}
            </Badge>
          </div>
          {animal.acquisitionDate && (
            <div>
              <p className="text-sm text-muted-foreground">Date d&apos;Acquisition</p>
              <p className="font-medium">
                {new Date(animal.acquisitionDate).toLocaleDateString("fr-FR")}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
