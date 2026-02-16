import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import tenantConfig from 'config/tenantConfig';

const PracticeContext = createContext();

export const usePractice = () => {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used within PracticeProvider');
  }
  return context;
};

export const PracticeProvider = ({ children }) => {
  const { user } = useAuth();
  const [programmingQuestions, setProgrammingQuestions] = useState(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState(null);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  const getApiUrl = () => {
    return import.meta.env.DEV ? 'http://localhost:4000/api' : config?.apiEndpoint;
  };

  const fetchProgrammingQuestions = async (forceRefresh = false) => {
    if (programmingQuestions && !forceRefresh) return programmingQuestions;
    
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      if (!apiUrl) return null;

      const res = await fetch(`${apiUrl}/programming-questions`);
      const data = await res.json();
      setProgrammingQuestions(data);
      setLoading(false);
      return data;
    } catch (error) {
      console.error('Programming questions error:', error);
      setLoading(false);
      return null;
    }
  };

  const fetchAssessmentQuestions = async (forceRefresh = false) => {
    if (assessmentQuestions && !forceRefresh) return assessmentQuestions;
    
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      if (!apiUrl) return null;

      const res = await fetch(`${apiUrl}/assessment-questions`);
      const data = await res.json();
      setAssessmentQuestions(data);
      setLoading(false);
      return data;
    } catch (error) {
      console.error('Assessment questions error:', error);
      setLoading(false);
      return null;
    }
  };

  const fetchCompletedQuestions = async (forceRefresh = false) => {
    if (completedQuestions.length > 0 && !forceRefresh) return completedQuestions;
    
    if (!user?.token) return [];

    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      if (!apiUrl) return [];

      const res = await fetch(`${apiUrl}/practice-submissions/completed`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      setCompletedQuestions(data.completedQuestionIds || []);
      setLoading(false);
      return data.completedQuestionIds || [];
    } catch (error) {
      console.error('Completed questions error:', error);
      setLoading(false);
      return [];
    }
  };

  const refreshData = () => {
    setProgrammingQuestions(null);
    setAssessmentQuestions(null);
    setCompletedQuestions([]);
  };

  return (
    <PracticeContext.Provider
      value={{
        programmingQuestions,
        assessmentQuestions,
        completedQuestions,
        loading,
        fetchProgrammingQuestions,
        fetchAssessmentQuestions,
        fetchCompletedQuestions,
        refreshData
      }}
    >
      {children}
    </PracticeContext.Provider>
  );
};
