import { Badge } from "@/components/ui/badge";
import { Plane } from "lucide-react";

type EmployeeStatus = "present" | "on_leave" | "absent";
type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LATE"
  | "ON_LEAVE"
  | "HOLIDAY"
  | "WEEKEND";

interface StatusBadgeProps {
  status: EmployeeStatus | AttendanceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Normalize status to uppercase for comparison
  const normalizedStatus =
    typeof status === "string" ? status.toUpperCase() : status;

  switch (normalizedStatus) {
    case "PRESENT":
      return (
        <Badge variant="success" className="gap-1.5">
          <span className="size-2 rounded-full bg-white" />
          Present
        </Badge>
      );
    case "ON_LEAVE":
    case "ON LEAVE":
      return (
        <Badge variant="warning" className="gap-1.5">
          <Plane className="size-3" />
          On Leave
        </Badge>
      );
    case "ABSENT":
      return (
        <Badge variant="outline" className="gap-1.5">
          <span className="size-2 rounded-full bg-amber-400" />
          Absent
        </Badge>
      );
    case "LATE":
      return (
        <Badge variant="warning" className="gap-1.5">
          <span className="size-2 rounded-full bg-white" />
          Late
        </Badge>
      );
    case "HALF_DAY":
    case "HALF DAY":
      return (
        <Badge variant="warning" className="gap-1.5">
          Half Day
        </Badge>
      );
    case "HOLIDAY":
      return (
        <Badge variant="secondary" className="gap-1.5">
          Holiday
        </Badge>
      );
    case "WEEKEND":
      return (
        <Badge variant="secondary" className="gap-1.5">
          Weekend
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

// Helper component for employee avatar initials
interface EmployeeAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

export function EmployeeAvatar({ name, size = "md" }: EmployeeAvatarProps) {
  const sizeClasses = {
    sm: "size-8 text-sm",
    md: "size-10 text-base",
    lg: "size-12 text-lg",
  };

  const initials = name
    .split(" ")
    .map((s) => (s ? s[0] : ""))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${sizeClasses[size]} shrink-0 rounded-full bg-muted flex items-center justify-center font-medium text-muted-foreground`}
    >
      {initials}
    </div>
  );
}
