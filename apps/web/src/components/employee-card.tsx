"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane } from "lucide-react";
import { getImageUrl } from "@/lib/image-utils";
import { useRouter } from "next/navigation";

type Status = "present" | "on_leave" | "absent";

export default function EmployeeCard({
  id,
  name,
  role,
  status,
  profileImage,
}: {
  id: string;
  name: string;
  role?: string;
  status: Status;
  profileImage?: string | null;
}) {
  const router = useRouter();
  const statusNode = (() => {
    switch (status) {
      case "present":
        return (
          <div className="flex items-center gap-1.5" title="Present">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-600">Active</span>
          </div>
        );
      case "on_leave":
        return (
          <div className="flex items-center gap-1.5" title="On leave">
            <Plane className="size-4 text-blue-500" />
            <span className="text-xs font-medium text-blue-600">On Leave</span>
          </div>
        );
      case "absent":
      default:
        return (
          <div className="flex items-center gap-1.5" title="Absent">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="text-xs font-medium text-amber-600">Absent</span>
          </div>
        );
    }
  })();

  const imageUrl = getImageUrl(profileImage);
  const initials = name
    .split(" ")
    .map((s) => (s ? s[0] : ""))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card
      className="relative min-h-[120px] hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/dashboard/employees/${id}`)}>
      {/* top-right status */}
      <div className="absolute right-3 top-3">{statusNode}</div>

      <CardHeader>
        <div className="flex items-center gap-4">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="h-14 w-14 shrink-0 rounded-md object-cover" />
          ) : (
            <div className="h-14 w-14 shrink-0 rounded-md bg-muted/40 flex items-center justify-center text-2xl text-muted-foreground font-semibold">
              {initials}
            </div>
          )}
          <div>
            <CardTitle>{name}</CardTitle>
            {role && <CardDescription className="capitalize">{role.replace(/_/g, " ")}</CardDescription>}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
