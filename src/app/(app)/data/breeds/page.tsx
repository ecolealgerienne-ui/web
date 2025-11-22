'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBreeds } from '@/lib/hooks/useBreeds';

export default function BreedsPage() {
  const { breeds, loading, error } = useBreeds();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Races</h1>
            <p className="text-muted-foreground mt-1">
              Gestion des races d'animaux
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
              Gestion des races d'animaux
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
            Gestion des races d'animaux
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle race
        </Button>
      </div>

      {/* Liste des races */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des races ({breeds.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {breeds.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucune race enregistrée.
              <br />
              Cliquez sur "Nouvelle race" pour en ajouter une.
            </div>
          ) : (
            <div className="space-y-2">
              {breeds.map((breed) => (
                <div
                  key={breed.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div>
                    <div className="font-medium">{breed.name}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {breed.species === 'sheep' && 'Mouton'}
                      {breed.species === 'goat' && 'Chèvre'}
                      {breed.species === 'cattle' && 'Bovin'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      Modifier
                    </Button>
                    <Button variant="ghost" size="sm">
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
