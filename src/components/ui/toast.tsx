'use client'

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, Trash2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'undo'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: ToastAction
  onClose: () => void
  // Pour le type undo
  onUndo?: () => void
  undoLabel?: string
}

// Durées par défaut selon le type (en ms)
const defaultDurations: Record<ToastType, number> = {
  success: 3000,
  info: 5000,
  warning: 10000,
  error: 0, // Persistant (0 = pas de fermeture auto)
  undo: 10000,
}

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
  undo: Trash2,
}

const colorMap = {
  success: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
  error: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
  info: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
  warning: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100',
  undo: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100',
}

const iconColorMap = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  warning: 'text-orange-600 dark:text-orange-400',
  undo: 'text-slate-600 dark:text-slate-400',
}

const progressColorMap = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-orange-500',
  undo: 'bg-slate-500',
}

export function Toast({
  id,
  type,
  title,
  message,
  duration,
  action,
  onClose,
  onUndo,
  undoLabel = 'Annuler',
}: ToastProps) {
  const Icon = iconMap[type]
  const effectiveDuration = duration ?? defaultDurations[type]
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)

  // Gestion du timer et de la barre de progression
  useEffect(() => {
    if (effectiveDuration === 0 || isPaused) return

    const startTime = Date.now()
    const remainingTime = (effectiveDuration * progress) / 100

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.max(0, ((remainingTime - elapsed) / effectiveDuration) * 100)
      setProgress(newProgress)

      if (newProgress <= 0) {
        clearInterval(timer)
        onClose()
      }
    }, 50)

    return () => clearInterval(timer)
  }, [effectiveDuration, isPaused, onClose, progress])

  const handleUndo = useCallback(() => {
    onUndo?.()
    onClose()
  }, [onUndo, onClose])

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-lg border shadow-lg overflow-hidden',
        'animate-in slide-in-from-top-5 duration-300',
        colorMap[type]
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconColorMap[type])} />
          <div className="flex-1 space-y-1 min-w-0">
            <p className="font-semibold text-sm">{title}</p>
            {message && <p className="text-sm opacity-90">{message}</p>}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              {type === 'undo' && onUndo && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUndo}
                  className="h-7 text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {undoLabel}
                </Button>
              )}
              {action && (
                <Button
                  size="sm"
                  variant={type === 'error' ? 'default' : 'outline'}
                  onClick={() => {
                    action.onClick()
                    onClose()
                  }}
                  className="h-7 text-xs"
                >
                  {action.label}
                </Button>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Barre de progression pour les toasts avec durée */}
      {effectiveDuration > 0 && (
        <div className="h-1 bg-black/5 dark:bg-white/5">
          <div
            className={cn('h-full transition-all duration-75', progressColorMap[type])}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4 pointer-events-none max-w-md">
      {children}
    </div>
  )
}
