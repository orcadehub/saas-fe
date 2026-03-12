import { createContext, useContext, useState, useCallback } from 'react';
import apiService from 'services/apiService';

const LabsContext = createContext();

export const LabsProvider = ({ children }) => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLabs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await apiService.client.get('/labs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLabs(response.data || []);
    } catch (err) {
      console.error('Error fetching labs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <LabsContext.Provider value={{ labs, loading, error, fetchLabs }}>
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
