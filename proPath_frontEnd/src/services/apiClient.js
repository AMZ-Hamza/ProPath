const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");
const SESSION_STORAGE_KEY = "propath.session.v3";

function getStoredToken() {
  if (typeof window === "undefined" || !window.localStorage) return null;

  try {
    const session = JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEY) || "null");
    return session?.token || null;
  } catch {
    return null;
  }
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Received an invalid JSON response from the server.");
  }
}

export function buildQueryString(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value == null || value === "" || value === "all") return;
    params.set(key, Array.isArray(value) ? value.join(",") : String(value));
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export async function requestJson(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    Accept: "application/json",
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return payload;
}

export function unwrap(payload) {
  return payload && Object.prototype.hasOwnProperty.call(payload, "data")
    ? payload.data
    : payload;
}
