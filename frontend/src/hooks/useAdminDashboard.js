import { useQuery } from '@tanstack/react-query';
import {
  fetchDashboardStats,
  fetchRecentMatches,
  fetchPerformanceRatings,
} from '../services/dashboardService';

export const useAdminDashboard = () => {
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorObj,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => fetchDashboardStats().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: matchesData,
    isLoading: matchesLoading,
    isError: matchesError,
    error: matchesErrorObj,
  } = useQuery({
    queryKey: ['dashboard-recent-matches'],
    queryFn: () => fetchRecentMatches().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: ratingsData,
    isLoading: ratingsLoading,
    isError: ratingsError,
    error: ratingsErrorObj,
  } = useQuery({
    queryKey: ['dashboard-performance-ratings'],
    queryFn: () => fetchPerformanceRatings().then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  // Transform and aggregate data
  const stats = statsData?.success ? statsData.data : null;
  const recentMatches = matchesData?.success ? matchesData.data : [];
  const performanceData = ratingsData?.success ? ratingsData.data : [];

  const loading = statsLoading || matchesLoading || ratingsLoading;
  const error = statsError || matchesError || ratingsError;
  const errorMessage = statsErrorObj?.response?.data?.message || 
                       matchesErrorObj?.response?.data?.message || 
                       ratingsErrorObj?.response?.data?.message || 
                       'Failed to load dashboard data';

  return {
    stats,
    recentMatches,
    performanceData,
    loading,
    error,
    errorMessage,
  };
};
