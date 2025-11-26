'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { useOnboarding } from '@/lib/hooks/useOnboarding'
import { ToastProvider } from '@/lib/hooks/useToast'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isLoading, needsOnboarding } = useOnboarding()

  useEffect(() => {
    // Rediriger vers l'onboarding si nécessaire
    if (!isLoading && needsOnboarding) {
      router.push('/onboarding')
    }
  }, [isLoading, needsOnboarding, router])

  // Afficher un loading pendant la vérification
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // Si onboarding nécessaire, ne pas afficher le layout (la redirection est en cours)
  if (needsOnboarding) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Redirection vers la configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-background p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
