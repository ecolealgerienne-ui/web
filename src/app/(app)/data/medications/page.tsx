'use client';

import { useState } from 'react';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/lib/i18n';
import { useMedicalProducts } from '@/lib/hooks/useMedicalProducts';
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
import { medicalProductsService, MedicalProduct, CreateMedicalProductDto } from '@/lib/services/medical-products.service';
import { toast } from 'sonner';

export default function MedicationsPage() {
  const t = useTranslations('medications');
  const { products, loading, error, refetch } = useMedicalProducts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<MedicalProduct | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateMedicalProductDto>>({
    name: '',
    commercialName: '',
    category: '',
    type: '',
    activeIngredient: '',
    manufacturer: '',
    withdrawalPeriodMeat: undefined,
    withdrawalPeriodMilk: undefined,
    currentStock: undefined,
    stockUnit: '',
    isActive: true,
  });

  const openCreateDialog = () => {
    setDialogMode('create');
    setSelectedProduct(null);
    setFormData({
      name: '',
      commercialName: '',
      category: '',
      type: '',
      activeIngredient: '',
      manufacturer: '',
      withdrawalPeriodMeat: undefined,
      withdrawalPeriodMilk: undefined,
      currentStock: undefined,
      stockUnit: '',
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (product: MedicalProduct) => {
    setDialogMode('edit');
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      commercialName: product.commercialName || '',
      category: product.category || '',
      type: product.type || '',
      activeIngredient: product.activeIngredient || '',
      manufacturer: product.manufacturer || '',
      withdrawalPeriodMeat: product.withdrawalPeriodMeat,
      withdrawalPeriodMilk: product.withdrawalPeriodMilk,
      currentStock: product.currentStock,
      stockUnit: product.stockUnit || '',
      isActive: product.isActive,
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
        await medicalProductsService.create(formData as CreateMedicalProductDto);
        toast.success(t('createSuccess'));
      } else if (selectedProduct) {
        await medicalProductsService.update(selectedProduct.id, formData);
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

  const handleDelete = async (product: MedicalProduct) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      await medicalProductsService.delete(product.id);
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
          {t('newMedication')}
        </Button>
      </div>

      {/* Liste des médicaments */}
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
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('noMedications')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('commercialName')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{t('manufacturer')}</TableHead>
                  <TableHead>{t('stock')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{product.name}</div>
                        {product.activeIngredient && (
                          <div className="text-xs text-muted-foreground">
                            {product.activeIngredient}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.commercialName || '-'}</TableCell>
                    <TableCell>
                      {product.category ? (
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{product.manufacturer || '-'}</TableCell>
                    <TableCell>
                      {product.currentStock !== undefined ? (
                        <span>
                          {product.currentStock} {product.stockUnit || ''}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {product.isActive ? (
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
                          onClick={() => openEditDialog(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product)}
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
              {dialogMode === 'create' ? t('newMedication') : t('editMedication')}
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
                <Label htmlFor="commercialName">{t('commercialName')}</Label>
                <Input
                  id="commercialName"
                  value={formData.commercialName}
                  onChange={(e) => setFormData({ ...formData, commercialName: e.target.value })}
                  placeholder={t('commercialNamePlaceholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">{t('category')}</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder={t('categoryPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">{t('type')}</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder={t('typePlaceholder')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activeIngredient">{t('activeIngredient')}</Label>
              <Input
                id="activeIngredient"
                value={formData.activeIngredient}
                onChange={(e) => setFormData({ ...formData, activeIngredient: e.target.value })}
                placeholder={t('activeIngredientPlaceholder')}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="withdrawalMeat">{t('withdrawalPeriodMeat')}</Label>
                <Input
                  id="withdrawalMeat"
                  type="number"
                  value={formData.withdrawalPeriodMeat || ''}
                  onChange={(e) => setFormData({ ...formData, withdrawalPeriodMeat: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder={t('daysPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdrawalMilk">{t('withdrawalPeriodMilk')}</Label>
                <Input
                  id="withdrawalMilk"
                  type="number"
                  value={formData.withdrawalPeriodMilk || ''}
                  onChange={(e) => setFormData({ ...formData, withdrawalPeriodMilk: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder={t('daysPlaceholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">{t('currentStock')}</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.currentStock || ''}
                  onChange={(e) => setFormData({ ...formData, currentStock: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder={t('stockPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockUnit">{t('stockUnit')}</Label>
                <Input
                  id="stockUnit"
                  value={formData.stockUnit}
                  onChange={(e) => setFormData({ ...formData, stockUnit: e.target.value })}
                  placeholder={t('stockUnitPlaceholder')}
                />
              </div>
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
