"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

export interface SparklineDataPoint {
  value: number;
  label?: string;
}

interface SparklineProps {
  data: SparklineDataPoint[];
  color?: string;
  height?: number;
  width?: number | string;
  showTooltip?: boolean;
  strokeWidth?: number;
  className?: string;
}

export function Sparkline({
  data,
  color = "currentColor",
  height = 40,
  width = "100%",
  showTooltip = true,
  strokeWidth = 2,
  className,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return null;
  }

  return (
    <div className={className} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const point = payload[0].payload as SparklineDataPoint;
                  return (
                    <div className="rounded-md bg-popover px-2 py-1 text-xs shadow-md border">
                      {point.label && <div className="text-muted-foreground">{point.label}</div>}
                      <div className="font-medium">{point.value.toFixed(1)}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={strokeWidth}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
