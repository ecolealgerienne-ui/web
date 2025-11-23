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
  const t = useTranslations('settings');
  const [activeSection, setActiveSection] = useState<string>('profile');

  const sections = [
    { id: 'profile', key: 'profile', icon: User },
    { id: 'farm', key: 'farm', icon: Building2 },
    { id: 'notifications', key: 'notifications', icon: Bell },
    { id: 'language', key: 'language', icon: Globe },
    { id: 'security', key: 'security', icon: Shield },
    { id: 'data', key: 'data', icon: Database },
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
                <CardTitle>Profil utilisateur</CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
