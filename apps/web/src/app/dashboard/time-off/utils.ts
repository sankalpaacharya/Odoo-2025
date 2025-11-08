import type { LeaveType, LeaveStatus } from "./types";

export function formatLeaveType(type: LeaveType): string {
  const typeMap: Record<LeaveType, string> = {
    PAID_TIME_OFF: "Paid Time Off",
    SICK_LEAVE: "Sick Leave",
    UNPAID_LEAVE: "Unpaid Leave",
  };
  return typeMap[type] || type;
}

export function formatLeaveStatus(status: LeaveStatus): string {
  const statusMap: Record<LeaveStatus, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
  };
  return statusMap[status] || status;
}

export function getStatusColor(
  status: LeaveStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "APPROVED":
      return "default";
    case "PENDING":
      return "secondary";
    case "REJECTED":
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
