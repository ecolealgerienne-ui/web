'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Toast, ToastContainer, ToastType, ToastAction } from '@/components/ui/toast'

// Configuration
const MAX_VISIBLE_TOASTS = 3

interface ToastData {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: ToastAction
  onUndo?: () => void
  undoLabel?: string
}

interface ToastContextValue {
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, 'id'>) => string
  removeToast: (id: string) => void
  // Raccourcis pratiques
  success: (title: string, message?: string) => string
  error: (title: string, message?: string, action?: ToastAction) => string
  warning: (title: string, message?: string) => string
  info: (title: string, message?: string) => string
  undo: (title: string, onUndo: () => void, message?: string) => string
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((toast: Omit<ToastData, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    setToasts((prev) => {
      const newToasts = [...prev, { ...toast, id }]
      // Limiter le nombre de toasts visibles
      if (newToasts.length > MAX_VISIBLE_TOASTS) {
        return newToasts.slice(-MAX_VISIBLE_TOASTS)
      }
      return newToasts
    })

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Raccourcis
  const success = useCallback(
    (title: string, message?: string) => addToast({ type: 'success', title, message }),
    [addToast]
  )

  const error = useCallback(
    (title: string, message?: string, action?: ToastAction) =>
      addToast({ type: 'error', title, message, action }),
    [addToast]
  )

  const warning = useCallback(
    (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    [addToast]
  )

  const info = useCallback(
    (title: string, message?: string) => addToast({ type: 'info', title, message }),
    [addToast]
  )

  const undo = useCallback(
    (title: string, onUndo: () => void, message?: string) =>
      addToast({ type: 'undo', title, message, onUndo }),
    [addToast]
  )

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
        undo,
      }}
    >
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
