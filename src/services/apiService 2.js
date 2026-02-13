import axios from 'axios';
import toast from 'react-hot-toast';
import tenantConfig from '../config/tenantConfig';

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';
    this.apiKey = '';
    this.tenantId = '';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.setupInterceptors();
  }

  async initialize() {
    const config = await tenantConfig.load();
    this.baseURL = import.meta.env.DEV ? 'http://localhost:4000/api' : (config.apiEndpoint || 'https://backend.orcode.in/api');
    this.apiKey = config.apiKey || '';
    this.tenantId = config.tenantId || '';
    this.client.defaults.baseURL = this.baseURL;
  }
  
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const cfg = tenantConfig.get();
        if (cfg) {
          config.headers['x-api-key'] = cfg.apiKey || '';
          config.headers['x-tenant-id'] = cfg.tenantId || '';
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.status, error.response?.data);
        // Don't auto-redirect from interceptor to prevent loops
        // Let the calling component handle the error
        return Promise.reject(error);
      }
    );
  }
  
  // Get tenant configuration
  async getTenantConfig() {
    return tenantConfig.get();
  }
  
  // Student authentication
  async loginStudent(credentials) {
    const response = await this.client.post('/auth/student/login', credentials);
    return response.data;
  }
  
  // Get student profile
  async getStudentProfile(token) {
    const response = await this.client.get('/auth/student/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
  
  // Get student batches
  async getStudentBatches(token) {
    const response = await this.client.get('/auth/student/batches', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
  
  // Get student quizzes
  async getStudentQuizzes(token) {
    const response = await this.client.get('/auth/student/quizzes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
  
  // Get quiz details
  async getQuizDetails(token, quizId) {
    const response = await this.client.get(`/auth/student/quiz/${quizId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Get quiz attempts
  async getQuizAttempts(token, quizId) {
    const response = await this.client.get(`/auth/student/quiz/${quizId}/attempts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Get current quiz attempt
  async getQuizAttempt(token, quizId) {
    const response = await this.client.get(`/auth/student/quiz/${quizId}/attempt`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Start new quiz attempt
  async startQuizAttempt(token, quizId) {
    const response = await this.client.post(`/auth/student/quiz/${quizId}/start`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Save interrupted state
  async saveInterruptedState(token, attemptId, data) {
    const response = await this.client.post(`/auth/student/attempt/${attemptId}/interrupt`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Save individual answer
  async saveAnswer(token, attemptId, data) {
    const response = await this.client.patch(`/auth/student/attempt/${attemptId}/answer`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Update attempt status
  async updateAttemptStatus(token, attemptId, status) {
    const response = await this.client.patch(`/auth/student/attempt/${attemptId}/status`, 
      { status }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  // Save progress
  async saveProgress(token, attemptId, data) {
    const response = await this.client.patch(`/auth/student/attempt/${attemptId}/progress`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Resume quiz
  async resumeQuiz(token, attemptId) {
    console.log('API Service: Calling resume quiz for attempt:', attemptId);
    const response = await this.client.post(`/auth/student/attempt/${attemptId}/resume`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Submit quiz
  async submitQuiz(token, attemptId, data) {
    const response = await this.client.post(`/auth/student/attempt/${attemptId}/submit`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Update tab switch count
  async updateTabSwitchCount(token, attemptId) {
    const response = await this.client.patch(`/auth/student/attempt/${attemptId}/tab-switch`, 
      {}, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  // Update fullscreen exit count
  async updateFullscreenExitCount(token, attemptId) {
    const response = await this.client.patch(`/auth/student/attempt/${attemptId}/fullscreen-exit`, 
      {}, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  // Update system info periodically
  async updateSystemInfo(token, attemptId, systemInfo) {
    const response = await this.client.post(`/auth/student/attempt/${attemptId}/system-info`, 
      { systemInfo }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  // Update system info periodically
  async updateSystemInfo(token, attemptId, systemInfo) {
    const response = await this.client.post(`/auth/student/attempt/${attemptId}/system-info`, 
      { systemInfo }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  // Store session start info
  async storeSessionStart(token, quizId, data) {
    const response = await this.client.post(`/auth/student/quiz/${quizId}/session-start`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Get practice topics
  async getPracticeTopics(token) {
    const response = await this.client.get('/auth/student/practice/topics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Get practice questions for topic
  async getPracticeQuestions(token, topicId) {
    const response = await this.client.get(`/auth/student/practice/topics/${topicId}/questions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Get practice progress
  async getPracticeProgress(token) {
    const response = await this.client.get('/auth/student/practice/progress', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Submit practice solution
  async submitPracticeSolution(token, data) {
    const response = await this.client.post('/practice-submissions/submit', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Save practice code
  async savePracticeCode(token, data) {
    const response = await this.client.post('/practice-submissions/save-code', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Get practice submission
  async getPracticeSubmission(token, questionId) {
    const response = await this.client.get(`/practice-submissions/question/${questionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Get user's total coins
  async getUserCoins(token) {
    const response = await this.client.get('/practice-submissions/coins', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Get user's completed questions
  async getUserCompletedQuestions(token) {
    const response = await this.client.get('/practice-submissions/completed', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Get practice student count
  async getPracticeStudentCount(token) {
    const response = await this.client.get('/auth/student/practice/student-count', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Get total students (public endpoint)
  async getTotalStudents() {
    const response = await this.client.get('/auth/student/practice/student-count');
    return response.data;
  }

  // Get topics (public endpoint)
  async getTopics() {
    const token = localStorage.getItem('studentToken');
    const response = await this.client.get('/student/practice/topics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Get single topic
  async getTopic(topicId) {
    const response = await this.client.get(`/student/practice/topics/${topicId}`);
    return response.data;
  }

  // Get subtopics for a topic
  async getSubtopics(topicId) {
    const token = localStorage.getItem('studentToken');
    const response = await this.client.get(`/student/practice/topics/${topicId}/subtopics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Get questions for a subtopic
  async getQuestions(subtopicId) {
    const response = await this.client.get(`/student/practice/subtopics/${subtopicId}/questions`);
    return response.data;
  }

  // Get single question
  async getQuestion(questionId) {
    const response = await this.client.get(`/student/practice/questions/${questionId}`);
    return response.data;
  }

  // Get question by ID (alias for compatibility)
  async getQuestionById(questionId) {
    const response = await this.client.get(`/student/practice/questions/${questionId}`);
    return response.data;
  }

  // Get leaderboard data
  async getLeaderboard(token, type = 'overall') {
    const response = await this.client.get(`/auth/student/leaderboard?type=${type}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Gamified Attempt APIs
  async startGamifiedAttempt(token, questionId, data) {
    const response = await this.client.post(`/student/gamified-attempts/start`, 
      { questionId, ...data },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async saveGamifiedAnswer(token, attemptId, data) {
    const response = await this.client.post(`/student/gamified-attempts/${attemptId}/answer`, 
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async completeGamifiedAttempt(token, attemptId, data) {
    const response = await this.client.post(`/student/gamified-attempts/${attemptId}/complete`, 
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  // Assessment APIs
  async getStudentAssessments(token) {
    const response = await this.client.get('/auth/student/assessments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async getAssessmentDetails(token, assessmentId) {
    const response = await this.client.get(`/auth/student/assessment/${assessmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Get assessment questions without answers (for caching)
  async getAssessmentQuestions(token, assessmentId) {
    const response = await this.client.get(`/auth/student/assessment/${assessmentId}/questions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async getAssessmentAttempts(token, assessmentId) {
    const response = await this.client.get(`/auth/student/assessment/${assessmentId}/attempts`, {
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

  async startAssessmentAttempt(token, assessmentId, systemInfo, startIP) {
    const response = await this.client.post(`/auth/student/assessment/${assessmentId}/start`, 
      { systemInfo, startIP }, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }

  // Update tab switch count
  async updateTabSwitchCount(token, attemptId, count) {
    const response = await this.client.patch(`/auth/student/attempt/${attemptId}/tab-switch`, 
      { tabSwitchCount: count }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  // Submit assessment
  async submitAssessment(token, assessmentId, data) {
    const response = await this.client.post(`/auth/student/assessment/${assessmentId}/submit`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Get last executed code from API
  async getLastExecutedCode(token, attemptId) {
    const response = await this.client.get(`/auth/student/assessment-attempt/${attemptId}/last-code`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  // Save assessment code
  async saveAssessmentCode(token, attemptId, questionId, language, code, isSuccessful = false, testResults = null) {
    const response = await this.client.post(`/auth/student/assessment-attempt/${attemptId}/save-code`, 
      { questionId, language, code, isSuccessful, testResults }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  // Save quiz answer
  async saveQuizAnswer(token, attemptId, questionId, selectedAnswer) {
    const response = await this.client.post(`/auth/student/assessment-attempt/${attemptId}/save-quiz-answer`, 
      { questionId, selectedAnswer }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  // Update assessment system info with end IP
  async updateAssessmentSystemInfo(token, attemptId, systemInfo, endIP) {
    const response = await this.client.post(`/auth/student/assessment-attempt/${attemptId}/system-info`, 
      { systemInfo, endIP }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  // PySpark APIs
  async getPySparkQuestions(token) {
    console.log('getPySparkQuestions called with token:', token ? 'exists' : 'missing');
    console.log('Making request to:', this.client.defaults.baseURL + '/pyspark/questions');
    const response = await this.client.get('/pyspark/questions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Response data:', response.data);
    return response.data;
  }

  async getPySparkQuestion(token, questionId) {
    const response = await this.client.get(`/pyspark/questions/${questionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async submitPySparkCode(token, data) {
    const response = await this.client.post('/pyspark/submit', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}

export default new ApiService();