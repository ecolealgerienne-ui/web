'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useAnimals } from '@/lib/hooks/useAnimals';
import { Animal, CreateAnimalDto, UpdateAnimalDto } from '@/lib/types/animal';
import { animalsService } from '@/lib/services/animals.service';
import { AnimalDialog } from '@/components/animals/animal-dialog';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { DataTable, ColumnDef } from '@/components/data/common/DataTable';
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = () => {
    setSelectedAnimal(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleViewDetail = (animal: Animal) => {
    setSelectedAnimal(animal);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedAnimal) return;
    const currentIndex = animals.findIndex((a) => a.id === selectedAnimal.id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < animals.length) {
      setSelectedAnimal(animals[newIndex]);
    }
  };

  const handleEdit = (animal: Animal) => {
    setSelectedAnimal(animal);
    setDialogMode('edit');
    setDialogOpen(true);
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
      setDialogOpen(false);
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

  const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'success' | 'warning' | 'secondary' => {
    switch (status) {
      case 'alive':
        return 'success';
      case 'sold':
        return 'warning';
      case 'slaughtered':
        return 'secondary';
      case 'dead':
        return 'destructive';
      case 'missing':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Définition des colonnes du tableau
  const columns: ColumnDef<Animal>[] = [
    {
      key: 'identification',
      header: t('fields.identification'),
      sortable: true,
      render: (animal) => {
        const displayId = animal.officialNumber || animal.visualId || animal.currentEid || animal.id.substring(0, 8);
        return (
          <div>
            <div className="font-medium">{displayId}</div>
            {animal.breed && (
              <div className="text-sm text-muted-foreground">{animal.breed.name}</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'sex',
      header: t('fields.sex'),
      sortable: true,
      render: (animal) => t(`sex.${animal.sex}`),
    },
    {
      key: 'birthDate',
      header: t('fields.birthDate'),
      sortable: true,
      render: (animal) => animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : '-',
    },
    {
      key: 'status',
      header: t('fields.status'),
      sortable: true,
      render: (animal) => (
        <Badge variant={getStatusBadgeVariant(animal.status)}>
          {t(`status.${animal.status}`)}
        </Badge>
      ),
    },
  ];

  // Filtre personnalisé pour le statut
  const statusFilterComponent = (
    <Select
      value={statusFilter}
      onValueChange={(value) => setStatusFilter(value)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t('filters.allStatus')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('filters.allStatus')}</SelectItem>
        <SelectItem value="alive">{t('status.alive')}</SelectItem>
        <SelectItem value="sold">{t('status.sold')}</SelectItem>
        <SelectItem value="slaughtered">{t('status.slaughtered')}</SelectItem>
        <SelectItem value="dead">{t('status.dead')}</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      {/* Header avec bouton d'ajout */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {t('newAnimal')}
        </Button>
      </div>

      {/* DataTable avec filtres intégrés */}
      <DataTable<Animal>
        data={animals}
        columns={columns}
        totalItems={animals.length}
        loading={loading}
        error={error}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('filters.search')}
        onRowClick={handleViewDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={t('noAnimals')}
        filters={statusFilterComponent}
      />

      {/* Dialog unifié (consultation/modification/création) */}
      <AnimalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        animal={selectedAnimal}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        animals={animals}
        onNavigate={handleNavigate}
      />

      {/* Dialog confirmation suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('messages.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('messages.deleteConfirmDescription', {
                id: animalToDelete?.currentEid || animalToDelete?.officialNumber || animalToDelete?.visualId || animalToDelete?.id?.substring(0, 8) || ''
              })}
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
