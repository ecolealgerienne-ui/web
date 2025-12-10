'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { REPORT_DEFINITIONS, ReportPeriod } from '@/lib/types/report';
import { useTranslations } from '@/lib/i18n';
import {
  Beef,
  Syringe,
  Pill,
  ArrowLeftRight,
  TrendingUp,
  Activity,
  DollarSign,
  Download,
  FileText,
  Calendar,
} from 'lucide-react';

const iconMap = {
  Beef,
  Syringe,
  Pill,
  ArrowLeftRight,
  TrendingUp,
  Activity,
  DollarSign,
};

export default function ReportsPage() {
  const t = useTranslations('reports');
  const [period, setPeriod] = useState<ReportPeriod>('month');

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'health':
        return 'border-blue-200 dark:border-blue-800';
      case 'production':
        return 'border-green-200 dark:border-green-800';
      case 'financial':
        return 'border-orange-200 dark:border-orange-800';
      case 'regulatory':
        return 'border-purple-200 dark:border-purple-800';
      default:
        return 'border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Période globale */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.title')}</CardTitle>
          <CardDescription>
            {t('settings.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="period">{t('period.label')}</Label>
              <Select
                value={period}
                onValueChange={(value) => setPeriod(value as ReportPeriod)}
              >
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">{t('period.week')}</SelectItem>
                  <SelectItem value="month">{t('period.month')}</SelectItem>
                  <SelectItem value="quarter">{t('period.quarter')}</SelectItem>
                  <SelectItem value="year">{t('period.year')}</SelectItem>
                  <SelectItem value="custom">{t('settings.customPeriod')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                {t('settings.applyToAll')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rapports par catégorie */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('categoryTitles.health')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {REPORT_DEFINITIONS.filter((r) => r.category === 'health').map((report) => {
              const Icon = iconMap[report.icon as keyof typeof iconMap];
              return (
                <Card key={report.id} className={getCategoryColor(report.category)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 dark:bg-blue-900 p-2">
                          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{t(`definitions.${report.id}.name`)}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {t(`definitions.${report.id}.description`)}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      {t('buttons.generate')}
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      {t('buttons.exportPdf')}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t('categoryTitles.production')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {REPORT_DEFINITIONS.filter((r) => r.category === 'production').map((report) => {
              const Icon = iconMap[report.icon as keyof typeof iconMap];
              return (
                <Card key={report.id} className={getCategoryColor(report.category)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 dark:bg-green-900 p-2">
                          <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{t(`definitions.${report.id}.name`)}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {t(`definitions.${report.id}.description`)}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      {t('buttons.generate')}
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      {t('buttons.exportPdf')}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t('categoryTitles.financial')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {REPORT_DEFINITIONS.filter((r) => ['financial', 'regulatory'].includes(r.category)).map(
              (report) => {
                const Icon = iconMap[report.icon as keyof typeof iconMap];
                const isFinancial = report.category === 'financial';
                return (
                  <Card key={report.id} className={getCategoryColor(report.category)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-lg p-2 ${
                              isFinancial
                                ? 'bg-orange-100 dark:bg-orange-900'
                                : 'bg-purple-100 dark:bg-purple-900'
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                isFinancial
                                  ? 'text-orange-600 dark:text-orange-400'
                                  : 'text-purple-600 dark:text-purple-400'
                              }`}
                            />
                          </div>
                          <div>
                            <CardTitle className="text-base">{t(`definitions.${report.id}.name`)}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {t(`definitions.${report.id}.description`)}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        {t('buttons.generate')}
                      </Button>
                      <Button variant="outline" className="w-full" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        {t('buttons.exportPdf')}
                      </Button>
                    </CardContent>
                  </Card>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
