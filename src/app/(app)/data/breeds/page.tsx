'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { useBreeds } from '@/lib/hooks/useBreeds';

const speciesOptions = [
  { value: '', label: 'Toutes les espèces' },
  { value: 'sheep', label: 'Moutons' },
  { value: 'goat', label: 'Chèvres' },
  { value: 'cattle', label: 'Bovins' },
];

export default function BreedsPage() {
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const { breeds, loading, error } = useBreeds(selectedSpecies || undefined);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Races</h1>
            <p className="text-muted-foreground mt-1">
              Données de référence - Races d'animaux
            </p>
          </div>
        </div>
        <div className="text-center py-12">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Races</h1>
            <p className="text-muted-foreground mt-1">
              Données de référence - Races d'animaux
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Erreur lors du chargement des races
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
          <h1 className="text-3xl font-bold">Races</h1>
          <p className="text-muted-foreground mt-1">
            Données de référence - Races d'animaux disponibles
          </p>
        </div>
      </div>

      {/* Filtre par espèce */}
      <div className="flex gap-4">
        <Select
          value={selectedSpecies}
          onChange={(e) => setSelectedSpecies(e.target.value)}
          className="w-full md:w-[200px]"
        >
          {speciesOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Liste des races */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des races ({breeds.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {breeds.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucune race trouvée pour ce filtre.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {breeds.map((breed) => (
                <div
                  key={breed.id}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-semibold text-lg">{breed.nameFr}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {breed.nameEn}
                  </div>
                  {breed.nameAr && (
                    <div className="text-sm text-muted-foreground mt-1 text-right" dir="rtl">
                      {breed.nameAr}
                    </div>
                  )}
                  {breed.description && (
                    <div className="text-sm text-muted-foreground mt-2">
                      {breed.description}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    ID: {breed.speciesId}
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
            ℹ️ Les races sont des données de référence fournies par le système.
            Ces données ne sont pas modifiables depuis l'interface.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
