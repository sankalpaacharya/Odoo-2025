import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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
        <Card
          key={stat.name}
          className={cn(
            "group relative overflow-hidden w-full transition-all duration-200  border-zinc-200/80 dark:border-zinc-800/80",
            stat.changeType === "positive" &&
              "hover:border-green-500/20 dark:hover:border-green-500/20",
            stat.changeType === "negative" &&
              "hover:border-red-500/20 dark:hover:border-red-500/20"
          )}
        >
          {/* Subtle gradient background based on change type */}
          <div
            className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              stat.changeType === "positive" &&
                "bg-linear-to-br from-green-50/50 to-transparent dark:from-green-950/10",
              stat.changeType === "negative" &&
                "bg-linear-to-br from-red-50/50 to-transparent dark:from-red-950/10",
              stat.changeType === "neutral" &&
                "bg-linear-to-br from-blue-50/30 to-transparent dark:from-blue-950/5"
            )}
          />

          <CardContent className="relative">
            <div className="flex flex-col gap-3">
              {/* Header with title and change indicator */}
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground/90 dark:text-muted-foreground truncate tracking-wide uppercase">
                  {stat.name}
                </p>
                {stat.change && (
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold shrink-0 transition-colors",
                      stat.changeType === "positive" &&
                        "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
                      stat.changeType === "negative" &&
                        "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
                      stat.changeType === "neutral" &&
                        "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400"
                    )}
                  >
                    {stat.changeType === "positive" && (
                      <TrendingUp className="h-3 w-3" />
                    )}
                    {stat.changeType === "negative" && (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stat.changeType === "neutral" && (
                      <Minus className="h-3 w-3" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                )}
              </div>

              {/* Main value */}
              <div
                className={cn(
                  "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight",
                  stat.valueClassName ||
                    "text-foreground bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text"
                )}
              >
                {stat.value}
              </div>

              {/* Description */}
              {stat.description && (
                <p className="text-xs sm:text-sm text-muted-foreground/80 dark:text-muted-foreground/70 line-clamp-2 leading-relaxed">
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
