import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

interface Alert {
  id: number;
  type: "destructive" | "warning" | "success" | "default";
  count: number;
  label: string;
}

interface AlertsCardProps {
  alerts: Alert[];
}

export function AlertsCard({ alerts }: AlertsCardProps) {
  const t = useTranslations('dashboard');
  const totalAlerts = alerts.reduce((sum, alert) => sum + alert.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t('alerts.title')} ({totalAlerts})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between py-2"
            >
              <span className="text-sm">{alert.label}</span>
              <Badge variant={alert.type}>{alert.count}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
