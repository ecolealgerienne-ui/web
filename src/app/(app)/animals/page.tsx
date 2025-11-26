'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useAnimals } from '@/lib/hooks/useAnimals';
import { Animal, CreateAnimalDto, UpdateAnimalDto } from '@/lib/types/animal';
import { animalsService } from '@/lib/services/animals.service';
import { AnimalFormDialog } from '@/components/data/animal-form-dialog';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AnimalsPage() {
  const t = useTranslations('animals');
  const tc = useCommonTranslations();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { animals, loading, error, refetch } = useAnimals({ status: statusFilter, search });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | undefined>();
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = () => {
    setSelectedAnimal(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (animal: Animal) => {
    setSelectedAnimal(animal);
    setIsDialogOpen(true);
  };

  const handleDelete = (animal: Animal) => {
    setAnimalToDelete(animal);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: CreateAnimalDto | UpdateAnimalDto) => {
    setIsSubmitting(true);
    try {
      if (selectedAnimal) {
        await animalsService.update(selectedAnimal.id, data as UpdateAnimalDto);
        toast.success(tc('messages.success'), t('messages.updated'));
      } else {
        await animalsService.create(data as CreateAnimalDto);
        toast.success(tc('messages.success'), t('messages.created'));
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error(tc('messages.error'), t('messages.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!animalToDelete) return;

    try {
      await animalsService.delete(animalToDelete.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      setIsDeleteDialogOpen(false);
      setAnimalToDelete(null);
      refetch();
    } catch (error) {
      toast.error(tc('messages.error'), t('messages.deleteError'));
    }
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'success' | 'warning' => {
    switch (status) {
      case 'alive':
        return 'success';
      case 'sold':
        return 'warning';
      case 'dead':
        return 'destructive';
      case 'missing':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <div className="text-center py-12">{tc('messages.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
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
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      {/* Filtres et actions */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('filters.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('filters.allStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allStatus')}</SelectItem>
            <SelectItem value="alive">{t('status.alive')}</SelectItem>
            <SelectItem value="sold">{t('status.sold')}</SelectItem>
            <SelectItem value="dead">{t('status.dead')}</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleAdd} className="ml-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('newAnimal')}
        </Button>
      </div>

      {/* Liste des animaux */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('title')} ({animals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {animals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('noAnimals')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {animals.map((animal) => (
                <div
                  key={animal.id}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-lg truncate">
                          {animal.identificationNumber}
                        </div>
                        {animal.name && (
                          <div className="text-sm text-muted-foreground truncate">
                            {animal.name}
                          </div>
                        )}
                      </div>
                      <Badge variant={getStatusBadgeVariant(animal.status)}>
                        {t(`status.${animal.status}`)}
                      </Badge>
                    </div>

                    {/* Informations */}
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t('fields.sex')}:</span>
                        <span>{t(`sex.${animal.sex}`)}</span>
                      </div>
                      {animal.birthDate && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t('fields.birthDate')}:</span>
                          <span>{new Date(animal.birthDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {animal.currentWeight && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t('fields.currentWeight')}:</span>
                          <span>{animal.currentWeight} kg</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(animal)}
                        className="flex-1"
                      >
                        <Edit2 className="mr-1 h-3 w-3" />
                        {tc('actions.edit')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(animal)}
                        className="text-destructive hover:text-destructive"
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

      {/* Dialog formulaire */}
      <AnimalFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        animal={selectedAnimal}
        isLoading={isSubmitting}
      />

      {/* Dialog confirmation suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('messages.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('messages.deleteConfirmDescription', { id: animalToDelete?.identificationNumber || '' })}
              <br />
              <span className="text-destructive font-medium">
                {tc('messages.actionIrreversible')}
              </span>
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
