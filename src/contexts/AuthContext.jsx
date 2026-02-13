import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    const studentData = localStorage.getItem('studentData');
    
    if (token && studentData) {
      const parsed = JSON.parse(studentData);
      setUser({ ...parsed, token });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const userWithToken = { ...userData, token: userData.token };
    setUser(userWithToken);
    localStorage.setItem('studentToken', userData.token);
    localStorage.setItem('studentData', JSON.stringify(userWithToken));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentData');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
