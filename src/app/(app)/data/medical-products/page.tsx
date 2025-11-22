'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMedicalProducts } from '@/lib/hooks/useMedicalProducts';
import { MedicalProductFormDialog } from '@/components/data/medical-product-form-dialog';
import { MedicalProduct } from '@/lib/types/medical-product';
import { medicalProductsService } from '@/lib/services/medical-products.service';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

export default function MedicalProductsPage() {
  const t = useTranslations('medicalProducts');
  const tc = useCommonTranslations();
  const toast = useToast();
  const [showInactive, setShowInactive] = useState(true);
  const { products: allProducts, loading, error, refetch } = useMedicalProducts();

  // Filtrer les produits selon l'état actif/inactif
  const products = showInactive
    ? allProducts
    : allProducts.filter(product => product.isActive !== false);

  // État du formulaire
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MedicalProduct | null>(null);

  // État de la confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<MedicalProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleEdit = (product: MedicalProduct) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleDeleteClick = (product: MedicalProduct) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;

    setDeleting(true);
    try {
      await medicalProductsService.delete(deletingProduct.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      refetch();
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
    } catch (error) {
      toast.error(tc('messages.error'), t('messages.deleteError'));
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = async () => {
    await refetch();
    setFormOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('subtitle')}
            </p>
          </div>
        </div>
        <div className="text-center py-12">{tc('messages.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('subtitle')}
            </p>
          </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {t('newItem')}
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showInactive"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="showInactive" className="text-sm cursor-pointer">
            {t('filters.showInactive')}
          </label>
        </div>

        <div className="text-sm text-muted-foreground">
          {t(products.length > 1 ? 'productCount_plural' : 'productCount', { count: products.length })}
        </div>
      </div>

      {/* Liste des produits */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('title')} ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('noProducts')}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 border rounded-lg hover:bg-accent transition-colors relative group ${
                    product.isActive === false ? 'opacity-60 bg-muted/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-lg flex-1">{product.name}</div>
                    {product.isActive === false && (
                      <Badge variant="secondary" className="text-xs">
                        {tc('status.disabled')}
                      </Badge>
                    )}
                  </div>
                  {product.commercialName && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {product.commercialName}
                    </div>
                  )}
                  {product.category && (
                    <div className="mt-2 text-xs">
                      <Badge variant="outline">{t(`categories.${product.category}`)}</Badge>
                    </div>
                  )}
                  {product.manufacturer && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {t('fields.manufacturer')}: {product.manufacturer}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    {t('fields.withdrawalPeriodMeat')}: {product.withdrawalPeriodMeat}j
                    {' | '}
                    {t('fields.withdrawalPeriodMilk')}: {product.withdrawalPeriodMilk}h
                  </div>
                  {product.currentStock !== undefined && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Stock: {product.currentStock} {product.stockUnit}
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50 border-blue-200 dark:border-blue-800"
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      {tc('actions.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(product)}
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50 border-red-200 dark:border-red-800"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      {tc('actions.delete')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info box */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            ℹ️ {t('messages.infoMessage')}
          </p>
        </CardContent>
      </Card>

      {/* Formulaire d'ajout/édition */}
      <MedicalProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        onSuccess={handleFormSuccess}
      />

      {/* Confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setDeleteDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>{t('deleteProduct')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">
              {t('messages.confirmDelete', { name: deletingProduct ? deletingProduct.name : '' })}
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              {t('messages.confirmDeleteDetails')}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              {tc('actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? tc('actions.deleting') : tc('actions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
