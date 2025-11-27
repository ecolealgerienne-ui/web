'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Heart, BarChart3, FileText } from 'lucide-react'
import { AlertSettings, defaultAlertSettings } from '@/lib/types/farm-preferences'

interface AlertGroup {
  id: string
  title: string
  icon: React.ReactNode
  alerts: {
    key: keyof AlertSettings
    label: string
    description: string
  }[]
}

const ALERT_GROUPS: AlertGroup[] = [
  {
    id: 'health',
    title: 'Santé',
    icon: <Heart className="w-5 h-5 text-red-500" />,
    alerts: [
      {
        key: 'vaccinationReminders',
        label: 'Rappels vaccinations',
        description: 'Recevoir une alerte 7 jours avant les vaccinations prévues',
      },
      {
        key: 'treatmentOverdue',
        label: 'Traitements en retard',
        description: 'Alerte pour les traitements non terminés',
      },
      {
        key: 'withdrawalPeriod',
        label: 'Fin de délai d\'attente',
        description: 'Notification quand le délai d\'attente est terminé',
      },
    ],
  },
  {
    id: 'production',
    title: 'Production',
    icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
    alerts: [
      {
        key: 'missingWeights',
        label: 'Pesées manquantes',
        description: 'Animaux non pesés depuis plus de 30 jours',
      },
    ],
  },
  {
    id: 'admin',
    title: 'Administratif',
    icon: <FileText className="w-5 h-5 text-amber-500" />,
    alerts: [
      {
        key: 'pendingMovements',
        label: 'Mouvements à déclarer',
        description: 'Entrées et sorties d\'animaux à déclarer',
      },
      {
        key: 'expiredDocuments',
        label: 'Documents expirés',
        description: 'Certificats et documents à renouveler',
      },
    ],
  },
]

interface MyAlertsProps {
  initialSettings?: AlertSettings
  onSave?: (settings: AlertSettings) => Promise<void>
}

export function MyAlerts({ initialSettings = defaultAlertSettings, onSave }: MyAlertsProps) {
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
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Mes Alertes</h2>
        <p className="text-sm text-muted-foreground">
          Configurez les alertes que vous souhaitez recevoir.
          Elles apparaîtront sur votre tableau de bord.
        </p>
      </div>

      <div className="space-y-6">
        {ALERT_GROUPS.map((group) => (
          <div key={group.id} className="border rounded-lg overflow-hidden">
            {/* En-tête du groupe */}
            <div className="flex items-center gap-3 p-4 bg-muted/30 border-b">
              {group.icon}
              <h3 className="font-semibold">{group.title}</h3>
            </div>

            {/* Alertes du groupe */}
            <div className="divide-y">
              {group.alerts.map((alert) => (
                <div
                  key={alert.key}
                  className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <p className="font-medium text-sm">{alert.label}</p>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings[alert.key]}
                    onClick={() => handleToggle(alert.key)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                      ${settings[alert.key] ? 'bg-primary' : 'bg-muted'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                        ${settings[alert.key] ? 'translate-x-6' : 'translate-x-1'}
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
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer les préférences
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
