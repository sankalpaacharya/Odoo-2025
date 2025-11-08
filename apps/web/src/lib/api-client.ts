const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  console.log("API Request:", {
    method: options?.method || "GET",
    url,
    body: options?.body,
  });

  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    console.log("API Response:", {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API Error: ${res.status} ${res.statusText}`
      );
    }

    return res.json();
  } catch (error) {
    console.error("API Client Error:", error);
    throw error;
  }
}
