// Session storage cache for assessment questions
export const QuestionCache = {
  // Cache questions without answers for security
  set(assessmentId, questions) {
    const cache = {
      timestamp: Date.now(),
      ttl: 30 * 60 * 1000, // 30 minutes
      programmingQuestions: questions.programmingQuestions || [],
      quizQuestions: questions.quizQuestions || []
    };
    sessionStorage.setItem(`assessment_${assessmentId}_questions`, JSON.stringify(cache));
  },

  // Get cached questions if valid
  get(assessmentId) {
    const cached = sessionStorage.getItem(`assessment_${assessmentId}_questions`);
    if (!cached) return null;
    
    try {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp > data.ttl) {
        this.clear(assessmentId);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error parsing cached questions:', error);
      this.clear(assessmentId);
      return null;
    }
  },

  // Clear cache for specific assessment
  clear(assessmentId) {
    sessionStorage.removeItem(`assessment_${assessmentId}_questions`);
  },

  // Clear all assessment caches
  clearAll() {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('assessment_') && key.endsWith('_questions')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};