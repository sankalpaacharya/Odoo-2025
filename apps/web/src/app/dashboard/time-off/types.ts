export type LeaveType = "PAID_TIME_OFF" | "SICK_LEAVE" | "UNPAID_LEAVE";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveBalance {
  id: string;
  leaveType: LeaveType;
  allocated: number;
  used: number;
  remaining: number;
}

export interface Leave {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  department?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachment?: string | null;
  status: LeaveStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface CreateLeaveRequest {
  employeeId?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  attachment?: File;
}

export interface ApproveLeaveRequest {
  note?: string;
}

export interface RejectLeaveRequest {
  rejectionReason: string;
}

export interface LeavesResponse {
  leaves: Leave[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
