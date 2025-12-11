'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, X, Filter, Beef, Scale, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useAnimals } from '@/lib/hooks/useAnimals';
import { useSpecies } from '@/lib/hooks/useSpecies';
import { useBreeds } from '@/lib/hooks/useBreeds';
import { Animal, CreateAnimalDto, UpdateAnimalDto } from '@/lib/types/animal';
import { animalsService, AnimalStats } from '@/lib/services/animals.service';
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

// Helper function to calculate age from birthDate
function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays}j`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} mois`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    if (remainingMonths > 0) {
      return `${years}a ${remainingMonths}m`;
    }
    return `${years} an${years > 1 ? 's' : ''}`;
  }
}

// Helper to check if weighing is overdue (>30 days)
function isWeighingOverdue(lastWeighDate: string | null | undefined, days = 30): boolean {
  if (!lastWeighDate) return true;
  const lastWeigh = new Date(lastWeighDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastWeigh.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > days;
}

export default function AnimalsPage() {
  const t = useTranslations('animals');
  const tc = useCommonTranslations();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read filter params from URL (from dashboard actions)
  const notWeighedDays = searchParams.get('notWeighedDays');
  const minWeight = searchParams.get('minWeight');
  const maxWeight = searchParams.get('maxWeight');
  const urlStatus = searchParams.get('status');

  // Check if dashboard filters are active
  const hasDashboardFilters = !!(notWeighedDays || minWeight || maxWeight || urlStatus);

  // Build filter description for display
  const filterDescription = useMemo(() => {
    const parts: string[] = [];
    if (notWeighedDays) parts.push(t('filters.notWeighedDays', { days: notWeighedDays }));
    if (minWeight) parts.push(t('filters.minWeight', { weight: minWeight }));
    if (maxWeight) parts.push(t('filters.maxWeight', { weight: maxWeight }));
    if (urlStatus) parts.push(t(`status.${urlStatus}`));
    return parts.join(' • ');
  }, [notWeighedDays, minWeight, maxWeight, urlStatus, t]);

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [sexFilter, setSexFilter] = useState<string>('all');
  const [breedFilter, setBreedFilter] = useState<string>('all');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Stats state
  const [stats, setStats] = useState<AnimalStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Load species and breeds for filters
  const { species } = useSpecies();
  const { breeds } = useBreeds(speciesFilter !== 'all' ? speciesFilter : undefined);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const result = await animalsService.getStats(30);
        setStats(result);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Effective status: URL param takes priority over local filter
  const effectiveStatus = urlStatus || statusFilter;

  // Build filters including URL params and pagination
  const filters = useMemo(() => ({
    status: effectiveStatus,
    speciesId: speciesFilter !== 'all' ? speciesFilter : undefined,
    breedId: breedFilter !== 'all' ? breedFilter : undefined,
    sex: sexFilter !== 'all' ? sexFilter as 'male' | 'female' : undefined,
    search,
    page,
    limit,
    notWeighedDays: notWeighedDays ? parseInt(notWeighedDays, 10) : undefined,
    minWeight: minWeight ? parseInt(minWeight, 10) : undefined,
    maxWeight: maxWeight ? parseInt(maxWeight, 10) : undefined,
  }), [effectiveStatus, speciesFilter, breedFilter, sexFilter, search, page, limit, notWeighedDays, minWeight, maxWeight]);

  const { animals, meta, loading, error, refetch } = useAnimals(filters);

  // Clear dashboard filters
  const clearDashboardFilters = () => {
    router.push('/animals');
  };

  // Reset breed filter when species changes
  useEffect(() => {
    setBreedFilter('all');
  }, [speciesFilter]);

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
      // Refresh stats after create/update
      const newStats = await animalsService.getStats(30);
      setStats(newStats);
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
      // Refresh stats after delete
      const newStats = await animalsService.getStats(30);
      setStats(newStats);
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

  // Column definitions
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
            {animal.species && (
              <div className="text-xs text-muted-foreground">
                {animal.species.nameFr}
                {animal.breed && ` • ${animal.breed.nameFr}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'sex',
      header: t('fields.sex'),
      sortable: true,
      render: (animal) => (
        <span className={animal.sex === 'male' ? 'text-blue-600' : 'text-pink-600'}>
          {t(`sex.${animal.sex}`)}
        </span>
      ),
    },
    {
      key: 'age',
      header: t('fields.age'),
      sortable: true,
      render: (animal) => animal.birthDate ? calculateAge(animal.birthDate) : '-',
    },
    {
      key: 'currentWeight',
      header: t('fields.weight'),
      sortable: true,
      render: (animal) => {
        if (!animal.currentWeight) return <span className="text-muted-foreground">-</span>;
        return (
          <span className="font-medium">{animal.currentWeight.toFixed(0)} kg</span>
        );
      },
    },
    {
      key: 'lastWeighDate',
      header: t('fields.lastWeighDate'),
      sortable: true,
      render: (animal) => {
        if (!animal.lastWeighDate) {
          return (
            <div className="flex items-center gap-1 text-orange-600">
              <AlertCircle className="h-3 w-3" />
              <span className="text-xs">{t('fields.neverWeighed')}</span>
            </div>
          );
        }
        const isOverdue = isWeighingOverdue(animal.lastWeighDate);
        return (
          <div className={isOverdue ? 'text-orange-600' : ''}>
            <div className="flex items-center gap-1">
              {isOverdue && <AlertCircle className="h-3 w-3" />}
              <span className="text-sm">{new Date(animal.lastWeighDate).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        );
      },
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

  // Filter component
  const filtersComponent = (
    <div className="flex flex-wrap gap-2">
      {/* Status filter */}
      <Select
        value={statusFilter}
        onValueChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
      >
        <SelectTrigger className="w-[140px]">
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

      {/* Species filter */}
      <Select
        value={speciesFilter}
        onValueChange={(value) => {
          setSpeciesFilter(value);
          setPage(1);
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder={t('filters.allSpecies')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allSpecies')}</SelectItem>
          {species.map((s) => (
            <SelectItem key={s.id} value={s.id}>{s.nameFr}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Breed filter - only show if species is selected */}
      {speciesFilter !== 'all' && breeds.length > 0 && (
        <Select
          value={breedFilter}
          onValueChange={(value) => {
            setBreedFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('filters.allBreeds')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allBreeds')}</SelectItem>
            {breeds.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.nameFr}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Sex filter */}
      <Select
        value={sexFilter}
        onValueChange={(value) => {
          setSexFilter(value);
          setPage(1);
        }}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder={t('filters.allSex')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filters.allSex')}</SelectItem>
          <SelectItem value="male">{t('sex.male')}</SelectItem>
          <SelectItem value="female">{t('sex.female')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Total Animals */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Beef className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statsLoading ? '-' : stats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">{t('kpis.totalAnimals')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Males */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <span className="text-lg">♂</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {statsLoading ? '-' : stats?.bySex.male || 0}
                </p>
                <p className="text-xs text-muted-foreground">{t('sex.male')}s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Females */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900">
                <span className="text-lg">♀</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-pink-600">
                  {statsLoading ? '-' : stats?.bySex.female || 0}
                </p>
                <p className="text-xs text-muted-foreground">{t('sex.female')}s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Need Weighing */}
        <Card className={stats?.notWeighedCount && stats.notWeighedCount > 0 ? 'border-orange-300 dark:border-orange-700' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats?.notWeighedCount && stats.notWeighedCount > 0 ? 'bg-orange-100 dark:bg-orange-900' : 'bg-green-100 dark:bg-green-900'}`}>
                <Scale className={`h-5 w-5 ${stats?.notWeighedCount && stats.notWeighedCount > 0 ? 'text-orange-600' : 'text-green-600'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${stats?.notWeighedCount && stats.notWeighedCount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {statsLoading ? '-' : stats?.notWeighedCount || 0}
                </p>
                <p className="text-xs text-muted-foreground">{t('kpis.needWeighing')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard filter banner */}
      {hasDashboardFilters && (
        <div className="flex items-center justify-between p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t('filters.dashboardFilterActive')}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {filterDescription}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearDashboardFilters}
            className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300"
          >
            <X className="h-4 w-4 mr-1" />
            {t('filters.clearFilters')}
          </Button>
        </div>
      )}

      {/* DataTable */}
      <DataTable<Animal>
        data={animals}
        columns={columns}
        totalItems={meta.total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        loading={loading}
        error={error}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder={t('filters.search')}
        onRowClick={handleViewDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={t('noAnimals')}
        filters={filtersComponent}
      />

      {/* Animal Dialog */}
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

      {/* Delete Confirmation Dialog */}
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
