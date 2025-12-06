'use client'

/**
 * Modal de confirmation de suppression avec vérification des dépendances
 *
 * Features:
 * - Affichage du nom de l'item à supprimer
 * - Vérification des dépendances
 * - Blocage de la suppression si dépendances existent
 * - État loading pendant la suppression
 * - Support i18n complet
 *
 * @example
 * ```tsx
 * <DeleteConfirmModal
 *   open={showModal}
 *   onOpenChange={setShowModal}
 *   itemName="Amoxicilline"
 *   onConfirm={handleDelete}
 *   dependencies={{ products: 12, therapeuticIndications: 5 }}
 * />
 * ```
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, AlertTriangle } from 'lucide-react'

interface DeleteConfirmModalProps {
  /** Modal ouvert/fermé */
  open: boolean

  /** Callback changement état modal */
  onOpenChange: (open: boolean) => void

  /** Nom de l'item à supprimer */
  itemName: string

  /** Callback confirmation suppression */
  onConfirm: () => Promise<void>

  /** Dépendances empêchant la suppression (entity: count) */
  dependencies?: Record<string, number>

  /** État loading externe */
  loading?: boolean
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  itemName,
  onConfirm,
  dependencies,
  loading = false,
}: DeleteConfirmModalProps) {
  const t = useTranslations('common')
  const [isDeleting, setIsDeleting] = useState(false)

  const hasDependencies = dependencies && Object.keys(dependencies).length > 0

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      // Error handled by parent (via toast)
    } finally {
      setIsDeleting(false)
    }
  }

  /**
   * Formate les dépendances pour affichage
   * Ex: { products: 12, therapeuticIndications: 5 } → "12 products, 5 therapeutic indications"
   */
  const formatDependencies = () => {
    if (!dependencies) return ''

    return Object.entries(dependencies)
      .map(([entity, count]) => {
        // Convertir camelCase en lisible : therapeuticIndications → therapeutic indications
        const readable = entity.replace(/([A-Z])/g, ' $1').toLowerCase().trim()
        return `${count} ${readable}`
      })
      .join(', ')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasDependencies ? (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {t('error.hasDependencies')}
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-destructive" />
                {t('messages.confirmDelete')}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            {hasDependencies ? (
              <div className="space-y-2">
                <p className="text-destructive font-medium">
                  {t('error.hasDependencies')}
                </p>
                <p>
                  {t('table.cannotDelete')} <strong>{itemName}</strong> {t('table.isUsedBy')}:
                </p>
                <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    {formatDependencies()}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('table.mustDeleteDependencies')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p>
                  {t('table.confirmDeleteItem')} <strong className="text-foreground">{itemName}</strong> ?
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('messages.actionIrreversible')}
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting || loading}
          >
            {t('actions.cancel')}
          </Button>
          {!hasDependencies && (
            <Button
              variant="default"
              onClick={handleConfirm}
              disabled={isDeleting || loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting || loading
                ? t('actions.deleting')
                : t('actions.delete')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
