'use client';

import { useState } from 'react';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/lib/i18n';
import { useVaccines } from '@/lib/hooks/useVaccines';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { vaccinesService, Vaccine, CreateVaccineDto } from '@/lib/services/vaccines.service';
import { toast } from 'sonner';

export default function VaccinesPage() {
  const t = useTranslations('vaccines');
  const { vaccines, loading, error, refetch } = useVaccines();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateVaccineDto>>({
    name: '',
    description: '',
    manufacturer: '',
    targetSpecies: [],
    targetDiseases: [],
    standardDose: undefined,
    injectionsRequired: undefined,
    injectionIntervalDays: undefined,
    meatWithdrawalDays: undefined,
    milkWithdrawalDays: undefined,
    administrationRoute: '',
    isActive: true,
  });

  const openCreateDialog = () => {
    setDialogMode('create');
    setSelectedVaccine(null);
    setFormData({
      name: '',
      description: '',
      manufacturer: '',
      targetSpecies: [],
      targetDiseases: [],
      standardDose: undefined,
      injectionsRequired: undefined,
      injectionIntervalDays: undefined,
      meatWithdrawalDays: undefined,
      milkWithdrawalDays: undefined,
      administrationRoute: '',
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (vaccine: Vaccine) => {
    setDialogMode('edit');
    setSelectedVaccine(vaccine);
    setFormData({
      name: vaccine.name,
      description: vaccine.description || '',
      manufacturer: vaccine.manufacturer || '',
      targetSpecies: vaccine.targetSpecies || [],
      targetDiseases: vaccine.targetDiseases || [],
      standardDose: vaccine.standardDose,
      injectionsRequired: vaccine.injectionsRequired,
      injectionIntervalDays: vaccine.injectionIntervalDays,
      meatWithdrawalDays: vaccine.meatWithdrawalDays,
      milkWithdrawalDays: vaccine.milkWithdrawalDays,
      administrationRoute: vaccine.administrationRoute || '',
      isActive: vaccine.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error(t('nameRequired'));
      return;
    }

    setSaving(true);
    try {
      if (dialogMode === 'create') {
        await vaccinesService.create(formData as CreateVaccineDto);
        toast.success(t('createSuccess'));
      } else if (selectedVaccine) {
        await vaccinesService.update(selectedVaccine.id, formData);
        toast.success(t('updateSuccess'));
      }
      setDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || t('saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vaccine: Vaccine) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      await vaccinesService.delete(vaccine.id);
      toast.success(t('deleteSuccess'));
      refetch();
    } catch (error: any) {
      toast.error(error.message || t('deleteError'));
    }
  };

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
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t('newVaccine')}
        </Button>
      </div>

      {/* Liste des vaccins */}
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              {error.message}
            </div>
          ) : vaccines.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('noVaccines')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('manufacturer')}</TableHead>
                  <TableHead>{t('targetDiseases')}</TableHead>
                  <TableHead>{t('administrationRoute')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vaccines.map((vaccine) => (
                  <TableRow key={vaccine.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{vaccine.name}</div>
                        {vaccine.description && (
                          <div className="text-xs text-muted-foreground">
                            {vaccine.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{vaccine.manufacturer || '-'}</TableCell>
                    <TableCell>
                      {vaccine.targetDiseases?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {vaccine.targetDiseases.map((disease, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {disease}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{vaccine.administrationRoute || '-'}</TableCell>
                    <TableCell>
                      {vaccine.isActive ? (
                        <Badge variant="default">{t('active')}</Badge>
                      ) : (
                        <Badge variant="secondary">{t('inactive')}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(vaccine)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(vaccine)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog for Create/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? t('newVaccine') : t('editVaccine')}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'create' ? t('createDescription') : t('editDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('namePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer">{t('manufacturer')}</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder={t('manufacturerPlaceholder')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('descriptionPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="administrationRoute">{t('administrationRoute')}</Label>
              <Input
                id="administrationRoute"
                value={formData.administrationRoute}
                onChange={(e) => setFormData({ ...formData, administrationRoute: e.target.value })}
                placeholder={t('administrationRoutePlaceholder')}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="standardDose">{t('standardDose')}</Label>
                <Input
                  id="standardDose"
                  type="number"
                  value={formData.standardDose || ''}
                  onChange={(e) => setFormData({ ...formData, standardDose: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder={t('dosePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="injectionsRequired">{t('injectionsRequired')}</Label>
                <Input
                  id="injectionsRequired"
                  type="number"
                  value={formData.injectionsRequired || ''}
                  onChange={(e) => setFormData({ ...formData, injectionsRequired: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder={t('injectionsPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="injectionInterval">{t('injectionIntervalDays')}</Label>
                <Input
                  id="injectionInterval"
                  type="number"
                  value={formData.injectionIntervalDays || ''}
                  onChange={(e) => setFormData({ ...formData, injectionIntervalDays: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder={t('daysPlaceholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meatWithdrawal">{t('meatWithdrawalDays')}</Label>
                <Input
                  id="meatWithdrawal"
                  type="number"
                  value={formData.meatWithdrawalDays || ''}
                  onChange={(e) => setFormData({ ...formData, meatWithdrawalDays: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder={t('daysPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="milkWithdrawal">{t('milkWithdrawalDays')}</Label>
                <Input
                  id="milkWithdrawal"
                  type="number"
                  value={formData.milkWithdrawalDays || ''}
                  onChange={(e) => setFormData({ ...formData, milkWithdrawalDays: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder={t('daysPlaceholder')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDiseases">{t('targetDiseases')}</Label>
              <Input
                id="targetDiseases"
                value={formData.targetDiseases?.join(', ') || ''}
                onChange={(e) => setFormData({ ...formData, targetDiseases: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder={t('targetDiseasesPlaceholder')}
              />
              <p className="text-xs text-muted-foreground">{t('separateWithComma')}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetSpecies">{t('targetSpecies')}</Label>
              <Input
                id="targetSpecies"
                value={formData.targetSpecies?.join(', ') || ''}
                onChange={(e) => setFormData({ ...formData, targetSpecies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder={t('targetSpeciesPlaceholder')}
              />
              <p className="text-xs text-muted-foreground">{t('separateWithComma')}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {dialogMode === 'create' ? t('create') : t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
