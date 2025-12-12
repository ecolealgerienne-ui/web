'use client';

import {
  UserPlus,
  UserMinus,
  Scale,
  Syringe,
  RefreshCw,
  FileText,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations, useCommonTranslations } from '@/lib/i18n';
import { LotEvent, LotEventType } from '@/lib/services/dashboard.service';
import { cn } from '@/lib/utils';

interface LotTimelineProps {
  events: LotEvent[];
  loading?: boolean;
}

// Event type configuration
const eventConfig: Record<LotEventType, { icon: typeof UserPlus; color: string; bgColor: string }> = {
  animal_joined: {
    icon: UserPlus,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900',
  },
  animal_left: {
    icon: UserMinus,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900',
  },
  weighing: {
    icon: Scale,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
  },
  treatment: {
    icon: Syringe,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900',
  },
  status_change: {
    icon: RefreshCw,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900',
  },
  note: {
    icon: FileText,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
  },
};

export function LotTimeline({ events, loading }: LotTimelineProps) {
  const t = useTranslations('lots');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('detail.timeline.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-muted rounded" />
                  <div className="h-3 w-2/3 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('detail.timeline.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('detail.timeline.noEvents')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('detail.timeline.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          {events.map((event, index) => {
            const config = eventConfig[event.type] || eventConfig.note;
            const Icon = config.icon;

            return (
              <div key={event.id} className="relative flex gap-4 pl-1">
                {/* Icon */}
                <div className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full',
                  config.bgColor
                )}>
                  <Icon className={cn('h-4 w-4', config.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {t(`detail.timeline.eventTypes.${event.type}`)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Event details */}
                  <div className="text-sm text-muted-foreground">
                    {event.type === 'animal_joined' && event.details.count && (
                      <span>{event.details.count} {t('detail.timeline.animalsAdded')}</span>
                    )}
                    {event.type === 'animal_left' && event.details.count && (
                      <span>{event.details.count} {t('detail.timeline.animalsRemoved')}</span>
                    )}
                    {event.type === 'weighing' && (
                      <span>
                        {event.details.animalCount} {t('detail.timeline.animalsWeighed')} · {t('detail.kpis.avgWeight')}: {event.details.avgWeight?.toFixed(1)} kg
                      </span>
                    )}
                    {event.type === 'treatment' && (
                      <span>
                        {event.details.productName}
                        {event.details.veterinarian && ` · ${event.details.veterinarian}`}
                      </span>
                    )}
                    {event.type === 'status_change' && (
                      <span>
                        {t(`status.${event.details.fromStatus}`)} → {t(`status.${event.details.toStatus}`)}
                        {event.details.reason && ` · ${event.details.reason}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
