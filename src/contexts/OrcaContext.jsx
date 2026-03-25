import { createContext, useContext, useState, useEffect } from 'react';
import tenantConfig from 'config/tenantConfig';

const OrcaContext = createContext();

export const OrcaProvider = ({ children }) => {
  const [platformConfig, setPlatformConfig] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    tenantConfig.load().then(setPlatformConfig).catch(console.error);
  }, []);

  const addNotification = (notif) => {
    setNotifications(prev => [...prev, { id: Date.now(), ...notif }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <OrcaContext.Provider value={{ 
      platformConfig, 
      isAssistantOpen, 
      setIsAssistantOpen,
      notifications,
      addNotification,
      removeNotification
    }}>
      {children}
    </OrcaContext.Provider>
  );
};

export const useOrca = () => {
  const context = useContext(OrcaContext);
  if (!context) {
    throw new Error('useOrca must be used within OrcaProvider');
  }
  return context;
};
