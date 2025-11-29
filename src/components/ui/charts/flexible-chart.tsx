"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "@/lib/i18n";

export type ChartType = "line" | "bar" | "area";
export type ChartPeriod = "6months" | "12months" | "1year" | "2years" | "all";

export interface ChartDataPoint {
  [key: string]: string | number;
}

interface FlexibleChartProps {
  title: string;
  data: ChartDataPoint[];
  dataKey: string;
  xAxisKey: string;
  defaultPeriod?: ChartPeriod;
  defaultChartType?: ChartType;
  showPeriodSelector?: boolean;
  showTypeSelector?: boolean;
  onPeriodChange?: (period: ChartPeriod) => void;
  height?: number;
  color?: string;
}

export function FlexibleChart({
  title,
  data,
  dataKey,
  xAxisKey,
  defaultPeriod = "6months",
  defaultChartType = "line",
  showPeriodSelector = true,
  showTypeSelector = true,
  onPeriodChange,
  height = 300,
  color = "hsl(var(--primary))",
}: FlexibleChartProps) {
  const t = useTranslations("chart");
  const [period, setPeriod] = useState<ChartPeriod>(defaultPeriod);
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);

  const handlePeriodChange = (newPeriod: ChartPeriod) => {
    setPeriod(newPeriod);
    onPeriodChange?.(newPeriod);
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 10, left: 0, bottom: 5 },
    };

    const commonAxisProps = {
      className: "text-sm",
      tick: { fill: "hsl(var(--muted-foreground))" },
    };

    const tooltipProps = {
      contentStyle: {
        backgroundColor: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "0.5rem",
      },
    };

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            <Tooltip {...tooltipProps} />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            <Tooltip {...tooltipProps} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case "line":
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            <Tooltip {...tooltipProps} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex flex-wrap gap-2">
            {showPeriodSelector && (
              <Select value={period} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t("labels.selectPeriod")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">
                    {t("periods.6months")}
                  </SelectItem>
                  <SelectItem value="12months">
                    {t("periods.12months")}
                  </SelectItem>
                  <SelectItem value="1year">{t("periods.1year")}</SelectItem>
                  <SelectItem value="2years">{t("periods.2years")}</SelectItem>
                  <SelectItem value="all">{t("periods.all")}</SelectItem>
                </SelectContent>
              </Select>
            )}
            {showTypeSelector && (
              <Select
                value={chartType}
                onValueChange={(value) => setChartType(value as ChartType)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={t("labels.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">{t("types.line")}</SelectItem>
                  <SelectItem value="bar">{t("types.bar")}</SelectItem>
                  <SelectItem value="area">{t("types.area")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
