'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="text-xl font-bold">École Algérienne</span>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Button onClick={() => router.push('/dashboard')}>
                Accéder au tableau de bord
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Link href="/login">
                <Button>Se connecter</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold tracking-tight">
            Gestion complète de votre élevage
          </h1>
          <p className="text-xl text-muted-foreground">
            Suivez vos animaux, gérez les vaccinations, traitements et optimisez
            votre production avec une solution moderne et intuitive.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <Button size="lg" onClick={() => router.push('/dashboard')}>
                Accéder au tableau de bord
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button size="lg">
                    Commencer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <FeatureCard
            title="Suivi des animaux"
            description="Enregistrez et suivez tous vos animaux avec leur historique complet"
            icon="🐄"
          />
          <FeatureCard
            title="Vaccinations & Traitements"
            description="Gérez les calendriers de vaccination et les traitements vétérinaires"
            icon="💉"
          />
          <FeatureCard
            title="Rapports détaillés"
            description="Analysez vos données avec des rapports complets et exportables"
            icon="📊"
          />
          <FeatureCard
            title="Gestion des lots"
            description="Organisez vos animaux par lots pour une meilleure gestion"
            icon="📦"
          />
          <FeatureCard
            title="Traçabilité complète"
            description="Assurez la traçabilité de tous vos produits et animaux"
            icon="🔍"
          />
          <FeatureCard
            title="Multi-utilisateurs"
            description="Collaborez avec votre équipe en toute sécurité"
            icon="👥"
          />
        </div>

        {/* Benefits */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Pourquoi choisir notre solution ?
          </h2>
          <div className="space-y-4">
            <BenefitItem text="Interface moderne et intuitive" />
            <BenefitItem text="Accessible depuis n'importe quel appareil" />
            <BenefitItem text="Données sécurisées et conformes" />
            <BenefitItem text="Support client réactif" />
            <BenefitItem text="Mises à jour régulières" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2024 École Algérienne. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: string
}) {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-3">
      <div className="text-4xl">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center space-x-3">
      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
      <span>{text}</span>
    </div>
  )
}
