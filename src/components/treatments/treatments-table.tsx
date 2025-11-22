'use client';

import { useRouter } from 'next/navigation';
import { Treatment, TREATMENT_STATUS_LABELS, TREATMENT_TYPE_LABELS, TREATMENT_TARGET_LABELS } from '@/lib/types/treatment';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TreatmentsTableProps {
  treatments: Treatment[];
}

export function TreatmentsTable({ treatments }: TreatmentsTableProps) {
  const router = useRouter();

  if (treatments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Aucun traitement trouvé</p>
      </div>
    );
  }

  const getStatusVariant = (status: Treatment['status']): 'default' | 'destructive' | 'warning' | 'success' => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'scheduled': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getTypeColor = (type: Treatment['treatmentType']) => {
    switch (type) {
      case 'antibiotic':
        return 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'antiparasitic':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'anti_inflammatory':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'vitamin':
        return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Cible</TableHead>
            <TableHead>Raison</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Coût</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {treatments.map((treatment) => (
            <TableRow
              key={treatment.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => router.push(`/treatments/${treatment.id}`)}
            >
              <TableCell className="font-medium">
                <div className="space-y-1">
                  <div>{treatment.productName}</div>
                  {treatment.dosage && (
                    <div className="text-xs text-muted-foreground">{treatment.dosage}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getTypeColor(treatment.treatmentType)}>
                  {TREATMENT_TYPE_LABELS[treatment.treatmentType]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className="border border-border bg-background">
                  {TREATMENT_TARGET_LABELS[treatment.targetType]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm max-w-xs truncate">
                {treatment.reason}
              </TableCell>
              <TableCell className="text-sm">
                {new Date(treatment.startDate).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(treatment.status)}>
                  {TREATMENT_STATUS_LABELS[treatment.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {treatment.cost ? `${treatment.cost.toLocaleString()} DA` : '-'}
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
