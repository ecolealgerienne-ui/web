'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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

  const sections = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'farm', label: 'Ferme', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', label: 'Langue & Région', icon: Globe },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'data', label: 'Données', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez vos préférences et la configuration de l&apos;application
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Sections</CardTitle>
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
                <CardTitle>Profil utilisateur</CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          )}

          {/* Ferme */}
          {activeSection === 'farm' && (
            <Card>
              <CardHeader>
                <CardTitle>Informations de la ferme</CardTitle>
                <CardDescription>
                  Configurez les détails de votre exploitation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <Label htmlFor="species">Espèces élevées</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge>Ovins</Badge>
                    <Badge>Caprins</Badge>
                    <Badge className="border border-dashed border-primary text-primary bg-transparent">
                      + Ajouter
                    </Badge>
                  </div>
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notifications</CardTitle>
                <CardDescription>
                  Choisissez comment vous souhaitez être alerté
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Vaccinations à venir</div>
                      <div className="text-sm text-muted-foreground">
                        Recevoir une alerte 7 jours avant
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Traitements en cours</div>
                      <div className="text-sm text-muted-foreground">
                        Rappel quotidien pour les traitements
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Délais d&apos;attente</div>
                      <div className="text-sm text-muted-foreground">
                        Alerte fin de délai d&apos;attente
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Naissances</div>
                      <div className="text-sm text-muted-foreground">
                        Notification à chaque naissance
                      </div>
                    </div>
                    <input type="checkbox" className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Alertes sanitaires</div>
                      <div className="text-sm text-muted-foreground">
                        Notifications urgentes pour problèmes de santé
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les préférences
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Langue & Région */}
          {activeSection === 'language' && (
            <Card>
              <CardHeader>
                <CardTitle>Langue & Région</CardTitle>
                <CardDescription>
                  Personnalisez l&apos;affichage selon vos préférences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Thème sombre
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Activer le mode sombre
                    </div>
                  </div>
                  <input type="checkbox" className="h-4 w-4" />
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les préférences
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Sécurité */}
          {activeSection === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>
                  Protégez votre compte et vos données
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="border-t pt-4 mt-6">
                  <h3 className="font-medium mb-4">Authentification à deux facteurs</h3>
                  <div className="flex items-center justify-between">
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

                <div className="border-t pt-4 mt-6">
                  <h3 className="font-medium mb-4">Sessions actives</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">Navigateur actuel</div>
                        <div className="text-muted-foreground">
                          Chrome sur Windows • Alger, Algérie
                        </div>
                      </div>
                      <Badge variant="success">Active</Badge>
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
                <CardTitle>Gestion des données</CardTitle>
                <CardDescription>
                  Sauvegarde, export et suppression de données
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Sauvegarde automatique</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Dernière sauvegarde : Aujourd&apos;hui à 03:00
                    </div>
                    <Badge variant="success">Activé</Badge>
                  </div>
                  <Button variant="outline" className="mt-2">
                    Sauvegarder maintenant
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Exporter les données</h3>
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

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2 text-destructive">Zone de danger</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Les actions suivantes sont irréversibles
                  </p>
                  <Button variant="destructive">
                    Supprimer toutes les données
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
