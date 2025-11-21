'use client';

import { Lot, LOT_TYPE_LABELS, LOT_STATUS_LABELS } from '@/lib/types/lot';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LotsTableProps {
  lots: Lot[];
}

export function LotsTable({ lots }: LotsTableProps) {
  if (lots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Aucun lot trouvé</p>
      </div>
    );
  }

  const getStatusVariant = (status: Lot['status']) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'closed':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: Lot['type']) => {
    switch (type) {
      case 'treatment':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400';
      case 'vaccination':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400';
      case 'sale':
        return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400';
      case 'slaughter':
        return 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400';
      case 'purchase':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400';
      case 'breeding':
        return 'text-pink-600 bg-pink-50 dark:bg-pink-950 dark:text-pink-400';
      default:
        return '';
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Animaux</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Produit/Activité</TableHead>
            <TableHead className="text-right">Montant</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lots.map((lot) => (
            <TableRow key={lot.id}>
              <TableCell className="font-medium">
                <div className="space-y-1">
                  <div>{lot.name}</div>
                  {lot.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {lot.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getTypeColor(lot.type)}>
                  {LOT_TYPE_LABELS[lot.type]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(lot.status)}>
                  {LOT_STATUS_LABELS[lot.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {lot.animalCount}
              </TableCell>
              <TableCell className="text-sm">
                {lot.treatmentDate
                  ? new Date(lot.treatmentDate).toLocaleDateString('fr-FR')
                  : new Date(lot.createdAt).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell className="text-sm">
                <div className="space-y-1">
                  {lot.productName && <div>{lot.productName}</div>}
                  {lot.veterinarianName && (
                    <div className="text-xs text-muted-foreground">
                      {lot.veterinarianName}
                    </div>
                  )}
                  {lot.buyerName && (
                    <div className="text-xs text-muted-foreground">
                      Acheteur: {lot.buyerName}
                    </div>
                  )}
                  {lot.sellerName && (
                    <div className="text-xs text-muted-foreground">
                      Vendeur: {lot.sellerName}
                    </div>
                  )}
                  {!lot.productName &&
                    !lot.veterinarianName &&
                    !lot.buyerName &&
                    !lot.sellerName && <span className="text-muted-foreground">-</span>}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {lot.priceTotal ? (
                  <span className="font-medium">
                    {lot.priceTotal.toLocaleString('fr-DZ')} DA
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/lots/${lot.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
