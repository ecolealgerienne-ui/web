'use client';

import { useRouter } from 'next/navigation';
import { Lot } from '@/lib/types/lot';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslations } from '@/lib/i18n';

interface LotsTableProps {
  lots: Lot[];
}

export function LotsTable({ lots }: LotsTableProps) {
  const router = useRouter();
  const t = useTranslations('lots');

  if (lots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">{t('noLots')}</p>
      </div>
    );
  }

  const getStatusVariant = (status: Lot['status']): 'default' | 'destructive' | 'warning' | 'success' => {
    switch (status) {
      case 'open':
        return 'success';
      case 'closed':
        return 'default';
      case 'archived':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: Lot['type']) => {
    switch (type) {
      case 'reproduction':
        return 'text-pink-600 bg-pink-50 dark:bg-pink-950 dark:text-pink-400 border-pink-200 dark:border-pink-800';
      case 'fattening':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'weaning':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'quarantine':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'sale':
        return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'other':
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.name')}</TableHead>
            <TableHead>{t('table.type')}</TableHead>
            <TableHead>{t('table.status')}</TableHead>
            <TableHead className="text-right">{t('table.animals')}</TableHead>
            <TableHead>{t('table.date')}</TableHead>
            <TableHead>{t('table.product')}</TableHead>
            <TableHead className="text-right">{t('table.amount')}</TableHead>
            <TableHead className="text-right">{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lots.map((lot) => (
            <TableRow
              key={lot.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => router.push(`/lots/${lot.id}`)}
            >
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
                <Badge className={getTypeColor(lot.type)}>
                  {t(`type.${lot.type}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(lot.status)}>
                  {t(`status.${lot.status}`)}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {lot._count?.lotAnimals || 0}
              </TableCell>
              <TableCell className="text-sm">
                {lot.treatmentDate
                  ? new Date(lot.treatmentDate).toLocaleDateString('fr-FR')
                  : lot.createdAt
                    ? new Date(lot.createdAt).toLocaleDateString('fr-FR')
                    : '-'}
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
                      {t('table.buyer')}: {lot.buyerName}
                    </div>
                  )}
                  {lot.sellerName && (
                    <div className="text-xs text-muted-foreground">
                      {t('table.seller')}: {lot.sellerName}
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
                <Eye className="h-4 w-4 text-muted-foreground" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
