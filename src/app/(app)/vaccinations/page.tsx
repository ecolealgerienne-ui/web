'use client';

import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Syringe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVaccinations } from '@/lib/hooks/useVaccinations';
import { Vaccination, CreateVaccinationDto, UpdateVaccinationDto } from '@/lib/types/vaccination';
import { vaccinationsService } from '@/lib/services/vaccinations.service';
import { VaccinationFormDialog } from '@/components/vaccinations/vaccination-form-dialog';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function VaccinationsPage() {
  const t = useTranslations('vaccinations');
  const tc = useCommonTranslations();
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { vaccinations, loading, error, refresh } = useVaccinations({ status: statusFilter === 'all' ? undefined : statusFilter as any });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | undefined>();
  const [vaccinationToDelete, setVaccinationToDelete] = useState<Vaccination | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: vaccinations.length,
      scheduled: vaccinations.filter((v) => v.status === 'scheduled').length,
      completed: vaccinations.filter((v) => v.status === 'completed').length,
      overdue: vaccinations.filter((v) => v.status === 'overdue').length,
    };
  }, [vaccinations]);

  const handleAdd = () => {
    setSelectedVaccination(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (vaccination: Vaccination) => {
    setSelectedVaccination(vaccination);
    setIsDialogOpen(true);
  };

  const handleDelete = (vaccination: Vaccination) => {
    setVaccinationToDelete(vaccination);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: CreateVaccinationDto | UpdateVaccinationDto) => {
    setIsSubmitting(true);
    try {
      if (selectedVaccination) {
        await vaccinationsService.update(selectedVaccination.id, data as UpdateVaccinationDto);
        toast.success(tc('messages.success'), t('messages.updated'));
      } else {
        await vaccinationsService.create(data as CreateVaccinationDto);
        toast.success(tc('messages.success'), t('messages.created'));
      }
      setIsDialogOpen(false);
      refresh();
    } catch (error) {
      toast.error(tc('messages.error'), selectedVaccination ? t('messages.updateError') : t('messages.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!vaccinationToDelete) return;
    try {
      await vaccinationsService.delete(vaccinationToDelete.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      setIsDeleteDialogOpen(false);
      setVaccinationToDelete(null);
      refresh();
    } catch (error) {
      toast.error(tc('messages.error'), t('messages.deleteError'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'scheduled': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'overdue': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      case 'cancelled': return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  if (loading) return <div className="p-6"><div className="text-center py-12">{tc('messages.loading')}</div></div>;
  if (error) return <div className="p-6"><Card><CardContent className="pt-6"><div className="text-center text-destructive">{t('messages.loadError')}</div></CardContent></Card></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {t('newVaccination')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{t('stats.total')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">{t('stats.scheduled')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">{t('stats.completed')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">{t('stats.overdue')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">{t('filters.allStatus')}</option>
          <option value="scheduled">{t('status.scheduled')}</option>
          <option value="completed">{t('status.completed')}</option>
          <option value="overdue">{t('status.overdue')}</option>
          <option value="cancelled">{t('status.cancelled')}</option>
        </select>
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('title')} ({vaccinations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {vaccinations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">{t('noVaccinations')}</div>
          ) : (
            <div className="space-y-3">
              {vaccinations.map((vaccination) => (
                <div key={vaccination.id} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Syringe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {vaccination.scheduledDate ? new Date(vaccination.scheduledDate).toLocaleDateString() : 'N/A'}
                        </span>
                        <Badge className={getStatusColor(vaccination.status)}>
                          {t(`status.${vaccination.status}`)}
                        </Badge>
                      </div>
                      <h3 className="font-semibold">{vaccination.vaccineName}</h3>
                      {vaccination.diseaseTarget && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('fields.diseaseTarget')}: {vaccination.diseaseTarget}
                        </p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm">
                        {vaccination.batchNumber && (
                          <span className="text-muted-foreground">
                            {t('fields.batchNumber')}: {vaccination.batchNumber}
                          </span>
                        )}
                        {vaccination.dosage && (
                          <span className="text-muted-foreground">
                            {t('fields.dosage')}: {vaccination.dosage}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(vaccination)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(vaccination)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <VaccinationFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        vaccination={selectedVaccination}
        isLoading={isSubmitting}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('messages.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('messages.deleteConfirmDescription')}
              <br />
              <span className="text-destructive font-medium">{tc('messages.actionIrreversible')}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tc('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
