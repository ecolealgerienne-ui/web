'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Lot } from '@/lib/types/lot';

interface LotFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lot?: Lot;
  onSave?: (lot: Partial<Lot>) => void;
}

export function LotFormDialog({ open, onOpenChange, lot, onSave }: LotFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Lot>>(
    lot || {
      name: '',
      type: 'fattening',
      status: 'open',
      description: '',
      productName: '',
      priceTotal: 0,
      notes: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{lot ? 'Modifier le lot' : 'Créer un lot'}</DialogTitle>
          <DialogDescription>
            {lot
              ? 'Modifiez les informations du lot'
              : 'Créez un nouveau lot pour grouper des animaux'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Nom */}
          <div>
            <Label htmlFor="name">Nom du lot *</Label>
            <Input
              id="name"
              placeholder="Traitement antiparasitaire Mars 2025"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Type */}
            <div>
              <Label htmlFor="type">Type de lot *</Label>
              <Select
                required
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reproduction">Reproduction</SelectItem>
                  <SelectItem value="fattening">Engraissement</SelectItem>
                  <SelectItem value="weaning">Sevrage</SelectItem>
                  <SelectItem value="quarantine">Quarantaine</SelectItem>
                  <SelectItem value="sale">Vente</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Statut */}
            <div>
              <Label htmlFor="status">Statut *</Label>
              <Select
                required
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Ouvert</SelectItem>
                  <SelectItem value="closed">Fermé</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Description du lot..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Prix et acheteur (si vente) */}
          {formData.type === 'sale' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="priceTotal">Montant total (DA)</Label>
                <Input
                  id="priceTotal"
                  type="number"
                  placeholder="0"
                  value={formData.priceTotal || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, priceTotal: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label htmlFor="buyer">Acheteur</Label>
                <Input
                  id="buyer"
                  placeholder="Nom..."
                  value={formData.buyerName || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, buyerName: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Notes supplémentaires..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">{lot ? 'Mettre à jour' : 'Créer'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
