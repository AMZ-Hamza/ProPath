import { useCallback, useEffect, useState } from "react";
import dataService from '../dataService';

const DASHBOARD_FETCHERS = {
  admin: dataService.fetchAdminDashboard,
  trainer: dataService.fetchTrainerDashboard,
  student: dataService.fetchStudentDashboard,
};

/**
 * Custom hook to fetch specialized dashboard summary data.
 * @param {string} role - The role of the user ('admin', 'trainer', 'student').
 * @returns {object} - { data, loading, error, refresh }
 */
export function useDashboardData(role) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetcher = DASHBOARD_FETCHERS[role];
      if (!fetcher) {
        throw new Error("Invalid role for dashboard data.");
      }
      setData(await fetcher());
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (role) {
      fetchDashboard();
    }
  }, [role, fetchDashboard]);

  return { data, loading, error, refresh: fetchDashboard };
}
