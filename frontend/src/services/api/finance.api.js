import { apiRequest } from "./client";

export const getFinanceRecords = async (filters = {}) =>
  apiRequest("/finance", {
    query: filters,
    requiresAuth: true
  });

export const getFinanceRecord = async (id) =>
  apiRequest(`/finance/${id}`, {
    requiresAuth: true
  });

export const createFinanceRecord = async (payload) =>
  apiRequest("/finance", {
    method: "POST",
    body: payload,
    requiresAuth: true
  });

export const updateFinanceRecord = async (id, payload) =>
  apiRequest(`/finance/${id}`, {
    method: "PATCH",
    body: payload,
    requiresAuth: true
  });

export const deleteFinanceRecord = async (id) =>
  apiRequest(`/finance/${id}`, {
    method: "DELETE",
    requiresAuth: true
  });
