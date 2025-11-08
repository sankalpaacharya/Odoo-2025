"use client";

import { cn } from "@/lib/utils";

interface BarData {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  data: BarData[];
  className?: string;
  barColor?: string;
}

export function SimpleBarChart({
  data,
  className,
  barColor = "bg-primary",
}: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className={cn("flex items-end gap-3 h-32", className)}>
      {data.map((item, index) => {
        const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

        return (
          <div key={index} className="flex flex-col items-center gap-2 flex-1">
            <div className="w-full flex items-end justify-center h-24">
              <div
                className={cn("w-full rounded-t-md transition-all", barColor)}
                style={{
                  height: `${height}%`,
                  minHeight: height > 0 ? "8px" : "0",
                }}
                title={`${item.label}: ${item.value}`}
              />
            </div>
            <span className="text-xs text-muted-foreground text-center">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
