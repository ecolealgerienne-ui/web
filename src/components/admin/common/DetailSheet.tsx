'use client'

import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { BaseEntity } from '@/lib/types/common/api'

/**
 * Définition d'un champ à afficher
 */
interface DetailField {
  /** Clé du champ */
  key: string

  /** Label du champ (clé i18n) */
  label: string

  /** Render personnalisé de la valeur */
  render?: (value: any) => React.ReactNode

  /** Type de champ (pour render par défaut) */
  type?: 'text' | 'date' | 'boolean' | 'badge'
}

/**
 * Props du DetailSheet
 */
interface DetailSheetProps<T extends BaseEntity> {
  /** Dialog ouvert ? */
  open: boolean

  /** Callback changement état */
  onOpenChange: (open: boolean) => void

  /** Item à afficher */
  item: T | null

  /** Titre du sheet (ex: "Détail Espèce") */
  title: string

  /** Description optionnelle */
  description?: string

  /** Champs à afficher */
  fields: DetailField[]

  /** Actions personnalisées (render) */
  actions?: React.ReactNode
}

/**
 * Dialog générique pour afficher les détails d'une entité
 *
 * ✅ RÈGLE #3 : Composant réutilisable admin
 * ✅ RÈGLE #6 : i18n complet
 *
 * @example
 * ```tsx
 * <DetailSheet<Species>
 *   open={detailOpen}
 *   onOpenChange={setDetailOpen}
 *   item={selectedSpecies}
 *   title={t('title.singular')}
 *   fields={[
 *     { key: 'code', label: t('fields.code') },
 *     { key: 'name', label: t('fields.name') },
 *     { key: 'isActive', label: t('fields.isActive'), type: 'badge' },
 *   ]}
 * />
 * ```
 */
export function DetailSheet<T extends BaseEntity>({
  open,
  onOpenChange,
  item,
  title,
  description,
  fields,
  actions,
}: DetailSheetProps<T>) {
  const tc = useTranslations('common')

  if (!item) return null

  /**
   * Render d'une valeur selon son type
   */
  const renderValue = (field: DetailField, value: any) => {
    // Render personnalisé
    if (field.render) {
      return field.render(value)
    }

    // Valeur vide
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground italic">-</span>
    }

    // Render par type
    switch (field.type) {
      case 'date':
        return new Date(value).toLocaleString('fr-FR', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })

      case 'boolean':
        return value ? (
          <Badge variant="success">{tc('status.active')}</Badge>
        ) : (
          <Badge variant="warning">{tc('status.inactive')}</Badge>
        )

      case 'badge':
        return value ? (
          <Badge variant="success">{tc('status.active')}</Badge>
        ) : (
          <Badge variant="warning">{tc('status.inactive')}</Badge>
        )

      case 'text':
      default:
        return <span>{String(value)}</span>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Champs principaux */}
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">
                  {field.label}
                </dt>
                <dd className="text-base">
                  {renderValue(field, (item as any)[field.key])}
                </dd>
              </div>
            ))}
          </div>

          {/* Métadonnées BaseEntity */}
          <div className="mt-6 pt-6 border-t space-y-4">
            <h3 className="text-sm font-semibold">{tc('fields.metadata') || 'Métadonnées'}</h3>

            {item.createdAt && (
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">
                  {tc('fields.createdAt')}
                </dt>
                <dd className="text-sm">
                  {new Date(item.createdAt).toLocaleString('fr-FR', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </dd>
              </div>
            )}

            {item.updatedAt && (
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">
                  {tc('fields.updatedAt')}
                </dt>
                <dd className="text-sm">
                  {new Date(item.updatedAt).toLocaleString('fr-FR', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </dd>
              </div>
            )}

            {item.version !== undefined && (
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">
                  Version
                </dt>
                <dd className="text-sm">
                  <Badge variant="default">v{item.version}</Badge>
                </dd>
              </div>
            )}

            {item.deletedAt && (
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">
                  {tc('fields.deletedAt') || 'Supprimé le'}
                </dt>
                <dd className="text-sm">
                  <Badge variant="warning">
                    {new Date(item.deletedAt).toLocaleString('fr-FR', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </Badge>
                </dd>
              </div>
            )}
          </div>

          {/* Actions personnalisées */}
          {actions && (
            <div className="mt-6 pt-6 border-t flex gap-2">{actions}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
