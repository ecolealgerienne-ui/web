'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Veterinarian } from '@/lib/types/veterinarian'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail, MapPin, Building2, FileText, Stethoscope, Home } from 'lucide-react'

interface VeterinarianDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  veterinarian: Veterinarian | null
}

export function VeterinarianDetailsDialog({
  open,
  onOpenChange,
  veterinarian,
}: VeterinarianDetailsDialogProps) {
  const t = useTranslations('settings.veterinarians')
  const tf = useTranslations('settings.veterinarians.form')
  const ts = useTranslations('settings.veterinarians.specialties')
  const td = useTranslations('settings.veterinarians.details')

  if (!veterinarian) return null

  const isLocal = veterinarian.scope === 'local'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>
              Dr. {veterinarian.firstName} {veterinarian.lastName}
            </DialogTitle>
            {isLocal && (
              <Badge variant="warning">
                <Home className="w-3 h-3 me-1" />
                {td('localBadge')}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {td('sections.contact')}
            </h3>
            <div className="space-y-2">
              {veterinarian.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{tf('phone')}:</span>
                  <span dir="ltr">{veterinarian.phone}</span>
                </div>
              )}
              {veterinarian.mobile && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{tf('mobile')}:</span>
                  <span dir="ltr">{veterinarian.mobile}</span>
                </div>
              )}
              {veterinarian.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{tf('email')}:</span>
                  <span>{veterinarian.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Spécialité */}
          {veterinarian.specialties && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {td('sections.specialty')}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <Stethoscope className="w-4 h-4 text-muted-foreground" />
                <span>{ts(veterinarian.specialties)}</span>
              </div>
            </div>
          )}

          {/* Localisation */}
          {(veterinarian.city || veterinarian.department || veterinarian.clinic) && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {td('sections.location')}
              </h3>
              <div className="space-y-2">
                {veterinarian.clinic && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{tf('clinic')}:</span>
                    <span>{veterinarian.clinic}</span>
                  </div>
                )}
                {veterinarian.city && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{tf('city')}:</span>
                    <span>{veterinarian.city}</span>
                  </div>
                )}
                {veterinarian.department && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{tf('department')}:</span>
                    <span>{veterinarian.department}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Numéro de licence */}
          {veterinarian.licenseNumber && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {td('sections.license')}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{tf('licenseNumber')}:</span>
                <span>{veterinarian.licenseNumber}</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
