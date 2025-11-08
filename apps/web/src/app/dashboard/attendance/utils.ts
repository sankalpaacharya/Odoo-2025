import type { AttendanceStatus } from "./types";

export function getStatusColor(
  status: AttendanceStatus
): "success" | "destructive" | "warning" | "secondary" | "default" {
  switch (status) {
    case "PRESENT":
      return "success";
    case "ABSENT":
      return "destructive";
    case "HALF_DAY":
    case "LATE":
      return "warning";
    case "ON_LEAVE":
      return "secondary";
    case "HOLIDAY":
    case "WEEKEND":
      return "default";
    default:
      return "default";
  }
}

export function formatStatus(status: AttendanceStatus): string {
  return status.replace(/_/g, " ");
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(timeString: string | null): string {
  if (!timeString) return "-";
  const date = new Date(timeString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
