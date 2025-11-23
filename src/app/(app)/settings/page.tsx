'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const t = useTranslations('settings');
  const [activeSection, setActiveSection] = useState<string>('profile');

  const sections = [
    { id: 'profile', key: 'profile', label: 'Profil', icon: User },
    { id: 'farm', key: 'farm', label: 'Ferme', icon: Building2 },
    { id: 'notifications', key: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', key: 'language', label: 'Langue & Région', icon: Globe },
    { id: 'security', key: 'security', label: 'Sécurité', icon: Shield },
    { id: 'data', key: 'data', label: 'Données', icon: Database },
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
                  {t(`sections.${section.key}`)}
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
                  <Select defaultValue="manager">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">{t('profile.roles.owner')}</SelectItem>
                      <SelectItem value="manager">{t('profile.roles.manager')}</SelectItem>
                      <SelectItem value="veterinarian">{t('profile.roles.veterinarian')}</SelectItem>
                      <SelectItem value="worker">{t('profile.roles.worker')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  {t('profile.saveButton')}
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
                    <Label htmlFor="department">{t('farm.department')}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('farm.selectDepartment')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ain">Ain (01)</SelectItem>
                        <SelectItem value="aisne">Aisne (02)</SelectItem>
                        <SelectItem value="allier">Allier (03)</SelectItem>
                        <SelectItem value="alpes-de-haute-provence">Alpes-de-Haute-Provence (04)</SelectItem>
                        <SelectItem value="hautes-alpes">Hautes-Alpes (05)</SelectItem>
                        <SelectItem value="alpes-maritimes">Alpes-Maritimes (06)</SelectItem>
                        <SelectItem value="ardeche">Ardèche (07)</SelectItem>
                        <SelectItem value="ardennes">Ardennes (08)</SelectItem>
                        <SelectItem value="ariege">Ariège (09)</SelectItem>
                        <SelectItem value="aube">Aube (10)</SelectItem>
                        <SelectItem value="bouches-du-rhone">Bouches-du-Rhône (13)</SelectItem>
                        <SelectItem value="calvados">Calvados (14)</SelectItem>
                        <SelectItem value="charente">Charente (16)</SelectItem>
                        <SelectItem value="cote-dor">Côte-d'Or (21)</SelectItem>
                        <SelectItem value="dordogne">Dordogne (24)</SelectItem>
                        <SelectItem value="essonne">Essonne (91)</SelectItem>
                        <SelectItem value="gironde">Gironde (33)</SelectItem>
                        <SelectItem value="herault">Hérault (34)</SelectItem>
                        <SelectItem value="ille-et-vilaine">Ille-et-Vilaine (35)</SelectItem>
                        <SelectItem value="isere">Isère (38)</SelectItem>
                        <SelectItem value="loire">Loire (42)</SelectItem>
                        <SelectItem value="loire-atlantique">Loire-Atlantique (44)</SelectItem>
                        <SelectItem value="loiret">Loiret (45)</SelectItem>
                        <SelectItem value="maine-et-loire">Maine-et-Loire (49)</SelectItem>
                        <SelectItem value="marne">Marne (51)</SelectItem>
                        <SelectItem value="meurthe-et-moselle">Meurthe-et-Moselle (54)</SelectItem>
                        <SelectItem value="moselle">Moselle (57)</SelectItem>
                        <SelectItem value="nord">Nord (59)</SelectItem>
                        <SelectItem value="paris">Paris (75)</SelectItem>
                        <SelectItem value="pas-de-calais">Pas-de-Calais (62)</SelectItem>
                        <SelectItem value="puy-de-dome">Puy-de-Dôme (63)</SelectItem>
                        <SelectItem value="bas-rhin">Bas-Rhin (67)</SelectItem>
                        <SelectItem value="haut-rhin">Haut-Rhin (68)</SelectItem>
                        <SelectItem value="rhone">Rhône (69)</SelectItem>
                        <SelectItem value="sarthe">Sarthe (72)</SelectItem>
                        <SelectItem value="savoie">Savoie (73)</SelectItem>
                        <SelectItem value="haute-savoie">Haute-Savoie (74)</SelectItem>
                        <SelectItem value="paris">Paris (75)</SelectItem>
                        <SelectItem value="var">Var (83)</SelectItem>
                        <SelectItem value="vaucluse">Vaucluse (84)</SelectItem>
                        <SelectItem value="vienne">Vienne (86)</SelectItem>
                      </SelectContent>
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
                    <Badge>Ovins</Badge>
                    <Badge>Caprins</Badge>
                    <Badge className="border border-dashed border-primary text-primary bg-transparent">
                      {t('farm.addSpecies')}
                    </Badge>
                  </div>
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  {t('farm.saveButton')}
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
                  {t('notifications.saveButton')}
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
                  <Select defaultValue="fr">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="ar">العربية (Arabe)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">{t('language.timezone')}</Label>
                  <Select defaultValue="europe-paris">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="europe-paris">Europe/Paris (GMT+1)</SelectItem>
                      <SelectItem value="europe-london">Europe/London (GMT+0)</SelectItem>
                      <SelectItem value="america-new-york">America/New York (GMT-5)</SelectItem>
                      <SelectItem value="asia-tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateFormat">{t('language.dateFormat')}</Label>
                  <Select defaultValue="dd/mm/yyyy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">JJ/MM/AAAA</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/JJ/AAAA</SelectItem>
                      <SelectItem value="yyyy-mm-dd">AAAA-MM-JJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">{t('language.currency')}</Label>
                  <Select defaultValue="eur">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eur">Euro (€)</SelectItem>
                      <SelectItem value="usd">Dollar US ($)</SelectItem>
                      <SelectItem value="gbp">Livre Sterling (£)</SelectItem>
                      <SelectItem value="chf">Franc Suisse (CHF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      {t('language.darkTheme.title')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t('language.darkTheme.description')}
                    </div>
                  </div>
                  <input type="checkbox" className="h-4 w-4" />
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  {t('language.saveButton')}
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
                <Button>{t('security.changePasswordButton')}</Button>

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
                  <h3 className="font-medium mb-4">{t('security.activeSessions.title')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{t('security.activeSessions.currentBrowser')}</div>
                        <div className="text-muted-foreground">
                          Chrome sur Windows • Alger, Algérie
                        </div>
                      </div>
                      <Badge variant="success">{t('security.activeSessions.active')}</Badge>
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
                  <h3 className="font-medium mb-2">{t('data.autoBackup.title')}</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {t('data.autoBackup.lastBackup')}
                    </div>
                    <Badge variant="success">{t('data.autoBackup.enabled')}</Badge>
                  </div>
                  <Button variant="outline" className="mt-2">
                    {t('data.autoBackup.backupNow')}
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
