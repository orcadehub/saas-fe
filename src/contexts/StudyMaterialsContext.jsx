import { createContext, useContext, useState, useCallback } from 'react';
import apiService from 'services/apiService';

const StudyMaterialsContext = createContext();

export const StudyMaterialsProvider = ({ children }) => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getStudyMaterials();
      setMaterials(data || []);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMaterialById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getStudyMaterialById(id);
      setSelectedMaterial(data);
      return data;
    } catch (err) {
      console.error('Error fetching material by ID:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <StudyMaterialsContext.Provider value={{ 
      materials, 
      selectedMaterial, 
      loading, 
      error, 
      fetchMaterials, 
      fetchMaterialById,
      setSelectedMaterial 
    }}>
      {children}
    </StudyMaterialsContext.Provider>
  );
};

export const useStudyMaterials = () => {
  const context = useContext(StudyMaterialsContext);
  if (!context) {
    throw new Error('useStudyMaterials must be used within StudyMaterialsProvider');
  }
  return context;
};
