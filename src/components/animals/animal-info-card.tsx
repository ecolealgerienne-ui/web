import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Animal } from "@/lib/types/animal";
import {
  calculateAge,
  speciesLabels,
  sexLabels,
  statusLabels,
} from "@/lib/data/animals.mock";

interface AnimalInfoCardProps {
  animal: Animal;
}

export function AnimalInfoCard({ animal }: AnimalInfoCardProps) {
  const getStatusVariant = (status: Animal["status"]) => {
    switch (status) {
      case "alive":
        return "success";
      case "sold":
        return "default";
      case "dead":
      case "missing":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations Générales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">EID</p>
            <p className="font-mono font-medium">{animal.identificationNumber}</p>
          </div>
          {animal.identificationNumber && (
            <div>
              <p className="text-sm text-muted-foreground">ID Interne</p>
              <p className="font-medium">{animal.identificationNumber}</p>
            </div>
          )}
          {animal.name && (
            <div>
              <p className="text-sm text-muted-foreground">Nom</p>
              <p className="font-medium">{animal.name}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Espèce</p>
            <p className="font-medium">{speciesLabels[animal.speciesId]}</p>
          </div>
          {animal.breedId && (
            <div>
              <p className="text-sm text-muted-foreground">Race</p>
              <p className="font-medium">{animal.breedId}</p>
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
