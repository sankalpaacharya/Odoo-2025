import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiClientFormData } from "@/lib/api-client";
import type {
  Leave,
  CreateLeaveRequest,
  ApproveLeaveRequest,
  RejectLeaveRequest,
  LeavesResponse,
} from "./types";

export interface ActiveEmployee {
  id: string;
  employeeCode: string;
  name: string;
  department: string;
  designation: string;
}

export function useActiveEmployees() {
  return useQuery({
    queryKey: ["employees", "active-list"],
    queryFn: () => apiClient<ActiveEmployee[]>("/api/employees/active-list"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyLeaves(params?: {
  status?: string;
  leaveType?: string;
  year?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.leaveType) queryParams.append("leaveType", params.leaveType);
  if (params?.year) queryParams.append("year", params.year.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/leaves/my-leaves?${queryString}`
    : "/api/leaves/my-leaves";

  return useQuery({
    queryKey: ["leaves", "my-leaves", params],
    queryFn: () => apiClient<Leave[]>(endpoint),
  });
}

export function useAllLeaves(params?: {
  status?: string;
  leaveType?: string;
  department?: string;
  year?: number;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.leaveType) queryParams.append("leaveType", params.leaveType);
  if (params?.department) queryParams.append("department", params.department);
  if (params?.year) queryParams.append("year", params.year.toString());
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/leaves/all?${queryString}`
    : "/api/leaves/all";

  return useQuery({
    queryKey: ["leaves", "all", params],
    queryFn: () => apiClient<LeavesResponse>(endpoint),
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveRequest) => {
      const formData = new FormData();

      if (data.employeeId) formData.append("employeeId", data.employeeId);
      formData.append("leaveType", data.leaveType);
      formData.append("startDate", data.startDate);
      formData.append("endDate", data.endDate);
      formData.append("reason", data.reason);
      if (data.attachment) formData.append("attachment", data.attachment);

      return apiClientFormData<Leave>("/api/leaves/request", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leaveId,
      data,
    }: {
      leaveId: string;
      data?: ApproveLeaveRequest;
    }) =>
      apiClient<Leave>(`/api/leaves/${leaveId}/approve`, {
        method: "PATCH",
        body: JSON.stringify(data || {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leaveId,
      data,
    }: {
      leaveId: string;
      data: RejectLeaveRequest;
    }) =>
      apiClient<Leave>(`/api/leaves/${leaveId}/reject`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leaveId: string) =>
      apiClient<{ message: string }>(`/api/leaves/${leaveId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
  });
}
