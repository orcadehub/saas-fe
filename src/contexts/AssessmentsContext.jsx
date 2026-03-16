import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import tenantConfig from 'config/tenantConfig';

const AssessmentsContext = createContext();

export const useAssessments = () => {
  const context = useContext(AssessmentsContext);
  if (!context) {
    throw new Error('useAssessments must be used within AssessmentsProvider');
  }
  return context;
};

const CACHE_KEY = 'assessments_cache';
const ATTEMPTS_CACHE_KEY = 'assessment_attempts_cache';

export const AssessmentsProvider = ({ children }) => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || []; } catch { return []; }
  });
  const [assessmentAttempts, setAssessmentAttempts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ATTEMPTS_CACHE_KEY)) || {}; } catch { return {}; }
  });
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  const getApiUrl = () => {
    return import.meta.env.DEV ? 'http://localhost:4000/api' : (config?.apiEndpoint || 'https://backend.orcode.in/api');
  };

  const getHeaders = () => {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': config?.apiKey || '',
      'x-tenant-id': config?.tenantId || ''
    };
    if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;
    return headers;
  };

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!user?.token || !config) { setLoading(false); return; }

      // Show cached data immediately, no loading spinner if cache exists
      const hasCached = assessments.length > 0;
      if (!hasCached) setLoading(true);

      try {
        const response = await fetch(`${getApiUrl()}/auth/student/assessments`, { headers: getHeaders() });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const list = Array.isArray(data) ? data : [];

        setAssessments(list);
        localStorage.setItem(CACHE_KEY, JSON.stringify(list));

        // Fetch all attempts in parallel
        const attemptResults = await Promise.all(
          list.map(async (assessment) => {
            try {
              const res = await fetch(`${getApiUrl()}/auth/student/assessment/${assessment._id}/attempt`, { headers: getHeaders() });
              if (res.ok) return [assessment._id, await res.json()];
            } catch {}
            return [assessment._id, null];
          })
        );

        const attempts = Object.fromEntries(attemptResults.filter(([, v]) => v !== null));
        setAssessmentAttempts(attempts);
        localStorage.setItem(ATTEMPTS_CACHE_KEY, JSON.stringify(attempts));
      } catch (error) {
        console.error('Error fetching assessments:', error);
        if (!hasCached) setAssessments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [user, config]);

  const getAssessmentById = (assessmentId) => {
    return assessments.find(a => a._id === assessmentId) || null;
  };

  const getAssessmentAttempt = (assessmentId) => {
    return assessmentAttempts[assessmentId] || null;
  };

  const refreshAssessments = async () => {
    if (!user?.token || !config) return;
    setLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/auth/student/assessments`, { headers: getHeaders() });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setAssessments(list);
      localStorage.setItem(CACHE_KEY, JSON.stringify(list));

      const attemptResults = await Promise.all(
        list.map(async (assessment) => {
          try {
            const res = await fetch(`${getApiUrl()}/auth/student/assessment/${assessment._id}/attempt`, { headers: getHeaders() });
            if (res.ok) return [assessment._id, await res.json()];
          } catch {}
          return [assessment._id, null];
        })
      );
      const attempts = Object.fromEntries(attemptResults.filter(([, v]) => v !== null));
      setAssessmentAttempts(attempts);
      localStorage.setItem(ATTEMPTS_CACHE_KEY, JSON.stringify(attempts));
    } catch (error) {
      console.error('Error refreshing assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AssessmentsContext.Provider value={{
      assessments,
      assessmentAttempts,
      loading,
      getAssessmentById,
      getAssessmentAttempt,
      refreshAssessments
    }}>
      {children}
    </AssessmentsContext.Provider>
  );
};
