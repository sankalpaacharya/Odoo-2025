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
