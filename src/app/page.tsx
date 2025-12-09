'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Check,
  ChevronRight,
  Moon,
  Sun,
  Beef,
  Syringe,
  BarChart3,
  Package,
  Shield,
  Users,
  Zap,
  Clock,
  Globe,
  Smartphone,
  Star,
  Play,
  Menu,
  X,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { theme, setTheme } = useTheme()
  const t = useTranslations('homepage')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 animate-pulse" />
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-background/80 backdrop-blur-lg border-b shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Beef className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-none">AniTra</span>
                <span className="text-[10px] text-muted-foreground leading-none">by École Algérienne</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.features')}
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.howItWorks')}
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.pricing')}
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hidden sm:flex"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {isAuthenticated ? (
                <Button onClick={() => router.push('/dashboard')} className="hidden sm:flex">
                  {t('nav.dashboard')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost">{t('nav.login')}</Button>
                  </Link>
                  <Link href="/login">
                    <Button>{t('nav.getStarted')}</Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <nav className="flex flex-col gap-4">
                <a href="#features" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.features')}
                </a>
                <a href="#how-it-works" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.howItWorks')}
                </a>
                <a href="#pricing" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.pricing')}
                </a>
                <Link href="/login">
                  <Button className="w-full">{t('nav.getStarted')}</Button>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-400/20 to-emerald-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
              <Zap className="h-4 w-4 mr-2 text-emerald-500" />
              {t('hero.badge')}
            </Badge>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
              <br />
              {t('hero.titleRest')}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              {t('hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                  {t('hero.cta.primary')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8">
                <Play className="mr-2 h-5 w-5" />
                {t('hero.cta.secondary')}
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-emerald-500" />
                {t('hero.trust.noCard')}
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-emerald-500" />
                {t('hero.trust.freeTrial')}
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-emerald-500" />
                {t('hero.trust.cancel')}
              </div>
            </div>
          </div>

          {/* App Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative mx-auto max-w-5xl">
              <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
                <div className="h-8 bg-muted flex items-center gap-2 px-4">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="aspect-[16/9] bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                  <div className="text-center p-8">
                    <BarChart3 className="h-16 w-16 mx-auto text-emerald-500 mb-4" />
                    <p className="text-lg font-medium">{t('hero.preview.title')}</p>
                    <p className="text-sm text-muted-foreground">{t('hero.preview.subtitle')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="10,000+" label={t('stats.animals')} />
            <StatCard value="500+" label={t('stats.farms')} />
            <StatCard value="99.9%" label={t('stats.uptime')} />
            <StatCard value="4.9/5" label={t('stats.rating')} icon={<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">{t('features.badge')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('features.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('features.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Beef className="h-6 w-6" />}
              title={t('features.items.tracking.title')}
              description={t('features.items.tracking.description')}
              color="emerald"
            />
            <FeatureCard
              icon={<Syringe className="h-6 w-6" />}
              title={t('features.items.health.title')}
              description={t('features.items.health.description')}
              color="blue"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title={t('features.items.reports.title')}
              description={t('features.items.reports.description')}
              color="purple"
            />
            <FeatureCard
              icon={<Package className="h-6 w-6" />}
              title={t('features.items.lots.title')}
              description={t('features.items.lots.description')}
              color="orange"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title={t('features.items.compliance.title')}
              description={t('features.items.compliance.description')}
              color="red"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title={t('features.items.team.title')}
              description={t('features.items.team.description')}
              color="cyan"
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">{t('howItWorks.badge')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('howItWorks.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('howItWorks.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              number="1"
              title={t('howItWorks.steps.signup.title')}
              description={t('howItWorks.steps.signup.description')}
              icon={<Globe className="h-6 w-6" />}
            />
            <StepCard
              number="2"
              title={t('howItWorks.steps.configure.title')}
              description={t('howItWorks.steps.configure.description')}
              icon={<Smartphone className="h-6 w-6" />}
            />
            <StepCard
              number="3"
              title={t('howItWorks.steps.manage.title')}
              description={t('howItWorks.steps.manage.description')}
              icon={<Zap className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">{t('testimonials.badge')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('testimonials.title')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <TestimonialCard
              quote={t('testimonials.items.farmer1.quote')}
              author={t('testimonials.items.farmer1.author')}
              role={t('testimonials.items.farmer1.role')}
            />
            <TestimonialCard
              quote={t('testimonials.items.farmer2.quote')}
              author={t('testimonials.items.farmer2.author')}
              role={t('testimonials.items.farmer2.role')}
            />
            <TestimonialCard
              quote={t('testimonials.items.farmer3.quote')}
              author={t('testimonials.items.farmer3.author')}
              role={t('testimonials.items.farmer3.role')}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">{t('pricing.badge')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('pricing.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('pricing.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard
              name={t('pricing.plans.starter.name')}
              price={t('pricing.plans.starter.price')}
              period={t('pricing.plans.starter.period')}
              description={t('pricing.plans.starter.description')}
              features={[
                t('pricing.plans.starter.features.animals'),
                t('pricing.plans.starter.features.users'),
                t('pricing.plans.starter.features.reports'),
                t('pricing.plans.starter.features.support'),
              ]}
            />
            <PricingCard
              name={t('pricing.plans.professional.name')}
              price={t('pricing.plans.professional.price')}
              period={t('pricing.plans.professional.period')}
              description={t('pricing.plans.professional.description')}
              features={[
                t('pricing.plans.professional.features.animals'),
                t('pricing.plans.professional.features.users'),
                t('pricing.plans.professional.features.reports'),
                t('pricing.plans.professional.features.support'),
                t('pricing.plans.professional.features.api'),
              ]}
              popular
            />
            <PricingCard
              name={t('pricing.plans.enterprise.name')}
              price={t('pricing.plans.enterprise.price')}
              period={t('pricing.plans.enterprise.period')}
              description={t('pricing.plans.enterprise.description')}
              features={[
                t('pricing.plans.enterprise.features.animals'),
                t('pricing.plans.enterprise.features.users'),
                t('pricing.plans.enterprise.features.reports'),
                t('pricing.plans.enterprise.features.support'),
                t('pricing.plans.enterprise.features.api'),
                t('pricing.plans.enterprise.features.sla'),
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative px-8 py-16 md:py-24 text-center text-white">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('cta.title')}</h2>
              <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
                {t('cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 bg-white text-emerald-700 hover:bg-white/90">
                    {t('cta.button')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Beef className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold">AniTra</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{t('footer.description')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.product.title')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">{t('footer.product.features')}</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">{t('footer.product.pricing')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.product.demo')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.company.title')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.company.about')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.company.contact')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.company.blog')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.legal.title')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.legal.privacy')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.legal.terms')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.legal.cookies')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">{t('footer.copyright')}</p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </Button>
              <Button variant="ghost" size="icon">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </Button>
              <Button variant="ghost" size="icon">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Component: Stat Card
function StatCard({ value, label, icon }: { value: string; label: string; icon?: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        {icon}
        <span className="text-3xl md:text-4xl font-bold">{value}</span>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

// Component: Feature Card
function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: 'emerald' | 'blue' | 'purple' | 'orange' | 'red' | 'cyan'
}) {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', colorClasses[color])}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

// Component: Step Card
function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="text-center">
      <div className="relative mx-auto w-16 h-16 mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl rotate-6" />
        <div className="absolute inset-0 bg-background rounded-2xl flex items-center justify-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {number}
          </span>
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

// Component: Testimonial Card
function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          ))}
        </div>
        <p className="text-sm mb-4 italic">&ldquo;{quote}&rdquo;</p>
        <div>
          <p className="font-semibold text-sm">{author}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Component: Pricing Card
function PricingCard({
  name,
  price,
  period,
  description,
  features,
  popular,
}: {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  popular?: boolean
}) {
  return (
    <Card className={cn('relative', popular && 'border-emerald-500 border-2 shadow-lg')}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600">Populaire</Badge>
        </div>
      )}
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground">/{period}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <ul className="space-y-3 mb-6">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        <Link href="/login">
          <Button className={cn('w-full', popular && 'bg-gradient-to-r from-emerald-600 to-teal-600')}>
            Commencer
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
