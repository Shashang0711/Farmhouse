const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return handleResponse<{ accessToken: string; user: any }>(res);
}

export async function apiGet<T>(path: string, token: string | null) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    cache: "no-store"
  });
  return handleResponse<T>(res);
}

export async function apiPost<T>(
  path: string,
  token: string | null,
  body: unknown
) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  return handleResponse<T>(res);
}

export async function apiPatch<T>(
  path: string,
  token: string | null,
  body: unknown
) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string, token: string | null) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return (res.status === 204 ? (null as T) : handleResponse<T>(res)) as T;
}

