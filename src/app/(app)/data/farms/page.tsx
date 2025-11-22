'use client';

import { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useFarms } from '@/lib/hooks/useFarms';
import { Farm, CreateFarmDto, UpdateFarmDto } from '@/lib/types/farm';
import { farmsService } from '@/lib/services/farms.service';
import { FarmFormDialog } from '@/components/data/farm-form-dialog';
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

export default function FarmsPage() {
  const t = useTranslations('farms');
  const tc = useCommonTranslations();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const { farms, loading, error, refetch } = useFarms({ search });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | undefined>();
  const [farmToDelete, setFarmToDelete] = useState<Farm | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = () => {
    setSelectedFarm(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (farm: Farm) => {
    setSelectedFarm(farm);
    setIsDialogOpen(true);
  };

  const handleDelete = (farm: Farm) => {
    setFarmToDelete(farm);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: CreateFarmDto | UpdateFarmDto) => {
    setIsSubmitting(true);
    try {
      if (selectedFarm) {
        await farmsService.update(selectedFarm.id, data as UpdateFarmDto);
        toast.success(tc('messages.success'), t('messages.updated'));
      } else {
        await farmsService.create(data as CreateFarmDto);
        toast.success(tc('messages.success'), t('messages.created'));
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error(tc('messages.error'), t('messages.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!farmToDelete) return;

    try {
      await farmsService.delete(farmToDelete.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      setIsDeleteDialogOpen(false);
      setFarmToDelete(null);
      refetch();
    } catch (error) {
      toast.error(tc('messages.error'), t('messages.deleteError'));
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
        <Input
          placeholder={t('filters.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-[300px]"
        />

        <Button onClick={handleAdd} className="ml-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('actions.add')}
        </Button>
      </div>

      {/* Liste des fermes */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('title')} ({farms.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {farms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('noFarms')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {farms.map((farm) => (
                <div
                  key={farm.id}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="font-semibold truncate">{farm.name}</div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{farm.location}</span>
                        </div>
                      </div>

                      {farm.isDefault && (
                        <Badge variant="default" className="text-xs flex-shrink-0">
                          {t('badges.default')}
                        </Badge>
                      )}
                    </div>

                    {/* Informations */}
                    <div className="text-sm text-muted-foreground space-y-1">
                      {farm.cheptelNumber && (
                        <div>
                          <span className="font-medium">{t('fields.cheptelNumber')}:</span>{' '}
                          {farm.cheptelNumber}
                        </div>
                      )}
                      {farm.groupName && (
                        <div>
                          <span className="font-medium">{t('fields.groupName')}:</span>{' '}
                          {farm.groupName}
                        </div>
                      )}
                    </div>

                    {/* Statistiques */}
                    {farm.stats && (
                      <div className="pt-2 border-t">
                        <div className="text-sm font-medium mb-2">{t('stats.title')}</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('stats.totalAnimals')}:</span>
                            <span className="font-medium">{farm.stats.totalAnimals}</span>
                          </div>
                          {farm.stats.animalsBySpecies && Object.keys(farm.stats.animalsBySpecies).length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {Object.entries(farm.stats.animalsBySpecies).map(([species, count]) => (
                                <div key={species} className="flex justify-between">
                                  <span>{species}:</span>
                                  <span>{count}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(farm)}
                        className="flex-1"
                      >
                        <Edit2 className="mr-1 h-3 w-3" />
                        {t('actions.edit')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(farm)}
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
      <FarmFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        farm={selectedFarm}
        isLoading={isSubmitting}
      />

      {/* Dialog confirmation suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('messages.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('messages.deleteConfirmDescription', { name: farmToDelete?.name || '' })}
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
