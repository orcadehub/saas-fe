import { createContext, useContext, useState, useCallback } from 'react';
import apiService from 'services/apiService';

const LabsContext = createContext();

export const LabsProvider = ({ children }) => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentLab, setCurrentLab] = useState(null);

  const fetchLabs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getLabs();
      setLabs(data || []);
    } catch (err) {
      console.error('Error fetching labs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getLabById = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await apiService.getLabById?.(id);
      setCurrentLab(data);
      return data;
    } catch (err) {
      console.error('Error fetching lab by ID:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <LabsContext.Provider value={{ 
      labs, 
      currentLab,
      loading, 
      error, 
      fetchLabs,
      getLabById,
      setCurrentLab 
    }}>
      {children}
    </LabsContext.Provider>
  );
};

export const useLabs = () => {
  const context = useContext(LabsContext);
  if (!context) {
    throw new Error('useLabs must be used within LabsProvider');
  }
  return context;
};
