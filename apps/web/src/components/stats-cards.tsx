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
        "grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full",
        className
      )}
    >
      {data.map((stat) => (
        <Card key={stat.name} className="overflow-hidden w-full">
          <CardContent className="">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  {stat.name}
                </p>
                {stat.change && (
                  <span
                    className={cn(
                      "text-[10px] sm:text-xs font-medium shrink-0",
                      stat.changeType === "positive" &&
                        "text-green-800 dark:text-green-400",
                      stat.changeType === "negative" &&
                        "text-red-800 dark:text-red-400",
                      stat.changeType === "neutral" && "text-muted-foreground"
                    )}
                  >
                    {stat.change}
                  </span>
                )}
              </div>
              <div
                className={cn(
                  "text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight",
                  stat.valueClassName || "text-foreground"
                )}
              >
                {stat.value}
              </div>
              {stat.description && (
                <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                  {stat.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
