'use client';

import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Pill } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTreatments } from '@/lib/hooks/useTreatments';
import { Treatment } from '@/lib/types/treatment';
import { CreateTreatmentDto, UpdateTreatmentDto, treatmentsService } from '@/lib/services/treatments.service';
import { TreatmentFormDialog } from '@/components/treatments/treatment-form-dialog';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function TreatmentsPage() {
  const t = useTranslations('treatments');
  const tc = useCommonTranslations();
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { treatments, loading, error, refresh } = useTreatments({ status: statusFilter === 'all' ? undefined : statusFilter as any });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | undefined>();
  const [treatmentToDelete, setTreatmentToDelete] = useState<Treatment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: treatments.length,
      scheduled: treatments.filter((t) => t.status === 'scheduled').length,
      inProgress: treatments.filter((t) => t.status === 'in_progress').length,
      completed: treatments.filter((t) => t.status === 'completed').length,
    };
  }, [treatments]);

  const handleAdd = () => {
    setSelectedTreatment(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setIsDialogOpen(true);
  };

  const handleDelete = (treatment: Treatment) => {
    setTreatmentToDelete(treatment);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: CreateTreatmentDto | UpdateTreatmentDto) => {
    setIsSubmitting(true);
    try {
      if (selectedTreatment) {
        await treatmentsService.update(selectedTreatment.id, data as UpdateTreatmentDto);
        toast.success(tc('messages.success'), t('messages.updated'));
      } else {
        await treatmentsService.create(data as CreateTreatmentDto);
        toast.success(tc('messages.success'), t('messages.created'));
      }
      setIsDialogOpen(false);
      refresh();
    } catch (error) {
      toast.error(tc('messages.error'), selectedTreatment ? t('messages.updateError') : t('messages.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!treatmentToDelete) return;
    try {
      await treatmentsService.delete(treatmentToDelete.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      setIsDeleteDialogOpen(false);
      setTreatmentToDelete(null);
      refresh();
    } catch (error) {
      toast.error(tc('messages.error'), t('messages.deleteError'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'scheduled': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'in_progress': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
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
          {t('newTreatment')}
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
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">{t('stats.inProgress')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">{t('stats.completed')}</p>
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
          <option value="in_progress">{t('status.in_progress')}</option>
          <option value="completed">{t('status.completed')}</option>
          <option value="cancelled">{t('status.cancelled')}</option>
        </select>
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('title')} ({treatments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {treatments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">{t('noTreatments')}</div>
          ) : (
            <div className="space-y-3">
              {treatments.map((treatment) => (
                <div key={treatment.id} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Pill className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(treatment.startDate).toLocaleDateString()}
                          {treatment.duration && ` - ${treatment.duration} ${treatment.duration > 1 ? 'jours' : 'jour'}`}
                        </span>
                        <Badge className={getStatusColor(treatment.status)}>
                          {t(`status.${treatment.status}`)}
                        </Badge>
                        <Badge variant="outline">{t(`type.${treatment.treatmentType}`)}</Badge>
                      </div>
                      <h3 className="font-semibold">{treatment.productName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('fields.reason')}: {treatment.reason}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          {t('fields.dosage')}: {treatment.dosage}
                        </span>
                        {treatment.frequency && (
                          <span className="text-muted-foreground">
                            {t('fields.frequency')}: {treatment.frequency}
                          </span>
                        )}
                      </div>
                      {(treatment.withdrawalPeriodMeat || treatment.withdrawalPeriodMilk) && (
                        <div className="flex gap-4 mt-1 text-sm text-orange-600">
                          {treatment.withdrawalPeriodMeat && (
                            <span>⚠️ Viande: {treatment.withdrawalPeriodMeat}j</span>
                          )}
                          {treatment.withdrawalPeriodMilk && (
                            <span>⚠️ Lait: {treatment.withdrawalPeriodMilk}j</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(treatment)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(treatment)}
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

      <TreatmentFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        treatment={selectedTreatment}
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
