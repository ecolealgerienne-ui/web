'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
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
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const t = useTranslations('reports');

  // Map report types to translation keys
  const getReportTranslation = (reportType: string) => {
    const typeMap: Record<string, string> = {
      'herd_inventory': 'herdInventory',
      'vaccinations': 'vaccinations',
      'treatments': 'treatments',
      'movements': 'movements',
      'growth': 'growth',
      'health': 'health',
      'financial': 'financial',
    };
    return typeMap[reportType] || reportType;
  };

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
            <div>
              <Label htmlFor="period">{t('settings.periodLabel')}</Label>
              <Select
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
              >
                <option value="week">{t('periods.week')}</option>
                <option value="month">{t('periods.month')}</option>
                <option value="quarter">{t('periods.quarter')}</option>
                <option value="year">{t('periods.year')}</option>
                <option value="custom">{t('periods.custom')}</option>
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
          <h2 className="text-xl font-semibold mb-4">{t('categories.health')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {REPORT_DEFINITIONS.filter((r) => r.category === 'health').map((report) => {
              const Icon = iconMap[report.icon as keyof typeof iconMap];
              const reportKey = getReportTranslation(report.type);
              return (
                <Card key={report.id} className={getCategoryColor(report.category)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 dark:bg-blue-900 p-2">
                          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{t(`types.${reportKey}.name`)}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {t(`types.${reportKey}.description`)}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      {t('generate')}
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      {t('exportPdf')}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t('categories.production')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {REPORT_DEFINITIONS.filter((r) => r.category === 'production').map((report) => {
              const Icon = iconMap[report.icon as keyof typeof iconMap];
              const reportKey = getReportTranslation(report.type);
              return (
                <Card key={report.id} className={getCategoryColor(report.category)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 dark:bg-green-900 p-2">
                          <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{t(`types.${reportKey}.name`)}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {t(`types.${reportKey}.description`)}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      {t('generate')}
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      {t('exportPdf')}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t('categories.financial')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {REPORT_DEFINITIONS.filter((r) => ['financial', 'regulatory'].includes(r.category)).map(
              (report) => {
                const Icon = iconMap[report.icon as keyof typeof iconMap];
                const isFinancial = report.category === 'financial';
                const reportKey = getReportTranslation(report.type);
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
                            <CardTitle className="text-base">{t(`types.${reportKey}.name`)}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {t(`types.${reportKey}.description`)}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        {t('generate')}
                      </Button>
                      <Button variant="outline" className="w-full" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        {t('exportPdf')}
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
