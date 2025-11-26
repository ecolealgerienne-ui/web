'use client';

import { useRouter } from 'next/navigation';
import { Vaccination, VACCINATION_STATUS_LABELS, VACCINATION_TARGET_LABELS } from '@/lib/types/vaccination';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface VaccinationsTableProps {
  vaccinations: Vaccination[];
}

export function VaccinationsTable({ vaccinations }: VaccinationsTableProps) {
  const router = useRouter();

  if (vaccinations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Aucune vaccination trouvée</p>
      </div>
    );
  }

  const getStatusVariant = (status: Vaccination['status']): 'default' | 'destructive' | 'warning' | 'success' => {
    switch (status) {
      case 'completed': return 'success';
      case 'scheduled': return 'default';
      case 'overdue': return 'destructive';
      case 'cancelled': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vaccin</TableHead>
            <TableHead>Cible</TableHead>
            <TableHead>Date prévue</TableHead>
            <TableHead>Vétérinaire</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vaccinations.map((vaccination) => (
            <TableRow
              key={vaccination.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => router.push(`/vaccinations/${vaccination.id}`)}
            >
              <TableCell className="font-medium">
                <div className="space-y-1">
                  <div>{vaccination.vaccineName}</div>
                  <div className="text-xs text-muted-foreground">{vaccination.diseaseTarget}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className="border border-border bg-background">
                  {VACCINATION_TARGET_LABELS[vaccination.targetType]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {new Date(vaccination.vaccinationDate).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell className="text-sm">
                {vaccination.veterinarianName || '-'}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(vaccination.status)}>
                  {VACCINATION_STATUS_LABELS[vaccination.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Eye className="h-4 w-4 text-muted-foreground" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
