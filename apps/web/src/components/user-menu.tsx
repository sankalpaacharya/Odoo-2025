"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  useActiveSession,
  useStartSession,
  useStopSession,
} from "@/app/dashboard/attendance/session-hooks";
import { toast } from "sonner";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [showTooltip, setShowTooltip] = useState(false);

  const { data: activeSessionData, isLoading: isLoadingSession } =
    useActiveSession();
  const startSessionMutation = useStartSession();
  const stopSessionMutation = useStopSession();

  const user = (session as any)?.user as any;

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

  if (isPending || isLoadingSession) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session) {
    return (
      <Button variant="outline" asChild>
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  const hasActiveSession = activeSessionData?.hasActiveSession;
  const sessionStartTime = activeSessionData?.session?.startTime;
  const isCheckedIn = hasActiveSession && sessionStartTime;

  const tooltipText = isCheckedIn
    ? `Checked in since ${new Date(sessionStartTime).toLocaleTimeString()}`
    : "Not checked in";

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        <div className="relative flex flex-col items-center group">
          <button
            aria-label={tooltipText}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            onClick={handleCheckInOut}
            disabled={
              startSessionMutation.isPending || stopSessionMutation.isPending
            }
            className={`relative flex items-center justify-center h-10 w-10 rounded-full focus:outline-none transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isCheckedIn ? "" : "hover:scale-105"
            }`}
          >
            <span
              aria-hidden
              className={`absolute rounded-full transition-opacity duration-300 ${
                isCheckedIn
                  ? "h-10 w-10 bg-emerald-500/20 animate-pulse"
                  : "h-8 w-8"
              }`}
            />

            <span
              aria-hidden
              className={`relative inline-block h-4 w-4 rounded-full transition-colors duration-200 ${
                isCheckedIn ? "bg-emerald-500 shadow-md" : "bg-gray-400"
              }`}
            />
          </button>

          {showTooltip && isCheckedIn && (
            <div className="absolute top-full mt-1 text-xs text-muted-foreground whitespace-nowrap">
              Since {new Date(sessionStartTime).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="rounded-full h-9 w-9 flex items-center justify-center"
          >
            {user.name
              .split(" ")
              .map((s: string) => (s ? s[0] : ""))
              .slice(0, 2)
              .join("")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-card">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/dashboard/profile")}
            >
              My Profile
            </Button>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/");
                    },
                  },
                });
              }}
            >
              Sign Out
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
