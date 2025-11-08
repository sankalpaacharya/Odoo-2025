export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "ON_LEAVE"
  | "HOLIDAY"
  | "WEEKEND";

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number;
  overtimeHours: number;
  status: AttendanceStatus;
  notes?: string | null;
  sessions?: WorkSessionInfo[];
}

export interface WorkSessionInfo {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  isActive: boolean;
  workingHours: number;
  overtimeHours: number;
  totalBreakTime: number;
  durationMinutes: number;
  durationFormatted: string;
}

export interface AttendanceSummary {
  month: number;
  year: number;
  totalWorkingDays: number;
  totalPresentDays: number;
  totalAbsentDays: number;
  totalLeaveDays: number;
  totalWorkingHours: number;
  totalOvertimeHours: number;
}

export interface LeaveInfo {
  id: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string | null;
}

export interface MyAttendanceResponse {
  sessions: WorkSessionInfo[];
  leaves: LeaveInfo[];
  summary: AttendanceSummary;
}

export interface EmployeeAttendance {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number;
  status: AttendanceStatus;
  isCurrentlyActive: boolean;
  activeSessionStart: string | null;
  sessions?: WorkSessionInfo[];
}
