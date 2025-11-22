'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Toast, ToastContainer, ToastType } from '@/components/ui/toast'

interface ToastData {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toast: (options: Omit<ToastData, 'id'>) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    ({ type, title, message, duration = 5000 }: Omit<ToastData, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: ToastData = { id, type, title, message, duration }

      setToasts((prev) => [...prev, newToast])

      // Auto-remove après duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const success = useCallback(
    (title: string, message?: string) => {
      toast({ type: 'success', title, message })
    },
    [toast]
  )

  const error = useCallback(
    (title: string, message?: string) => {
      toast({ type: 'error', title, message })
    },
    [toast]
  )

  const info = useCallback(
    (title: string, message?: string) => {
      toast({ type: 'info', title, message })
    },
    [toast]
  )

  const warning = useCallback(
    (title: string, message?: string) => {
      toast({ type: 'warning', title, message })
    },
    [toast]
  )

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <ToastContainer>
        {toasts.map((toastData) => (
          <Toast
            key={toastData.id}
            {...toastData}
            onClose={() => removeToast(toastData.id)}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
