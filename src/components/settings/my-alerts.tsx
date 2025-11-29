'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Heart, BarChart3, FileText } from 'lucide-react'
import { useToast } from '@/lib/hooks/useToast'
import { useTranslations } from 'next-intl'
import { AlertSettings, defaultAlertSettings } from '@/lib/types/farm-preferences'

type AlertGroupId = 'health' | 'production' | 'admin'

interface AlertGroup {
  id: AlertGroupId
  icon: React.ReactNode
  alerts: (keyof AlertSettings)[]
}

const ALERT_GROUPS: AlertGroup[] = [
  {
    id: 'health',
    icon: <Heart className="w-5 h-5 text-red-500" />,
    alerts: ['vaccinationReminders', 'treatmentOverdue', 'withdrawalPeriod'],
  },
  {
    id: 'production',
    icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
    alerts: ['missingWeights'],
  },
  {
    id: 'admin',
    icon: <FileText className="w-5 h-5 text-amber-500" />,
    alerts: ['pendingMovements', 'expiredDocuments'],
  },
]

interface MyAlertsProps {
  initialSettings?: AlertSettings
  onSave?: (settings: AlertSettings) => Promise<void>
}

export function MyAlerts({ initialSettings = defaultAlertSettings, onSave }: MyAlertsProps) {
  const t = useTranslations('settings.alerts')
  const ta = useTranslations('settings.actions')
  const toast = useToast()

  const [settings, setSettings] = useState<AlertSettings>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleToggle = (key: keyof AlertSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (onSave) {
        await onSave(settings)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500))
        console.log('Saved alert settings:', settings)
      }
      setHasChanges(false)
      toast.success(t('saved'), t('savedMessage'))
    } catch {
      toast.error(
        t('saveFailed'),
        t('saveFailedMessage'),
        {
          label: t('retry'),
          onClick: handleSave,
        }
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="space-y-6">
        {ALERT_GROUPS.map((group) => (
          <div key={group.id} className="border rounded-lg overflow-hidden">
            {/* En-tête du groupe */}
            <div className="flex items-center gap-3 p-4 bg-muted/30 border-b">
              {group.icon}
              <h3 className="font-semibold">{t(`groups.${group.id}`)}</h3>
            </div>

            {/* Alertes du groupe */}
            <div className="divide-y">
              {group.alerts.map((alertKey) => (
                <div
                  key={alertKey}
                  className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex-1 pe-4">
                    <p className="font-medium text-sm">{t(`alertTypes.${alertKey}.label`)}</p>
                    <p className="text-sm text-muted-foreground">{t(`alertTypes.${alertKey}.description`)}</p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings[alertKey]}
                    onClick={() => handleToggle(alertKey)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                      ${settings[alertKey] ? 'bg-primary' : 'bg-muted'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                        ${settings[alertKey] ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin me-2" />
              {ta('saving')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 me-2" />
              {ta('savePreferences')}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
