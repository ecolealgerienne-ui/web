import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from './button'

interface EmptyStateProps {
  icon?: LucideIcon | ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'ghost'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return null

    if (typeof icon === 'function') {
      const Icon = icon as LucideIcon
      return (
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Icon className="w-10 h-10 text-muted-foreground" />
        </div>
      )
    }

    return (
      <div className="mb-6">
        {icon}
      </div>
    )
  }

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {renderIcon()}

      <h3 className="text-xl font-semibold mb-2">{title}</h3>

      {description && (
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size="lg"
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              size="lg"
              className="text-muted-foreground"
            >
              {secondaryAction.icon && (
                <secondaryAction.icon className="w-4 h-4 mr-2" />
              )}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Composant pour les cartes d'avertissement de configuration incomplète
interface ConfigWarningCardProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  onDismiss?: () => void
}

export function ConfigWarningCard({
  title,
  description,
  actionLabel,
  onAction,
  onDismiss,
}: ConfigWarningCardProps) {
  return (
    <div className="relative p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
      <div className="flex items-start gap-3">
        <div className="text-2xl">⚙️</div>
        <div className="flex-1">
          <p className="font-medium text-amber-800 dark:text-amber-200">{title}</p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAction}
            className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200"
          >
            {actionLabel}
          </Button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-amber-500 hover:text-amber-700 p-1"
              aria-label="Fermer"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Illustration par défaut pour l'état vide principal
export function EmptyStateIllustration() {
  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Fond avec dégradé */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30" />

      {/* Icônes d'animaux */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-6xl">🐄</div>
      </div>

      {/* Éléments décoratifs */}
      <div className="absolute top-2 right-4 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>
        🌾
      </div>
      <div className="absolute bottom-4 left-2 text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>
        🌿
      </div>
    </div>
  )
}
