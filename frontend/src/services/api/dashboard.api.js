import { apiRequest } from "./client";

export const getDashboardSummary = async (filters = {}) =>
  apiRequest("/dashboard/summary", {
    query: filters,
    requiresAuth: true
  });

export const getDashboardCategories = async (filters = {}) =>
  apiRequest("/dashboard/categories", {
    query: filters,
    requiresAuth: true
  });

export const getDashboardTrends = async (filters = {}) =>
  apiRequest("/dashboard/trends", {
    query: filters,
    requiresAuth: true
  });

export const getDashboardRecentTransactions = async (filters = {}) =>
  apiRequest("/dashboard/recent", {
    query: filters,
    requiresAuth: true
  });
