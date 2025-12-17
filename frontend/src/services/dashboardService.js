import axiosInstance from "./axiosInstance";

export const fetchDashboardStats = (signal) =>
  axiosInstance.get("/dashboard/stats", { signal });

export const fetchRecentMatches = (signal) =>
  axiosInstance.get("/dashboard/recent-matches?limit=5", { signal });

export const fetchPerformanceRatings = (signal) =>
  axiosInstance.get("/dashboard/performance-ratings?months=6", { signal });
