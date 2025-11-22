'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/lib/i18n';
import {
  User,
  Building2,
  Bell,
  Globe,
  Shield,
  Database,
  Moon,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string>('profile');
  const t = useTranslations('settings');

  const sections = [
    { id: 'profile', label: t('sections.profile'), icon: User },
    { id: 'farm', label: t('sections.farm'), icon: Building2 },
    { id: 'notifications', label: t('sections.notifications'), icon: Bell },
    { id: 'language', label: t('sections.language'), icon: Globe },
    { id: 'security', label: t('sections.security'), icon: Shield },
    { id: 'data', label: t('sections.data'), icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">{t('sections.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {section.label}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Contenu */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profil */}
          {activeSection === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.title')}</CardTitle>
                <CardDescription>
                  {t('profile.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">{t('profile.firstName')}</Label>
                    <Input id="firstName" placeholder="Mohamed" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t('profile.lastName')}</Label>
                    <Input id="lastName" placeholder="Amrani" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">{t('profile.email')}</Label>
                  <Input id="email" type="email" placeholder="m.amrani@example.com" />
                </div>
                <div>
                  <Label htmlFor="phone">{t('profile.phone')}</Label>
                  <Input id="phone" type="tel" placeholder="+213 555 123 456" />
                </div>
                <div>
                  <Label htmlFor="role">{t('profile.role')}</Label>
                  <Select id="role" defaultValue="manager">
                    <option value="owner">{t('profile.roles.owner')}</option>
                    <option value="manager">{t('profile.roles.manager')}</option>
                    <option value="veterinarian">{t('profile.roles.veterinarian')}</option>
                    <option value="worker">{t('profile.roles.worker')}</option>
                  </Select>
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  {t('profile.saveChanges')}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Ferme */}
          {activeSection === 'farm' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('farm.title')}</CardTitle>
                <CardDescription>
                  {t('farm.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="farmName">{t('farm.farmName')}</Label>
                  <Input id="farmName" placeholder="Ferme El Baraka" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="farmId">{t('farm.farmId')}</Label>
                    <Input id="farmId" placeholder="EL-2023-001" />
                  </div>
                  <div>
                    <Label htmlFor="surface">{t('farm.surface')}</Label>
                    <Input id="surface" type="number" placeholder="50" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">{t('farm.address')}</Label>
                  <Input id="address" placeholder="Route de Blida, Boufarik" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="wilaya">{t('farm.wilaya')}</Label>
                    <Select id="wilaya">
                      <option value="">{t('farm.wilayas.select')}</option>
                      <option value="alger">{t('farm.wilayas.alger')}</option>
                      <option value="oran">{t('farm.wilayas.oran')}</option>
                      <option value="constantine">{t('farm.wilayas.constantine')}</option>
                      <option value="blida">{t('farm.wilayas.blida')}</option>
                      <option value="setif">{t('farm.wilayas.setif')}</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="commune">{t('farm.commune')}</Label>
                    <Input id="commune" placeholder="Boufarik" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="species">{t('farm.species')}</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge>{t('farm.speciesTypes.sheep')}</Badge>
                    <Badge>{t('farm.speciesTypes.goat')}</Badge>
                    <Badge className="border border-dashed border-primary text-primary bg-transparent">
                      {t('farm.addSpecies')}
                    </Badge>
                  </div>
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  {t('profile.saveChanges')}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('notifications.title')}</CardTitle>
                <CardDescription>
                  {t('notifications.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t('notifications.vaccinations.title')}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('notifications.vaccinations.description')}
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t('notifications.treatments.title')}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('notifications.treatments.description')}
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t('notifications.waitingPeriods.title')}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('notifications.waitingPeriods.description')}
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t('notifications.births.title')}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('notifications.births.description')}
                      </div>
                    </div>
                    <input type="checkbox" className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t('notifications.healthAlerts.title')}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('notifications.healthAlerts.description')}
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  {t('notifications.savePreferences')}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Langue & Région */}
          {activeSection === 'language' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('language.title')}</CardTitle>
                <CardDescription>
                  {t('language.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="language">{t('language.interfaceLanguage')}</Label>
                  <Select id="language" defaultValue="fr">
                    <option value="fr">{t('language.languages.fr')}</option>
                    <option value="ar">{t('language.languages.ar')}</option>
                    <option value="en">{t('language.languages.en')}</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">{t('language.timezone')}</Label>
                  <Select id="timezone" defaultValue="africa-algiers">
                    <option value="africa-algiers">{t('language.timezones.africaAlgiers')}</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateFormat">{t('language.dateFormat')}</Label>
                  <Select id="dateFormat" defaultValue="dd/mm/yyyy">
                    <option value="dd/mm/yyyy">{t('language.dateFormats.ddmmyyyy')}</option>
                    <option value="mm/dd/yyyy">{t('language.dateFormats.mmddyyyy')}</option>
                    <option value="yyyy-mm-dd">{t('language.dateFormats.yyyymmdd')}</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">{t('language.currency')}</Label>
                  <Select id="currency" defaultValue="dzd">
                    <option value="dzd">{t('language.currencies.dzd')}</option>
                    <option value="eur">{t('language.currencies.eur')}</option>
                    <option value="usd">{t('language.currencies.usd')}</option>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      {t('language.darkMode.title')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t('language.darkMode.description')}
                    </div>
                  </div>
                  <input type="checkbox" className="h-4 w-4" />
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  {t('notifications.savePreferences')}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Sécurité */}
          {activeSection === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('security.title')}</CardTitle>
                <CardDescription>
                  {t('security.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">{t('security.currentPassword')}</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">{t('security.newPassword')}</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">{t('security.confirmPassword')}</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>{t('security.changePassword')}</Button>

                <div className="border-t pt-4 mt-6">
                  <h3 className="font-medium mb-4">{t('security.twoFactor.title')}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t('security.twoFactor.label')}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('security.twoFactor.description')}
                      </div>
                    </div>
                    <Badge variant="warning">{t('security.twoFactor.disabled')}</Badge>
                  </div>
                  <Button variant="outline" className="mt-4">
                    {t('security.twoFactor.enable')}
                  </Button>
                </div>

                <div className="border-t pt-4 mt-6">
                  <h3 className="font-medium mb-4">{t('security.sessions.title')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{t('security.sessions.current')}</div>
                        <div className="text-muted-foreground">
                          Chrome sur Windows • Alger, Algérie
                        </div>
                      </div>
                      <Badge variant="success">{t('security.sessions.active')}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Données */}
          {activeSection === 'data' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('data.title')}</CardTitle>
                <CardDescription>
                  {t('data.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">{t('data.backup.title')}</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {t('data.backup.lastBackup')}
                    </div>
                    <Badge variant="success">{t('data.backup.enabled')}</Badge>
                  </div>
                  <Button variant="outline" className="mt-2">
                    {t('data.backup.backupNow')}
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">{t('data.export.title')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('data.export.description')}
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="mr-2 h-4 w-4" />
                      {t('data.export.excel')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="mr-2 h-4 w-4" />
                      {t('data.export.json')}
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2 text-destructive">{t('data.dangerZone.title')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('data.dangerZone.description')}
                  </p>
                  <Button variant="destructive">
                    {t('data.dangerZone.deleteAll')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
