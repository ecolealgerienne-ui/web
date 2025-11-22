'use client';

import { useState } from 'react';
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
import { Plus, X, Eye } from 'lucide-react';
import Link from 'next/link';

interface LotAnimalsCardProps {
  lotId: string;
}

// Données mock pour les animaux du lot
const mockLotAnimals = [
  {
    id: '1',
    animalId: 'animal-1',
    visualId: 'A-001',
    currentEid: '250268001234567',
    sex: 'female',
    status: 'alive',
    birthDate: '2023-03-15',
    speciesId: 'sheep',
    joinedAt: '2025-03-08T08:00:00Z',
  },
  {
    id: '2',
    animalId: 'animal-2',
    visualId: 'A-002',
    currentEid: '250268001234568',
    sex: 'male',
    status: 'alive',
    birthDate: '2023-02-10',
    speciesId: 'sheep',
    joinedAt: '2025-03-08T08:00:00Z',
  },
  {
    id: '3',
    animalId: 'animal-3',
    visualId: 'A-015',
    currentEid: '250268001234583',
    sex: 'female',
    status: 'alive',
    birthDate: '2023-04-22',
    speciesId: 'sheep',
    joinedAt: '2025-03-08T08:00:00Z',
  },
];

const calculateAge = (birthDate: string): string => {
  const birth = new Date(birthDate);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays}j`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} mois`;
  } else {
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return months > 0 ? `${years}a ${months}m` : `${years}a`;
  }
};

const getSexLabel = (sex: string): string => {
  return sex === 'male' ? 'Mâle' : 'Femelle';
};

const getSpeciesLabel = (speciesId: string): string => {
  const labels: Record<string, string> = {
    sheep: 'Ovin',
    goat: 'Caprin',
    cattle: 'Bovin',
  };
  return labels[speciesId] || speciesId;
};

export function LotAnimalsCard({ lotId }: LotAnimalsCardProps) {
  const [animals] = useState(mockLotAnimals);

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
                {animals.map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell className="font-medium">
                      {animal.visualId || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {animal.currentEid || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className="border border-border bg-background">
                        {getSpeciesLabel(animal.speciesId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {getSexLabel(animal.sex)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {calculateAge(animal.birthDate)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(animal.joinedAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/animals/${animal.animalId}`}>
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
