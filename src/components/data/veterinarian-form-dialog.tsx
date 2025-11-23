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
import { Veterinarian, CreateVeterinarianDto, UpdateVeterinarianDto } from '@/lib/types/veterinarian';
import { veterinariansService } from '@/lib/services/veterinarians.service';
import { useToast } from '@/contexts/toast-context';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';

interface VeterinarianFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  veterinarian?: Veterinarian | null;
  onSuccess: () => void;
}

export function VeterinarianFormDialog({
  open,
  onOpenChange,
  veterinarian,
  onSuccess,
}: VeterinarianFormDialogProps) {
  const t = useTranslations('veterinarians');
  const tc = useCommonTranslations();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    title: 'Dr.',
    licenseNumber: '',
    specialties: '',
    clinic: '',
    phone: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    isAvailable: true,
    emergencyService: false,
    workingHours: '',
    consultationFee: 0,
    emergencyFee: 0,
    currency: 'EUR',
    isPreferred: false,
    isDefault: false,
    isActive: true,
  });

  const isEditMode = Boolean(veterinarian);

  useEffect(() => {
    if (veterinarian) {
      setFormData({
        firstName: veterinarian.firstName,
        lastName: veterinarian.lastName,
        title: veterinarian.title || 'Dr.',
        licenseNumber: veterinarian.licenseNumber,
        specialties: Array.isArray(veterinarian.specialties)
          ? veterinarian.specialties.join(', ')
          : veterinarian.specialties || '',
        clinic: veterinarian.clinic || '',
        phone: veterinarian.phone,
        mobile: veterinarian.mobile || '',
        email: veterinarian.email || '',
        address: veterinarian.address || '',
        city: veterinarian.city || '',
        postalCode: veterinarian.postalCode || '',
        country: veterinarian.country || 'France',
        isAvailable: veterinarian.isAvailable ?? true,
        emergencyService: veterinarian.emergencyService ?? false,
        workingHours: veterinarian.workingHours || '',
        consultationFee: veterinarian.consultationFee || 0,
        emergencyFee: veterinarian.emergencyFee || 0,
        currency: veterinarian.currency || 'EUR',
        isPreferred: veterinarian.isPreferred ?? false,
        isDefault: veterinarian.isDefault ?? false,
        isActive: veterinarian.isActive ?? true,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        title: 'Dr.',
        licenseNumber: '',
        specialties: '',
        clinic: '',
        phone: '',
        mobile: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'France',
        isAvailable: true,
        emergencyService: false,
        workingHours: '',
        consultationFee: 0,
        emergencyFee: 0,
        currency: 'EUR',
        isPreferred: false,
        isDefault: false,
        isActive: true,
      });
    }
  }, [veterinarian, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorDetails(null);

    try {
      if (isEditMode) {
        const updateData: UpdateVeterinarianDto = { ...formData };
        console.log('Updating veterinarian:', updateData);
        await veterinariansService.update(veterinarian!.id, updateData);
        toast.success(tc('messages.success'), t('messages.updated'));
      } else {
        const createData: CreateVeterinarianDto = { ...formData };
        console.log('Creating veterinarian:', createData);
        await veterinariansService.create(createData);
        toast.success(tc('messages.success'), t('messages.created'));
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error submitting veterinarian form:', error);

      // Extract detailed error message
      let detailedError = error?.message || 'Unknown error';
      if (error?.response?.data?.message) {
        detailedError = error.response.data.message;
      } else if (error?.data?.message) {
        detailedError = error.data.message;
      }

      setErrorDetails(`${detailedError} (Status: ${error?.status || 'N/A'})`);

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('editVeterinarian') : t('newVeterinarian')}
          </DialogTitle>
        </DialogHeader>

        {errorDetails && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
            <p className="text-sm font-semibold text-destructive mb-1">Erreur détaillée :</p>
            <p className="text-sm text-destructive/90">{errorDetails}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Informations personnelles */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('sections.personal')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">{t('fields.title')}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Dr."
                />
              </div>
              <div>
                <Label htmlFor="firstName">
                  {t('fields.firstName')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">
                  {t('fields.lastName')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="licenseNumber">
                  {t('fields.licenseNumber')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Spécialités */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('sections.specialties')}</h3>
            <div>
              <Label htmlFor="specialties">
                {t('fields.specialties')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="specialties"
                value={formData.specialties}
                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                placeholder={t('placeholders.specialties')}
                required
              />
            </div>
          </div>

          {/* Section: Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('sections.contact')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">
                  {t('fields.phone')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mobile">{t('fields.mobile')}</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="email">{t('fields.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section: Adresse */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('sections.address')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="clinic">{t('fields.clinic')}</Label>
                <Input
                  id="clinic"
                  value={formData.clinic}
                  onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">{t('fields.address')}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="city">{t('fields.city')}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="postalCode">{t('fields.postalCode')}</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="country">{t('fields.country')}</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section: Disponibilité */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('sections.availability')}</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="workingHours">{t('fields.workingHours')}</Label>
                <Input
                  id="workingHours"
                  value={formData.workingHours}
                  onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                  placeholder={t('placeholders.workingHours')}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="isAvailable" className="cursor-pointer">
                  {t('fields.isAvailable')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emergencyService"
                  checked={formData.emergencyService}
                  onChange={(e) => setFormData({ ...formData, emergencyService: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="emergencyService" className="cursor-pointer">
                  {t('fields.emergencyService')}
                </Label>
              </div>
            </div>
          </div>

          {/* Section: Tarifs */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('sections.pricing')}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="consultationFee">{t('fields.consultationFee')}</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  step="0.01"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="emergencyFee">{t('fields.emergencyFee')}</Label>
                <Input
                  id="emergencyFee"
                  type="number"
                  step="0.01"
                  value={formData.emergencyFee}
                  onChange={(e) => setFormData({ ...formData, emergencyFee: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="currency">{t('fields.currency')}</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section: Préférences */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('sections.preferences')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPreferred"
                  checked={formData.isPreferred}
                  onChange={(e) => setFormData({ ...formData, isPreferred: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="isPreferred" className="cursor-pointer">
                  {t('fields.isPreferred')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="isDefault" className="cursor-pointer">
                  {t('fields.isDefault')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  {t('fields.isActive')}
                </Label>
              </div>
            </div>
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
