const FALLBACK_API_BASE_URL = "http://localhost:5000/api/v1";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || FALLBACK_API_BASE_URL).replace(/\/$/, "");
const AUTH_TOKEN_KEY = "authToken";

const buildUrl = (path, query) => {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
};

const getStoredToken = () =>
  localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem("token") || "";

export const getAuthToken = () => getStoredToken();

const extractErrorMessage = async (response) => {
  try {
    const payload = await response.json();
    return payload.message || "Request failed.";
  } catch (_error) {
    return "Request failed.";
  }
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem("token");
  }
};

export const clearAuthToken = () => setAuthToken("");

export const apiRequest = async (path, options = {}) => {
  const {
    method = "GET",
    body,
    headers = {},
    query,
    requiresAuth = false
  } = options;

  const requestHeaders = {
    Accept: "application/json",
    ...headers
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (requiresAuth) {
    const token = getStoredToken();

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json();
  return payload.data;
};
