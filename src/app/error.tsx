'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { logger } from '@/lib/utils/logger'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log l'erreur au service de logging centralisé
    logger.error('Global error caught', {
      error: error.message,
      stack: error.stack,
      digest: error.digest,
    })
  }, [error])

  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-6">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Erreur inattendue</h1>
              <p className="text-muted-foreground">
                Une erreur s'est produite. Nous en avons été informés et travaillons
                à résoudre le problème.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left">
                <p className="text-sm font-mono text-destructive break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button onClick={reset} variant="default">
                Réessayer
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="outline"
              >
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
