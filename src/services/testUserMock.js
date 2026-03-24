import axios from 'axios';

const originalFetch = window.fetch;

// Define mock assessment types globally for consistency
const types = [
  { id: 't_quiz', title: 'Quiz', type: 'quiz', quizCount: 4, codingCount: 0, sqlCount: 0, frontendCount: 0, mongodbCount: 0 },
  { id: 't_prog', title: 'Programming', type: 'programming', quizCount: 4, codingCount: 4, sqlCount: 0, frontendCount: 0, mongodbCount: 0 },
  { id: 't_front', title: 'Frontend', type: 'frontend', quizCount: 4, codingCount: 0, sqlCount: 0, frontendCount: 4, mongodbCount: 0 },
  { id: 't_mongo', title: 'MongoDB', type: 'mongodb', quizCount: 4, codingCount: 0, sqlCount: 0, frontendCount: 0, mongodbCount: 4 },
  { id: 't_sql', title: 'SQL', type: 'sql', quizCount: 4, codingCount: 0, sqlCount: 4, frontendCount: 0, mongodbCount: 0 },
];

export const setupTestUserMock = () => {
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url;
    
    // Check if test user
    let isTestUser = false;
    try {
      const studentStr = localStorage.getItem('studentData');
      if (studentStr) {
        const student = JSON.parse(studentStr);
        if (student.email === 'test@test.com') isTestUser = true;
      }
    } catch (e) {}

    // Pass through if not test user
    if (!isTestUser || !url) {
      return originalFetch(input, init);
    }

    // Delay to simulate network
    await new Promise(r => setTimeout(r, 20));

    const createResponse = (body, status = 200) => {
      return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    const now = new Date();
    const future = new Date(now.getTime() + 86400000).toISOString();
    const past = new Date(now.getTime() - 86400000).toISOString();
    const farPast = new Date(now.getTime() - 172800000).toISOString();

    const method = init?.method || 'GET';

    // Mock IP detection
    if (url.includes('api.ipify.org')) {
      return createResponse({ ip: '127.0.0.1' });
    }

    // Handle our API
    if (!url.includes('/api/')) {
      return originalFetch(input, init);
    }
    
    const assessments = [];
    ['available', 'completed', 'expired'].forEach(tab => {
      types.forEach(t => {
        const _id = `${t.id}_${tab}`;
        assessments.push({
          _id,
          title: t.title,
          description: `This is a mockup ${t.title} designed for the Test User role to explore the assessment interface.`,
          type: t.type,
          duration: 60,
          startTime: tab === 'available' ? new Date(now.getTime() - 5 * 60000).toISOString() : tab === 'completed' ? past : farPast,
          quizQuestionCount: t.quizCount,
          codingQuestionCount: t.codingCount,
          questionCounts: { 
            programming: t.codingCount, 
            sql: t.sqlCount, 
            frontend: t.frontendCount, 
            mongodb: t.mongodbCount,
            quiz: t.quizCount
          },
          earlyStartBuffer: 60,
          status: 'live',
          questions: generateQuestions(t),
          attempt: tab === 'available' ? { _id: `att_${_id}`, attemptStatus: 'STARTED', startTime: now.toISOString() } : (tab === 'completed' ? { _id: `att_${_id}`, attemptStatus: 'COMPLETED', score: 85 } : null)
        });
      });
    });

    // 1. assessments list
    if (url.endsWith('/assessments') && method === 'GET') {
      return createResponse(assessments);
    }

    // 1b. network check bypass
    if (url.includes('/check-assessment-access')) {
      return createResponse({
        hasAccess: true,
        userIP: '127.0.0.1',
        message: 'Bypassed for test user'
      });
    }

    // 1c. server time mock
    if (url.includes('/server-time')) {
       return createResponse({ serverTime: new Date().toISOString() });
    }

    // 2. attempt status: /assessment/:id/attempt
    const attemptMatch = url.match(/\/assessment\/([^/]+)\/attempt$/);
    if (attemptMatch && method === 'GET') {
      const id = attemptMatch[1];
      const found = assessments.find(a => a._id === id);
      if (found && found.attempt) return createResponse(found.attempt);

      if (id.includes('_completed')) {
        return createResponse({ _id: 'dummy_att', attemptStatus: 'COMPLETED', score: 85 });
      } else if (id.includes('_available')) {
        return createResponse({ _id: 'dummy_att', attemptStatus: 'STARTED', startTime: now.toISOString() });
      } else {
        return createResponse(null, 404);
      }
    }

    // 3. get details: /assessment/:id OR /labs/:id OR /programming-questions/question/:id
    const detailMatch = url.match(/\/(assessment|labs|programming-questions\/question)\/([^/]+)$/);
    if (detailMatch && method === 'GET') {
      const id = detailMatch[2];
      const found = assessments.find(a => a._id === id);
      if (found) return createResponse(found);

      // Check if it's a lab
      if (url.includes('/labs/')) {
        return createResponse({
          _id: id,
          title: 'Dummy CSE Lab Experiment',
          description: 'A comprehensive virtual lab experiment part of the B.Tech CSE curriculum.',
          inputFormat: 'Multiple test parameters',
          outputFormat: 'System response',
          constraints: ['Execution time < 2s', 'Memory < 256MB'],
          testCases: [
            { _id: 'tc1', input: 'Sample Input 1', output: 'Sample Output 1', isPublic: true },
            { _id: 'tc2', input: 'Sample Input 2', output: 'Sample Output 2', isPublic: true }
          ]
        });
      }

      // Check if it's a practice question
      if (url.includes('/programming-questions/')) {
        return createResponse({
          _id: id,
          title: 'Master Programming Challenge',
          description: 'A curated engineering challenge for practicing core computer science concepts.',
          problemStatement: 'Problem statement for ' + id,
          constraints: ['Time: 1s', 'Memory: 128MB'],
          testCases: [
            { _id: 'tc1', input: '1', output: '1', isPublic: true },
            { _id: 'tc2', input: '2', output: '2', isPublic: true }
          ]
        });
      }

      return createResponse(found || {});
    }

    // 3b. get questions: /assessment/:id/questions
    if (url.includes('/questions') && method === 'GET') {
       const id = url.split('/assessment/')[1].split('/')[0];
       const foundT = types.find(t => id.startsWith(t.id));
       const qs = generateQuestions(foundT);
       return createResponse({
         programmingQuestions: qs.filter(q => q.type === 'programming'),
         frontendQuestions: qs.filter(q => q.type === 'frontend'),
         mongodbPlaygroundQuestions: qs.filter(q => q.type === 'mongodb'),
         sqlPlaygroundQuestions: qs.filter(q => q.type === 'sql'),
         quizQuestions: qs.filter(q => q.type === 'quiz')
       });
    }

    // 4. Start assessment or practice: /assessment/:id/start OR /assessment/:id/practice
    if (url.includes('/start') || url.includes('/practice')) {
       const id = url.split('/assessment/')[1].split('/')[0];
       const found = assessments.find(a => a._id === id) || assessments[0];
       return createResponse({
         attempt: { _id: 'dummy_attempt', attemptStatus: 'IN_PROGRESS' },
         assessment: found,
         questions: generateQuestions(types.find(t => id.startsWith(t.id)))
       });
    }

    // 5. Submit or Save progress
    if (url.includes('/submit') || url.includes('/save-progress')) {
      return createResponse({ success: true, message: 'Saved dummy data' });
    }

    // 6. Results
    if (url.includes('/results')) {
      const id = url.split('/assessment/')[1].split('/')[0];
      const found = assessments.find(a => a._id === id) || assessments[0];
      return createResponse({
        assessment: found,
        attempt: { score: 95, attemptStatus: 'COMPLETED', submittedAt: new Date().toISOString() },
        questions: generateQuestions(types.find(t => id.startsWith(t.id))),
        autoGradedScore: 95,
        totalScore: 100
      });
    }

    // 7. Last Executed Code (for recovery)
    if (url.includes('/last-executed-code')) {
      return createResponse({
        lastExecutedCode: {},
        successfulCodes: {},
        lastExecutedFrontendCode: {},
        lastExecutedMongoDBQueries: {},
        lastExecutedSQLQuery: {},
        quizAnswers: {}
      });
    }

    // 8. Submit Final Assessment 
    if (url.includes('/submit') && method === 'POST') {
      return createResponse({ success: true, message: 'Assessment submitted successfully' });
    }

    // 10. Programming Practice Topics
    if (url.includes('/programming-questions/topics')) {
      const pTopics = [
        'input', 'operators', 'conditions', 'nested conditions', 
        'loops', 'nested loops', 'while loop', 'arrays', 
        'strings', 'stack', 'queue', 'two pointers', 
        'sliding window', 'hash map', 'Backtracking', 
        'Greedy Algo', 'Dynamic Programming'
      ].map(t => ({ topic: t, count: 4 }));
      return createResponse(pTopics);
    }

    // 11. Programming Practice Questions
    // Matches /programming-questions/questions/TOPIC
    const pQMatch = url.match(/\/programming-questions\/questions\/(.+)$/);
    if (pQMatch && method === 'GET') {
      const topic = decodeURIComponent(pQMatch[1]);
      const pQs = Array.from({ length: 4 }).map((_, i) => ({
        _id: `pq_${topic}_${i}`,
        title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Challenge ${i + 1}`,
        description: `Master ${topic} by solving this comprehensive dummy challenge designed for the test user.`,
        difficulty: i === 0 ? 'Easy' : (i === 3 ? 'Hard' : 'Medium'),
        tags: [topic, 'Practice']
      }));
      return createResponse(pQs);
    }

    // 12. Aptitude/Verbal/Quantitative Mock Endpoints
    const genericMatch = url.match(/\/(aptitude|verbal|quantitative)-questions\/(topics|questions\/(.+))$/);
    if (genericMatch && method === 'GET') {
      const type = genericMatch[1];
      const sub = genericMatch[2];
      
      if (sub === 'topics') {
         const topics = {
           aptitude: ['Numerical Ability', 'Logical Reasoning', 'Data Interpretation'],
           verbal: ['Reading Comprehension', 'Sentence Correction', 'Vocabulary'],
           quantitative: ['Arithmetic', 'Algebra', 'Geometry']
         };
         return createResponse((topics[type] || []).map(t => ({ topic: t, count: 4 })));
      } else {
         const subMatch = genericMatch[2].match(/questions\/(.+)$/);
         const topic = decodeURIComponent(subMatch[1]);
         const pQs = Array.from({ length: 4 }).map((_, i) => ({
           _id: `${type}_${topic}_${i}`,
           title: `${topic} ${i + 1}`,
           description: `Practice your ${type} skills with this targeted challenge.`,
           difficulty: 'Medium',
           tags: [type, topic]
         }));
         return createResponse(pQs);
      }
    }

    // 13. Labs Mock
    if (url.includes('/labs') && method === 'GET') {
      const techs = [
        'C', 'C++', 'Java', 'Python', 'AI', 'ML', 'IoT', 
        'MySQL', 'MongoDB', 'Data Structures', 'Operating Systems', 'Computer Networks'
      ];
      
      const labs = [];
      techs.forEach(tech => {
        for (let i = 1; i <= 12; i++) {
          labs.push({
            _id: `lab_${tech}_${i}`,
            title: `${tech} Experiment ${i}`,
            technology: tech,
            difficulty: i <= 4 ? 'Easy' : (i <= 8 ? 'Medium' : 'Hard'),
            points: i * 20,
            timeLimit: 60 + (i * 5),
            description: `A detailed ${tech} technical experiment (#${i}) focusing on core B.Tech CSE fundamentals and practical implementation.`
          });
        }
      });
      return createResponse(labs);
    }

    return originalFetch(input, init);
  };
};

export const mockApiService = (apiService) => {
  // Check if test user
  const studentStr = localStorage.getItem('studentData');
  if (!studentStr) return;
  try {
    const student = JSON.parse(studentStr);
    if (student.email !== 'test@test.com') return;
  } catch (e) { return; }

  // Mock the specific methods used by AssessmentTaking
  apiService.getAssessmentDetails = async (token, id) => {
    const resp = await window.fetch(`http://localhost:4000/api/auth/student/assessment/${id}`);
    return resp.json();
  };

  apiService.getAssessmentQuestions = async (token, id) => {
    const resp = await window.fetch(`http://localhost:4000/api/auth/student/assessment/${id}/questions`);
    return resp.json();
  };

  apiService.getAssessmentAttempt = async (token, id) => {
    const resp = await window.fetch(`http://localhost:4000/api/auth/student/assessment/${id}/attempt`);
    return resp.json();
  };

  apiService.getLastExecutedCode = async (token, attemptId) => {
    return {
        lastExecutedCode: {},
        successfulCodes: {},
        lastExecutedFrontendCode: {},
        lastExecutedMongoDBQueries: {},
        lastExecutedSQLQuery: {},
        quizAnswers: {}
    };
  };

  apiService.updateAssessmentSystemInfo = async () => {
    return { success: true };
  };

  apiService.getAssessmentInfo = async (token, id) => {
    const resp = await window.fetch(`http://localhost:4000/api/auth/student/assessment/${id}`);
    return resp.json();
  };
  
  // New: Programming topics and questions for axios components
  apiService.getProgrammingTopics = async () => {
      const resp = await window.fetch(`http://localhost:4000/api/programming-questions/topics`);
      return resp.json();
  };
  
  apiService.getProgrammingTopicQuestions = async (topic) => {
      const resp = await window.fetch(`http://localhost:4000/api/programming-questions/questions/${topic}`);
      return resp.json();
  };
};

function generateQuestions(t) {
  if (!t) return [];
  const q = [];
  for (let i = 0; i < t.quizCount; i++) {
    q.push({
      _id: `q_quiz_${i}`,
      type: 'quiz',
      title: `Quiz Question ${i + 1}`,
      problemStatement: `Which of the following describes the key purpose of **${t.title}** in a real-world scenario? <br/><br/><i>Please select the most accurate option from the right panel.</i>`,
      tags: ['Conceptual', 'Core Principles'],
      codeSnippet: i === 0 ? "// Sample Reference Code \nconst value = check(input);\nconsole.log(value);" : null,
      options: [
        { _id: 'o1', text: 'Option A: Primary objective and strategy', originalIndex: 0 },
        { _id: 'o2', text: 'Option B: Secondary implementation detail', originalIndex: 1 },
        { _id: 'o3', text: 'Option C: Alternative approach analysis', originalIndex: 2 },
        { _id: 'o4', text: 'Option D: Optimization and performance', originalIndex: 3 }
      ]
    });
  }
  for (let i = 0; i < t.codingCount; i++) {
    q.push({
      _id: `q_code_${i}`,
      type: 'programming',
      title: `Programming Challenge: ${t.title} ${i + 1}`,
      problemStatement: `<p>Design an efficient algorithm to solve <b>${t.title} Challenge #${i + 1}</b>. You are given a series of inputs and must provide the corresponding optimized outputs.</p><p>Consider all edge cases such as empty input, extremely large values, and performance constraints.</p>`,
      constraints: [
        'Each input N is between 1 and 10^5',
        'Time Complexity should be O(N) or better',
        'Space Complexity must be O(N)'
      ],
      example: {
        input: '5',
        output: '120',
        explanation: 'The factorial of 5 is 120 (5 * 4 * 3 * 2 * 1)'
      },
      testCases: Array.from({ length: 10 }).map((_, idx) => ({
        _id: `tc_${idx}`,
        input: (idx + 1).toString(),
        output: (idx + 1 === 5 ? '120' : (idx + 1).toString()),
        isPublic: idx < 3
      }))
    });
  }
  for (let i = 0; i < t.sqlCount; i++) {
    q.push({
      _id: `q_sql_${i}`,
      type: 'sql',
      title: `Dummy SQL ${i + 1}`,
      problemStatement: `Write a query to fetch all dummy users.`,
      schema: `CREATE TABLE users (id INT, name VARCHAR);`
    });
  }
  for (let i = 0; i < t.frontendCount; i++) {
    q.push({
      _id: `q_front_${i}`,
      type: 'frontend',
      title: `Frontend Development: ${t.title} ${i + 1}`,
      problemStatement: `<p>Design a beautiful and responsive UI component for <b>${t.title}</b> using modern React hooks and Tailwind-like utility classes.</p>`,
      requirements: [
        'Component must be fully responsive (Mobile, Tablet, Desktop)',
        'Use semantic HTML tags for accessibility',
        'Implement error handling for empty states',
        'Optimize re-renders using useMemo/useCallback where appropriate'
      ],
      acceptanceCriteria: [
        'Header changes color on scroll',
        'Search button is disabled when input is empty',
        'Modal opens with smooth fade-in animation',
        'Data persists after page reload using localStorage'
      ],
      testCases: []
    });
  }
  for (let i = 0; i < t.mongodbCount; i++) {
    q.push({
      _id: `q_mongo_${i}`,
      type: 'mongodb',
      title: `Dummy MongoDB ${i + 1}`,
      problemStatement: `Write a dummy MongoDB query.`
    });
  }
  return q;
}
