'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VaccinesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vaccins</h1>
          <p className="text-muted-foreground mt-1">
            Gestion des vaccins disponibles
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau vaccin
        </Button>
      </div>

      {/* Liste des vaccins */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des vaccins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Aucun vaccin enregistré.
            <br />
            Cliquez sur "Nouveau vaccin" pour en ajouter un.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
