'use client';

import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/lib/i18n';
import { useMedicalProducts } from '@/lib/hooks/useMedicalProducts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function MedicationsPage() {
  const t = useTranslations('medications');
  const { products, loading, error } = useMedicalProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('newMedication')}
        </Button>
      </div>

      {/* Liste des médicaments */}
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              {error.message}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('noMedications')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('commercialName')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{t('manufacturer')}</TableHead>
                  <TableHead>{t('stock')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{product.name}</div>
                        {product.activeIngredient && (
                          <div className="text-xs text-muted-foreground">
                            {product.activeIngredient}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.commercialName || '-'}</TableCell>
                    <TableCell>
                      {product.category ? (
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{product.manufacturer || '-'}</TableCell>
                    <TableCell>
                      {product.currentStock !== undefined ? (
                        <span>
                          {product.currentStock} {product.stockUnit || ''}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {product.isActive ? (
                        <Badge variant="default">{t('active')}</Badge>
                      ) : (
                        <Badge variant="secondary">{t('inactive')}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
