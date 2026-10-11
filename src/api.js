const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const session = {
  get token() { return localStorage.getItem("token"); },
  get user() { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } },
  save(token, user) { localStorage.setItem("token", token); localStorage.setItem("user", JSON.stringify(user)); },
  clear() { localStorage.removeItem("token"); localStorage.removeItem("user"); },
};

export async function api(path, method = "GET", body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(session.token && { Authorization: `Bearer ${session.token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && session.token) { session.clear(); window.location.hash = "#/login"; }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}
