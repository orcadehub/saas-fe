import { createContext, useContext, useState } from 'react';
import { analyzeResume, submitAnswer, completeInterview } from 'services/aiMockService';

const AIMockContext = createContext(null);

export function AIMockProvider({ children }) {
  const [currentInterview, setCurrentInterview] = useState(null);

  const startInterview = async (data) => {
    const result = await analyzeResume(data);
    setCurrentInterview(result);
    return result;
  };

  const submitMockAnswer = async (data) => {
    return await submitAnswer(data);
  };

  const finishInterview = async (id) => {
    const result = await completeInterview(id);
    setCurrentInterview(null);
    return result;
  };

  return (
    <AIMockContext.Provider value={{ 
      currentInterview, 
      startInterview, 
      submitAnswer: submitMockAnswer, 
      completeInterview: finishInterview 
    }}>
      {children}
    </AIMockContext.Provider>
  );
}

export function useAIMock() {
  const context = useContext(AIMockContext);
  if (!context) {
    throw new Error('useAIMock must be used within an AIMockProvider');
  }
  return context;
}
