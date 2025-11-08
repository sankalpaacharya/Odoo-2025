const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
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
    throw new Error(
      errorData.error || `API Error: ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();
  return data;
}

export async function apiClientFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error || `API Error: ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();
  return data;
}
