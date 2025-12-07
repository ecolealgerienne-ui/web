'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, X, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useLot } from '@/lib/hooks/useLots';
import { calculateAge, sexLabels, speciesLabels } from '@/lib/utils/animal-helpers';

interface LotAnimalsCardProps {
  lotId: string;
}

const getSpeciesLabel = (speciesId: string): string => {
  const labels: Record<string, string> = {
    sheep: 'Ovin',
    goat: 'Caprin',
    cattle: 'Bovin',
  };
  return labels[speciesId] || speciesId;
};

export function LotAnimalsCard({ lotId }: LotAnimalsCardProps) {
  const { animals, loading, error } = useLot(lotId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Animaux du lot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Animaux du lot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive">
              Erreur lors du chargement des animaux
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Animaux du lot</CardTitle>
            <CardDescription>
              {animals.length} animal{animals.length > 1 ? 'aux' : ''} dans ce lot
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {animals.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun animal dans ce lot
            </p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Visuel</TableHead>
                  <TableHead>EID</TableHead>
                  <TableHead>Espèce</TableHead>
                  <TableHead>Sexe</TableHead>
                  <TableHead>Âge</TableHead>
                  <TableHead>Ajouté le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animals.map((lotAnimal) => (
                  <TableRow key={lotAnimal.id}>
                    <TableCell className="font-medium">
                      {lotAnimal.animal?.visualId || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {lotAnimal.animal?.currentEid || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className="border border-border bg-background">
                        {getSpeciesLabel(lotAnimal.animal?.speciesId || '')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {lotAnimal.animal?.sex ? (sexLabels[lotAnimal.animal.sex] || lotAnimal.animal.sex) : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {lotAnimal.animal?.birthDate ? calculateAge(lotAnimal.animal.birthDate) : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(lotAnimal.joinedAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/animals/${lotAnimal.animalId}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
