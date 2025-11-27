'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
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

interface Section {
  id: SectionId
  label: string
  icon: typeof User
  group: 'general' | 'my-data' | 'preferences' | 'system'
}

const sections: Section[] = [
  // Général
  { id: 'profile', label: 'Profil', icon: User, group: 'general' },
  { id: 'farm', label: 'Ferme', icon: Building2, group: 'general' },

  // Mes Données (nouveau groupe)
  { id: 'my-veterinarians', label: 'Mes Vétérinaires', icon: Stethoscope, group: 'my-data' },
  { id: 'my-breeds', label: 'Mes Races', icon: Dna, group: 'my-data' },
  { id: 'my-vaccines', label: 'Mes Vaccins', icon: Syringe, group: 'my-data' },
  { id: 'my-medications', label: 'Ma Pharmacie', icon: Pill, group: 'my-data' },
  { id: 'my-alerts', label: 'Mes Alertes', icon: Bell, group: 'my-data' },

  // Préférences
  { id: 'language', label: 'Langue & Région', icon: Globe, group: 'preferences' },

  // Système
  { id: 'security', label: 'Sécurité', icon: Shield, group: 'system' },
  { id: 'data', label: 'Données', icon: Database, group: 'system' },
]

const groupLabels: Record<string, string> = {
  general: 'Général',
  'my-data': 'Mes Données',
  preferences: 'Préférences',
  system: 'Système',
}

export default function SettingsPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez vos préférences et la configuration de votre exploitation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Navigation */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-4 space-y-6">
            {Object.entries(groupedSections).map(([group, items]) => (
              <div key={group}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                  {groupLabels[group]}
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
                        <Icon className="mr-2 h-4 w-4" />
                        {section.label}
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

// ==================== Sections existantes ====================

function ProfileSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Profil utilisateur</h2>
        <p className="text-sm text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" placeholder="Mohamed" />
          </div>
          <div>
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" placeholder="Amrani" />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m.amrani@example.com" />
        </div>
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" type="tel" placeholder="+213 555 123 456" />
        </div>
        <div>
          <Label htmlFor="role">Rôle</Label>
          <Select id="role" defaultValue="manager">
            <option value="owner">Propriétaire</option>
            <option value="manager">Gestionnaire</option>
            <option value="veterinarian">Vétérinaire</option>
            <option value="worker">Employé</option>
          </Select>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  )
}

function FarmSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Informations de la ferme</h2>
        <p className="text-sm text-muted-foreground">
          Configurez les détails de votre exploitation
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="farmName">Nom de la ferme</Label>
          <Input id="farmName" placeholder="Ferme El Baraka" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="farmId">N° d&apos;identification</Label>
            <Input id="farmId" placeholder="EL-2023-001" />
          </div>
          <div>
            <Label htmlFor="surface">Surface (hectares)</Label>
            <Input id="surface" type="number" placeholder="50" />
          </div>
        </div>
        <div>
          <Label htmlFor="address">Adresse</Label>
          <Input id="address" placeholder="Route de Blida, Boufarik" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="wilaya">Wilaya</Label>
            <Select id="wilaya">
              <option value="">Sélectionner...</option>
              <option value="alger">Alger</option>
              <option value="oran">Oran</option>
              <option value="constantine">Constantine</option>
              <option value="blida">Blida</option>
              <option value="setif">Sétif</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="commune">Commune</Label>
            <Input id="commune" placeholder="Boufarik" />
          </div>
        </div>
        <div>
          <Label>Espèces élevées</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge>Ovins</Badge>
            <Badge>Caprins</Badge>
            <Badge className="border border-dashed border-primary text-primary bg-transparent cursor-pointer hover:bg-primary/10">
              + Ajouter
            </Badge>
          </div>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  )
}

function LanguageSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Langue & Région</h2>
        <p className="text-sm text-muted-foreground">
          Personnalisez l&apos;affichage selon vos préférences
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="language">Langue de l&apos;interface</Label>
          <Select id="language" defaultValue="fr">
            <option value="fr">Français</option>
            <option value="ar">العربية (Arabe)</option>
            <option value="en">English</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="timezone">Fuseau horaire</Label>
          <Select id="timezone" defaultValue="africa-algiers">
            <option value="africa-algiers">Afrique/Alger (GMT+1)</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="dateFormat">Format de date</Label>
          <Select id="dateFormat" defaultValue="dd/mm/yyyy">
            <option value="dd/mm/yyyy">JJ/MM/AAAA</option>
            <option value="mm/dd/yyyy">MM/JJ/AAAA</option>
            <option value="yyyy-mm-dd">AAAA-MM-JJ</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="currency">Devise</Label>
          <Select id="currency" defaultValue="dzd">
            <option value="dzd">Dinar Algérien (DA)</option>
            <option value="eur">Euro (€)</option>
            <option value="usd">Dollar US ($)</option>
          </Select>
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="font-medium flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Thème sombre
            </div>
            <div className="text-sm text-muted-foreground">Activer le mode sombre</div>
          </div>
          <input type="checkbox" className="h-4 w-4" />
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Enregistrer les préférences
        </Button>
      </div>
    </div>
  )
}

function SecuritySection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Sécurité</h2>
        <p className="text-sm text-muted-foreground">Protégez votre compte et vos données</p>
      </div>

      <div className="space-y-6">
        {/* Changement de mot de passe */}
        <div className="space-y-4">
          <h3 className="font-medium">Changer le mot de passe</h3>
          <div>
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div>
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <Button>Changer le mot de passe</Button>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Authentification à deux facteurs</h3>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">2FA</div>
              <div className="text-sm text-muted-foreground">
                Ajouter une couche de sécurité supplémentaire
              </div>
            </div>
            <Badge variant="warning">Désactivé</Badge>
          </div>
          <Button variant="outline" className="mt-4">
            Activer 2FA
          </Button>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Sessions actives</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Navigateur actuel</div>
                <div className="text-muted-foreground">Chrome sur Windows • Alger, Algérie</div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DataSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Gestion des données</h2>
        <p className="text-sm text-muted-foreground">
          Sauvegarde, export et suppression de données
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Sauvegarde automatique</h3>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">
              Dernière sauvegarde : Aujourd&apos;hui à 03:00
            </div>
            <Badge variant="success">Activé</Badge>
          </div>
          <Button variant="outline" className="mt-3">
            Sauvegarder maintenant
          </Button>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-3">Exporter les données</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Téléchargez une copie complète de toutes vos données
          </p>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Database className="mr-2 h-4 w-4" />
              Exporter en Excel
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Database className="mr-2 h-4 w-4" />
              Exporter en JSON
            </Button>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-2 text-destructive">Zone de danger</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Les actions suivantes sont irréversibles
          </p>
          <Button
            variant="outline"
            className="text-destructive border-destructive hover:bg-destructive/10"
          >
            Supprimer toutes les données
          </Button>
        </div>
      </div>
    </div>
  )
}
