'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { theme, setTheme } = useTheme()
  const t = useTranslations('homepage')

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
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
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Auth Button */}
            {isAuthenticated ? (
              <Button onClick={() => router.push('/dashboard')}>
                {t('accessDashboard')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Link href="/login">
                <Button>{t('login')}</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('subtitle')}
          </p>

          <div className="flex justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <Button size="lg" onClick={() => router.push('/dashboard')}>
                {t('accessDashboard')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button size="lg">
                    {t('getStarted')}
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
            title={t('features.animalTracking.title')}
            description={t('features.animalTracking.description')}
            icon="🐄"
          />
          <FeatureCard
            title={t('features.vaccinations.title')}
            description={t('features.vaccinations.description')}
            icon="💉"
          />
          <FeatureCard
            title={t('features.reports.title')}
            description={t('features.reports.description')}
            icon="📊"
          />
          <FeatureCard
            title={t('features.lotManagement.title')}
            description={t('features.lotManagement.description')}
            icon="📦"
          />
          <FeatureCard
            title={t('features.traceability.title')}
            description={t('features.traceability.description')}
            icon="🔍"
          />
          <FeatureCard
            title={t('features.multiUser.title')}
            description={t('features.multiUser.description')}
            icon="👥"
          />
        </div>

        {/* Benefits */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            {t('benefits.title')}
          </h2>
          <div className="space-y-4">
            <BenefitItem text={t('benefits.modernInterface')} />
            <BenefitItem text={t('benefits.accessAnywhere')} />
            <BenefitItem text={t('benefits.secureData')} />
            <BenefitItem text={t('benefits.reactiveSupport')} />
            <BenefitItem text={t('benefits.regularUpdates')} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            {t('footer.copyright')}
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
