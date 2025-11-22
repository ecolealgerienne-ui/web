'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MedicationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Médicaments</h1>
          <p className="text-muted-foreground mt-1">
            Gestion des médicaments disponibles
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau médicament
        </Button>
      </div>

      {/* Liste des médicaments */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des médicaments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Aucun médicament enregistré.
            <br />
            Cliquez sur "Nouveau médicament" pour en ajouter un.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
