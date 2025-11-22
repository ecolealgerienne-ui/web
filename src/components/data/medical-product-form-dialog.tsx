'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MedicalProduct, CreateMedicalProductDto, UpdateMedicalProductDto } from '@/lib/types/medical-product';
import { medicalProductsService } from '@/lib/services/medical-products.service';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';

interface MedicalProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: MedicalProduct | null;
  onSuccess: () => void;
}

export function MedicalProductFormDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: MedicalProductFormDialogProps) {
  const t = useTranslations('medicalProducts');
  const tc = useCommonTranslations();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    commercialName: '',
    category: '',
    activeIngredient: '',
    manufacturer: '',
    dosage: 0,
    withdrawalPeriodMeat: 0,
    withdrawalPeriodMilk: 0,
    currentStock: 0,
    minStock: 0,
    stockUnit: '',
    unitPrice: 0,
    type: '',
    targetSpecies: '',
    isActive: true,
  });

  const isEditMode = Boolean(product);

  // Charger les données du produit en mode édition
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        commercialName: product.commercialName || '',
        category: product.category,
        activeIngredient: product.activeIngredient || '',
        manufacturer: product.manufacturer || '',
        dosage: product.dosage || 0,
        withdrawalPeriodMeat: product.withdrawalPeriodMeat,
        withdrawalPeriodMilk: product.withdrawalPeriodMilk,
        currentStock: product.currentStock || 0,
        minStock: product.minStock || 0,
        stockUnit: product.stockUnit,
        unitPrice: product.unitPrice || 0,
        type: product.type || '',
        targetSpecies: product.targetSpecies || '',
        isActive: product.isActive ?? true,
      });
    } else {
      // Réinitialiser le formulaire en mode création
      setFormData({
        name: '',
        commercialName: '',
        category: '',
        activeIngredient: '',
        manufacturer: '',
        dosage: 0,
        withdrawalPeriodMeat: 0,
        withdrawalPeriodMilk: 0,
        currentStock: 0,
        minStock: 0,
        stockUnit: '',
        unitPrice: 0,
        type: '',
        targetSpecies: '',
        isActive: true,
      });
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        // Mode édition
        const updateData: UpdateMedicalProductDto = {
          name: formData.name,
          commercialName: formData.commercialName || undefined,
          category: formData.category,
          activeIngredient: formData.activeIngredient || undefined,
          manufacturer: formData.manufacturer || undefined,
          dosage: formData.dosage || undefined,
          withdrawalPeriodMeat: formData.withdrawalPeriodMeat,
          withdrawalPeriodMilk: formData.withdrawalPeriodMilk,
          currentStock: formData.currentStock || undefined,
          minStock: formData.minStock || undefined,
          stockUnit: formData.stockUnit,
          unitPrice: formData.unitPrice || undefined,
          type: formData.type || undefined,
          targetSpecies: formData.targetSpecies || undefined,
          isActive: formData.isActive,
        };
        await medicalProductsService.update(product!.id, updateData);
        toast.success(tc('messages.success'), t('messages.updated'));
      } else {
        // Mode création
        const createData: CreateMedicalProductDto = {
          name: formData.name,
          commercialName: formData.commercialName || undefined,
          category: formData.category,
          activeIngredient: formData.activeIngredient || undefined,
          manufacturer: formData.manufacturer || undefined,
          dosage: formData.dosage || undefined,
          withdrawalPeriodMeat: formData.withdrawalPeriodMeat,
          withdrawalPeriodMilk: formData.withdrawalPeriodMilk,
          currentStock: formData.currentStock || undefined,
          minStock: formData.minStock || undefined,
          stockUnit: formData.stockUnit,
          unitPrice: formData.unitPrice || undefined,
          type: formData.type || undefined,
          targetSpecies: formData.targetSpecies || undefined,
          isActive: formData.isActive,
        };
        await medicalProductsService.create(createData);
        toast.success(tc('messages.success'), t('messages.created'));
      }

      onSuccess();
    } catch (error) {
      const errorMessage = isEditMode
        ? t('messages.updateError')
        : t('messages.createError');
      toast.error(tc('messages.error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('editItem') : t('newItem')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Nom */}
            <div>
              <Label htmlFor="name">
                {t('fields.name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder={t('placeholders.name')}
              />
            </div>

            {/* Nom commercial */}
            <div>
              <Label htmlFor="commercialName">{t('fields.commercialName')}</Label>
              <Input
                id="commercialName"
                value={formData.commercialName}
                onChange={(e) =>
                  setFormData({ ...formData, commercialName: e.target.value })
                }
                placeholder={t('placeholders.commercialName')}
              />
            </div>

            {/* Catégorie */}
            <div>
              <Label htmlFor="category">
                {t('fields.category')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
                placeholder={t('placeholders.category')}
              />
            </div>

            {/* Principe actif */}
            <div>
              <Label htmlFor="activeIngredient">{t('fields.activeIngredient')}</Label>
              <Input
                id="activeIngredient"
                value={formData.activeIngredient}
                onChange={(e) =>
                  setFormData({ ...formData, activeIngredient: e.target.value })
                }
                placeholder={t('placeholders.activeIngredient')}
              />
            </div>

            {/* Fabricant */}
            <div>
              <Label htmlFor="manufacturer">{t('fields.manufacturer')}</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
                placeholder={t('placeholders.manufacturer')}
              />
            </div>

            {/* Dosage */}
            <div>
              <Label htmlFor="dosage">{t('fields.dosage')}</Label>
              <Input
                id="dosage"
                type="number"
                value={formData.dosage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dosage: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder={t('placeholders.dosage')}
              />
            </div>

            {/* Délai d'attente viande */}
            <div>
              <Label htmlFor="withdrawalPeriodMeat">
                {t('fields.withdrawalPeriodMeat')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="withdrawalPeriodMeat"
                type="number"
                value={formData.withdrawalPeriodMeat}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    withdrawalPeriodMeat: parseInt(e.target.value) || 0,
                  })
                }
                required
                min={0}
                placeholder={t('placeholders.withdrawalPeriodMeat')}
              />
            </div>

            {/* Délai d'attente lait */}
            <div>
              <Label htmlFor="withdrawalPeriodMilk">
                {t('fields.withdrawalPeriodMilk')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="withdrawalPeriodMilk"
                type="number"
                value={formData.withdrawalPeriodMilk}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    withdrawalPeriodMilk: parseInt(e.target.value) || 0,
                  })
                }
                required
                min={0}
                placeholder={t('placeholders.withdrawalPeriodMilk')}
              />
            </div>

            {/* Stock actuel */}
            <div>
              <Label htmlFor="currentStock">{t('fields.currentStock')}</Label>
              <Input
                id="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentStock: parseFloat(e.target.value) || 0,
                  })
                }
                min={0}
                placeholder={t('placeholders.currentStock')}
              />
            </div>

            {/* Stock minimum */}
            <div>
              <Label htmlFor="minStock">{t('fields.minStock')}</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minStock: parseFloat(e.target.value) || 0,
                  })
                }
                min={0}
                placeholder={t('placeholders.minStock')}
              />
            </div>

            {/* Unité de stock */}
            <div>
              <Label htmlFor="stockUnit">
                {t('fields.stockUnit')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stockUnit"
                value={formData.stockUnit}
                onChange={(e) =>
                  setFormData({ ...formData, stockUnit: e.target.value })
                }
                required
                placeholder={t('placeholders.stockUnit')}
              />
            </div>

            {/* Prix unitaire */}
            <div>
              <Label htmlFor="unitPrice">{t('fields.unitPrice')}</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unitPrice: parseFloat(e.target.value) || 0,
                  })
                }
                min={0}
                placeholder={t('placeholders.unitPrice')}
              />
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="type">{t('fields.type')}</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                placeholder={t('placeholders.type')}
              />
            </div>

            {/* Espèces cibles */}
            <div>
              <Label htmlFor="targetSpecies">{t('fields.targetSpecies')}</Label>
              <Input
                id="targetSpecies"
                value={formData.targetSpecies}
                onChange={(e) =>
                  setFormData({ ...formData, targetSpecies: e.target.value })
                }
                placeholder={t('placeholders.targetSpecies')}
              />
            </div>

            {/* Actif */}
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                {t('fields.isActive')}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {tc('actions.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? tc('actions.saving')
                : isEditMode
                  ? tc('actions.update')
                  : tc('actions.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
