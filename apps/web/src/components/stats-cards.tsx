import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatItem {
  name: string;
  value: string | number;
  description?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  valueClassName?: string;
}

interface StatsCardsProps {
  data: StatItem[];
  className?: string;
}

export function StatsCards({ data, className }: StatsCardsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-px rounded-xl bg-border sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {data.map((stat, index) => (
        <Card
          key={stat.name}
          className={cn(
            "rounded-none border-0 shadow-none py-0 bg-card",
            index === 0 && "rounded-l-xl",
            index === data.length - 1 && "rounded-r-xl"
          )}
        >
          <CardContent className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 p-4 sm:p-6">
            <div className="font-medium text-muted-foreground">{stat.name}</div>
            {stat.change && (
              <div
                className={cn(
                  "text-xs font-medium",
                  stat.changeType === "positive" &&
                    "text-green-800 dark:text-green-400",
                  stat.changeType === "negative" &&
                    "text-red-800 dark:text-red-400",
                  stat.changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {stat.change}
              </div>
            )}
            <div
              className={cn(
                "w-full flex-none text-3xl font-medium tracking-tight",
                stat.valueClassName || "text-foreground"
              )}
            >
              {stat.value}
            </div>
            {stat.description && (
              <p className="text-xs text-muted-foreground w-full">
                {stat.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
