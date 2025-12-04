'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVeterinarians } from '@/lib/hooks/useVeterinarians';
import { VeterinarianFormDialog } from '@/components/data/veterinarian-form-dialog';
import { Veterinarian } from '@/lib/types/veterinarian';
import { veterinariansService } from '@/lib/services/veterinarians.service';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { useAuth } from '@/contexts/auth-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

export default function VeterinariansPage() {
  const t = useTranslations('veterinarians');
  const tc = useCommonTranslations();
  const toast = useToast();
  const { user } = useAuth();
  const [showInactive, setShowInactive] = useState(true);
  const { veterinarians: allVeterinarians, loading, error, refetch } = useVeterinarians(user?.farmId);

  // Filtrer selon l'état actif/inactif
  const veterinarians = showInactive
    ? allVeterinarians
    : allVeterinarians.filter(vet => vet.isActive !== false);

  // État du formulaire
  const [formOpen, setFormOpen] = useState(false);
  const [editingVeterinarian, setEditingVeterinarian] = useState<Veterinarian | null>(null);

  // État de la confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingVeterinarian, setDeletingVeterinarian] = useState<Veterinarian | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = () => {
    setEditingVeterinarian(null);
    setFormOpen(true);
  };

  const handleEdit = (veterinarian: Veterinarian) => {
    setEditingVeterinarian(veterinarian);
    setFormOpen(true);
  };

  const handleDeleteClick = (veterinarian: Veterinarian) => {
    setDeletingVeterinarian(veterinarian);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVeterinarian || !user?.farmId) return;

    setDeleting(true);
    try {
      await veterinariansService.delete(user.farmId, deletingVeterinarian.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      refetch();
      setDeleteDialogOpen(false);
      setDeletingVeterinarian(null);
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
          {t('newVeterinarian')}
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
          {t(veterinarians.length > 1 ? 'veterinarianCount_plural' : 'veterinarianCount', { count: veterinarians.length })}
        </div>
      </div>

      {/* Liste des vétérinaires */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('title')} ({veterinarians.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {veterinarians.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('noVeterinarians')}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {veterinarians.map((vet) => (
                <div
                  key={vet.id}
                  className={`p-4 border rounded-lg hover:bg-accent transition-colors relative group ${
                    vet.isActive === false ? 'opacity-60 bg-muted/30' : ''
                  }`}
                >
                  {/* En-tête */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="font-semibold text-lg">
                        {vet.title} {vet.firstName} {vet.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('fields.licenseNumber')}: {vet.licenseNumber}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {vet.isActive === false && (
                        <Badge variant="warning" className="text-xs">
                          {tc('status.disabled')}
                        </Badge>
                      )}
                      {vet.isDefault && (
                        <Badge variant="default" className="text-xs">
                          {t('badges.default')}
                        </Badge>
                      )}
                      {vet.emergencyService && (
                        <Badge variant="destructive" className="text-xs">
                          {t('badges.emergency')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Spécialités */}
                  <div className="text-sm text-muted-foreground mb-2">
                    {vet.specialties}
                  </div>

                  {/* Clinique */}
                  {vet.clinic && (
                    <div className="text-sm font-medium mb-2">
                      {vet.clinic}
                    </div>
                  )}

                  {/* Contact */}
                  <div className="space-y-1 text-sm mb-3">
                    {vet.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{vet.phone}</span>
                      </div>
                    )}
                    {vet.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{vet.email}</span>
                      </div>
                    )}
                    {vet.city && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{vet.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Tarifs */}
                  {(vet.consultationFee || vet.emergencyFee) && (
                    <div className="text-xs text-muted-foreground mb-3 pt-2 border-t">
                      {vet.consultationFee && vet.consultationFee > 0 && (
                        <div>
                          {t('fields.consultationFee')}: {vet.consultationFee} {vet.currency || 'EUR'}
                        </div>
                      )}
                      {vet.emergencyFee && vet.emergencyFee > 0 && (
                        <div>
                          {t('fields.emergencyFee')}: {vet.emergencyFee} {vet.currency || 'EUR'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(vet)}
                      className="flex-1"
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      {tc('actions.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(vet)}
                      className="flex-1 text-destructive hover:text-destructive"
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

      {/* Formulaire d'ajout/édition */}
      <VeterinarianFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        veterinarian={editingVeterinarian}
        onSuccess={handleFormSuccess}
      />

      {/* Confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setDeleteDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>{t('deleteVeterinarian')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              {t('messages.confirmDelete', {
                name: deletingVeterinarian
                  ? `${deletingVeterinarian.title} ${deletingVeterinarian.firstName} ${deletingVeterinarian.lastName}`
                  : ''
              })}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {tc('messages.actionIrreversible')}
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
              variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
