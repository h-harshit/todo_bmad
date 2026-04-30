const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function request(endpoint: string, options: FetchOptions = {}): Promise<any> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status}: ${body || response.statusText}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const apiGet = (endpoint: string) => request(endpoint, { method: "GET" });
export const apiPost = (endpoint: string, data: any) =>
  request(endpoint, { method: "POST", body: JSON.stringify(data) });
export const apiPut = (endpoint: string, data: any) =>
  request(endpoint, { method: "PUT", body: JSON.stringify(data) });
export const apiPatch = (endpoint: string, data: any) =>
  request(endpoint, { method: "PATCH", body: JSON.stringify(data) });
export const apiDelete = (endpoint: string) => request(endpoint, { method: "DELETE" });
