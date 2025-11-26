'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Calendar, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { useCampaigns } from '@/lib/hooks/useCampaigns';
import { CampaignFormDialog } from '@/components/data/campaign-form-dialog';
import { Campaign, CampaignType, CampaignStatus } from '@/lib/types/campaign';
import { campaignsService } from '@/lib/services/campaigns.service';
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

export default function CampaignsPage() {
  const t = useTranslations('campaigns');
  const tc = useCommonTranslations();
  const toast = useToast();
  const [selectedType, setSelectedType] = useState<CampaignType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<CampaignStatus | ''>('');
  const { campaigns, loading, error, refetch } = useCampaigns({
    type: selectedType || undefined,
    status: selectedStatus || undefined,
  });

  // État du formulaire
  const [formOpen, setFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // État de la confirmation de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = () => {
    setEditingCampaign(null);
    setFormOpen(true);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormOpen(true);
  };

  const handleDeleteClick = (campaign: Campaign) => {
    setDeletingCampaign(campaign);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCampaign) return;

    setDeleting(true);
    try {
      await campaignsService.delete(deletingCampaign.id);
      toast.success(tc('messages.success'), t('messages.deleted'));
      refetch();
      setDeleteDialogOpen(false);
      setDeletingCampaign(null);
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

  const getStatusBadgeVariant = (status: CampaignStatus) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'scheduled':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getProgressPercentage = (campaign: Campaign) => {
    if (!campaign.targetCount || campaign.targetCount === 0) return 0;
    return Math.round(((campaign.completedCount || 0) / campaign.targetCount) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
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
            <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
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
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {t('newCampaign')}
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center flex-wrap">
        <Select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as CampaignType | '')}
          className="w-full md:w-[200px]"
        >
          <option value="">{t('filters.allTypes')}</option>
          <option value="vaccination">{t('types.vaccination')}</option>
          <option value="treatment">{t('types.treatment')}</option>
          <option value="weighing">{t('types.weighing')}</option>
          <option value="identification">{t('types.identification')}</option>
        </Select>

        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as CampaignStatus | '')}
          className="w-full md:w-[200px]"
        >
          <option value="">{t('filters.allStatus')}</option>
          <option value="planned">{t('status.planned')}</option>
          <option value="in_progress">{t('status.in_progress')}</option>
          <option value="completed">{t('status.completed')}</option>
          <option value="cancelled">{t('status.cancelled')}</option>
        </Select>

        <div className="text-sm text-muted-foreground">
          {t(campaigns.length > 1 ? 'campaignCount_plural' : 'campaignCount', { count: campaigns.length })}
        </div>
      </div>

      {/* Liste des campagnes */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('title')} ({campaigns.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('noCampaigns')}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  {/* En-tête */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="font-semibold text-lg flex-1">{campaign.name}</div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={getStatusBadgeVariant(campaign.status)} className="text-xs">
                        {t(`status.${campaign.status}`)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {t(`types.${campaign.type}`)}
                      </Badge>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(campaign.campaignDate).toLocaleDateString('fr-FR')}</span>
                  </div>

                  {/* Produit et Vétérinaire */}
                  {campaign.productName && (
                    <div className="text-sm mb-2">
                      <span className="font-medium">{t('fields.productName')}:</span> {campaign.productName}
                    </div>
                  )}
                  {campaign.veterinarianName && (
                    <div className="text-sm mb-2">
                      <span className="font-medium">{t('fields.veterinarianName')}:</span> {campaign.veterinarianName}
                    </div>
                  )}

                  {/* Progression */}
                  {campaign.targetCount && campaign.targetCount > 0 && (
                    <div className="mb-3 pt-2 border-t">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          <span>{t('progress')}</span>
                        </div>
                        <span className="font-semibold">
                          {campaign.completedCount || 0} / {campaign.targetCount} ({getProgressPercentage(campaign)}%)
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${getProgressPercentage(campaign)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {campaign.description && (
                    <div className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {campaign.description}
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(campaign)}
                      className="flex-1"
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      {tc('actions.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(campaign)}
                      className="flex-1 text-destructive hover:text-destructive"
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

      {/* Formulaire d'ajout/édition */}
      <CampaignFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        campaign={editingCampaign}
        onSuccess={handleFormSuccess}
      />

      {/* Confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setDeleteDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>{t('deleteCampaign')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              {t('messages.confirmDelete', { name: deletingCampaign?.name || '' })}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {tc('messages.actionIrreversible')}
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
