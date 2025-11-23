'use client';

import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/lib/i18n';
import { useVaccines } from '@/lib/hooks/useVaccines';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function VaccinesPage() {
  const t = useTranslations('vaccines');
  const { vaccines, loading, error } = useVaccines();

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
          {t('newVaccine')}
        </Button>
      </div>

      {/* Liste des vaccins */}
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
          ) : vaccines.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('noVaccines')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('manufacturer')}</TableHead>
                  <TableHead>{t('targetDiseases')}</TableHead>
                  <TableHead>{t('administrationRoute')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vaccines.map((vaccine) => (
                  <TableRow key={vaccine.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{vaccine.name}</div>
                        {vaccine.description && (
                          <div className="text-xs text-muted-foreground">
                            {vaccine.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{vaccine.manufacturer || '-'}</TableCell>
                    <TableCell>
                      {vaccine.targetDiseases?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {vaccine.targetDiseases.map((disease, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {disease}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{vaccine.administrationRoute || '-'}</TableCell>
                    <TableCell>
                      {vaccine.isActive ? (
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
