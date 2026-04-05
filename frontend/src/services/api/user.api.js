import { apiRequest } from "./client";

export const getUsers = async (filters = {}) =>
  apiRequest("/users", {
    query: filters,
    requiresAuth: true,
  });

export const createUser = async (payload) =>
  apiRequest("/users", {
    method: "POST",
    body: payload,
    requiresAuth: true,
  });

export const updateUserRole = async (id, role) =>
  apiRequest(`/users/${id}/role`, {
    method: "PATCH",
    body: { role },
    requiresAuth: true,
  });

export const updateUserStatus = async (id, isActive) =>
  apiRequest(`/users/${id}/status`, {
    method: "PATCH",
    body: { isActive },
    requiresAuth: true,
  });
