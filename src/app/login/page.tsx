'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { authConfig } from '@/lib/auth/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const redirectTo = searchParams.get('redirect') || authConfig.defaultRedirectAfterLogin

  // Si déjà authentifié, rediriger
  if (isAuthenticated) {
    router.push(redirectTo)
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      router.push(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted px-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
        </div>

        {/* Login Card */}
        <div className="rounded-lg border bg-card p-8 shadow-lg">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-primary" />
            <h1 className="text-2xl font-bold">École Algérienne</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {authConfig.enabled
                ? 'Connectez-vous avec Keycloak'
                : 'Mode développement - Connexion simplifiée'}
            </p>
          </div>

          {!authConfig.enabled && (
            <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <div className="text-sm">
                <strong>Mode DEV:</strong> La sécurité est désactivée. Cliquez sur
                "Se connecter" pour accéder à l'application.
              </div>
            </Alert>
          )}

          {authConfig.enabled ? (
            // Mode PROD: Bouton Keycloak
            <div className="space-y-4">
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  // TODO: Rediriger vers Keycloak
                  window.location.href = `${authConfig.keycloak.url}/realms/${authConfig.keycloak.realm}/protocol/openid-connect/auth?client_id=${authConfig.keycloak.clientId}&redirect_uri=${window.location.origin}/auth/callback&response_type=code&scope=openid`
                }}
              >
                Se connecter avec Keycloak
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Vous serez redirigé vers la page de connexion sécurisée
              </p>
            </div>
          ) : (
            // Mode DEV: Formulaire simple
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="bg-destructive/10 text-destructive border-destructive">
                  {error}
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="dev@ecole-algerienne.dz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                En mode développement, les identifiants ne sont pas vérifiés
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>© 2024 École Algérienne. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  )
}
