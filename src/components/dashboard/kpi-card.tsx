import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  subtitle?: string;
  iconColor?: string;
}

export function KpiCard({
  icon: Icon,
  value,
  label,
  subtitle,
  iconColor = "text-primary",
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg bg-primary/10 ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm font-medium text-foreground">{label}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
