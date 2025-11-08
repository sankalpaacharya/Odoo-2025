export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LATE"
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
  startTime: string;
  endTime: string | null;
  isActive: boolean;
  workingHours: number | null;
  overtimeHours: number;
  totalBreakTime: number;
}

export interface AttendanceSummary {
  month: number;
  year: number;
  totalWorkingDays: number;
  totalPresentDays: number;
  totalAbsentDays: number;
  totalLeaveDays: number;
  totalHalfDays: number;
  totalLateDays: number;
  totalWorkingHours: number;
  totalOvertimeHours: number;
}

export interface MyAttendanceResponse {
  attendances: AttendanceRecord[];
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
  isActive: boolean;
}
