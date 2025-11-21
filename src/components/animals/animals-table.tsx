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
} from "@/lib/data/animals.mock";

interface AnimalsTableProps {
  animals: Animal[];
}

export function AnimalsTable({ animals }: AnimalsTableProps) {
  const router = useRouter();

  const getStatusVariant = (status: Animal["status"]) => {
    switch (status) {
      case "active":
        return "success";
      case "sold":
        return "default";
      case "dead":
      case "slaughtered":
        return "destructive";
      default:
        return "default";
    }
  };

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
            animals.map((animal) => (
              <TableRow
                key={animal.id}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => router.push(`/animals/${animal.id}`)}
              >
                <TableCell className="font-mono text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">{animal.eid}</span>
                    {animal.internalId && (
                      <span className="text-xs text-muted-foreground">
                        {animal.internalId}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {animal.name || (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{speciesLabels[animal.species]}</TableCell>
                <TableCell>
                  {animal.breed || (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{sexLabels[animal.sex]}</TableCell>
                <TableCell className="text-sm">
                  {calculateAge(animal.birthDate)}
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
