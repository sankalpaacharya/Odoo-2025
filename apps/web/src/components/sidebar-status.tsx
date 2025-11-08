"use client";

import { useState } from "react";
import {
  useActiveSession,
  useStartSession,
  useStopSession,
} from "@/app/dashboard/attendance/session-hooks";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export function SidebarStatus() {
  const { data: activeSessionData, isLoading: isLoadingSession } =
    useActiveSession();
  const startSessionMutation = useStartSession();
  const stopSessionMutation = useStopSession();

  const handleCheckInOut = async () => {
    if (startSessionMutation.isPending || stopSessionMutation.isPending) return;

    const hasActiveSession = activeSessionData?.hasActiveSession;

    if (hasActiveSession) {
      try {
        await stopSessionMutation.mutateAsync();
        toast.success("Checked out successfully");
      } catch (error: any) {
        toast.error(error?.message || "Failed to check out");
      }
    } else {
      try {
        await startSessionMutation.mutateAsync();
        toast.success("Checked in successfully");
      } catch (error: any) {
        toast.error(error?.message || "Failed to check in");
      }
    }
  };

  const hasActiveSession = activeSessionData?.hasActiveSession;
  const sessionStartTime = activeSessionData?.session?.startTime;
  const isCheckedIn = hasActiveSession && sessionStartTime;

  // Calculate today's hours
  const getTodaysHours = () => {
    if (!isCheckedIn || !sessionStartTime) return "0h 0m";

    const start = new Date(sessionStartTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const tooltipText = isCheckedIn
    ? `Checked in since ${new Date(sessionStartTime).toLocaleTimeString()}`
    : "Click to check in";

  if (isLoadingSession) {
    return null;
  }

  return (
    <div className="px-2">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={handleCheckInOut}
              disabled={
                startSessionMutation.isPending || stopSessionMutation.isPending
              }
              className="w-full h-auto p-2 flex items-center justify-between hover:bg-sidebar-accent transition-colors disabled:opacity-50 px-3 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Status Indicator */}
                <div className="relative flex items-center justify-center">
                  <span
                    className={`absolute rounded-full transition-opacity duration-300 ${
                      isCheckedIn
                        ? "h-6 w-6 bg-emerald-500/20 animate-pulse"
                        : "h-5 w-5"
                    }`}
                  />
                  <span
                    className={`relative inline-block h-3 w-3 rounded-full transition-colors duration-200 ${
                      isCheckedIn ? "bg-emerald-500 shadow-md" : "bg-gray-400"
                    }`}
                  />
                </div>

                {/* Status Text - Hidden when collapsed */}
                <span className="text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                  {isCheckedIn ? "Online" : "Offline"}
                </span>
              </div>

              {/* Today's Hours - Hidden when collapsed */}
              <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{getTodaysHours()}</span>
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
