'use client';

import { useState, useCallback, useMemo } from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useAnimals } from '@/lib/hooks/useAnimals';
import { useSpecies } from '@/lib/hooks/useSpecies';
import { Animal, CreateAnimalDto, UpdateAnimalDto } from '@/lib/types/animal';
import { animalsService } from '@/lib/services/animals.service';
import { AnimalDialog } from '@/components/animals/animal-dialog';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { DataTable, ColumnDef } from '@/components/data/common/DataTable';
import { handleApiError } from '@/lib/utils/api-error-handler';

/**
 * Calcule l'âge d'un animal à partir de sa date de naissance
 * @param birthDate - Date de naissance ISO
 * @returns Âge formaté (ex: "2 ans 3 mois" ou "45 jours")
 */
function calculateAge(birthDate: string | null): string {
  if (!birthDate) return '-';

  const birth = new Date(birthDate);
  const now = new Date();

  const diffMs = now.getTime() - birth.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} j`;
  }

  const months = Math.floor(diffDays / 30);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${months} mois`;
  }

  if (remainingMonths === 0) {
    return `${years} an${years > 1 ? 's' : ''}`;
  }

  return `${years} an${years > 1 ? 's' : ''} ${remainingMonths} mois`;
}

/**
 * Exporte les animaux en CSV
 */
function exportToCSV(animals: Animal[], t: (key: string) => string): void {
  const headers = [
    t('fields.identification'),
    t('fields.species'),
    t('fields.breed'),
    t('fields.sex'),
    t('fields.birthDate'),
    t('fields.age'),
    t('fields.status'),
  ];

  const rows = animals.map(animal => [
    animal.officialNumber || animal.visualId || animal.currentEid || animal.id.substring(0, 8),
    animal.species?.name || '-',
    animal.breed?.name || '-',
    t(`sex.${animal.sex}`),
    animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : '-',
    calculateAge(animal.birthDate),
    t(`status.${animal.status}`),
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `animaux_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
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

  // Hook avec params/setParams pour la pagination (règle 7.7)
  const { animals, total, loading, error, params, setParams, refetch } = useAnimals();

  // Hook pour récupérer les espèces (pour le filtre)
  const { species } = useSpecies();

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

  const handleSubmit = useCallback(async (data: CreateAnimalDto | UpdateAnimalDto) => {
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
      handleApiError(error, 'animals.submit', toast);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedAnimal, refetch, toast, tc, t]);

  const confirmDelete = useCallback(async () => {
    if (!animalToDelete) return;

    try {
      await animalsService.delete(animalToDelete.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      setIsDeleteDialogOpen(false);
      setAnimalToDelete(null);
      refetch();
    } catch (error) {
      handleApiError(error, 'animals.delete', toast);
    }
  }, [animalToDelete, refetch, toast, tc, t]);

  // Variant du badge selon le statut
  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'success' | 'warning' => {
    switch (status) {
      case 'alive':
        return 'success';
      case 'sold':
        return 'warning';
      case 'slaughtered':
        return 'secondary'; // Gris pour abattu (opération normale)
      case 'dead':
        return 'destructive';
      default:
        return 'secondary';
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
      key: 'species',
      header: t('fields.species'),
      sortable: true,
      render: (animal) => animal.species?.name || '-',
    },
    {
      key: 'sex',
      header: t('fields.sex'),
      sortable: true,
      render: (animal) => t(`sex.${animal.sex}`),
    },
    {
      key: 'age',
      header: t('fields.age'),
      sortable: false,
      render: (animal) => calculateAge(animal.birthDate),
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

  // Handlers pour la pagination et les filtres (règle 7.7)
  const handlePageChange = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, [setParams]);

  const handleLimitChange = useCallback((limit: number) => {
    setParams(prev => ({ ...prev, limit, page: 1 }));
  }, [setParams]);

  const handleSearchChange = useCallback((search: string) => {
    setParams(prev => ({ ...prev, search, page: 1 }));
  }, [setParams]);

  const handleStatusChange = useCallback((status: string) => {
    setParams(prev => ({ ...prev, status, page: 1 }));
  }, [setParams]);

  const handleSpeciesChange = useCallback((speciesId: string) => {
    setParams(prev => ({ ...prev, speciesId: speciesId === 'all' ? undefined : speciesId, page: 1 }));
  }, [setParams]);

  // Fonction d'export
  const handleExport = useCallback(() => {
    exportToCSV(animals, t);
  }, [animals, t]);

  // Note: Le tri n'est pas encore supporté par le backend
  // const handleSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
  //   setParams(prev => ({ ...prev, sortBy, sortOrder }));
  // }, [setParams]);

  // Filtres personnalisés (statut + espèce)
  const filtersComponent = (
    <div className="flex gap-2">
      {/* Filtre par espèce */}
      <Select
        value={params.speciesId || 'all'}
        onValueChange={handleSpeciesChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('filters.allSpecies')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allSpecies')}</SelectItem>
          {species.map((sp) => (
            <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtre par statut */}
      <Select
        value={params.status || 'all'}
        onValueChange={handleStatusChange}
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
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header avec boutons d'actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={animals.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            {tc('actions.export')}
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {t('newAnimal')}
          </Button>
        </div>
      </div>

      {/* DataTable avec pagination serveur (règle 7.7) */}
      <DataTable<Animal>
        data={animals}
        columns={columns}
        totalItems={total}
        page={params.page || 1}
        limit={params.limit || 25}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        loading={loading}
        error={error}
        searchValue={params.search || ''}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t('filters.search')}
        onRowClick={handleViewDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={t('noAnimals')}
        filters={filtersComponent}
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
