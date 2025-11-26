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
import { Select } from '@/components/ui/select';
import { Campaign, CreateCampaignDto, UpdateCampaignDto, CampaignType, CampaignStatus } from '@/lib/types/campaign';
import { campaignsService } from '@/lib/services/campaigns.service';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';

interface CampaignFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign | null;
  onSuccess: () => void;
}

export function CampaignFormDialog({
  open,
  onOpenChange,
  campaign,
  onSuccess,
}: CampaignFormDialogProps) {
  const t = useTranslations('campaigns');
  const tc = useCommonTranslations();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'vaccination' as CampaignType,
    productId: '',
    productName: '',
    campaignDate: new Date().toISOString().split('T')[0],
    status: 'scheduled' as CampaignStatus,
    targetCount: 0,
    completedCount: 0,
    description: '',
    veterinarianId: '',
    veterinarianName: '',
    cost: 0,
    notes: '',
  });

  const isEditMode = Boolean(campaign);

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        type: campaign.type,
        productId: campaign.productId || '',
        productName: campaign.productName || '',
        campaignDate: campaign.campaignDate.split('T')[0],
        status: campaign.status,
        targetCount: campaign.targetCount || 0,
        completedCount: campaign.completedCount || 0,
        description: campaign.description || '',
        veterinarianId: campaign.veterinarianId || '',
        veterinarianName: campaign.veterinarianName || '',
        cost: campaign.cost || 0,
        notes: campaign.notes || '',
      });
    } else {
      setFormData({
        name: '',
        type: 'vaccination',
        productId: '',
        productName: '',
        campaignDate: new Date().toISOString().split('T')[0],
        status: 'in_progress' as const,
        targetCount: 0,
        completedCount: 0,
        description: '',
        veterinarianId: '',
        veterinarianName: '',
        cost: 0,
        notes: '',
      });
    }
  }, [campaign, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        campaignDate: new Date(formData.campaignDate).toISOString(),
      };

      if (isEditMode) {
        const updateData: UpdateCampaignDto = payload;
        await campaignsService.update(campaign!.id, updateData);
        toast.success(tc('messages.success'), t('messages.updated'));
      } else {
        const createData: CreateCampaignDto = payload;
        await campaignsService.create(createData);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('editCampaign') : t('newCampaign')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom et Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">
                {t('fields.name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="type">
                {t('fields.type')} <span className="text-destructive">*</span>
              </Label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as CampaignType })}
                required
              >
                <option value="vaccination">{t('types.vaccination')}</option>
                <option value="treatment">{t('types.treatment')}</option>
                <option value="weighing">{t('types.weighing')}</option>
                <option value="identification">{t('types.identification')}</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">
                {t('fields.status')} <span className="text-destructive">*</span>
              </Label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CampaignStatus })}
                required
              >
                <option value="planned">{t('status.planned')}</option>
                <option value="in_progress">{t('status.in_progress')}</option>
                <option value="completed">{t('status.completed')}</option>
                <option value="cancelled">{t('status.cancelled')}</option>
              </Select>
            </div>
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="campaignDate">
              {t('fields.campaignDate')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="campaignDate"
              type="date"
              value={formData.campaignDate}
              onChange={(e) => setFormData({ ...formData, campaignDate: e.target.value })}
              required
            />
          </div>

          {/* Produit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productName">{t('fields.productName')}</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder={t('placeholders.productName')}
              />
            </div>
            <div>
              <Label htmlFor="productId">{t('fields.productId')}</Label>
              <Input
                id="productId"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              />
            </div>
          </div>

          {/* Vétérinaire */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="veterinarianName">{t('fields.veterinarianName')}</Label>
              <Input
                id="veterinarianName"
                value={formData.veterinarianName}
                onChange={(e) => setFormData({ ...formData, veterinarianName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="veterinarianId">{t('fields.veterinarianId')}</Label>
              <Input
                id="veterinarianId"
                value={formData.veterinarianId}
                onChange={(e) => setFormData({ ...formData, veterinarianId: e.target.value })}
              />
            </div>
          </div>

          {/* Objectifs */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="targetCount">{t('fields.targetCount')}</Label>
              <Input
                id="targetCount"
                type="number"
                value={formData.targetCount}
                onChange={(e) => setFormData({ ...formData, targetCount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="completedCount">{t('fields.completedCount')}</Label>
              <Input
                id="completedCount"
                type="number"
                value={formData.completedCount}
                onChange={(e) => setFormData({ ...formData, completedCount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="cost">{t('fields.cost')}</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">{t('fields.description')}</Label>
            <textarea
              id="description"
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('placeholders.description')}
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">{t('fields.notes')}</Label>
            <textarea
              id="notes"
              className="w-full min-h-[60px] px-3 py-2 rounded-md border border-input bg-background"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
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
              {loading ? tc('actions.saving') : tc('actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
