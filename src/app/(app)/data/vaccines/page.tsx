'use client';

import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useVaccines } from '@/lib/hooks/useVaccines';
import { VaccineScope, VaccineTargetDisease } from '@/lib/types/vaccine';
import { VACCINE_TARGET_DISEASE_LABELS, VACCINE_SCOPE_LABELS } from '@/lib/types/vaccine';

export default function VaccinesPage() {
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<VaccineScope | 'all'>('all');
  const [diseaseFilter, setDiseaseFilter] = useState<VaccineTargetDisease | 'all'>('all');

  const { vaccines, loading, error } = useVaccines({
    search,
    scope: scopeFilter,
    targetDisease: diseaseFilter === 'all' ? undefined : diseaseFilter,
    isActive: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vaccins</h1>
          <p className="text-muted-foreground mt-1">
            Gestion des vaccins (globaux et locaux)
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau vaccin
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
                  placeholder="Nom du vaccin..."
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
                onChange={(e) => setScopeFilter(e.target.value as VaccineScope | 'all')}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="all">Tous</option>
                <option value="global">Global</option>
                <option value="local">Local</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Maladie ciblée</label>
              <select
                value={diseaseFilter}
                onChange={(e) => setDiseaseFilter(e.target.value as VaccineTargetDisease | 'all')}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="all">Toutes</option>
                {Object.entries(VACCINE_TARGET_DISEASE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des vaccins */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des vaccins ({vaccines.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-12 text-muted-foreground">
              Chargement des vaccins...
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-destructive">
              Erreur lors du chargement : {error.message}
            </div>
          )}

          {!loading && !error && vaccines.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Aucun vaccin trouvé.
              <br />
              Cliquez sur &quot;Nouveau vaccin&quot; pour en ajouter un.
            </div>
          )}

          {!loading && !error && vaccines.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4">Nom</th>
                    <th className="text-left py-3 px-4">Maladie ciblée</th>
                    <th className="text-left py-3 px-4">Scope</th>
                    <th className="text-left py-3 px-4">Laboratoire</th>
                    <th className="text-left py-3 px-4">Code</th>
                    <th className="text-left py-3 px-4">Durée immunité</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccines.map((vaccine) => (
                    <tr key={vaccine.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{vaccine.nameFr}</div>
                        {vaccine.nameEn && (
                          <div className="text-sm text-muted-foreground">
                            {vaccine.nameEn}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {vaccine.targetDisease && (
                          <Badge variant="default">
                            {VACCINE_TARGET_DISEASE_LABELS[vaccine.targetDisease]}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={vaccine.scope === 'global' ? 'default' : 'warning'}>
                          {VACCINE_SCOPE_LABELS[vaccine.scope]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{vaccine.laboratoire || '-'}</td>
                      <td className="py-3 px-4 text-sm">{vaccine.code || '-'}</td>
                      <td className="py-3 px-4 text-sm">
                        {vaccine.dureeImmunite !== undefined
                          ? `${vaccine.dureeImmunite}j`
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
