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
import { useEffect, useState } from "react";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [attendance, setAttendance] = useState<{ status: string; checkInAt?: string; checkOutAt?: string } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // derive a stable user id for attendance keys early so hooks have a stable order
  const user = (session as any)?.user as any;
  const userId = user?.id ?? user?.email ?? user?.name ?? "unknown";

  function readAttendance(userId: string) {
    try {
      const raw = localStorage.getItem(`attendance:${userId}`);
      if (!raw) return null;
      return JSON.parse(raw) as { status: string; checkInAt?: string; checkOutAt?: string };
    } catch (e) {
      return null;
    }
  }

  function writeAttendance(userId: string, payload: { status: string; checkInAt?: string; checkOutAt?: string }) {
    try {
      localStorage.setItem(`attendance:${userId}`, JSON.stringify(payload));
      try {
        window.dispatchEvent(new CustomEvent("attendance-updated", { detail: { userId } }));
      } catch (e) {
      }
    } catch (e) {
    }
  }

  useEffect(() => {
    if (!session) {
      setAttendance(null);
      return;
    }

    // hydrate attendance state
    try {
      const stored = readAttendance(userId);
      setAttendance(stored);
    } catch (e) {
      setAttendance(null);
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === `attendance:${userId}`) {
        const stored = readAttendance(userId);
        setAttendance(stored);
      }
    };

    const onCustom = (e: Event) => {
      try {
        const ce = e as CustomEvent<{ userId?: string }>;
        if (ce?.detail?.userId && ce.detail.userId !== userId) return;
      } catch (err) {
        // ignore
      }
      const stored = readAttendance(userId);
      setAttendance(stored);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("attendance-updated", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("attendance-updated", onCustom as EventListener);
    };
  }, [userId, session]);

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session) {
    return (
      <Button variant="outline" asChild>
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Attendance toggle icon/button beside avatar */}
      <div className="relative flex items-center">
        {(() => {
          const isPresent = attendance?.status === "present";
          const isAbsent = attendance?.status === "absent";
          const tooltipText = isPresent
            ? `Checked in since ${attendance?.checkInAt ? new Date(attendance.checkInAt).toLocaleTimeString() : "--"}`
            : isAbsent
            ? attendance?.checkOutAt
              ? `Checked out at ${new Date(attendance.checkOutAt).toLocaleTimeString()}`
              : "Checked out"
            : "Not checked in";

          return (
            <div className="relative flex flex-col items-center group">
              <button
                aria-label={tooltipText}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
                onClick={() => {
                  if (isPresent) {
                    const payload = { status: "absent", checkOutAt: new Date().toISOString() };
                    writeAttendance(userId, payload);
                    setAttendance(payload);
                  } else {
                    const payload = { status: "present", checkInAt: new Date().toISOString() };
                    writeAttendance(userId, payload);
                    setAttendance(payload);
                  }
                }}
                className={`relative flex items-center justify-center h-10 w-10 rounded-full focus:outline-none transition-transform active:scale-95 ${
                  isPresent ? "" : "hover:scale-105"
                }`}>
                <span
                  aria-hidden
                  className={`absolute rounded-full transition-opacity duration-300 ${
                    isPresent ? "h-10 w-10 bg-emerald-500/20 animate-pulse" : "h-8 w-8"
                  }`}
                />

                <span
                  aria-hidden
                  className={`relative inline-block h-4 w-4 rounded-full transition-colors duration-200 ${
                    isPresent ? "bg-emerald-500 shadow-md" : isAbsent ? "bg-amber-400 shadow-sm" : "bg-gray-400"
                  }`}
                />
              </button>

              {showTooltip && isPresent && (
                <div className="absolute top-full mt-1 text-xs text-muted-foreground whitespace-nowrap">
                  Since {attendance?.checkInAt ? new Date(attendance.checkInAt).toLocaleTimeString() : "--"}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="rounded-full h-9 w-9 flex items-center justify-center">
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
            <Button variant="ghost" onClick={() => (window.location.href = "/dashboard/profile")}>
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
              }}>
              Sign Out
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
