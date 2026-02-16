import axios from 'axios';
import tenantConfig from 'config/tenantConfig';

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.setupInterceptors();
  }

  setupInterceptors() {
    this.client.interceptors.request.use(
      async (config) => {
        let cfg = tenantConfig.get();
        if (!cfg) {
          cfg = await tenantConfig.load();
        }
        if (cfg) {
          config.headers['x-api-key'] = cfg.apiKey || '';
          config.headers['x-tenant-id'] = cfg.tenantId || '';
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async getAssessmentDetails(token, assessmentId) {
    const response = await this.client.get(`/auth/student/assessment/${assessmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async getAssessmentAttempt(token, assessmentId) {
    const response = await this.client.get(`/auth/student/assessment/${assessmentId}/attempt`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async getAssessmentQuestions(token, assessmentId) {
    const response = await this.client.get(`/auth/student/assessment/${assessmentId}/questions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async saveAssessmentCode(token, attemptId, questionId, language, code, isSuccessful = false, testResults = null) {
    const response = await this.client.post(`/auth/student/assessment-attempt/${attemptId}/save-code`, 
      { questionId, language, code, isSuccessful, testResults }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async getStudentProfile(token) {
    const response = await this.client.get('/auth/student/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async startAssessmentAttempt(token, assessmentId, systemInfo) {
    const response = await this.client.post(`/auth/student/assessment/${assessmentId}/start-attempt`, 
      { systemInfo }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async saveQuizAnswer(token, attemptId, questionId, selectedAnswer) {
    const response = await this.client.post(`/auth/student/assessment-attempt/${attemptId}/save-quiz-answer`, 
      { questionId, selectedAnswer }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async getLastExecutedCode(token, attemptId) {
    const response = await this.client.get(`/auth/student/assessment-attempt/${attemptId}/last-code`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async submitAssessment(token, assessmentId, submissionData) {
    const response = await this.client.post(`/auth/student/assessment/${assessmentId}/submit`, 
      submissionData, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async updateTabSwitchCount(token, attemptId) {
    const response = await this.client.patch(`/auth/student/attempt/${attemptId}/tab-switch`, 
      {}, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async updateFullscreenExitCount(token, attemptId) {
    const response = await this.client.patch(`/auth/student/attempt/${attemptId}/fullscreen-exit`, 
      {}, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async updateAssessmentSystemInfo(token, attemptId, systemInfo, endIP = null) {
    const response = await this.client.post(`/auth/student/assessment-attempt/${attemptId}/system-info`, 
      { systemInfo, endIP }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async runFrontendTests(token, data) {
    const response = await this.client.post('/frontend-questions/run-tests', 
      data, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async saveFrontendCode(token, attemptId, questionId, html, css, js, testResults) {
    const response = await this.client.post(`/auth/student/assessment-attempt/${attemptId}/save-frontend-code`,
      { questionId, html, css, js, testResults },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
}
export default new ApiService();
