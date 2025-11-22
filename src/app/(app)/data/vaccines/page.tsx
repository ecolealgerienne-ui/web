'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVaccines } from '@/lib/hooks/useVaccines';
import { VaccineFormDialog } from '@/components/data/vaccine-form-dialog';
import { Vaccine } from '@/lib/types/vaccine';
import { vaccinesService } from '@/lib/services/vaccines.service';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations, useLocale } from '@/lib/i18n';
import { getVaccineName } from '@/lib/utils/i18n-helpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

export default function VaccinesPage() {
  const t = useTranslations('vaccines');
  const tc = useCommonTranslations();
  const { locale } = useLocale();
  const toast = useToast();
  const [showInactive, setShowInactive] = useState(true);
  const { vaccines: allVaccines, loading, error, refetch } = useVaccines();

  // Filtrer les vaccins selon l'état actif/inactif
  const vaccines = showInactive
    ? allVaccines
    : allVaccines.filter(vaccine => vaccine.isActive !== false);

  // État du formulaire
  const [formOpen, setFormOpen] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);

  // État de la confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingVaccine, setDeletingVaccine] = useState<Vaccine | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = () => {
    setEditingVaccine(null);
    setFormOpen(true);
  };

  const handleEdit = (vaccine: Vaccine) => {
    setEditingVaccine(vaccine);
    setFormOpen(true);
  };

  const handleDeleteClick = (vaccine: Vaccine) => {
    setDeletingVaccine(vaccine);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVaccine) return;

    setDeleting(true);
    try {
      await vaccinesService.delete(deletingVaccine.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      refetch();
      setDeleteDialogOpen(false);
      setDeletingVaccine(null);
    } catch (error) {
      toast.error(tc('messages.error'), t('messages.deleteError'));
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = async () => {
    await refetch();
    setFormOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('subtitle')}
            </p>
          </div>
        </div>
        <div className="text-center py-12">{tc('messages.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('subtitle')}
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              {/* ✅ CORRECTION: Utiliser tc('messages.loadError') au lieu de t('messages.deleteError') */}
              {tc('messages.loadError')}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {t('newItem')}
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showInactive"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="showInactive" className="text-sm cursor-pointer">
            {t('filters.showInactive')}
          </label>
        </div>

        <div className="text-sm text-muted-foreground">
          {t(vaccines.length > 1 ? 'vaccineCount_plural' : 'vaccineCount', { count: vaccines.length })}
        </div>
      </div>

      {/* Liste des vaccins */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('title')} ({vaccines.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vaccines.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('noVaccines')}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vaccines.map((vaccine) => (
                <div
                  key={vaccine.id}
                  className={`p-4 border rounded-lg hover:bg-accent transition-colors relative group ${
                    vaccine.isActive === false ? 'opacity-60 bg-muted/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* ✅ CORRECTION: Utiliser getVaccineName pour afficher le nom traduit */}
                    <div className="font-semibold text-lg flex-1">{getVaccineName(vaccine, locale)}</div>
                    {vaccine.isActive === false && (
                      <Badge variant="secondary" className="text-xs">
                        {tc('status.disabled')}
                      </Badge>
                    )}
                  </div>
                  {vaccine.description && (
                    <div className="text-sm text-muted-foreground mt-2">
                      {vaccine.description}
                    </div>
                  )}
                  {vaccine.manufacturer && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {t('fields.manufacturer')}: {vaccine.manufacturer}
                    </div>
                  )}
                  {vaccine.diseaseTarget && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t('fields.diseaseTarget')}: {vaccine.diseaseTarget}
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(vaccine)}
                      className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50 border-blue-200 dark:border-blue-800"
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      {tc('actions.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(vaccine)}
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50 border-red-200 dark:border-red-800"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      {tc('actions.delete')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info box */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            ℹ️ {t('messages.infoMessage')}
          </p>
        </CardContent>
      </Card>

      {/* Formulaire d'ajout/édition */}
      <VaccineFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        vaccine={editingVaccine}
        onSuccess={handleFormSuccess}
      />

      {/* Confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setDeleteDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>{t('deleteVaccine')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">
              {t('messages.confirmDelete', { name: deletingVaccine ? getVaccineName(deletingVaccine, locale) : '' })}
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              {t('messages.confirmDeleteDetails')}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              {tc('actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? tc('actions.deleting') : tc('actions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
