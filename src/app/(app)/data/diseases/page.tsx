'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DiseasesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maladies</h1>
          <p className="text-muted-foreground mt-1">
            Gestion des maladies connues
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle maladie
        </Button>
      </div>

      {/* Liste des maladies */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des maladies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Aucune maladie enregistrée.
            <br />
            Cliquez sur "Nouvelle maladie" pour en ajouter une.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
