'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RotateCcw } from 'lucide-react'
import { logger } from '@/lib/utils/logger'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AppError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log l'erreur au service de logging centralisé
    logger.error('App section error caught', {
      error: error.message,
      stack: error.stack,
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Quelque chose s'est mal passé</h1>
          <p className="text-muted-foreground text-lg">
            Une erreur s'est produite lors du chargement de cette page.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left max-h-40 overflow-auto">
            <p className="text-sm font-mono text-destructive break-all">
              {error.message}
            </p>
            {error.stack && (
              <pre className="text-xs text-muted-foreground mt-2 overflow-auto">
                {error.stack.slice(0, 500)}
              </pre>
            )}
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-4 justify-center pt-4">
          <Button onClick={reset} size="lg">
            <RotateCcw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Tableau de bord
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground pt-4">
          Si le problème persiste, veuillez contacter le support technique.
        </p>
      </div>
    </div>
  )
}
