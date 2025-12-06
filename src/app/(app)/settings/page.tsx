'use client'

import { useState, useEffect } from 'react'
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
  Settings,
  PawPrint,
} from 'lucide-react'

// Import des nouveaux composants de configuration
import { MyVeterinarians } from '@/components/settings/my-veterinarians'
import { MySpecies } from '@/components/settings/my-species'
import { MyBreeds } from '@/components/settings/my-breeds'
import { MyVaccines } from '@/components/settings/my-vaccines'
import { MyMedications } from '@/components/settings/my-medications'
import { MyAlerts } from '@/components/settings/my-alerts'

// Import pour les paramètres généraux
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFarmPreferences } from '@/lib/hooks/useFarmPreferences'
import { UpdateFarmPreferenceDto } from '@/lib/types/farm-preference'
import { farmPreferencesService } from '@/lib/services/farm-preferences.service'
import { useToast } from '@/lib/hooks/useToast'

// Import pour la gestion de la ferme
import { useAuth } from '@/contexts/auth-context'
import { useFarm } from '@/lib/hooks/useFarm'
import { CountryCode, UpdateFarmDto } from '@/lib/types/farm'
import { farmsService } from '@/lib/services/farms.service'
import { handleApiError } from '@/lib/utils/api-error-handler'

type SectionId =
  | 'profile'
  | 'farm'
  | 'general-settings'
  | 'my-veterinarians'
  | 'my-species'
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
  { id: 'general-settings', labelKey: 'generalSettings', icon: Settings, group: 'my-data' },
  { id: 'my-veterinarians', labelKey: 'myVeterinarians', icon: Stethoscope, group: 'my-data' },
  { id: 'my-species', labelKey: 'mySpecies', icon: PawPrint, group: 'my-data' },
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
      case 'general-settings':
        return <GeneralSettingsSection />
      case 'my-veterinarians':
        return <MyVeterinarians />
      case 'my-species':
        return <MySpecies />
      case 'my-breeds':
        return <MyBreeds />
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
  const tc = useTranslations('common')
  const { user } = useAuth()
  const toast = useToast()

  const { farm, loading, error, refetch } = useFarm(user?.farmId)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'DZ' as CountryCode | '',
    department: '',
    commune: '',
    latitude: 0,
    longitude: 0,
    cheptelNumber: '',
    groupName: '',
    isActive: true,
  })

  // Load farm data into form
  useEffect(() => {
    if (farm) {
      setFormData({
        name: farm.name || '',
        address: farm.address || '',
        postalCode: farm.postalCode || '',
        city: farm.city || '',
        country: farm.country || 'DZ',
        department: farm.department || '',
        commune: farm.commune || '',
        latitude: farm.latitude || 0,
        longitude: farm.longitude || 0,
        cheptelNumber: farm.cheptelNumber || '',
        groupName: farm.groupName || '',
        isActive: farm.isActive ?? true,
      })
    }
  }, [farm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!farm || !user?.farmId) return

    setSaving(true)
    try {
      const updateData: UpdateFarmDto = {
        ...formData,
        country: formData.country || undefined,
        version: farm.version,
      }
      await farmsService.update(user.farmId, updateData)
      toast.success(tc('messages.success'), t('updateSuccess'))
      refetch()
    } catch (error) {
      handleApiError(error, 'update farm', toast)
    } finally {
      setSaving(false)
    }
  }

  // Si l'utilisateur n'a pas de farmId
  if (!user?.farmId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          {tc('messages.noData')}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="text-center py-12">{t('loading')}</div>
      </div>
    )
  }

  if (error || !farm) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="text-center py-12 text-destructive">{t('loadError')}</div>
      </div>
    )
  }

  const availableRegions = formData.country ? REGIONS[formData.country] || [] : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="farmName">{t('farmName')}</Label>
          <Input
            id="farmName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ferme El Baraka"
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="cheptelNumber">{t('cheptelNumber')}</Label>
            <Input
              id="cheptelNumber"
              value={formData.cheptelNumber}
              onChange={(e) => setFormData({ ...formData, cheptelNumber: e.target.value })}
              placeholder="EL-2023-001"
            />
          </div>
          <div>
            <Label htmlFor="groupName">{t('groupName')}</Label>
            <Input
              id="groupName"
              value={formData.groupName}
              onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
              placeholder=""
            />
          </div>
        </div>
        <div>
          <Label htmlFor="address">{t('address')}</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Route de Blida, Boufarik"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="postalCode">{t('postalCode')}</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              placeholder="16000"
            />
          </div>
          <div>
            <Label htmlFor="city">{t('city')}</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Boufarik"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="country">{t('country')}</Label>
            <select
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value as CountryCode })}
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
            <Label htmlFor="department">{t('department')}</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="16"
            />
          </div>
          <div>
            <Label htmlFor="commune">{t('commune')}</Label>
            <Input
              id="commune"
              value={formData.commune}
              onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
              placeholder="16004"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="latitude">{t('latitude')}</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
              placeholder="36.4754"
              dir="ltr"
            />
          </div>
          <div>
            <Label htmlFor="longitude">{t('longitude')}</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
              placeholder="2.8329"
              dir="ltr"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 rounded border-input"
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            {t('isActive')}
          </Label>
        </div>
        <Button type="submit" disabled={saving}>
          <Save className="me-2 h-4 w-4" />
          {saving ? ta('saving') : ta('save')}
        </Button>
      </form>
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

function GeneralSettingsSection() {
  const t = useTranslations('farmPreferences')
  const ta = useTranslations('settings.actions')
  const tc = useTranslations('common')
  const { success, error: showError } = useToast()
  const { preferences, loading, refetch } = useFarmPreferences()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    defaultVeterinarianId: '',
    defaultSpeciesId: '',
    defaultBreedId: '',
    weightUnit: 'kg',
    currency: 'EUR',
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    enableNotifications: true,
  })

  // Charger les préférences existantes
  useEffect(() => {
    if (preferences) {
      setFormData({
        defaultVeterinarianId: preferences.defaultVeterinarianId || '',
        defaultSpeciesId: preferences.defaultSpeciesId || '',
        defaultBreedId: preferences.defaultBreedId || '',
        weightUnit: preferences.weightUnit || 'kg',
        currency: preferences.currency || 'EUR',
        language: preferences.language || 'fr',
        dateFormat: preferences.dateFormat || 'DD/MM/YYYY',
        enableNotifications: preferences.enableNotifications ?? true,
      })
    }
  }, [preferences])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updateData: UpdateFarmPreferenceDto = { ...formData }
      await farmPreferencesService.update(updateData)
      success(t('messages.updated'))
      refetch()
    } catch (error) {
      showError(t('messages.updateError'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="text-center py-12">{tc('messages.loading')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section: Valeurs par défaut */}
        <div>
          <h3 className="font-medium mb-3">{t('sections.defaults')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="defaultVeterinarianId">{t('fields.defaultVeterinarianId')}</Label>
              <Input
                id="defaultVeterinarianId"
                value={formData.defaultVeterinarianId}
                onChange={(e) => setFormData({ ...formData, defaultVeterinarianId: e.target.value })}
                placeholder={t('placeholders.defaultVeterinarianId')}
              />
            </div>
            <div>
              <Label htmlFor="defaultSpeciesId">{t('fields.defaultSpeciesId')}</Label>
              <Select
                value={formData.defaultSpeciesId || undefined}
                onValueChange={(value) => setFormData({ ...formData, defaultSpeciesId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('placeholders.selectSpecies')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cattle">{t('species.cattle')}</SelectItem>
                  <SelectItem value="sheep">{t('species.sheep')}</SelectItem>
                  <SelectItem value="goat">{t('species.goat')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="defaultBreedId">{t('fields.defaultBreedId')}</Label>
              <Input
                id="defaultBreedId"
                value={formData.defaultBreedId}
                onChange={(e) => setFormData({ ...formData, defaultBreedId: e.target.value })}
                placeholder={t('placeholders.defaultBreedId')}
              />
            </div>
          </div>
        </div>

        {/* Section: Unités et formats */}
        <div className="border-t pt-6">
          <h3 className="font-medium mb-3">{t('sections.unitsFormats')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="weightUnit">{t('fields.weightUnit')}</Label>
              <Select
                value={formData.weightUnit}
                onValueChange={(value) => setFormData({ ...formData, weightUnit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lb">lb</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">{t('fields.currency')}</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="DZD">DZD (دج)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="language">{t('fields.language')}</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFormat">{t('fields.dateFormat')}</Label>
              <Select
                value={formData.dateFormat}
                onValueChange={(value) => setFormData({ ...formData, dateFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Section: Notifications */}
        <div className="border-t pt-6">
          <h3 className="font-medium mb-3">{t('sections.notifications')}</h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableNotifications"
              checked={formData.enableNotifications}
              onChange={(e) => setFormData({ ...formData, enableNotifications: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="enableNotifications" className="cursor-pointer">
              {t('fields.enableNotifications')}
            </Label>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t('messages.notificationsInfo')}
          </p>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={saving}>
            <Save className="me-2 h-4 w-4" />
            {saving ? ta('saving') : ta('save')}
          </Button>
        </div>
      </form>
    </div>
  )
}
