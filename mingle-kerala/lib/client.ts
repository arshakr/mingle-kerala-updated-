export type ApiInit = Omit<RequestInit,"body"> & { body?: unknown };
async function raw(path: string, init: ApiInit = {}): Promise<Response> {
  const { body, ...options } = init;
  return fetch(path, { ...options, credentials: "include", cache: "no-store", headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
}
export async function api<T = Record<string, unknown>>(path: string, init: ApiInit = {}): Promise<T> {
  let res = await raw(path, init);
  if (res.status === 401 && path !== "/api/auth/refresh" && path !== "/api/auth/login" && path !== "/api/auth/register" && !path.includes("/api/activation/")) {
    const refreshed = await raw("/api/auth/refresh", { method: "POST" });
    if (refreshed.ok) res = await raw(path, init);
  }
  const data = await res.json().catch(() => ({})) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
export const human = (v: string) => v.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, x => x.toUpperCase());
export const when = (date: string) => new Date(date).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
export type PublicUser = {
  id: string; username: string; role: string; district: string; locality: string; showLocality: boolean; language: string; age: number;
  gender: string; bio: string; avatarSeed: string; interests?: string[]; discoverable: boolean; showOnline: boolean; allowRequests: string;
};
