'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBreeds } from '@/lib/hooks/useBreeds';
import { BreedFormDialog } from '@/components/data/breed-form-dialog';
import { Breed } from '@/lib/types/breed';
import { breedsService } from '@/lib/services/breeds.service';
import { useToast } from '@/contexts/toast-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

const speciesOptions = [
  { value: '', label: 'Toutes les espèces' },
  { value: 'sheep', label: 'Moutons' },
  { value: 'goat', label: 'Chèvres' },
  { value: 'cattle', label: 'Bovins' },
];

export default function BreedsPage() {
  const toast = useToast();
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const { breeds: allBreeds, loading, error, refetch } = useBreeds(selectedSpecies || undefined);

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
      toast.success('Succès', 'Race supprimée avec succès');
      refetch();
      setDeleteDialogOpen(false);
      setDeletingBreed(null);
    } catch (error) {
      toast.error('Erreur', 'Erreur lors de la suppression de la race');
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
            <h1 className="text-3xl font-bold">Races</h1>
            <p className="text-muted-foreground mt-1">
              Données de référence - Races d'animaux
            </p>
          </div>
        </div>
        <div className="text-center py-12">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Races</h1>
            <p className="text-muted-foreground mt-1">
              Données de référence - Races d'animaux
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Erreur lors du chargement des races
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
          <h1 className="text-3xl font-bold">Races</h1>
          <p className="text-muted-foreground mt-1">
            Données de référence - Races d'animaux disponibles
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle race
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center flex-wrap">
        <Select
          value={selectedSpecies}
          onChange={(e) => setSelectedSpecies(e.target.value)}
          className="w-full md:w-[200px]"
        >
          {speciesOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
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
            Afficher les races désactivées
          </label>
        </div>

        <div className="text-sm text-muted-foreground">
          {breeds.length} race{breeds.length > 1 ? 's' : ''} affichée{breeds.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Liste des races */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des races ({breeds.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {breeds.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucune race trouvée pour ce filtre.
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
                      <Badge variant="secondary" className="text-xs">
                        Désactivé
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
                    Espèce: {breed.speciesId}
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
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(breed)}
                      className="flex-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Supprimer
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
            ℹ️ Les races sont des données de référence administrées par les super admins.
            Vous pouvez créer, modifier ou supprimer des races. Les races supprimées ne sont plus visibles dans l'interface.
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
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Êtes-vous sûr de vouloir supprimer la race{' '}
              <strong>{deletingBreed?.nameFr}</strong> ?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Cette action est irréversible.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
