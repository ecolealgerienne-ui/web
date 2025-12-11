"use client";

import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Animal } from "@/lib/types/animal";
import {
  calculateAge,
  speciesLabels,
  sexLabels,
  statusLabels,
  getStatusVariant,
} from "@/lib/utils/animal-helpers";

interface AnimalsTableProps {
  animals: Animal[];
}

export function AnimalsTable({ animals }: AnimalsTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>EID / ID</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Espèce</TableHead>
            <TableHead>Race</TableHead>
            <TableHead>Sexe</TableHead>
            <TableHead>Âge</TableHead>
            <TableHead>Poids</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                Aucun animal trouvé
              </TableCell>
            </TableRow>
          ) : (
            animals.map((animal) => {
              const displayId = animal.currentEid || animal.officialNumber || animal.visualId || animal.id.substring(0, 8);
              return (
                <TableRow
                  key={animal.id}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => router.push(`/animals/${animal.id}`)}
                >
                  <TableCell className="font-mono text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">{displayId}</span>
                      {animal.visualId && animal.currentEid && (
                        <span className="text-xs text-muted-foreground">
                          {animal.visualId}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {animal.breed?.nameFr || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {animal.speciesId ? (animal.species?.nameFr || speciesLabels[animal.speciesId] || animal.speciesId) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {animal.breed?.nameFr || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{sexLabels[animal.sex]}</TableCell>
                  <TableCell className="text-sm">
                    {animal.birthDate ? calculateAge(animal.birthDate) : '-'}
                  </TableCell>
                  <TableCell>
                    {animal.currentWeight ? (
                      `${animal.currentWeight} kg`
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(animal.status)}>
                      {statusLabels[animal.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
