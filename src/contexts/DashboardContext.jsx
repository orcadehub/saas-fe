import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import tenantConfig from 'config/tenantConfig';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [practiceStats, setPracticeStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  const fetchDashboardData = async (forceRefresh = false) => {
    if (dashboardData && !forceRefresh) return dashboardData;
    
    if (!user?.email || !config) return null;

    setLoading(true);
    try {
      const apiEndpoint = import.meta.env.DEV ? 'http://localhost:4000/api' : config?.apiEndpoint;
      if (!apiEndpoint) return null;

      const res = await fetch(`${apiEndpoint}/dashboard/data?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setDashboardData(data);
      setLoading(false);
      return data;
    } catch (error) {
      console.error('Dashboard data error:', error);
      setLoading(false);
      return null;
    }
  };

  const fetchLeaderboardData = async (forceRefresh = false, timeframe = 'allTime') => {
    // We ignore the cached 'leaderboardData' check if we are supplying a timeframe that isn't 'allTime' 
    // or if forceRefresh is true, to ensure we get new data on filter change.
    if (leaderboardData && !forceRefresh && timeframe === 'allTime') return leaderboardData;
    
    if (!user?.email || !config) return null;

    setLoading(true);
    try {
      const apiEndpoint = import.meta.env.DEV ? 'http://localhost:4000/api' : config?.apiEndpoint;
      if (!apiEndpoint) return null;

      const res = await fetch(`${apiEndpoint}/leaderboard/overall?email=${encodeURIComponent(user.email)}&limit=1000&timeframe=${timeframe}`);
      const data = await res.json();
      setLeaderboardData(data.data || []);
      setLoading(false);
      return data.data || [];
    } catch (error) {
      console.error('Leaderboard data error:', error);
      setLoading(false);
      return null;
    }
  };

  const fetchPracticeStats = async (forceRefresh = false) => {
    if (practiceStats && !forceRefresh) return practiceStats;
    try {
      const apiEndpoint = import.meta.env.DEV ? 'http://localhost:4000/api' : config?.apiEndpoint;
      if (!apiEndpoint) return null;

      const res = await fetch(`${apiEndpoint}/aptitude-questions/topics`);
      const topics = await res.json();
      const totalQuestions = topics.reduce((sum, t) => sum + (t.count || 0), 0);
      const stats = { aptitudeCount: totalQuestions, aptitudeTopics: topics.length };
      setPracticeStats(stats);
      return stats;
    } catch (error) {
      console.error('Practice stats error:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user?.email && config) {
      fetchDashboardData(true);
      fetchLeaderboardData(true);
    }
  }, [user, config]);

  const refreshData = () => {
    setDashboardData(null);
    setLeaderboardData(null);
    setPracticeStats(null);
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,
        leaderboardData,
        practiceStats,
        loading,
        fetchDashboardData,
        fetchLeaderboardData,
        fetchPracticeStats,
        refreshData
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
