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
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  const fetchDashboardData = async (forceRefresh = false) => {
    if (dashboardData && !forceRefresh) return dashboardData;
    
    if (!user?.email || !config) return null;

    if (user.email === 'test@test.com') {
      const generatedActivity = {};
      for (let i = 0; i < 150; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        if (Math.random() > 0.3) {
          generatedActivity[d.toISOString().split('T')[0]] = Math.floor(Math.random() * 8) + 1;
        }
      }

      const dummyDashboard = {
        stats: { appSolved: 120, rank: 42, assessments: 15, quizzes: 8, practice: 45, accuracy: 92, overall: 85 },
        activityData: generatedActivity,
        codingProfiles: {
          leetcode: { username: 'test_leet', connected: true },
          hackerrank: { username: 'test_hacker', connected: true },
          codeforces: { username: '', connected: false }
        },
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
      };
      setDashboardData(dummyDashboard);
      return dummyDashboard;
    }

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

    if (user.email === 'test@test.com') {
      const mult = timeframe === 'thisWeek' ? 0.15 : timeframe === 'thisMonth' ? 0.4 : 1;
      const getVal = (val) => Math.max(1, Math.floor(val * mult));
      const dummyLeaderboard = [
        { _id: '1', rank: 1, name: 'Alice Smith', email: 'alice@example.com', leetcode: getVal(200), hackerrank: getVal(150), codeforces: getVal(50), appSolved: getVal(150), totalSolved: getVal(550) },
        { _id: '2', rank: 2, name: 'Bob Johnson', email: 'bob@example.com', leetcode: getVal(180), hackerrank: getVal(140), codeforces: getVal(40), appSolved: getVal(142), totalSolved: getVal(502) },
        { _id: '3', rank: 3, name: 'Charlie Brown', email: 'charlie@example.com', leetcode: getVal(160), hackerrank: getVal(130), codeforces: getVal(30), appSolved: getVal(135), totalSolved: getVal(455) },
        { _id: '42', rank: 42, name: 'Test User', email: 'test@test.com', leetcode: getVal(100), hackerrank: getVal(90), codeforces: getVal(20), appSolved: getVal(120), totalSolved: getVal(330) },
        { _id: '43', rank: 43, name: 'Diana Prince', email: 'diana@example.com', leetcode: getVal(50), hackerrank: getVal(80), codeforces: getVal(10), appSolved: getVal(118), totalSolved: getVal(258) },
      ];
      setLeaderboardData(dummyLeaderboard);
      return dummyLeaderboard;
    }

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

  useEffect(() => {
    if (user?.email && config) {
      fetchDashboardData(true);
      fetchLeaderboardData(true);
    }
  }, [user, config]);

  const refreshData = () => {
    setDashboardData(null);
    setLeaderboardData(null);
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,
        leaderboardData,
        loading,
        fetchDashboardData,
        fetchLeaderboardData,
        refreshData
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
