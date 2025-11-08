import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ProfileData, UpdateProfilePayload, UpdateSalaryPayload, SalaryComponent } from "@/types/profile";

// Fetch complete profile data
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiClient<ProfileData>("/api/profile"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Update profile information
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) =>
      apiClient<{ success: boolean; data: any }>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate both profile and employee queries
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["employee", "me"] });
    },
  });
}

// Update salary information (Admin/HR/Payroll only)
export function useUpdateSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId?: string; data: UpdateSalaryPayload }) => {
      const url = employeeId ? `/api/profile/salary?employeeId=${employeeId}` : "/api/profile/salary";

      return apiClient<{ success: boolean; data: any }>(url, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// Fetch salary components
export function useSalaryComponents() {
  return useQuery({
    queryKey: ["salary-components"],
    queryFn: () => apiClient<SalaryComponent[]>("/api/profile/salary-components"),
    staleTime: 5 * 60 * 1000,
  });
}

// Add salary component (Admin/HR/Payroll only)
export function useAddSalaryComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      employeeId?: string;
      name: string;
      type: "EARNING" | "DEDUCTION" | "BENEFIT";
      amount: string | number;
      isPercentage?: boolean;
      isRecurring?: boolean;
      description?: string;
    }) =>
      apiClient<{ success: boolean; data: SalaryComponent }>("/api/profile/salary-components", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-components"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
