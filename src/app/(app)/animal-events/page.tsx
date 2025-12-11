'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Calendar, Baby, DollarSign, ShoppingCart, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useAnimalEvents } from '@/lib/hooks/useAnimalEvents';
import { AnimalEvent, CreateAnimalEventDto, UpdateAnimalEventDto } from '@/lib/types/animal-event';
import { animalEventsService } from '@/lib/services/animal-events.service';
import { dashboardService, DashboardStatsV2 } from '@/lib/services/dashboard.service';
import { AnimalEventDialog } from '@/components/animal-events/animal-event-dialog';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { DataTable, ColumnDef } from '@/components/data/common/DataTable';
import { cn } from '@/lib/utils';
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

// Period options (same as dashboard for consistency)
type PeriodOption = {
  value: string;
  labelKey: string;
  statsPeriod: string;
  days: number;
};

const PERIOD_OPTIONS: PeriodOption[] = [
  { value: '1month', labelKey: 'period.1month', statsPeriod: '30d', days: 30 },
  { value: '3months', labelKey: 'period.3months', statsPeriod: '3months', days: 90 },
  { value: '6months', labelKey: 'period.6months', statsPeriod: '6months', days: 180 },
  { value: '1year', labelKey: 'period.1year', statsPeriod: '12months', days: 365 },
  { value: 'all', labelKey: 'period.all', statsPeriod: 'all', days: 0 },
];

export default function AnimalEventsPage() {
  const t = useTranslations('animalEvents');
  const td = useTranslations('dashboard');
  const tc = useCommonTranslations();
  const toast = useToast();

  // Period state (like dashboard)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1month');

  // Filter states
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Stats state (from dashboard service)
  const [stats, setStats] = useState<DashboardStatsV2 | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const periodConfig = PERIOD_OPTIONS.find(p => p.value === selectedPeriod) || PERIOD_OPTIONS[0];

    // 'all' option = no date filter
    if (periodConfig.days === 0) {
      return {
        fromDate: undefined,
        toDate: undefined,
        statsPeriod: periodConfig.statsPeriod,
      };
    }

    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - periodConfig.days);
    return {
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0],
      statsPeriod: periodConfig.statsPeriod,
    };
  }, [selectedPeriod]);

  // Fetch stats from dashboard service
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const result = await dashboardService.getStatsV2({ period: dateRange.statsPeriod });
        setStats(result);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [dateRange.statsPeriod]);

  // Build filters for the hook
  const filters = useMemo(() => {
    const f: {
      movementType?: string;
      fromDate?: string;
      toDate?: string;
      page: number;
      limit: number;
    } = {
      page,
      limit,
    };

    if (typeFilter !== 'all') {
      f.movementType = typeFilter;
    }

    // Only add date filters if not 'all' period
    if (dateRange.fromDate && dateRange.toDate) {
      f.fromDate = dateRange.fromDate;
      f.toDate = dateRange.toDate;
    }

    console.log('[animal-events page] filters:', f, 'period:', selectedPeriod);
    return f;
  }, [typeFilter, dateRange.fromDate, dateRange.toDate, page, limit, selectedPeriod]);

  const { events, meta, loading, error, refetch } = useAnimalEvents(filters);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [typeFilter, selectedPeriod]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedEvent, setSelectedEvent] = useState<AnimalEvent | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<AnimalEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = () => {
    setSelectedEvent(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleViewDetail = (event: AnimalEvent) => {
    setSelectedEvent(event);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedEvent) return;
    const currentIndex = events.findIndex((e) => e.id === selectedEvent.id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < events.length) {
      setSelectedEvent(events[newIndex]);
    }
  };

  const handleEdit = (event: AnimalEvent) => {
    setSelectedEvent(event);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDelete = (event: AnimalEvent) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: CreateAnimalEventDto | UpdateAnimalEventDto) => {
    setIsSubmitting(true);
    try {
      if (selectedEvent) {
        await animalEventsService.update(selectedEvent.id, data as UpdateAnimalEventDto);
        toast.success(tc('messages.success'), t('messages.updated'));
      } else {
        await animalEventsService.create(data as CreateAnimalEventDto);
        toast.success(tc('messages.success'), t('messages.created'));
      }
      setDialogOpen(false);
      refetch();
      // Refresh stats
      const newStats = await dashboardService.getStatsV2({ period: dateRange.statsPeriod });
      setStats(newStats);
    } catch (err) {
      toast.error(tc('messages.error'), t('messages.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await animalEventsService.delete(eventToDelete.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
      refetch();
      // Refresh stats
      const newStats = await dashboardService.getStatsV2({ period: dateRange.statsPeriod });
      setStats(newStats);
    } catch (err) {
      toast.error(tc('messages.error'), t('messages.deleteError'));
    }
  };

  // Column definitions
  const columns: ColumnDef<AnimalEvent>[] = [
    {
      key: 'movementDate',
      header: t('fields.movementDate'),
      sortable: true,
      render: (event) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(event.movementDate).toLocaleDateString('fr-FR')}</span>
        </div>
      ),
    },
    {
      key: 'movementType',
      header: t('fields.movementType'),
      sortable: true,
      render: (event) => {
        const typeColors: Record<string, string> = {
          birth: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          sale: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          purchase: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
          death: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          entry: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
          exit: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
          transfer_in: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
          transfer_out: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
          temporary_out: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          temporary_return: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
        };
        return (
          <Badge className={cn('font-medium', typeColors[event.movementType] || '')}>
            {t(`types.${event.movementType}`)}
          </Badge>
        );
      },
    },
    {
      key: 'animalCount',
      header: t('kpis.animals'),
      sortable: false,
      render: (event) => {
        const count = event.animalCount ?? event.animalIds?.length ?? 0;
        return (
          <span className="text-sm">
            {count} {count === 1 ? 'animal' : 'animaux'}
          </span>
        );
      },
    },
    {
      key: 'reason',
      header: t('fields.reason'),
      sortable: true,
      render: (event) => (
        <div>
          <div className="font-medium">{event.reason || t(`types.${event.movementType}`)}</div>
          {event.notes && (
            <div className="text-sm text-muted-foreground line-clamp-1">{event.notes}</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: t('fields.status'),
      sortable: true,
      render: (event) => event.status ? (
        <Badge variant="secondary">{t(`statuses.${event.status}`)}</Badge>
      ) : '-',
    },
  ];

  // Filter component
  const filtersComponent = (
    <Select
      value={typeFilter}
      onValueChange={(value) => {
        setTypeFilter(value);
        setPage(1);
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder={t('filters.allTypes')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
        <SelectItem value="entry">{t('types.entry')}</SelectItem>
        <SelectItem value="exit">{t('types.exit')}</SelectItem>
        <SelectItem value="birth">{t('types.birth')}</SelectItem>
        <SelectItem value="death">{t('types.death')}</SelectItem>
        <SelectItem value="sale">{t('types.sale')}</SelectItem>
        <SelectItem value="purchase">{t('types.purchase')}</SelectItem>
        <SelectItem value="transfer_in">{t('types.transfer_in')}</SelectItem>
        <SelectItem value="transfer_out">{t('types.transfer_out')}</SelectItem>
        <SelectItem value="temporary_out">{t('types.temporary_out')}</SelectItem>
        <SelectItem value="temporary_return">{t('types.temporary_return')}</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Period Selector (like dashboard) */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {PERIOD_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={selectedPeriod === option.value ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'text-xs h-8 px-3',
                  selectedPeriod === option.value && 'shadow-sm'
                )}
                onClick={() => setSelectedPeriod(option.value)}
              >
                {td(option.labelKey)}
              </Button>
            ))}
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            {t('newEvent')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Births */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <Baby className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {statsLoading ? '-' : stats?.movements.thisMonth.births || 0}
                </p>
                <p className="text-xs text-muted-foreground">{t('types.birth')}s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {statsLoading ? '-' : stats?.movements.thisMonth.sales || 0}
                </p>
                <p className="text-xs text-muted-foreground">{t('types.sale')}s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchases */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <ShoppingCart className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {statsLoading ? '-' : stats?.movements.thisMonth.purchases || 0}
                </p>
                <p className="text-xs text-muted-foreground">{t('types.purchase')}s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deaths */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                <Skull className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {statsLoading ? '-' : stats?.movements.thisMonth.deaths || 0}
                </p>
                <p className="text-xs text-muted-foreground">{t('types.death')}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DataTable with pagination */}
      <DataTable<AnimalEvent>
        data={events}
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
        emptyMessage={t('noEvents')}
        filters={filtersComponent}
      />

      {/* Dialog unified (view/edit/create) */}
      <AnimalEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        event={selectedEvent}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        events={events}
        onNavigate={handleNavigate}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('messages.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('messages.deleteConfirmDescription')}
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
