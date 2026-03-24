import axios from 'axios';
import tenantConfig from 'config/tenantConfig';

const getApiUrl = () => {
  return import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';
};

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token}`,
  };
};

export const analyzeResume = async (data) => {
  // If test user, mock the response
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.email === 'test@test.com') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          interviewId: 'mock_interview_' + Date.now(),
          questions: [
            { question: 'Describe your experience with the technologies mentioned in your profile.', category: 'Technical' },
            { question: 'What is your most significant architectural contribution?', category: 'Architecture' },
            { question: 'How do you handle conflict in a development team?', category: 'Behavioral' },
            { question: 'Explain the CAP theorem and its implications.', category: 'CS Fundamentals' }
          ]
        });
      }, 1500);
    });
  }

  const response = await axios.post(`${getApiUrl()}/ai-mock/analyze-resume`, data, {
    headers: getHeaders()
  });
  return response.data;
};

export const submitAnswer = async (data) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.email === 'test@test.com') {
    return { success: true };
  }
  const response = await axios.post(`${getApiUrl()}/ai-mock/submit-answer`, data, {
    headers: getHeaders()
  });
  return response.data;
};

export const completeInterview = async (interviewId) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.email === 'test@test.com') {
    return { score: 85 };
  }
  const response = await axios.post(`${getApiUrl()}/ai-mock/complete`, { interviewId }, {
    headers: getHeaders()
  });
  return response.data;
};
