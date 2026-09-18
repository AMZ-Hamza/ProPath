const SESSION_STORAGE_KEY = "propath.session.v3";

export function getHomeRoute(role) {
  if (role === "admin" || role === "proAdmin") return "/admin";
  if (role === "trainer") return "/trainer";
  return "/stagiere";
}

export function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function persistSession(user) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}
