"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plane } from "lucide-react";
import { useEffect, useState } from "react";

type Status = "present" | "on_leave" | "absent";

function readAttendance(userId: string) {
  try {
    const raw = localStorage.getItem(`attendance:${userId}`);
    if (!raw) return null;
    return JSON.parse(raw) as { status: Status; checkInAt?: string; checkOutAt?: string };
  } catch (e) {
    return null;
  }
}

export default function EmployeeCard({ id, name, role, status: initialStatus }: { id: string; name: string; role?: string; status: Status }) {
  const [attendance, setAttendance] = useState<{ status: Status; checkInAt?: string } | null>(null);

  useEffect(() => {
    // load from localStorage if present
    const stored = readAttendance(id);
    if (stored) setAttendance({ status: stored.status, checkInAt: stored.checkInAt });

    const onStorage = (e: StorageEvent) => {
      if (e.key === `attendance:${id}`) {
        const newVal = readAttendance(id);
        if (newVal) setAttendance({ status: newVal.status, checkInAt: newVal.checkInAt });
        else setAttendance(null);
      }
    };

    const onCustom = (e: Event) => {
      // custom event may include detail with userId
      try {
        const ce = e as CustomEvent<{ userId?: string }>;
        if (!ce?.detail) return;
        if (ce.detail.userId && ce.detail.userId !== id) return;
      } catch (err) {
        // ignore
      }
      const newVal = readAttendance(id);
      if (newVal) setAttendance({ status: newVal.status, checkInAt: newVal.checkInAt });
      else setAttendance(null);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("attendance-updated", onCustom as EventListener);
    return () => window.removeEventListener("storage", onStorage);
  }, [id]);

  const statusToShow = attendance?.status ?? initialStatus;

  const statusNode = (() => {
    switch (statusToShow) {
      case "present":
        return <span title="Present" className="inline-block h-3 w-3 rounded-full bg-emerald-500" />;
      case "on_leave":
        return (
          <span title="On leave" aria-hidden>
            <Plane className="size-4" />
          </span>
        );
      case "absent":
      default:
        return <span title="Absent" className="inline-block h-3 w-3 rounded-full bg-amber-400" />;
    }
  })();

  return (
    <Card className="relative min-h-[120px]">
      {/* top-right status */}
      <div className="absolute right-3 top-3">{statusNode}</div>

      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 shrink-0 rounded-md bg-muted/40 flex items-center justify-center text-2xl text-muted-foreground">
            {name
              .split(" ")
              .map((s) => (s ? s[0] : ""))
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <CardTitle>{name}</CardTitle>
            {role && <CardDescription className="capitalize">{role.replace(/_/g, " ")}</CardDescription>}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
