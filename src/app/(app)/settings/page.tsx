'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import {
  User,
  Building2,
  Globe,
  Shield,
  Database,
  Moon,
  Save,
  Stethoscope,
  Dna,
  Syringe,
  Pill,
  Bell,
} from 'lucide-react'

// Import des nouveaux composants de configuration
import { MyVeterinarians } from '@/components/settings/my-veterinarians'
import { MyBreeds } from '@/components/settings/my-breeds'
import { MyVaccines } from '@/components/settings/my-vaccines'
import { MyMedications } from '@/components/settings/my-medications'
import { MyAlerts } from '@/components/settings/my-alerts'

type SectionId =
  | 'profile'
  | 'farm'
  | 'my-veterinarians'
  | 'my-breeds'
  | 'my-vaccines'
  | 'my-medications'
  | 'my-alerts'
  | 'language'
  | 'security'
  | 'data'

type GroupId = 'general' | 'my-data' | 'preferences' | 'system'

interface Section {
  id: SectionId
  labelKey: string
  icon: typeof User
  group: GroupId
}

const sections: Section[] = [
  // Général
  { id: 'profile', labelKey: 'profile', icon: User, group: 'general' },
  { id: 'farm', labelKey: 'farm', icon: Building2, group: 'general' },

  // Mes Données
  { id: 'my-veterinarians', labelKey: 'myVeterinarians', icon: Stethoscope, group: 'my-data' },
  { id: 'my-breeds', labelKey: 'myBreeds', icon: Dna, group: 'my-data' },
  { id: 'my-vaccines', labelKey: 'myVaccines', icon: Syringe, group: 'my-data' },
  { id: 'my-medications', labelKey: 'myMedications', icon: Pill, group: 'my-data' },
  { id: 'my-alerts', labelKey: 'myAlerts', icon: Bell, group: 'my-data' },

  // Préférences
  { id: 'language', labelKey: 'language', icon: Globe, group: 'preferences' },

  // Système
  { id: 'security', labelKey: 'security', icon: Shield, group: 'system' },
  { id: 'data', labelKey: 'data', icon: Database, group: 'system' },
]

const groupKeys: Record<GroupId, string> = {
  general: 'general',
  'my-data': 'myData',
  preferences: 'preferences',
  system: 'system',
}

// Données de référence pour les pays et régions
const REGIONS: Record<string, { code: string; name: string }[]> = {
  DZ: [
    { code: 'ALG', name: 'Alger' },
    { code: 'ORA', name: 'Oran' },
    { code: 'CON', name: 'Constantine' },
    { code: 'BLI', name: 'Blida' },
    { code: 'SET', name: 'Sétif' },
    { code: 'BAT', name: 'Batna' },
    { code: 'TIP', name: 'Tipaza' },
    { code: 'TIZ', name: 'Tizi Ouzou' },
    { code: 'BEJ', name: 'Béjaïa' },
  ],
  TN: [
    { code: 'TUN', name: 'Tunis' },
    { code: 'SFA', name: 'Sfax' },
    { code: 'SOU', name: 'Sousse' },
  ],
  MA: [
    { code: 'CAS', name: 'Casablanca' },
    { code: 'RAB', name: 'Rabat' },
    { code: 'MAR', name: 'Marrakech' },
  ],
  FR: [
    { code: 'IDF', name: 'Île-de-France' },
    { code: 'ARA', name: 'Auvergne-Rhône-Alpes' },
    { code: 'NAQ', name: 'Nouvelle-Aquitaine' },
  ],
}

// Noms des pays pour l'affichage
const COUNTRY_NAMES: Record<string, string> = {
  DZ: 'Algérie',
  TN: 'Tunisie',
  MA: 'Maroc',
  FR: 'France',
}

export default function SettingsPage() {
  const t = useTranslations('settings')
  const [activeSection, setActiveSection] = useState<SectionId>('profile')

  // Grouper les sections
  const groupedSections = sections.reduce(
    (acc, section) => {
      if (!acc[section.group]) {
        acc[section.group] = []
      }
      acc[section.group].push(section)
      return acc
    },
    {} as Record<string, Section[]>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />
      case 'farm':
        return <FarmSection />
      case 'my-veterinarians':
        return <MyVeterinarians />
      case 'my-breeds':
        return <MyBreeds farmSpecies={['ovine', 'caprine', 'bovine']} />
      case 'my-vaccines':
        return <MyVaccines />
      case 'my-medications':
        return <MyMedications />
      case 'my-alerts':
        return <MyAlerts />
      case 'language':
        return <LanguageSection />
      case 'security':
        return <SecuritySection />
      case 'data':
        return <DataSection />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Navigation */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-4 space-y-6">
            {Object.entries(groupedSections).map(([group, items]) => (
              <div key={group}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                  {t(`groups.${groupKeys[group as GroupId]}`)}
                </p>
                <div className="space-y-1">
                  {items.map((section) => {
                    const Icon = section.icon
                    const isActive = activeSection === section.id
                    return (
                      <Button
                        key={section.id}
                        variant={isActive ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveSection(section.id)}
                      >
                        <Icon className="me-2 h-4 w-4" />
                        {t(`sections.${section.labelKey}`)}
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contenu */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">{renderContent()}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ==================== Sections ====================

function ProfileSection() {
  const t = useTranslations('settings.profile')
  const ta = useTranslations('settings.actions')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="firstName">{t('firstName')}</Label>
            <Input id="firstName" placeholder="Mohamed" />
          </div>
          <div>
            <Label htmlFor="lastName">{t('lastName')}</Label>
            <Input id="lastName" placeholder="Amrani" />
          </div>
        </div>
        <div>
          <Label htmlFor="email">{t('email')}</Label>
          <Input id="email" type="email" placeholder="m.amrani@example.com" />
        </div>
        <div>
          <Label htmlFor="phone">{t('phone')}</Label>
          <Input id="phone" type="tel" placeholder="+213 555 123 456" dir="ltr" />
        </div>
        <div>
          <Label htmlFor="role">{t('role')}</Label>
          <select
            id="role"
            defaultValue="manager"
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t('selectRole')}</option>
            <option value="owner">{t('roles.owner')}</option>
            <option value="manager">{t('roles.manager')}</option>
            <option value="veterinarian">{t('roles.veterinarian')}</option>
            <option value="worker">{t('roles.worker')}</option>
          </select>
        </div>
        <Button>
          <Save className="me-2 h-4 w-4" />
          {ta('save')}
        </Button>
      </div>
    </div>
  )
}

function FarmSection() {
  const t = useTranslations('settings.farm')
  const ta = useTranslations('settings.actions')
  const [selectedCountry, setSelectedCountry] = useState('DZ')

  const availableRegions = selectedCountry ? REGIONS[selectedCountry] || [] : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="farmName">{t('farmName')}</Label>
          <Input id="farmName" placeholder="Ferme El Baraka" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="farmId">{t('farmId')}</Label>
            <Input id="farmId" placeholder="EL-2023-001" />
          </div>
          <div>
            <Label htmlFor="surface">{t('surface')}</Label>
            <Input id="surface" type="number" placeholder="50" dir="ltr" />
          </div>
        </div>
        <div>
          <Label htmlFor="address">{t('address')}</Label>
          <Input id="address" placeholder="Route de Blida, Boufarik" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="country">{t('country')}</Label>
            <select
              id="country"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">{t('selectCountry')}</option>
              {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="region">{t('region')}</Label>
            <select
              id="region"
              disabled={!selectedCountry}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              <option value="">{t('selectRegion')}</option>
              {availableRegions.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="commune">{t('commune')}</Label>
          <Input id="commune" placeholder="Boufarik" />
        </div>
        <div>
          <Label>{t('species')}</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge>Ovins</Badge>
            <Badge>Caprins</Badge>
            <Badge className="border border-dashed border-primary text-primary bg-transparent cursor-pointer hover:bg-primary/10">
              {t('addSpecies')}
            </Badge>
          </div>
        </div>
        <Button>
          <Save className="me-2 h-4 w-4" />
          {ta('save')}
        </Button>
      </div>
    </div>
  )
}

function LanguageSection() {
  const t = useTranslations('settings.language')
  const ta = useTranslations('settings.actions')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="language">{t('interfaceLanguage')}</Label>
          <select
            id="language"
            defaultValue="fr"
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="fr">{t('languages.fr')}</option>
            <option value="ar">{t('languages.ar')}</option>
            <option value="en">{t('languages.en')}</option>
          </select>
        </div>
        <div>
          <Label htmlFor="timezone">{t('timezone')}</Label>
          <select
            id="timezone"
            defaultValue="africa-algiers"
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="africa-algiers">{t('timezones.africaAlgiers')}</option>
            <option value="europe-paris">{t('timezones.europeParis')}</option>
            <option value="utc">{t('timezones.utc')}</option>
          </select>
        </div>
        <div>
          <Label htmlFor="dateFormat">{t('dateFormat')}</Label>
          <select
            id="dateFormat"
            defaultValue="dd/mm/yyyy"
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="dd/mm/yyyy">{t('dateFormats.ddmmyyyy')}</option>
            <option value="mm/dd/yyyy">{t('dateFormats.mmddyyyy')}</option>
            <option value="yyyy-mm-dd">{t('dateFormats.yyyymmdd')}</option>
          </select>
        </div>
        <div>
          <Label htmlFor="currency">{t('currency')}</Label>
          <select
            id="currency"
            defaultValue="dzd"
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="dzd">{t('currencies.dzd')}</option>
            <option value="eur">{t('currencies.eur')}</option>
            <option value="usd">{t('currencies.usd')}</option>
            <option value="mad">{t('currencies.mad')}</option>
            <option value="tnd">{t('currencies.tnd')}</option>
          </select>
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="font-medium flex items-center gap-2">
              <Moon className="h-4 w-4" />
              {t('darkTheme')}
            </div>
            <div className="text-sm text-muted-foreground">{t('enableDarkMode')}</div>
          </div>
          <input type="checkbox" className="h-4 w-4" />
        </div>
        <Button>
          <Save className="me-2 h-4 w-4" />
          {ta('savePreferences')}
        </Button>
      </div>
    </div>
  )
}

function SecuritySection() {
  const t = useTranslations('settings.security')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* Changement de mot de passe */}
        <div className="space-y-4">
          <h3 className="font-medium">{t('changePassword')}</h3>
          <div>
            <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div>
            <Label htmlFor="newPassword">{t('newPassword')}</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <Button>{t('changePassword')}</Button>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">{t('twoFactor')}</h3>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">2FA</div>
              <div className="text-sm text-muted-foreground">{t('twoFactorDescription')}</div>
            </div>
            <Badge variant="warning">{t('disabled')}</Badge>
          </div>
          <Button variant="outline" className="mt-4">
            {t('enable2FA')}
          </Button>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">{t('activeSessions')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">{t('currentBrowser')}</div>
                <div className="text-muted-foreground">Chrome sur Windows • Alger, Algérie</div>
              </div>
              <Badge variant="success">{t('active')}</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DataSection() {
  const t = useTranslations('settings.data')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">{t('autoBackup')}</h3>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">
              {t('lastBackup')}: Aujourd&apos;hui à 03:00
            </div>
            <Badge variant="success">{t('enabled')}</Badge>
          </div>
          <Button variant="outline" className="mt-3">
            {t('backupNow')}
          </Button>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-3">{t('exportData')}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t('exportDescription')}</p>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Database className="me-2 h-4 w-4" />
              {t('exportExcel')}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Database className="me-2 h-4 w-4" />
              {t('exportJson')}
            </Button>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-2 text-destructive">{t('dangerZone')}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t('dangerDescription')}</p>
          <Button
            variant="outline"
            className="text-destructive border-destructive hover:bg-destructive/10"
          >
            {t('deleteAllData')}
          </Button>
        </div>
      </div>
    </div>
  )
}
