'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Pencil, Trash2, Search, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useWeighings } from '@/lib/hooks/useWeighings';
import { WeighingFormDialog } from '@/components/weighings/weighing-form-dialog';
import type { Weighing, CreateWeighingDto, UpdateWeighingDto, WeighingPurpose } from '@/lib/types/weighing';
import { toast } from 'sonner';

export default function WeighingsPage() {
  const t = useTranslations('weighings');
  const [search, setSearch] = useState('');
  const [purposeFilter, setPurposeFilter] = useState<WeighingPurpose | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWeighing, setSelectedWeighing] = useState<Weighing | undefined>();
  const [weighingToDelete, setWeighingToDelete] = useState<Weighing | null>(null);

  const { weighings, loading, createWeighing, updateWeighing, deleteWeighing } = useWeighings({
    purpose: purposeFilter,
    search,
  });

  const handleCreate = async (data: CreateWeighingDto) => {
    try {
      await createWeighing(data);
      toast.success(t('messages.createSuccess'));
      setIsFormOpen(false);
    } catch (error) {
      toast.error(t('messages.createError'));
      console.error('Error creating weighing:', error);
    }
  };

  const handleUpdate = async (data: UpdateWeighingDto) => {
    if (!selectedWeighing) return;
    try {
      await updateWeighing(selectedWeighing.id, data);
      toast.success(t('messages.updateSuccess'));
      setIsFormOpen(false);
      setSelectedWeighing(undefined);
    } catch (error) {
      toast.error(t('messages.updateError'));
      console.error('Error updating weighing:', error);
    }
  };

  const handleDelete = async () => {
    if (!weighingToDelete) return;
    try {
      await deleteWeighing(weighingToDelete.id);
      toast.success(t('messages.deleteSuccess'));
      setWeighingToDelete(null);
    } catch (error) {
      toast.error(t('messages.deleteError'));
      console.error('Error deleting weighing:', error);
    }
  };

  const openEditDialog = (weighing: Weighing) => {
    setSelectedWeighing(weighing);
    setIsFormOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedWeighing(undefined);
    setIsFormOpen(true);
  };

  // Calculate stats
  const totalWeighings = weighings.length;
  const routineWeighings = weighings.filter(w => w.purpose === 'routine').length;
  const medicalWeighings = weighings.filter(w => w.purpose === 'medical').length;
  const avgWeight = weighings.length > 0
    ? weighings.reduce((sum, w) => sum + w.weight, 0) / weighings.length
    : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t('newWeighing')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.total')}</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWeighings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.routine')}</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routineWeighings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.medical')}</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicalWeighings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.avgWeight')}</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgWeight.toFixed(1)} kg</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select
              value={purposeFilter}
              onValueChange={(value) => setPurposeFilter(value as WeighingPurpose | 'all')}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('purpose.all')}</SelectItem>
                <SelectItem value="routine">{t('purpose.routine')}</SelectItem>
                <SelectItem value="medical">{t('purpose.medical')}</SelectItem>
                <SelectItem value="sale">{t('purpose.sale')}</SelectItem>
                <SelectItem value="growth_monitoring">{t('purpose.growth_monitoring')}</SelectItem>
                <SelectItem value="other">{t('purpose.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Weighings List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des pesées</CardTitle>
          <CardDescription>
            {totalWeighings} pesée{totalWeighings !== 1 ? 's' : ''} au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : weighings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('messages.noWeighings')}
            </div>
          ) : (
            <div className="space-y-4">
              {weighings.map((weighing) => (
                <div
                  key={weighing.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {weighing.weight} {weighing.unit}
                      </p>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {t(`purpose.${weighing.purpose}`)}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>🗓️ {new Date(weighing.weighingDate).toLocaleDateString('fr-FR')}</span>
                      {weighing.weighingTime && <span>🕐 {weighing.weighingTime}</span>}
                      <span>🐄 Animal: {weighing.animalId}</span>
                    </div>
                    {weighing.weightGain && (
                      <div className="flex gap-4 mt-1 text-sm text-green-600">
                        <span>📈 Gain: {weighing.weightGain} kg</span>
                        {weighing.growthRate && <span>📊 Taux: {weighing.growthRate} kg/jour</span>}
                      </div>
                    )}
                    {weighing.method && (
                      <p className="text-sm text-muted-foreground">
                        Méthode: {weighing.method}
                      </p>
                    )}
                    {weighing.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        {weighing.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(weighing)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setWeighingToDelete(weighing)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <WeighingFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={selectedWeighing ? handleUpdate : handleCreate}
        weighing={selectedWeighing}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!weighingToDelete}
        onOpenChange={() => setWeighingToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('messages.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('messages.deleteConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
