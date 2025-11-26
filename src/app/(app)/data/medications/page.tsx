'use client';

import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMedicalProducts } from '@/lib/hooks/useMedicalProducts';
import { MedicalProductScope, MedicalProductCategory } from '@/lib/types/medical-product';
import { MEDICAL_PRODUCT_CATEGORY_LABELS, MEDICAL_PRODUCT_SCOPE_LABELS } from '@/lib/types/medical-product';

export default function MedicationsPage() {
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<MedicalProductScope | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<MedicalProductCategory | 'all'>('all');

  const { medicalProducts, loading, error } = useMedicalProducts({
    search,
    scope: scopeFilter,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    isActive: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produits Médicaux</h1>
          <p className="text-muted-foreground mt-1">
            Gestion des produits médicaux (globaux et locaux)
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau produit
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nom du produit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Scope</label>
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value as MedicalProductScope | 'all')}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="all">Tous</option>
                <option value="global">Global</option>
                <option value="local">Local</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Catégorie</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as MedicalProductCategory | 'all')}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="all">Toutes</option>
                {Object.entries(MEDICAL_PRODUCT_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des produits */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des produits ({medicalProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-12 text-muted-foreground">
              Chargement des produits médicaux...
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-destructive">
              Erreur lors du chargement : {error.message}
            </div>
          )}

          {!loading && !error && medicalProducts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Aucun produit médical trouvé.
              <br />
              Cliquez sur &quot;Nouveau produit&quot; pour en ajouter un.
            </div>
          )}

          {!loading && !error && medicalProducts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4">Nom</th>
                    <th className="text-left py-3 px-4">Catégorie</th>
                    <th className="text-left py-3 px-4">Scope</th>
                    <th className="text-left py-3 px-4">Fabricant</th>
                    <th className="text-left py-3 px-4">Stock</th>
                    <th className="text-left py-3 px-4">Délai viande</th>
                    <th className="text-left py-3 px-4">Délai lait</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{product.nameFr}</div>
                        {product.commercialName && (
                          <div className="text-sm text-muted-foreground">
                            {product.commercialName}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {product.category && (
                          <Badge variant="outline">
                            {MEDICAL_PRODUCT_CATEGORY_LABELS[product.category]}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={product.scope === 'global' ? 'default' : 'secondary'}>
                          {MEDICAL_PRODUCT_SCOPE_LABELS[product.scope]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{product.manufacturer || '-'}</td>
                      <td className="py-3 px-4 text-sm">
                        {product.currentStock !== undefined
                          ? `${product.currentStock} ${product.stockUnit || ''}`
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {product.withdrawalPeriodMeat !== undefined
                          ? `${product.withdrawalPeriodMeat}j`
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {product.withdrawalPeriodMilk !== undefined
                          ? `${product.withdrawalPeriodMilk}j`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
