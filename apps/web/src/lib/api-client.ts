const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.error || `API Error: ${res.status} ${res.statusText}`,
    };
  }

  const data = await res.json();
  return { success: true, data };
}
