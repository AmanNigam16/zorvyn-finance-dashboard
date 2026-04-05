import { apiRequest, setAuthToken } from "./client";

export const registerUser = async (payload) =>
  apiRequest("/auth/register", {
    method: "POST",
    body: payload
  });

export const loginUser = async (payload) => {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: payload
  });

  if (data?.token) {
    setAuthToken(data.token);
  }

  return data;
};

export const getProfile = async () =>
  apiRequest("/auth/profile", {
    requiresAuth: true
  });
