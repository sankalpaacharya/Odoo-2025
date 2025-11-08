import { Badge } from "@/components/ui/badge";
import { formatTime, formatHoursToTime } from "@/lib/time-utils";
import type { WorkSessionInfo } from "../types";

interface WorkSessionsDisplayProps {
  sessions: WorkSessionInfo[];
  title: string;
}

export function WorkSessionsDisplay({
  sessions,
  title,
}: WorkSessionsDisplayProps) {
  return (
    <div className="border-t bg-muted/30 p-4">
      <div className="space-y-2">
        <h4 className="font-semibold text-sm mb-3">{title}</h4>
        <div className="space-y-2">
          {sessions.map((session, idx) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 bg-background rounded-md border"
            >
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Session {idx + 1}
                  </span>
                  {session.isActive && (
                    <Badge variant="default" className="text-xs bg-green-500">
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        Active
                      </div>
                    </Badge>
                  )}
                </div>
                <div className="flex gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Check In: </span>
                    <span className="font-medium">
                      {formatTime(session.startTime)}
                    </span>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div>
                    <span className="text-muted-foreground">Check Out: </span>
                    <span className="font-medium">
                      {session.endTime
                        ? formatTime(session.endTime)
                        : "In Progress"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {session.totalBreakTime > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Break: </span>
                    <span className="font-medium">
                      {formatHoursToTime(session.totalBreakTime)}
                    </span>
                  </div>
                )}
                <div className="text-lg font-semibold text-primary">
                  {session.durationFormatted}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
