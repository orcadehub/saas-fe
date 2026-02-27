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

export const AssessmentsProvider = ({ children }) => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [assessmentAttempts, setAssessmentAttempts] = useState({});
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
    
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    
    return headers;
  };

  useEffect(() => {
    const fetchAssessments = async () => {
      if (user?.token && config) {
        setLoading(true);
        try {
          const response = await fetch(`${getApiUrl()}/auth/student/assessments`, {
            headers: getHeaders()
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          setAssessments(Array.isArray(data) ? data : []);

          const attempts = {};
          for (const assessment of (Array.isArray(data) ? data : [])) {
            try {
              const attemptResponse = await fetch(`${getApiUrl()}/auth/student/assessment/${assessment._id}/attempt`, {
                headers: getHeaders()
              });
              if (attemptResponse.ok) {
                const attemptData = await attemptResponse.json();
                attempts[assessment._id] = attemptData;
              }
            } catch (error) {
              // No attempt found
            }
          }
          setAssessmentAttempts(attempts);
        } catch (error) {
          console.error('Error fetching assessments:', error);
          setAssessments([]);
        } finally {
          setLoading(false);
        }
      } else {
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
    if (user?.token && config) {
      setLoading(true);
      try {
        const response = await fetch(`${getApiUrl()}/auth/student/assessments`, {
          headers: getHeaders()
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setAssessments(Array.isArray(data) ? data : []);

        const attempts = {};
        for (const assessment of (Array.isArray(data) ? data : [])) {
          try {
            const attemptResponse = await fetch(`${getApiUrl()}/auth/student/assessment/${assessment._id}/attempt`, {
              headers: getHeaders()
            });
            if (attemptResponse.ok) {
              const attemptData = await attemptResponse.json();
              attempts[assessment._id] = attemptData;
            }
          } catch (error) {
            // No attempt found
          }
        }
        setAssessmentAttempts(attempts);
      } catch (error) {
        console.error('Error refreshing assessments:', error);
        setAssessments([]);
      } finally {
        setLoading(false);
      }
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
