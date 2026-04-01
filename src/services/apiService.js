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

  async getAssessmentInfo(token, assessmentId) {
    const response = await this.client.get(`/auth/student/assessment/${assessmentId}/info`, {
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

  async sendStudentHeartbeat(token) {
    const response = await this.client.post('/auth/student/heartbeat', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async getActiveStudentCount(token) {
    const response = await this.client.get('/auth/student/active-count', {
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

  async saveMongoDBQuery(token, attemptId, questionId, query, result, expectedOutput, isCorrect) {
    const response = await this.client.post(`/auth/student/assessment-attempt/${attemptId}/save-mongodb-query`,
      { questionId, query, result, expectedOutput, isCorrect },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async saveSQLQuery(token, attemptId, questionId, query, result, expectedOutput, isCorrect) {
    const response = await this.client.post(`/auth/student/assessment-attempt/${attemptId}/save-sql-query`,
      { questionId, query, result, expectedOutput, isCorrect },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async connectCodingProfiles(token, data) {
    const response = await this.client.post('/auth/student/connect-coding-profiles',
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async changePassword(token, data) {
    const response = await this.client.post('/auth/student/change-password',
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async getStudyMaterials() {
    const response = await this.client.get('/study-materials');
    return response.data;
  }

  async getStudyMaterialById(id) {
    const response = await this.client.get(`/study-materials/${id}`);
    return response.data;
  }

  // Labs
  async getLabs() {
    const response = await this.client.get('/labs');
    return response.data;
  }

  async getLabById(id) {
    const response = await this.client.get(`/labs/${id}`);
    return response.data;
  }

  async getProgrammingTopics() {
    const response = await this.client.get('/programming-questions/topics');
    return response.data;
  }

  async getProgrammingTopicQuestions(topic) {
    const response = await this.client.get(`/programming-questions/questions/${topic}`);
    return response.data;
  }

  // Aptitude
  async getAptitudeTopics() {
    const response = await this.client.get('/aptitude-questions/topics');
    return response.data;
  }
  async getAptitudeTopicQuestions(topic) {
    const response = await this.client.get(`/aptitude-questions/questions/${topic}`);
    return response.data;
  }

  // Verbal
  async getVerbalTopics() {
    const response = await this.client.get('/verbal-questions/topics');
    return response.data;
  }
  async getVerbalTopicQuestions(topic) {
    const response = await this.client.get(`/verbal-questions/questions/${topic}`);
    return response.data;
  }

  // Quantitative
  async getQuantitativeTopics() {
    const response = await this.client.get('/quantitative-questions/topics');
    return response.data;
  }
  async getQuantitativeTopicQuestions(topic) {
    const response = await this.client.get(`/quantitative-questions/questions/${topic}`);
    return response.data;
  }

  // Admin/Instructor: Add programming question
  async addProgrammingQuestion(token, data) {
    const response = await this.client.post('/programming-questions/add', 
      data, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  // Certificate: Get my certificates (student)
  async getMyCertificates(token) {
    const response = await this.client.get('/certificates/my-certificates', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Certificate: Get certificate by string ID (public)
  async getCertificateByStringId(certificateId) {
    const response = await this.client.get(`/certificates/view/${certificateId}`);
    return response.data;
  }
}
export default new ApiService();
