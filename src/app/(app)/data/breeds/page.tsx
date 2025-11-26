'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBreeds } from '@/lib/hooks/useBreeds';
import { BreedFormDialog } from '@/components/data/breed-form-dialog';
import { Breed } from '@/lib/types/breed';
import { breedsService } from '@/lib/services/breeds.service';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

export default function BreedsPage() {
  const t = useTranslations('breeds');
  const tc = useCommonTranslations();
  const toast = useToast();
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const { breeds: allBreeds, loading, error, refetch } = useBreeds(selectedSpecies || undefined);

  const speciesOptions = [
    { value: '', label: t('filters.allSpecies') },
    { value: 'sheep', label: t('species.sheep') },
    { value: 'goat', label: t('species.goat') },
    { value: 'cattle', label: t('species.cattle') },
  ];

  // Filtrer les races selon l'état actif/inactif
  const breeds = showInactive
    ? allBreeds
    : allBreeds.filter(breed => breed.isActive !== false);

  // État du formulaire
  const [formOpen, setFormOpen] = useState(false);
  const [editingBreed, setEditingBreed] = useState<Breed | null>(null);

  // État de la confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBreed, setDeletingBreed] = useState<Breed | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = () => {
    setEditingBreed(null);
    setFormOpen(true);
  };

  const handleEdit = (breed: Breed) => {
    setEditingBreed(breed);
    setFormOpen(true);
  };

  const handleDeleteClick = (breed: Breed) => {
    setDeletingBreed(breed);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBreed) return;

    setDeleting(true);
    try {
      await breedsService.delete(deletingBreed.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      refetch();
      setDeleteDialogOpen(false);
      setDeletingBreed(null);
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
              {t('messages.deleteError')}
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
          {t('newBreed')}
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center flex-wrap">
        <Select
          value={selectedSpecies}
          onValueChange={setSelectedSpecies}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {speciesOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
          {t(breeds.length > 1 ? 'breedCount_plural' : 'breedCount', { count: breeds.length })}
        </div>
      </div>

      {/* Liste des races */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('title')} ({breeds.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {breeds.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('noBreeds')}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {breeds.map((breed) => (
                <div
                  key={breed.id}
                  className={`p-4 border rounded-lg hover:bg-accent transition-colors relative group ${
                    breed.isActive === false ? 'opacity-60 bg-muted/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-lg flex-1">{breed.nameFr}</div>
                    {breed.isActive === false && (
                      <Badge variant="warning" className="text-xs">
                        {tc('status.disabled')}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {breed.nameEn}
                  </div>
                  {breed.nameAr && (
                    <div className="text-sm text-muted-foreground mt-1 text-right" dir="rtl">
                      {breed.nameAr}
                    </div>
                  )}
                  {breed.description && (
                    <div className="text-sm text-muted-foreground mt-2">
                      {breed.description}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    {t('species.label')}: {breed.speciesId}
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(breed)}
                      className="flex-1"
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      {tc('actions.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(breed)}
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

      {/* Info box */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            ℹ️ {t('messages.infoMessage')}
          </p>
        </CardContent>
      </Card>

      {/* Formulaire d'ajout/édition */}
      <BreedFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        breed={editingBreed}
        onSuccess={handleFormSuccess}
      />

      {/* Confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setDeleteDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>{t('deleteBreed')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              {t('messages.confirmDelete', { name: deletingBreed?.nameFr || '' })}
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
