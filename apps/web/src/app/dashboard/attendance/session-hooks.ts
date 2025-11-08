import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface ActiveSession {
  hasActiveSession: boolean;
  session?: {
    id: string;
    startTime: string;
    date: string;
    breakStartTime: string | null;
    breakEndTime: string | null;
    totalBreakTime: number;
  };
}

interface SessionResponse {
  success: boolean;
  message: string;
  session: {
    id: string;
    startTime: string;
    date?: string;
    endTime?: string;
    workingHours?: number;
    overtimeHours?: number;
  };
  breakStartTime?: string;
  breakEndTime?: string;
  breakDuration?: number;
  totalBreakTime?: number;
}

export function useActiveSession() {
  return useQuery({
    queryKey: ["session", "active"],
    queryFn: () => apiClient<ActiveSession>("/api/session/active"),
    retry: 1,
    staleTime: 30 * 1000,
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<SessionResponse>("/api/session/start", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", "active"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useStopSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<SessionResponse>("/api/session/stop", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", "active"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useStartBreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<SessionResponse>("/api/session/break/start", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", "active"] });
    },
  });
}

export function useEndBreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<SessionResponse>("/api/session/break/end", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", "active"] });
    },
  });
}
