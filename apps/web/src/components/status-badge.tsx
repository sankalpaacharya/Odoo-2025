import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EmployeeStatus = "present" | "on_leave" | "absent";
type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "LATE" | "ON_LEAVE" | "HOLIDAY" | "WEEKEND";
type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

interface StatusBadgeProps {
  status: EmployeeStatus | AttendanceStatus | LeaveStatus;
}

const STATUS_STYLES = {
  PRESENT: "bg-green-500/10 text-green-700 dark:text-green-400 border-transparent hover:bg-green-500/20",
  ON_LEAVE: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-transparent hover:bg-amber-500/20",
  ABSENT: "bg-red-500/10 text-red-700 dark:text-red-400 border-transparent hover:bg-red-500/20",
  LATE: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-transparent hover:bg-orange-500/20",
  HALF_DAY: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-transparent hover:bg-blue-500/20",
  HOLIDAY: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-transparent hover:bg-purple-500/20",
  WEEKEND: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-transparent hover:bg-slate-500/20",
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-transparent hover:bg-amber-500/20",
  APPROVED: "bg-green-500/10 text-green-700 dark:text-green-400 border-transparent hover:bg-green-500/20",
  REJECTED: "bg-red-500/10 text-red-700 dark:text-red-400 border-transparent hover:bg-red-500/20",
  CANCELLED: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-transparent hover:bg-slate-500/20",
} as const;

const STATUS_LABELS = {
  PRESENT: "Present",
  ON_LEAVE: "On Leave",
  ABSENT: "Absent",
  LATE: "Late",
  HALF_DAY: "Half Day",
  HOLIDAY: "Holiday",
  WEEKEND: "Weekend",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
} as const;

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase().replace(/ /g, "_") as keyof typeof STATUS_STYLES;
  const style = STATUS_STYLES[normalizedStatus] || "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-transparent hover:bg-gray-500/20";
  const label = STATUS_LABELS[normalizedStatus] || status;

  return <Badge className={cn(style)}>{label}</Badge>;
}

import { getImageUrl } from "@/lib/image-utils";

// Helper component for employee avatar initials or image
interface EmployeeAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  profileImage?: string | null;
}

export function EmployeeAvatar({ name, size = "md", profileImage }: EmployeeAvatarProps) {
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

  const imageUrl = getImageUrl(profileImage);

  if (imageUrl) {
    return <img src={imageUrl} alt={name} className={`${sizeClasses[size]} shrink-0 rounded-full object-cover`} />;
  }

  return (
    <div className={`${sizeClasses[size]} shrink-0 rounded-full bg-muted flex items-center justify-center font-light text-muted-foreground`}>
      {initials}
    </div>
  );
}
