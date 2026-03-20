import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, ButtonGroup, CircularProgress, Modal, Radio, RadioGroup, FormControlLabel, IconButton, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Chip, Snackbar, Alert, Stack } from '@mui/material';
import { ChevronLeft, ChevronRight, PlayArrow, CheckCircle, Close, Add, Remove, Edit, Warning, TimerOff, Lock, AccessTime, FullscreenExit, TabUnselected } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import Joyride, { STATUS } from 'react-joyride';
import tenantConfig from 'config/tenantConfig';
import AssessmentHeader from './components/AssessmentHeader';
import { QuestionCache } from 'utils/questionCache';
import apiService from 'services/apiService';
import { submitCode } from 'services/pistonService';

import FrontendEditor from './components/FrontendEditor';
import MongoDBPlaygroundEditor from './components/MongoDBPlaygroundEditor';
import SQLPlaygroundEditor from './components/SQLPlaygroundEditor';

export default function AssessmentTaking() {
  const isProduction = import.meta.env.MODE === 'production';
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showPreparation, setShowPreparation] = useState(true);
  const [preparationTime, setPreparationTime] = useState(300);
  const [preparationFailed, setPreparationFailed] = useState(false);
  const [config, setConfig] = useState(null);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [fullscreenWarningTimer, setFullscreenWarningTimer] = useState(30);
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [studentData, setStudentData] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isDataReady, setIsDataReady] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showPartB, setShowPartB] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [answers, setAnswers] = useState({});
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [currentTestCaseTab, setCurrentTestCaseTab] = useState(0);
  const [language, setLanguage] = useState('');
  const [code, setCode] = useState('');
  const editorRef = useRef(null);
  const [compilerSplit, setCompilerSplit] = useState(60);
  const [isCompilerDragging, setIsCompilerDragging] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testCaseResults, setTestCaseResults] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResults, setSubmitResults] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));
  const [savedQuestions, setSavedQuestions] = useState(new Set());
  const [savingQuestions, setSavingQuestions] = useState(new Set());
  const [showFinalSubmitModal, setShowFinalSubmitModal] = useState(false);
  const [endTestInput, setEndTestInput] = useState('');
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');
  const [showLastCodeModal, setShowLastCodeModal] = useState(false);
  const [lastCodeData, setLastCodeData] = useState(null);
  const [fontSize, setFontSize] = useState(18);
  const [frontendCompletedQuestions, setFrontendCompletedQuestions] = useState(new Set());
  const [frontendQuestionPercentages, setFrontendQuestionPercentages] = useState({});
  const [customTestCases, setCustomTestCases] = useState([]);
  const [showAddCustomInput, setShowAddCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [editingCustomIndex, setEditingCustomIndex] = useState(null);
  const [execCounter, setExecCounter] = useState(0);
  const [runTour, setRunTour] = useState(false);
  const [tourSteps, setTourSteps] = useState([]);
  
  const quizTourSteps = [
    {
      target: '.divider-drag',
      content: 'Drag this vertical divider left or right to adjust the width of the problem statement and answer options panels.',
      disableBeacon: true,
      placement: 'right'
    },
    {
      target: '.question-navigation',
      content: 'Use these buttons to navigate between quiz questions. Green indicates answered questions.',
      placement: 'bottom'
    },
    {
      target: '.quiz-options',
      content: 'Select your answer by clicking on one of the options. Your selection is automatically saved.',
      placement: 'left'
    },
    {
      target: '.quiz-navigation-buttons',
      content: 'Use Previous and Save & Next buttons to move between questions.',
      placement: 'top'
    }
  ];
  
  const programmingTourSteps = [
    {
      target: '.divider-drag',
      content: 'Drag this vertical divider left or right to adjust the width of the problem statement and code editor panels.',
      disableBeacon: true,
      placement: 'right'
    },
    {
      target: '[data-compiler-container] > div:nth-child(2)',
      content: 'Drag this horizontal divider up or down to adjust the height of the code editor and test cases panels.',
      placement: 'top'
    },
    {
      target: '.language-selector',
      content: 'Select your preferred programming language from this dropdown to start coding.',
      placement: 'bottom'
    },
    {
      target: '.last-code-button',
      content: 'Click here to load your last executed code for this question. Useful if you want to continue from where you left off.',
      placement: 'bottom'
    }
  ];

  const getLanguageTemplate = (lang) => {
    switch (lang) {
      case 'python':
        return `# Write your code here\n`;
      case 'cpp':
        return `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`;
      case 'java':
        return `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`;
      case 'c':
        return `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}`;
      default:
        return '// Write your code here';
    }
  };

  const getMonacoLanguage = (lang) => {
    switch (lang) {
      case 'cpp': return 'cpp';
      case 'java': return 'java';
      case 'python': return 'python';
      case 'c': return 'c';
      default: return 'plaintext';
    }
  };

  const getLanguageId = (lang) => {
    switch (lang) {
      case 'python': return 71;
      case 'cpp': return 54;
      case 'java': return 62;
      case 'c': return 50;
      default: return 71;
    }
  };

  const recoverFullSession = async (token, currentAttemptId, questionsList, initialAttemptData = null) => {
    if (!token || !currentAttemptId || !questionsList) return;
    
    try {
      let response = initialAttemptData;
      if (!response) {
        response = await apiService.getLastExecutedCode(token, currentAttemptId);
      }
      
      const { lastExecutedCode, successfulCodes, lastExecutedFrontendCode, lastExecutedMongoDBQuery, lastExecutedMongoDBQueries, lastExecutedSQLQuery, lastExecutedQuizAnswers, quizAnswers } = response;
      
      // Combined Logic Codes (Programming)
      const progCodes = lastExecutedCode || successfulCodes;
      if (progCodes) {
        Object.keys(progCodes).forEach(questionId => {
          const codeEntry = progCodes[questionId];
          if (typeof codeEntry === 'object' && codeEntry !== null) {
            Object.keys(codeEntry).forEach(lang => {
              const storageKey = `assessment_${id}_question_${questionId}_${lang}`;
              if (codeEntry[lang]) {
                sessionStorage.setItem(storageKey, codeEntry[lang]);
              }
            });
          }
        });
      }
      
      // Recover Frontend Codes
      if (lastExecutedFrontendCode) {
        Object.keys(lastExecutedFrontendCode).forEach(questionId => {
          const storageKey = `frontend_${currentAttemptId}_${questionId}`;
          localStorage.setItem(storageKey, JSON.stringify(lastExecutedFrontendCode[questionId]));
        });
      }
      
      // Recover MongoDB Queries
      const mongoQueries = lastExecutedMongoDBQuery || lastExecutedMongoDBQueries || successfulCodes;
      if (mongoQueries) {
        Object.keys(mongoQueries).forEach(questionId => {
          // Verify if it's a mongodb question to avoid overwriting programming codes
          const question = questionsList.find(q => q._id === questionId);
          if (question?.type === 'mongodb') {
            const storageKey = `mongodb_query_${questionId}`;
            const queryData = mongoQueries[questionId];
            localStorage.setItem(storageKey, typeof queryData === 'string' ? queryData : (queryData.query || ''));
          }
        });
      }

      // Recover SQL Queries
      if (lastExecutedSQLQuery) {
        Object.keys(lastExecutedSQLQuery).forEach(questionId => {
          const question = questionsList.find(q => q._id === questionId);
          if (question?.type === 'sql') {
            const storageKey = `sql_query_${questionId}`;
            localStorage.setItem(storageKey, lastExecutedSQLQuery[questionId]);
          }
        });
      }

      // Recover Quiz Answers
      const qAnswers = lastExecutedQuizAnswers || quizAnswers;
      if (qAnswers) {
        const newAnswers = { ...answers };
        Object.keys(qAnswers).forEach(questionId => {
          const data = qAnswers[questionId];
          const savedOptionIndex = typeof data === 'object' ? data.selectedAnswer : data;
          newAnswers[questionId] = savedOptionIndex.toString();
        });
        setAnswers(newAnswers);
      }
      
      // Update current code state if needed
      const currentQ = questionsList[currentQuestionIndex];
      if (currentQ?.type === 'programming' && language) {
        const storageKey = `assessment_${id}_question_${currentQ._id}_${language}`;
        const savedCode = sessionStorage.getItem(storageKey);
        if (savedCode) {
          setCode(savedCode);
        }
      }
      
      if (!initialAttemptData) {
        setToastMessage('Session data synchronized with your latest submissions');
        setToastSeverity('success');
        setShowToast(true);
      }
      
      // Force refresh for child components
      setExecCounter(prev => prev + 1);
      
    } catch (error) {
      console.error('Error recovering session:', error);
    }
  };

  // Load code from session storage when question or language changes
  useEffect(() => {
    if (questions[currentQuestionIndex]?._id && language) {
      const storageKey = `assessment_${id}_question_${questions[currentQuestionIndex]._id}_${language}`;
      const savedCode = sessionStorage.getItem(storageKey);
      setCode(savedCode || getLanguageTemplate(language));
    }
  }, [currentQuestionIndex, language, questions, id, execCounter]);

  // Set initial editor height to 40% when language is first selected
  useEffect(() => {
    if (language && compilerSplit === 60) {
      setCompilerSplit(40);
    }
  }, [language, compilerSplit]);

  // Ensure compiler split stays within bounds (max 85% to keep test cases visible)
  useEffect(() => {
    if (compilerSplit > 85) {
      setCompilerSplit(85);
    }
  }, [compilerSplit]);

  // Save code to session storage when it changes
  useEffect(() => {
    if (questions[currentQuestionIndex]?._id && language && code) {
      const storageKey = `assessment_${id}_question_${questions[currentQuestionIndex]._id}_${language}`;
      sessionStorage.setItem(storageKey, code);
    }
  }, [code, currentQuestionIndex, language, questions, id]);

  const handleRunCode = async () => {
    if (!code.trim() || !language) return;
    
    setIsRunning(true);
    setTestCaseResults({});
    
    const publicTestCases = questions[currentQuestionIndex]?.testCases?.filter(tc => tc.isPublic) || [];
    const allTestCases = [...publicTestCases, ...customTestCases];
    const languageId = getLanguageId(language);
    
    for (let i = 0; i < allTestCases.length; i++) {
      const testCase = allTestCases[i];
      
      setTestCaseResults(prev => ({
        ...prev,
        [i]: { loading: true }
      }));
      
      try {
        const result = await submitCode(code, languageId, testCase.input);
        
        if (result.status.id === 3) {
          const userOutput = result.stdout ? result.stdout.trim() : '';
          setTestCaseResults(prev => ({
            ...prev,
            [i]: { loading: false, output: userOutput, error: null }
          }));
        } else {
          let errorOutput = result.stderr || 'Execution Error';
          if (errorOutput.includes('fatal signal')) {
            errorOutput = 'Error: Program exceeded time/memory limits';
          }
          setTestCaseResults(prev => ({
            ...prev,
            [i]: { loading: false, output: null, error: errorOutput }
          }));
        }
      } catch (error) {
        setTestCaseResults(prev => ({
          ...prev,
          [i]: { loading: false, output: null, error: error.message }
        }));
      }
    }
    
    setIsRunning(false);
    
    // Save code to backend after running
    if (attemptId && questions[currentQuestionIndex]?._id) {
      try {
        const token = localStorage.getItem('studentToken');
        await apiService.saveAssessmentCode(
          token,
          attemptId,
          questions[currentQuestionIndex]._id,
          language,
          code,
          false
        );
      } catch (error) {
        console.error('Error saving code:', error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!code.trim() || !language) return;
    
    const allTestCases = questions[currentQuestionIndex]?.testCases || [];
    
    // Initialize all test cases first
    const initialResults = allTestCases.map((tc, i) => ({
      index: i + 1,
      type: tc.isPublic ? 'Public' : 'Private',
      status: 'Pending',
      passed: null
    }));
    
    setSubmitResults(initialResults);
    setShowSubmitModal(true);
    setIsSubmitting(true);
    
    const languageId = getLanguageId(language);
    const results = [...initialResults];
    
    for (let i = 0; i < allTestCases.length; i++) {
      const testCase = allTestCases[i];
      
      results[i] = { ...results[i], status: 'Running' };
      setSubmitResults([...results]);
      
      try {
        const result = await submitCode(code, languageId, testCase.input);
        
        if (result.status.id === 3) {
          const userOutput = result.stdout ? result.stdout.trim() : '';
          const expectedOutput = (testCase.expectedOutput || testCase.output)?.toString().trim();
          const passed = userOutput === expectedOutput;
          
          results[i] = {
            ...results[i],
            status: passed ? 'Passed' : 'Failed',
            passed
          };
        } else {
          results[i] = {
            ...results[i],
            status: 'Error',
            passed: false
          };
        }
      } catch (error) {
        results[i] = {
          ...results[i],
          status: 'Error',
          passed: false
        };
      }
      
      setSubmitResults([...results]);
    }
    
    setIsSubmitting(false);
    
    // Save code to backend after submission
    const allPassed = results.every(r => r.passed === true);
    if (attemptId && questions[currentQuestionIndex]?._id) {
      try {
        const token = localStorage.getItem('studentToken');
        await apiService.saveAssessmentCode(
          token,
          attemptId,
          questions[currentQuestionIndex]._id,
          language,
          code,
          allPassed,
          results
        );
        
        // Mark as saved to update percentage
        if (allPassed) {
          setSavedQuestions(prev => new Set([...prev, currentQuestionIndex]));
        }
      } catch (error) {
        console.error('Error saving code:', error);
      }
    }
  };

  useEffect(() => {
    if (isCompilerDragging) {
      const handleMouseMove = (e) => {
        const container = document.querySelector('[data-compiler-container]');
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const newPosition = ((e.clientY - rect.top) / rect.height) * 100;
        if (newPosition >= 20 && newPosition <= 85) {
          setCompilerSplit(newPosition);
        }
      };

      const handleMouseUp = () => {
        setIsCompilerDragging(false);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isCompilerDragging]);

  // Ensure compiler split stays within bounds
  useEffect(() => {
    if (compilerSplit > 85) {
      setCompilerSplit(85);
    }
  }, [compilerSplit]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          
          if (attemptId) {
            const token = localStorage.getItem('studentToken');
            apiService.updateTabSwitchCount(token, attemptId)
              .then(async response => {
                const updatedCount = response.count || newCount;
                setTabSwitchCount(updatedCount);
                
                // Check if max tab switches exceeded
                const maxAllowed = assessment?.maxTabSwitches || 3;
                if (maxAllowed !== -1 && updatedCount >= maxAllowed) {
                  setTimeout(async () => {
                    const endIP = await fetch('https://api.ipify.org?format=json')
                      .then(res => res.json())
                      .then(data => data.ip)
                      .catch(() => 'Unknown');
                    
                    await apiService.submitAssessment(token, id, {
                      answers: {},
                      submissionReason: 'TAB_SWITCH_VIOLATION',
                      timeUsedSeconds: Math.floor((new Date() - new Date(assessment?.startTime)) / 1000),
                      endIP: endIP,
                      endTime: new Date().toISOString(),
                      attemptId: attemptId
                    });
                    
                    navigate('/assessments');
                  }, 3000);
                }
              })
              .catch(console.error);
          }
          
          return newCount;
        });
        setShowTabSwitchWarning(true);
      }
    };

    const handleBlur = () => {
      setTabSwitchCount(prev => {
        const newCount = prev + 1;
        
        if (attemptId) {
          const token = localStorage.getItem('studentToken');
          apiService.updateTabSwitchCount(token, attemptId)
            .then(async response => {
              const updatedCount = response.count || newCount;
              setTabSwitchCount(updatedCount);
              
              // Check if max tab switches exceeded
              const maxAllowed = assessment?.maxTabSwitches || 3;
              if (maxAllowed !== -1 && updatedCount >= maxAllowed) {
                setTimeout(async () => {
                  const endIP = await fetch('https://api.ipify.org?format=json')
                    .then(res => res.json())
                    .then(data => data.ip)
                    .catch(() => 'Unknown');
                  
                  await apiService.submitAssessment(token, id, {
                    answers: {},
                    submissionReason: 'TAB_SWITCH_VIOLATION',
                    timeUsedSeconds: Math.floor((new Date() - new Date(assessment?.startTime)) / 1000),
                    endIP: endIP,
                    endTime: new Date().toISOString(),
                    attemptId: attemptId
                  });
                  
                  navigate('/assessments');
                }, 3000);
              }
            })
            .catch(console.error);
        }
        
        return newCount;
      });
      setShowTabSwitchWarning(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [attemptId, assessment, id, navigate]);

  useEffect(() => {
    // Reset test case tab and results when question changes
    setCurrentTestCaseTab(0);
    setTestCaseResults({});
    setCustomTestCases([]);
  }, [currentQuestionIndex]);

  useEffect(() => {
    const checkScroll = () => {
      const container = document.getElementById('question-buttons');
      if (container) {
        setShowLeftScroll(container.scrollLeft > 0);
        setShowRightScroll(container.scrollLeft < container.scrollWidth - container.clientWidth);
      }
    };
    
    const container = document.getElementById('question-buttons');
    if (container) {
      checkScroll();
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [questions, currentQuestionIndex, showPartB]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 20 && newWidth < 80) {
          setLeftWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
    const data = localStorage.getItem('studentData');
    if (data) {
      setStudentData(JSON.parse(data));
    }
    
    // Fetch assessment data during preparation timer
    const fetchAssessmentData = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        
        // Check sessionStorage first
        const cachedAssessment = sessionStorage.getItem(`assessment_${id}`);
        if (cachedAssessment) {
          const assessmentData = JSON.parse(cachedAssessment);
          setAssessment(assessmentData);
          
          // Fetch fresh data in background and update cache
          apiService.getAssessmentDetails(token, id)
            .then(freshData => {
              sessionStorage.setItem(`assessment_${id}`, JSON.stringify(freshData));
              setAssessment(freshData);
            })
            .catch(console.error);
        } else {
          // Fetch from API and cache
          const assessmentData = await apiService.getAssessmentDetails(token, id);
          sessionStorage.setItem(`assessment_${id}`, JSON.stringify(assessmentData));
          setAssessment(assessmentData);
        }
        
        // Always fetch fresh questions data from API on page load/reload
        const questionsData = await apiService.getAssessmentQuestions(token, id);
        QuestionCache.set(id, questionsData);
        
        // Transform to array
        const allQuestions = [
          ...(questionsData.programmingQuestions || []).map(q => ({ ...q, type: 'programming' })),
          ...(questionsData.frontendQuestions || []).map(q => ({ ...q, type: 'frontend' })),
          ...(questionsData.mongodbPlaygroundQuestions || []).map(q => ({ ...q, type: 'mongodb' })),
          ...(questionsData.sqlPlaygroundQuestions || []).map(q => ({ ...q, type: 'sql' })),
          ...(questionsData.quizQuestions || []).map(q => ({ ...q, type: 'quiz' }))
        ];
        
        // Shuffle questions but keep options in their original order
        const shuffledQuestions = allQuestions.map(q => {
          if (q.type === 'quiz' && q.options) {
            // Store original index (required by backend matching logic) without shuffling the options array
            const optionsWithOriginalIndex = q.options.map((opt, idx) => ({ ...opt, originalIndex: idx }));
            return { ...q, options: optionsWithOriginalIndex };
          }
          return q;
        }).sort(() => Math.random() - 0.5);
        
        setQuestions(shuffledQuestions);
        
        // Auto-select Part A and first quiz question
        const firstQuizIndex = shuffledQuestions.findIndex(q => q.type === 'quiz');
        const firstFrontendIndex = shuffledQuestions.findIndex(q => q.type === 'frontend');
        const firstProgrammingIndex = shuffledQuestions.findIndex(q => q.type === 'programming');
        
        if (firstQuizIndex !== -1) {
          setShowPartB(false);
          setCurrentQuestionIndex(firstQuizIndex);
          setVisitedQuestions(new Set([firstQuizIndex]));
        } else if (firstFrontendIndex !== -1) {
          setShowPartB(false);
          setCurrentQuestionIndex(firstFrontendIndex);
          setVisitedQuestions(new Set([firstFrontendIndex]));
        } else if (firstProgrammingIndex !== -1) {
          setShowPartB(true);
          setCurrentQuestionIndex(firstProgrammingIndex);
          setVisitedQuestions(new Set([firstProgrammingIndex]));
        }
        
        setIsDataReady(true);
        
        // Get attempt ID from cached assessment or fetch
        const assessmentData = cachedAssessment ? JSON.parse(cachedAssessment) : assessment;
        let attemptStatus = null;
        let currentAttemptId = null;
        let recoveredAttemptData = assessmentData?.attempt || null;

        if (assessmentData?.attempt) {
          currentAttemptId = assessmentData.attempt._id;
          attemptStatus = assessmentData.attempt.attemptStatus;
        } else {
          try {
            const attemptResponse = await apiService.getAssessmentAttempt(token, id);
            if (attemptResponse) {
              currentAttemptId = attemptResponse._id;
              attemptStatus = attemptResponse.attemptStatus;
              recoveredAttemptData = attemptResponse;
            }
          } catch (error) {
            console.error('Error fetching attempt:', error);
          }
        }

        if (attemptStatus && (attemptStatus !== 'IN_PROGRESS' && attemptStatus !== 'STARTED' && attemptStatus !== 'RESUMED')) {
           navigate('/assessments');
           return;
        }

        if (currentAttemptId) {
          setAttemptId(currentAttemptId);
          // Recover session data if available
          recoverFullSession(token, currentAttemptId, shuffledQuestions, recoveredAttemptData);
        }

      } catch (error) {
        console.error('Error fetching assessment data:', error);
        setIsDataReady(true);
      }
    };
    
    fetchAssessmentData();
    
    // Mark reload time
    localStorage.setItem('assessmentReloadTime', Date.now().toString());
    
    // Show fullscreen prompt if not in fullscreen
    if (!document.fullscreenElement) {
      setShowFullscreenPrompt(true);
    }
    
    // Check fullscreen every second for 18 seconds after reload
    const checkInterval = setInterval(() => {
      const reloadTime = parseInt(localStorage.getItem('assessmentReloadTime') || '0');
      const elapsed = Date.now() - reloadTime;
      
      if (elapsed < 18000) {
        if (!document.fullscreenElement) {
          setShowFullscreenPrompt(true);
        } else {
          setShowFullscreenPrompt(false);
        }
      } else {
        clearInterval(checkInterval);
      }
    }, 1000);
    
    // Block browser navigation
    const blockNavigation = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    
    window.addEventListener('beforeunload', blockNavigation);
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('beforeunload', blockNavigation);
      window.removeEventListener('popstate', handlePopState);
      clearInterval(checkInterval);
    };
  }, [id]);

  useEffect(() => {
    // Preparation timer
    if (showPreparation && preparationTime > 0 && !preparationFailed) {
      if (isDataReady && !loading && attemptId) {
        setShowPreparation(false);
        return;
      }
      
      const timer = setInterval(() => {
        setPreparationTime(prev => {
          if (prev <= 1) {
            if (isDataReady && !loading && attemptId) {
              setShowPreparation(false);
            } else {
              setPreparationFailed(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (!showPreparation && !loading && !preparationFailed) {
      // After preparation ends, check and re-enter fullscreen
      const checkAndEnterFullscreen = () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(console.error);
        }
      };
      
      // Try immediately
      checkAndEnterFullscreen();
      
      // Try again after a short delay
      setTimeout(checkAndEnterFullscreen, 100);
      setTimeout(checkAndEnterFullscreen, 500);
    }
  }, [showPreparation, preparationTime, loading]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !showPreparation && !loading) {
        if (attemptId) {
          const token = localStorage.getItem('studentToken');
          apiService.updateFullscreenExitCount(token, attemptId)
            .then(response => setFullscreenExitCount(response.count))
            .catch(console.error);
        }
        
        setShowFullscreenWarning(true);
        setFullscreenWarningTimer(30);
      } else {
        setShowFullscreenWarning(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [showPreparation, loading, attemptId]);

  useEffect(() => {
    if (showFullscreenWarning && fullscreenWarningTimer > 0) {
      const timer = setInterval(() => {
        setFullscreenWarningTimer(prev => {
          if (prev <= 1) {
            // Auto-submit on fullscreen violation
            (async () => {
              const token = localStorage.getItem('studentToken');
              const endIP = await fetch('https://api.ipify.org?format=json')
                .then(res => res.json())
                .then(data => data.ip)
                .catch(() => 'Unknown');
              
              if (attemptId) {
                await apiService.submitAssessment(token, id, {
                  answers: {},
                  submissionReason: 'FULLSCREEN_EXIT_VIOLATION',
                  timeUsedSeconds: Math.floor((new Date() - new Date(assessment?.startTime)) / 1000),
                  endIP: endIP,
                  endTime: new Date().toISOString(),
                  attemptId: attemptId
                });
              }
              navigate('/assessments');
            })();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showFullscreenWarning, fullscreenWarningTimer, attemptId, assessment, id, navigate]);

  useEffect(() => {
    // Exit fullscreen on unmount
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    if (!showPreparation && !loading && questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      const questionType = currentQuestion?.type;
      
      if (questionType === 'quiz') {
        const tourKey = `assessment_tour_${id}_quiz`;
        const tourData = localStorage.getItem(tourKey);
        
        if (tourData) {
          const { timestamp } = JSON.parse(tourData);
          const oneHour = 60 * 60 * 1000;
          if (Date.now() - timestamp > oneHour) {
            localStorage.removeItem(tourKey);
            setTourSteps(quizTourSteps);
            setTimeout(() => setRunTour(true), 1000);
          }
        } else {
          setTourSteps(quizTourSteps);
          setTimeout(() => setRunTour(true), 1000);
        }
      } else if (questionType === 'programming' && showPartB) {
        const tourKey = `assessment_tour_${id}_programming`;
        const tourData = localStorage.getItem(tourKey);
        
        if (tourData) {
          const { timestamp } = JSON.parse(tourData);
          const oneHour = 60 * 60 * 1000;
          if (Date.now() - timestamp > oneHour) {
            localStorage.removeItem(tourKey);
            setTourSteps(programmingTourSteps);
            setTimeout(() => setRunTour(true), 1000);
          }
        } else {
          setTourSteps(programmingTourSteps);
          setTimeout(() => setRunTour(true), 1000);
        }
      }
    }
  }, [showPreparation, loading, questions, currentQuestionIndex, showPartB, id]);

  useEffect(() => {
    // Set initial time from assessment start time + duration
    if (assessment?.startTime && assessment?.duration) {
      const now = Date.now();
      const startTime = new Date(assessment.startTime).getTime();
      const endTime = startTime + (assessment.duration * 60 * 1000);
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeRemaining(remaining);
    }
  }, [assessment]);

  // Force modal open & lock whenever timeRemaining drops to <=5
  useEffect(() => {
    if (timeRemaining <= 5 && timeRemaining > 0) {
      setShowFinalSubmitModal(true);
      setIsTimeUp(true);
    }
  }, [timeRemaining]);

  useEffect(() => {
    // Timer countdown
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          const next = prev - 1;

          // Open submit modal at 5 seconds and lock it
          if (next <= 5 && next > 0) {
            setShowFinalSubmitModal(true);
            setIsTimeUp(true);
          }
          
          if (next <= 0) {
            clearInterval(timer);
            setShowFinalSubmitModal(true);
            setIsTimeUp(true);
            // Auto-submit when time expires
            (async () => {
              const token = localStorage.getItem('studentToken');
              const endIP = await fetch('https://api.ipify.org?format=json')
                .then(res => res.json())
                .then(data => data.ip)
                .catch(() => 'Unknown');
              
              if (attemptId) {
                await apiService.submitAssessment(token, id, {
                  answers: {},
                  submissionReason: 'TIME_UP',
                  timeUsedSeconds: Math.floor((new Date() - new Date(assessment?.startTime)) / 1000),
                  endIP: endIP,
                  endTime: new Date().toISOString(),
                  attemptId: attemptId
                });
              }
              navigate('/assessments');
            })();
            return 0;
          }
          return next;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, navigate, attemptId, assessment, id]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      const currentQuestion = questions[currentQuestionIndex];
      const questionType = currentQuestion?.type;
      if (questionType === 'quiz' || questionType === 'programming') {
        const tourKey = `assessment_tour_${id}_${questionType}`;
        localStorage.setItem(tourKey, JSON.stringify({ timestamp: Date.now() }));
      }
    }
  };

  const handleEnterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleFinalSubmit = async () => {
    if ((!isTimeUp && endTestInput !== 'END') || isSubmittingAssessment) return;
    
    setIsSubmittingAssessment(true);
    
    try {
      const token = localStorage.getItem('studentToken');
      const endIP = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => 'Unknown');
      
      await apiService.submitAssessment(token, id, {
        answers: {},
        submissionReason: 'MANUAL_SUBMIT',
        timeUsedSeconds: Math.floor((new Date() - new Date(assessment?.startTime)) / 1000),
        endIP: endIP,
        endTime: new Date().toISOString(),
        attemptId: attemptId
      });
      
      setIsSubmittingAssessment(false);
      setShowFinalSubmitModal(false);
      navigate('/assessments');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setIsSubmittingAssessment(false);
    }
  };

  if (showFullscreenPrompt) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 4,
        bgcolor: '#ffffff'
      }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: 'error.main' }}>
          Fullscreen Required
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
          Please click the button below to enter fullscreen mode
        </Typography>
        <Button 
          variant="contained" 
          color="error"
          size="large"
          onClick={() => {
            document.documentElement.requestFullscreen()
              .then(() => setShowFullscreenPrompt(false))
              .catch(console.error);
          }}
          sx={{ py: 2, px: 6, fontSize: '1.5rem', fontWeight: 700 }}
        >
          Enter Fullscreen
        </Button>
      </Box>
    );
  }

  if (showPreparation || preparationFailed) {
    return (
      <Box 
        onClick={() => {
          if (!document.fullscreenElement && !preparationFailed) {
            document.documentElement.requestFullscreen().catch(console.error);
          }
        }}
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 4,
          bgcolor: '#ffffff',
          cursor: preparationFailed ? 'default' : 'pointer'
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {config?.logoUrl ? (
            <img 
              src={config.logoUrl} 
              alt="Logo" 
              style={{ height: '64px', width: 'auto', borderRadius: '8px' }}
            />
          ) : (
            <Box sx={{ width: 64, height: 64, bgcolor: 'grey.300', borderRadius: 1 }} />
          )}
        </Box>
        
        {preparationFailed ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, fontSize: '2.5rem', color: 'error.main' }}>
              Connection Timeout
            </Typography>
            <Typography variant="h5" sx={{ color: 'text.secondary', mb: 4, fontSize: '1.5rem', maxWidth: 600, mx: 'auto' }}>
              We couldn't load all the necessary assessment data within the time limit. Please check your connection and retry.
            </Typography>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={() => window.location.reload()}
              sx={{ py: 2, px: 6, fontSize: '1.2rem', fontWeight: 800, borderRadius: '16px', textTransform: 'none' }}
            >
              Retry Connection
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 2, fontSize: '2.5rem' }}>
                Preparing Assessment
              </Typography>
              <Typography variant="h5" sx={{ color: 'text.secondary', mb: 4, fontSize: '1.5rem' }}>
                Please wait while we set up your assessment environment
              </Typography>
            </Box>
            
            <Box sx={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `conic-gradient(#6a0dad ${((300 - preparationTime) / 300) * 360}deg, #e0e0e0 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Box sx={{ 
                width: 170,
                height: 170,
                borderRadius: '50%',
                bgcolor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h1" sx={{ 
                    fontWeight: 900, 
                    color: '#6a0dad',
                    fontFamily: 'monospace',
                    fontSize: '4rem'
                  }}>
                    {preparationTime}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '1.2rem' }}>
                    seconds
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}>
              <Chip icon={assessment ? <CheckCircle /> : <CircularProgress size={16} />} label="Assessment Details" color={assessment ? "success" : "default"} variant={assessment ? "filled" : "outlined"} sx={{ fontWeight: 700 }} />
              <Chip icon={questions.length > 0 ? <CheckCircle /> : <CircularProgress size={16} />} label="Question Bank" color={questions.length > 0 ? "success" : "default"} variant={questions.length > 0 ? "filled" : "outlined"} sx={{ fontWeight: 700 }} />
              <Chip icon={attemptId ? <CheckCircle /> : <CircularProgress size={16} />} label="Secure Session" color={attemptId ? "success" : "default"} variant={attemptId ? "filled" : "outlined"} sx={{ fontWeight: 700 }} />
            </Box>

            <Typography variant="body1" sx={{ 
              textAlign: 'center', 
              maxWidth: 400,
              color: 'text.secondary',
              fontSize: '1.2rem',
              mt: 2
            }}>
              Loading questions, setting up code environment, and preparing your workspace...
            </Typography>
            
            {!document.fullscreenElement && (
              <Typography variant="body2" sx={{ 
                textAlign: 'center', 
                maxWidth: 400,
                color: 'primary.main',
                fontSize: '1rem',
                fontWeight: 600,
                mt: 1
              }}>
                Click anywhere to instantly enter Fullscreen Mode
              </Typography>
            )}
          </>
        )}
      </Box>
    );
  }

  if (loading || !assessment) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if assessment is frontend type - show with question navigation
  if (assessment.type === 'frontend') {
    // Frontend assessments use the same layout as programming with question navigation
    // The FrontendEditor will be rendered in the right panel when question type is 'frontend'
  }

  // Check if assessment is backend type - show simple editor
  if (assessment.type === 'backend') {
    return (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <AssessmentHeader
            logoUrl={config?.logoUrl}
            assessmentTitle={assessment?.title || 'Assessment'}
            studentName={studentData?.name || 'Student'}
            studentEmail={studentData?.email || ''}
            timeRemaining={timeRemaining}
            duration={assessment?.duration || 60}
            onSubmit={timeRemaining > 2 ? () => setShowFinalSubmitModal(true) : undefined}
          />
          
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              bgcolor: '#fff7ed',
              p: 3
            }}>
              <Card sx={{ 
                p: 6, 
                maxWidth: 600, 
                textAlign: 'center',
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#f59e0b' }}>
                  Backend Assessment
                </Typography>
                <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                  Django, Express, Spring Boot Editor
                </Typography>
              </Card>
            </Box>
          </Box>
        </Box>

        {/* Modals */}
        <Modal open={showFullscreenWarning} disableEscapeKeyDown>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: '#ffffff',
            boxShadow: '0 0 60px rgba(239,68,68,0.12), 0 25px 50px -12px rgba(0,0,0,0.15)',
            borderRadius: '24px',
            overflow: 'hidden',
            minWidth: 480,
            maxWidth: 520,
            border: '1px solid #fecaca'
          }}>
            {/* Red accent bar */}
            <Box sx={{
              height: '4px',
              background: 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)',
              backgroundSize: '200% 100%',
              animation: 'fsShimmer 2s linear infinite',
              '@keyframes fsShimmer': {
                '0%': { backgroundPosition: '200% 0' },
                '100%': { backgroundPosition: '-200% 0' }
              }
            }} />

            <Box sx={{ p: 5, textAlign: 'center' }}>
              {/* Icon */}
              <Box sx={{
                width: 64, height: 64, borderRadius: '18px',
                background: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)',
                border: '1px solid #fecaca',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 3
              }}>
                <FullscreenExit sx={{ fontSize: 32, color: '#dc2626' }} />
              </Box>

              <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.5rem', letterSpacing: '-0.02em', mb: 1 }}>
                Fullscreen Required
              </Typography>
              <Typography sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.95rem', mb: 4 }}>
                Assessment will auto-submit if you don't return to fullscreen
              </Typography>

              {/* Countdown ring */}
              <Box sx={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: `conic-gradient(#ef4444 ${((30 - fullscreenWarningTimer) / 30) * 360}deg, #fee2e2 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 4px 20px rgba(239,68,68,0.15)'
              }}>
                <Box sx={{
                  width: 112,
                  height: 112,
                  borderRadius: '50%',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <Typography sx={{
                    fontWeight: 900,
                    color: '#dc2626',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '2.5rem',
                    lineHeight: 1
                  }}>
                    {fullscreenWarningTimer}
                  </Typography>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, mt: 0.5 }}>
                    seconds
                  </Typography>
                </Box>
              </Box>

              {/* Exit count badge */}
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 1,
                px: 2.5, py: 1, borderRadius: '10px',
                bgcolor: '#fef2f2', border: '1px solid #fecaca', mb: 4
              }}>
                <Warning sx={{ fontSize: 16, color: '#dc2626' }} />
                <Typography sx={{ fontWeight: 700, color: '#991b1b', fontSize: '0.85rem' }}>
                  Fullscreen exits: {fullscreenExitCount}
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleEnterFullscreen}
                sx={{
                  py: 1.8, fontSize: '1rem', fontWeight: 800, textTransform: 'none',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  boxShadow: '0 8px 24px -4px rgba(220,38,38,0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 12px 28px -4px rgba(220,38,38,0.45)'
                  },
                  transition: 'all 0.2s ease'
                }}
                startIcon={<FullscreenExit />}
              >
                Return to Fullscreen
              </Button>
            </Box>
          </Box>
        </Modal>

        <Dialog
          open={showTabSwitchWarning}
          disableEscapeKeyDown
          maxWidth="sm"
          fullWidth
          sx={{
            '& .MuiBackdrop-root': {
              background: 'rgba(15,23,42,0.25)',
              backdropFilter: 'blur(6px)'
            },
            '& .MuiDialog-paper': {
              borderRadius: '24px',
              bgcolor: '#ffffff',
              boxShadow: '0 0 60px rgba(245,158,11,0.1), 0 25px 50px -12px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              border: '1px solid #fde68a'
            }
          }}
        >
          {/* Amber accent bar */}
          <Box sx={{
            height: '4px',
            background: 'linear-gradient(90deg, #f59e0b, #f97316, #f59e0b)',
            backgroundSize: '200% 100%',
            animation: 'tabShimmer 2s linear infinite',
            '@keyframes tabShimmer': {
              '0%': { backgroundPosition: '200% 0' },
              '100%': { backgroundPosition: '-200% 0' }
            }
          }} />

          <Box sx={{ p: 5, textAlign: 'center' }}>
            {/* Icon */}
            <Box sx={{
              width: 64, height: 64, borderRadius: '18px',
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: '1px solid #fde68a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 3
            }}>
              <TabUnselected sx={{ fontSize: 32, color: '#d97706' }} />
            </Box>

            <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.5rem', letterSpacing: '-0.02em', mb: 1 }}>
              Tab Switch Detected!
            </Typography>
            <Typography sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.95rem', mb: 3 }}>
              You switched away from the assessment tab
            </Typography>

            {/* Tab switch count badge */}
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1.5,
              px: 3, py: 1.5, borderRadius: '12px',
              bgcolor: '#fffbeb', border: '1px solid #fde68a', mb: 3
            }}>
              <Typography sx={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>
                Tab switches: <strong>{tabSwitchCount}</strong>
                {assessment?.maxTabSwitches && assessment.maxTabSwitches !== -1 && (
                  <> / <strong>{assessment.maxTabSwitches}</strong> allowed</>
                )}
                {assessment?.maxTabSwitches === -1 && (
                  <> (Unlimited allowed)</>
                )}
              </Typography>
            </Box>

            <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500, mb: 4, lineHeight: 1.6, px: 2 }}>
              Please stay on this tab. Excessive tab switching may result in automatic assessment termination.
            </Typography>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => setShowTabSwitchWarning(false)}
              sx={{
                py: 1.8, fontSize: '1rem', fontWeight: 800, textTransform: 'none',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                boxShadow: '0 8px 24px -4px rgba(245,158,11,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 12px 28px -4px rgba(245,158,11,0.45)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Continue Assessment
            </Button>
          </Box>
        </Dialog>


      </>
    );
  }

  return (
    <Box 
      sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
      onCopy={isProduction ? (e) => e.preventDefault() : undefined}
      onCut={isProduction ? (e) => e.preventDefault() : undefined}
      onPaste={isProduction ? (e) => e.preventDefault() : undefined}
      onContextMenu={isProduction ? (e) => e.preventDefault() : undefined}
      onSelectStart={isProduction ? (e) => e.preventDefault() : undefined}
      onDragStart={isProduction ? (e) => e.preventDefault() : undefined}
      onKeyDown={isProduction ? (e) => {
        const blockedKeys = ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Meta', 'Control', 'Insert'];
        
        if (blockedKeys.includes(e.key)) {
          e.preventDefault();
          setToastMessage(`${e.key} key is not allowed during assessment`);
          setToastSeverity('error');
          setShowToast(true);
          return;
        }
        
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x' || e.key === 'v' || e.key === 'a')) {
          e.preventDefault();
          setToastMessage(`${e.ctrlKey ? 'Ctrl' : 'Command'}+${e.key.toUpperCase()} is not allowed during assessment`);
          setToastSeverity('error');
          setShowToast(true);
        }
      } : undefined}
    >
      <AssessmentHeader
        logoUrl={config?.logoUrl}
        assessmentTitle={assessment?.title || 'Assessment'}
        studentName={studentData?.name || 'Student'}
        studentEmail={studentData?.email || ''}
        timeRemaining={timeRemaining}
        duration={assessment?.duration || 60}
        onSubmit={timeRemaining > 2 ? () => setShowFinalSubmitModal(true) : undefined}
      />
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: `${leftWidth}% 4px ${100 - leftWidth}%`,
        flexGrow: 1, 
        height: '100%',
        overflow: 'hidden'
      }}>
        {/* Problem Statement */}
        <Box sx={{ 
          overflow: 'auto', 
          height: '100%', 
          bgcolor: '#ffffff',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}>
          {/* Question Navigation */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 99 }}>
            {/* Part A/B Toggle */}
            {(() => {
              const hasQuiz = questions.filter(q => q.type === 'quiz').length > 0;
              const hasFrontend = questions.filter(q => q.type === 'frontend').length > 0;
              const hasMongoDB = questions.filter(q => q.type === 'mongodb').length > 0;
              const hasSQL = questions.filter(q => q.type === 'sql').length > 0;
              const hasProgramming = questions.filter(q => q.type === 'programming').length > 0;
              const totalParts = [hasQuiz, hasFrontend, hasMongoDB, hasSQL, hasProgramming].filter(Boolean).length;
              
              if (totalParts <= 1) return null;
              
              const types = [];
              if (hasQuiz) types.push('quiz');
              if (hasFrontend) types.push('frontend');
              if (hasMongoDB) types.push('mongodb');
              if (hasSQL) types.push('sql');
              if (hasProgramming) types.push('programming');
              
              const currentType = questions[currentQuestionIndex]?.type;
              const currentTypeIndex = types.indexOf(currentType);
              const partLabels = { quiz: 'Quiz', frontend: 'Frontend', mongodb: 'MongoDB', sql: 'SQL', programming: 'Programming' };
              const partLabel = `Part ${String.fromCharCode(65 + currentTypeIndex)} - ${partLabels[currentType]}`;
              
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>
                    {partLabel} ({questions.filter(q => q.type === currentType).length})
                  </Typography>
                  <ButtonGroup size="small" variant="outlined" sx={{ '& .MuiButtonGroup-grouped': { textTransform: 'none', fontWeight: 600, px: 2, py: 0.75 } }}>
                    {types.map((type, idx) => {
                      const isCurrent = type === currentType;
                      return (
                        <Button
                          key={type}
                          onClick={() => {
                            if (isCurrent) return;
                            const firstQuestionIndex = questions.findIndex(q => q.type === type);
                            if (firstQuestionIndex !== -1) {
                              setCurrentQuestionIndex(firstQuestionIndex);
                            }
                          }}
                          sx={isCurrent ? {
                            bgcolor: 'secondary.main',
                            color: 'white !important',
                            borderColor: 'secondary.main !important',
                            '&:hover': { bgcolor: 'secondary.dark', borderColor: 'secondary.dark !important' }
                          } : {
                            color: 'secondary.main',
                            borderColor: 'rgba(156, 39, 176, 0.5)',
                            '&:hover': { bgcolor: 'rgba(156, 39, 176, 0.04)', borderColor: 'secondary.main' }
                          }}
                        >
                          Part {String.fromCharCode(65 + idx)} - {partLabels[type]}
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                </Box>
              );
            })()}
            
            
            {/* Question Numbers */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {showLeftScroll && (
                <IconButton 
                  size="small" 
                  onClick={() => {
                    const container = document.getElementById('question-buttons');
                    container.scrollBy({ left: -200, behavior: 'smooth' });
                  }}
                  sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', color: '#6366f1' }}
                >
                  <ChevronLeft />
                </IconButton>
              )}
              <Box 
                id="question-buttons"
                sx={{ 
                  display: 'flex', 
                  gap: 1.25, 
                  overflow: 'auto',
                  flexGrow: 1,
                  py: 0.5,
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                  scrollBehavior: 'smooth'
                }}
              >
                {(() => {
                  const currentType = questions[currentQuestionIndex]?.type;
                  
                  return (questions || [])
                    .filter(q => q.type === currentType)
                    .map((q, filteredIndex) => {
                    const originalIndex = questions.findIndex(originalQ => originalQ._id === q._id);
                    const isCompleted = q.type === 'frontend' 
                      ? frontendCompletedQuestions.has(originalIndex)
                      : savedQuestions.has(originalIndex);
                    const isPartial = q.type === 'frontend' && !frontendCompletedQuestions.has(originalIndex) && (frontendQuestionPercentages[originalIndex] || 0) > 0;
                    const isActive = originalIndex === currentQuestionIndex;
                    
                    const isSaving = savingQuestions.has(originalIndex);

                    return (
                      <Button
                        key={originalIndex}
                        variant={isActive ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => {
                          setCurrentQuestionIndex(originalIndex);
                          setVisitedQuestions(prev => new Set([...prev, originalIndex]));
                        }}
                        sx={{
                          minWidth: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          fontWeight: 800,
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          
                          ...(isActive ? {
                            bgcolor: isCompleted ? '#10b981' : '#6366f1',
                            color: 'white',
                            boxShadow: `0 8px 16px -4px ${isCompleted ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.4)'}`,
                            transform: 'translateY(-2px)',
                            border: 'none',
                            '&:hover': { 
                                bgcolor: isCompleted ? '#059669' : '#4f46e5',
                                boxShadow: `0 12px 20px -6px ${isCompleted ? 'rgba(16, 185, 129, 0.5)' : 'rgba(99, 102, 241, 0.5)'}`
                            }
                          } : {
                            borderColor: isCompleted ? '#10b981' : (isPartial || visitedQuestions.has(originalIndex)) ? '#f59e0b' : '#e2e8f0',

                            bgcolor: isCompleted ? '#f0fdf4' : (isPartial || visitedQuestions.has(originalIndex)) ? '#fffbeb' : 'white',
                            color: isCompleted ? '#10b981' : (isPartial || visitedQuestions.has(originalIndex)) ? '#f59e0b' : '#64748b',
                            '&:hover': {
                              bgcolor: isCompleted ? '#dcfce7' : (isPartial || visitedQuestions.has(originalIndex)) ? '#fef3c7' : '#f8fafc',
                              borderColor: (isPartial || visitedQuestions.has(originalIndex)) ? '#f59e0b' : '#6366f1'
                            }
                          })
                        }}
                      >
                        {isSaving ? (
                          <CircularProgress size={18} sx={{ color: isActive ? 'white' : '#6366f1' }} />
                        ) : (
                          filteredIndex + 1
                        )}
                      </Button>
                    );
                  });
                })()}
              </Box>
              {showRightScroll && (
                <IconButton 
                  size="small" 
                  onClick={() => {
                    const container = document.getElementById('question-buttons');
                    container.scrollBy({ left: 200, behavior: 'smooth' });
                  }}
                  sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0', color: '#6366f1' }}
                >
                  <ChevronRight />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Unified Question Content for all types (Programming, Frontend, MongoDB, Quiz) */}
          <Box sx={{ p: { xs: 3, md: 5 }, maxWidth: '900px', mx: 'auto' }}>
            {/* Header Section */}
            <Typography variant="h2" sx={{ 
              fontWeight: 900, mb: 1.5, color: '#0f172a', 
              fontSize: { xs: '1.75rem', md: '2.5rem' }, 
              letterSpacing: '-0.025em',
              lineHeight: 1.2
            }}>
              {questions[currentQuestionIndex]?.title || 'System Initialization...'}
            </Typography>
            
            {/* Metadata Tags */}
            {questions[currentQuestionIndex]?.tags && questions[currentQuestionIndex].tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', mb: 4.5 }}>
                {questions[currentQuestionIndex].tags.map((tag, idx) => (
                  <Chip 
                    key={idx} 
                    label={tag}
                    size="small"
                    sx={{ 
                      fontWeight: 800, 
                      bgcolor: '#f1f5f9', 
                      color: '#475569',
                      borderRadius: '8px',
                      px: 0.5
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Content Sections - Stacked with consistent spacing */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              
              {/* 1. Core Description / Problem Statement */}
              {(questions[currentQuestionIndex]?.problemStatement || questions[currentQuestionIndex]?.description) && (
                <Box>
                  <Typography sx={{ 
                    fontWeight: 900, color: '#6366f1', textTransform: 'uppercase', 
                    fontSize: '0.75rem', letterSpacing: '0.1em', mb: 2.5,
                    display: 'flex', alignItems: 'center', gap: 1.5
                  }}>
                    <Box sx={{ width: 4, height: 16, bgcolor: '#6366f1', borderRadius: 1 }} />
                    Context & Requirements
                  </Typography>
                  <Box sx={{ 
                    p: 4, borderRadius: '24px', bgcolor: '#f8fafc', 
                    border: '1px solid #f1f5f9',
                    '& p': { m: 0, lineHeight: 1.8, color: '#334155', fontWeight: 600, fontSize: '1.1rem' },
                    '& div': { lineHeight: 1.8, color: '#334155', fontWeight: 600, fontSize: '1.1rem' }
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: questions[currentQuestionIndex]?.problemStatement || questions[currentQuestionIndex]?.description }} />
                  </Box>
                </Box>
              )}

              {/* 2. Logic / Code Snippets (Mostly for Quiz) */}
              {questions[currentQuestionIndex]?.codeSnippet && (
                <Box>
                  <Typography sx={{ 
                    fontWeight: 900, color: '#6366f1', textTransform: 'uppercase', 
                    fontSize: '0.75rem', letterSpacing: '0.1em', mb: 2.5,
                    display: 'flex', alignItems: 'center', gap: 1.5
                  }}>
                    <Box sx={{ width: 4, height: 16, bgcolor: '#6366f1', borderRadius: 1 }} />
                    Reference Snippet
                  </Typography>
                  <Box sx={{ 
                    p: 3, bgcolor: '#1e293b', borderRadius: '24px', 
                    border: '1px solid #0f172a', overflow: 'hidden'
                  }}>
                    <Typography component="pre" sx={{ 
                      whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: 1.7, margin: 0,
                      color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500
                    }}>
                      {questions[currentQuestionIndex].codeSnippet.replace(/\\n/g, '\n').replace(/\\t/g, '\t')}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* 3. Functional Specifications (Requirements) */}
              {questions[currentQuestionIndex]?.requirements && (
                <Box>
                  <Typography sx={{ 
                    fontWeight: 900, color: '#6366f1', textTransform: 'uppercase', 
                    fontSize: '0.75rem', letterSpacing: '0.1em', mb: 2.5,
                    display: 'flex', alignItems: 'center', gap: 1.5
                  }}>
                    <Box sx={{ width: 4, height: 16, bgcolor: '#6366f1', borderRadius: 1 }} />
                    Functional Specifications
                  </Typography>
                  <Stack spacing={2} sx={{ pl: 2 }}>
                    {(Array.isArray(questions[currentQuestionIndex].requirements) ? questions[currentQuestionIndex].requirements : [questions[currentQuestionIndex].requirements]).map((req, idx) => (
                      <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#6366f1', mt: 1.25, flexShrink: 0 }} />
                        <Typography sx={{ color: '#475569', fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.6 }}>{req}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* 4. Acceptance Criteria (Specifically for Frontend/Design) */}
              {questions[currentQuestionIndex]?.acceptanceCriteria && (
                <Box>
                  <Typography sx={{ 
                    fontWeight: 900, color: '#10b981', textTransform: 'uppercase', 
                    fontSize: '0.75rem', letterSpacing: '0.1em', mb: 2.5,
                    display: 'flex', alignItems: 'center', gap: 1.5
                  }}>
                    <Box sx={{ width: 4, height: 16, bgcolor: '#10b981', borderRadius: 1 }} />
                    Acceptance Criteria
                  </Typography>
                  <Stack spacing={2} sx={{ pl: 2 }}>
                    {questions[currentQuestionIndex].acceptanceCriteria.map((criteria, idx) => (
                      <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981', mt: 1.25, flexShrink: 0 }} />
                        <Typography sx={{ color: '#475569', fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.6 }}>{criteria}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* 5. Technical Constraints */}
              {questions[currentQuestionIndex]?.constraints && (
                <Box>
                  <Typography sx={{ 
                    fontWeight: 900, color: '#f97316', textTransform: 'uppercase', 
                    fontSize: '0.75rem', letterSpacing: '0.1em', mb: 2.5,
                    display: 'flex', alignItems: 'center', gap: 1.5
                  }}>
                    <Box sx={{ width: 4, height: 16, bgcolor: '#f97316', borderRadius: 1 }} />
                    Technical Constraints
                  </Typography>
                  <Box sx={{ p: 3, borderRadius: '20px', bgcolor: '#fff7ed', border: '1px solid #fed7aa' }}>
                    <Stack spacing={1.5}>
                      {(Array.isArray(questions[currentQuestionIndex].constraints) ? questions[currentQuestionIndex].constraints : [questions[currentQuestionIndex].constraints]).map((constraint, idx) => (
                        <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#f97316', flexShrink: 0 }} />
                          <Typography sx={{ color: '#9a3412', fontWeight: 800, fontSize: '0.95rem', fontFamily: "'JetBrains Mono', monospace" }}>{constraint}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              )}

              {/* 6. Example Scenarios */}
              {questions[currentQuestionIndex]?.example && (
                <Box>
                  <Typography sx={{ 
                    fontWeight: 900, color: '#6366f1', textTransform: 'uppercase', 
                    fontSize: '0.75rem', letterSpacing: '0.1em', mb: 2.5,
                    display: 'flex', alignItems: 'center', gap: 1.5
                  }}>
                    <Box sx={{ width: 4, height: 16, bgcolor: '#6366f1', borderRadius: 1 }} />
                    Example Scenario
                  </Typography>
                  <Box sx={{ 
                    p: 3.5, borderRadius: '24px', bgcolor: '#fafafa', border: '1px solid #f1f1f1', 
                    display: 'flex', flexDirection: 'column', gap: 2.5
                  }}>
                    {questions[currentQuestionIndex].example.input && (
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', mb: 1 }}>Input</Typography>
                        <Box sx={{ p: 2, bgcolor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#0f172a', fontWeight: 700 }}>
                          {questions[currentQuestionIndex].example.input}
                        </Box>
                      </Box>
                    )}
                    {questions[currentQuestionIndex].example.output && (
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', mb: 1 }}>Expected Output</Typography>
                        <Box sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '12px', fontFamily: "'JetBrains Mono', monospace", color: '#166534', fontWeight: 700 }}>
                          {questions[currentQuestionIndex].example.output}
                        </Box>
                      </Box>
                    )}
                    {questions[currentQuestionIndex].example.explanation && (
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', mb: 1 }}>Logic Breakdown</Typography>
                        <Typography sx={{ color: '#475569', fontWeight: 600, lineHeight: 1.7, fontSize: '0.95rem' }}>{questions[currentQuestionIndex].example.explanation}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* 7. Strategic Insights & Algorithm (Optional) */}
              {(questions[currentQuestionIndex]?.intuition?.keyInsights && assessment?.showKeyInsights) && (
                <Box>
                  <Typography sx={{ 
                    fontWeight: 900, color: '#8b5cf6', textTransform: 'uppercase', 
                    fontSize: '0.75rem', letterSpacing: '0.1em', mb: 2.5,
                    display: 'flex', alignItems: 'center', gap: 1.5
                  }}>
                    <Box sx={{ width: 4, height: 16, bgcolor: '#8b5cf6', borderRadius: 1 }} />
                    Strategic Insights
                  </Typography>
                  <Stack spacing={1.5} sx={{ pl: 2 }}>
                    {questions[currentQuestionIndex].intuition.keyInsights.map((insight, idx) => (
                      <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#8b5cf6', mt: 1.25, flexShrink: 0 }} />
                        <Typography sx={{ color: '#4c1d95', fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.6 }}>{insight}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* 8. Efficiency Analysis (Time & Space) */}
              {(questions[currentQuestionIndex]?.intuition?.timeComplexity || questions[currentQuestionIndex]?.intuition?.spaceComplexity) && (
                <Box>
                  <Typography sx={{ 
                    fontWeight: 900, color: '#6366f1', textTransform: 'uppercase', 
                    fontSize: '0.75rem', letterSpacing: '0.1em', mb: 2.5,
                    display: 'flex', alignItems: 'center', gap: 1.5
                  }}>
                    <Box sx={{ width: 4, height: 16, bgcolor: '#6366f1', borderRadius: 1 }} />
                    Efficiency Analysis
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    {questions[currentQuestionIndex].intuition.timeComplexity && (
                      <Box sx={{ p: 3, borderRadius: '24px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <Typography sx={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', mb: 1, letterSpacing: '0.1em' }}>Time Complexity</Typography>
                        <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.25rem', fontFamily: "'JetBrains Mono', monospace" }}>{questions[currentQuestionIndex].intuition.timeComplexity}</Typography>
                      </Box>
                    )}
                    {questions[currentQuestionIndex].intuition.spaceComplexity && (
                      <Box sx={{ p: 3, borderRadius: '24px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                        <Typography sx={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', mb: 1, letterSpacing: '0.1em' }}>Space Complexity</Typography>
                        <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.25rem', fontFamily: "'JetBrains Mono', monospace" }}>{questions[currentQuestionIndex].intuition.spaceComplexity}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Divider */}
        <Box 
          className="divider-drag"
          sx={{ 
            width: '2px', // Thin but visible
            bgcolor: '#e2e8f0', 
            cursor: 'col-resize',
            transition: 'all 0.2s',
            zIndex: 10,
            '&:hover': { bgcolor: '#6366f1', width: '4px' }
          }}
          onMouseDown={() => setIsDragging(true)}
        />

        {/* Right Side - Quiz Options or Code Editor */}
        <Box sx={{ 
          bgcolor: '#ffffff', 
          overflow: 'auto',
          height: '100%',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none'
        }}>
          {questions[currentQuestionIndex]?.type === 'quiz' ? (
            <Box className="quiz-options" sx={{ p: { xs: 3, md: 5 }, userSelect: 'none', WebkitUserSelect: 'none' }}>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 4, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Select Response
              </Typography>
              
              <RadioGroup
                value={answers[questions[currentQuestionIndex]?._id] || ''}
                onChange={(e) => {
                  const selectedOptionId = e.target.value;
                  setAnswers(prev => ({
                    ...prev,
                    [questions[currentQuestionIndex]._id]: selectedOptionId
                  }));
                }}
              >
                <Stack spacing={2.5}>
                  {(questions[currentQuestionIndex]?.options || []).map((option, idx) => (
                    <Box key={option._id || idx}>
                      <FormControlLabel
                        value={option.originalIndex !== undefined ? option.originalIndex.toString() : idx.toString()}
                        control={<Radio sx={{ display: 'none' }} />}
                        label={
                          <Card sx={{ 
                            p: 3, 
                            width: '100%',
                            minWidth: { md: '500px' },
                            borderRadius: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: '1px solid',
                            borderColor: answers[questions[currentQuestionIndex]?._id] === (option.originalIndex !== undefined ? option.originalIndex.toString() : idx.toString()) ? '#6366f1' : '#f1f5f9',
                            bgcolor: answers[questions[currentQuestionIndex]?._id] === (option.originalIndex !== undefined ? option.originalIndex.toString() : idx.toString()) ? '#f5f7ff' : '#ffffff',
                            boxShadow: answers[questions[currentQuestionIndex]?._id] === (option.originalIndex !== undefined ? option.originalIndex.toString() : idx.toString()) ? '0 12px 24px -8px rgba(99, 102, 241, 0.2)' : 'none',
                            '&:hover': {
                              borderColor: '#6366f1',
                              bgcolor: answers[questions[currentQuestionIndex]?._id] === (option.originalIndex !== undefined ? option.originalIndex.toString() : idx.toString()) ? '#f5f7ff' : '#f8fafc',
                              transform: 'translateX(8px)'
                            }
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Box sx={{ 
                                width: 44, height: 44, borderRadius: '16px', 
                                bgcolor: answers[questions[currentQuestionIndex]?._id] === (option.originalIndex !== undefined ? option.originalIndex.toString() : idx.toString()) ? '#6366f1' : '#f1f5f9',
                                color: answers[questions[currentQuestionIndex]?._id] === (option.originalIndex !== undefined ? option.originalIndex.toString() : idx.toString()) ? 'white' : '#64748b',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 900, fontSize: '1.2rem', flexShrink: 0
                              }}>
                                {String.fromCharCode(65 + idx)}
                              </Box>
                              <Typography sx={{ fontWeight: 700, color: answers[questions[currentQuestionIndex]?._id] === (option.originalIndex !== undefined ? option.originalIndex.toString() : idx.toString()) ? '#1e293b' : '#475569', fontSize: '1.15rem' }}>
                                {option.text}
                              </Typography>
                            </Box>
                          </Card>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Box>
                  ))}
                </Stack>
              </RadioGroup>
              
              <Box className="quiz-navigation-buttons" sx={{ mt: 6, display: 'flex', justifyContent: 'space-between', gap: 3, pt: 4, borderTop: '1px solid #f1f5f9' }}>
                <Button
                  variant="outlined"
                  startIcon={<ChevronLeft />}
                  onClick={() => {
                    const currentType = questions[currentQuestionIndex]?.type;
                    const filteredQuestions = questions.filter(q => q.type === currentType);
                    const currentFilteredIndex = filteredQuestions.findIndex(q => q._id === questions[currentQuestionIndex]._id);
                    if (currentFilteredIndex > 0) {
                      const prevQuestion = filteredQuestions[currentFilteredIndex - 1];
                      const prevIndex = questions.findIndex(q => q._id === prevQuestion._id);
                      setCurrentQuestionIndex(prevIndex);
                    }
                  }}
                  disabled={(() => {
                    const currentType = questions[currentQuestionIndex]?.type;
                    const filteredQuestions = questions.filter(q => q.type === currentType);
                    const currentFilteredIndex = filteredQuestions.findIndex(q => q._id === questions[currentQuestionIndex]._id);
                    return currentFilteredIndex === 0;
                  })()}
                  sx={{ 
                    px: 6, py: 2, borderRadius: '16px', fontWeight: 900, fontSize: '1rem',
                    textTransform: 'none', borderColor: '#e2e8f0', color: '#475569',
                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  endIcon={<ChevronRight />}
                  onClick={() => {
                    const currentIdx = currentQuestionIndex;
                    const currentQuestionId = questions[currentIdx]?._id;

                    const moveNext = () => {
                      const currentType = questions[currentIdx]?.type;
                      const filteredQuestions = questions.filter(q => q.type === currentType);
                      const currentFilteredIndex = filteredQuestions.findIndex(q => q._id === currentQuestionId);
                      if (currentFilteredIndex < filteredQuestions.length - 1) {
                        const nextQuestion = filteredQuestions[currentFilteredIndex + 1];
                        const nextIndex = questions.findIndex(q => q._id === nextQuestion._id);
                        setCurrentQuestionIndex(nextIndex);
                        setVisitedQuestions(prev => new Set([...prev, nextIndex]));
                      }
                    };

                    // Always move to next question immediately
                    moveNext();

                    // Save in background
                    if (answers[currentQuestionId] && attemptId) {
                      setSavingQuestions(prev => new Set([...prev, currentIdx]));
                      const token = localStorage.getItem('studentToken');
                      const selectedOptionId = answers[currentQuestionId];
                      const origOptionIndex = selectedOptionId ? parseInt(selectedOptionId, 10) : 0;

                      apiService.saveQuizAnswer(token, attemptId, currentQuestionId, origOptionIndex)
                        .then(() => {
                          setSavedQuestions(prev => new Set([...prev, currentIdx]));
                        })
                        .catch((error) => {
                          console.error('Error saving quiz answer:', error);
                          setToastSeverity('error');
                          setToastMessage('Answer not saved. Please try again.');
                          setShowToast(true);
                        })
                        .finally(() => {
                          setSavingQuestions(prev => {
                            const next = new Set(prev);
                            next.delete(currentIdx);
                            return next;
                          });
                        });
                    } else if (answers[currentQuestionId]) {
                      setSavedQuestions(prev => new Set([...prev, currentIdx]));
                    }
                  }}
                  sx={{ 
                    px: 6, py: 2, borderRadius: '16px', fontWeight: 900, fontSize: '1rem',
                    textTransform: 'none', bgcolor: '#6366f1',
                    boxShadow: '0 8px 20px -6px rgba(99, 102, 241, 0.5)',
                    '&:hover': { bgcolor: '#4f46e5', boxShadow: '0 12px 25px -8px rgba(99, 102, 241, 0.6)' }
                  }}
                >
                  Save & Next
                </Button>
              </Box>
            </Box>
          ) : questions[currentQuestionIndex]?.type === 'mongodb' ? (
            <MongoDBPlaygroundEditor 
              key={`mongodb-${currentQuestionIndex}-${execCounter}`}
              assessment={assessment} 
              question={questions[currentQuestionIndex]} 
              attemptId={attemptId}
              onTestComplete={(passed, total) => {
                if (passed === total && total > 0) {
                  setSavedQuestions(prev => new Set([...prev, currentQuestionIndex]));
                } else {
                  setSavedQuestions(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(currentQuestionIndex);
                    return newSet;
                  });
                }
              }}
            />
          ) : questions[currentQuestionIndex]?.type === 'sql' ? (
            <SQLPlaygroundEditor 
              key={`sql-${currentQuestionIndex}-${execCounter}`}
              assessment={assessment} 
              question={questions[currentQuestionIndex]} 
              attemptId={attemptId}
              onTestComplete={(passed, total) => {
                if (passed === total && total > 0) {
                  setSavedQuestions(prev => new Set([...prev, currentQuestionIndex]));
                } else {
                  setSavedQuestions(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(currentQuestionIndex);
                    return newSet;
                  });
                }
              }}
            />
          ) : questions[currentQuestionIndex]?.type === 'frontend' ? (
            <FrontendEditor 
              key={`frontend-${currentQuestionIndex}-${execCounter}`}
              assessment={assessment} 
              question={questions[currentQuestionIndex]} 
              attemptId={attemptId}
              version={execCounter}
              onTestComplete={(passed, total, percentage) => {
                setFrontendQuestionPercentages(prev => ({ ...prev, [currentQuestionIndex]: percentage || 0 }));
                if (passed === total && total > 0) {
                  setFrontendCompletedQuestions(prev => new Set([...prev, currentQuestionIndex]));
                } else {
                  setFrontendCompletedQuestions(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(currentQuestionIndex);
                    return newSet;
                  });
                }
              }}
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }} data-compiler-container>
              {/* Code Editor Section */}
              <Box sx={{ 
                height: `${compilerSplit}%`, 
                display: 'flex', 
                flexDirection: 'column', 
                borderBottom: '1px solid', 
                borderColor: '#f1f5f9', 
                bgcolor: '#ffffff',
                overflow: 'hidden'
              }}>
                {/* Editor Header */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: 2, 
                  px: 2.5, 
                  py: 1, 
                  bgcolor: '#ffffff', 
                  borderBottom: '1px solid #f1f5f9',
                  overflowX: 'auto',
                  minHeight: '68px',
                  '&::-webkit-scrollbar': { height: '4px' },
                  '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: '4px' }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Language Selector */}
                    <FormControl size="small" className="language-selector" sx={{ minWidth: 130 }}>
                      <InputLabel sx={{ fontWeight: 700 }}>Language</InputLabel>
                      <Select
                        value={language}
                        label="Language"
                        onChange={(e) => setLanguage(e.target.value)}
                        sx={{
                          borderRadius: '12px',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' }
                        }}
                      >
                        {(assessment?.allowedLanguages || ['python', 'cpp', 'java', 'c']).map((lang) => (
                          <MenuItem key={lang} value={lang}>
                            {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Font Size Control */}
                    <Box sx={{ 
                      display: 'flex', alignItems: 'center', gap: 0.5, 
                      bgcolor: '#f8fafc', px: 1, py: 0.5, borderRadius: '12px',
                      border: '1px solid #f1f5f9'
                    }}>
                      <IconButton size="small" onClick={() => setFontSize(prev => Math.max(12, prev - 2))} sx={{ color: '#64748b' }}>
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" sx={{ minWidth: '32px', textAlign: 'center', fontWeight: 900, color: '#0f172a', fontFamily: 'JetBrains Mono' }}>
                        {fontSize}px
                      </Typography>
                      <IconButton size="small" onClick={() => setFontSize(prev => Math.min(32, prev + 2))} sx={{ color: '#64748b' }}>
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Last Code Button */}
                    <Button
                      variant="outlined"
                      size="small"
                      className="last-code-button"
                      onClick={() => recoverFullSession(localStorage.getItem('studentToken'), attemptId, questions)}
                      disabled={!attemptId}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '12px',
                        fontWeight: 800,
                        px: 2,
                        borderColor: '#e2e8f0',
                        color: '#475569',
                        '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                        '&.Mui-disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' }
                      }}
                    >
                      Recover Session
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Run Code Button */}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={isRunning ? <CircularProgress size={16} sx={{ color: '#6366f1' }} /> : <PlayArrow />}
                      onClick={handleRunCode}
                      disabled={!code.trim() || isRunning}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '12px',
                        fontWeight: 800,
                        px: 2.5,
                        py: 0.8,
                        borderColor: '#e2e8f0',
                        color: '#475569',
                        '&:hover': { bgcolor: '#f8fafc', borderColor: '#6366f1', color: '#6366f1' },
                        '&.Mui-disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' }
                      }}
                    >
                      {isRunning ? 'Running...' : 'Run Code'}
                    </Button>

                    {/* Submit Button */}
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={handleSubmit}
                      disabled={!code.trim() || isSubmitting}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '12px',
                        fontWeight: 900,
                        px: 3,
                        py: 1,
                        bgcolor: '#6366f1',
                        boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
                        '&:hover': { bgcolor: '#4f46e5', boxShadow: '0 12px 20px -5px rgba(99, 102, 241, 0.4)' }
                      }}
                    >
                      Submit Code
                    </Button>
                  </Box>
                </Box>
                
                {/* Editor Area */}
                <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden', bgcolor: '#1e1e1e' }}>
                  {language ? (
                    <Editor
                      height="100%"
                      language={getMonacoLanguage(language)}
                      value={code}
                      theme="vs-dark"
                      onChange={(value) => setCode(value || '')}
                      onMount={(editor) => { editorRef.current = editor; }}
                      options={{
                        fontSize: fontSize,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        folding: true,
                        autoIndent: 'full',
                        formatOnPaste: true,
                        formatOnType: true,
                        padding: { top: 24 },
                        fontFamily: "'JetBrains Mono', monospace",
                        fontLigatures: true,
                        cursorSmoothCaretAnimation: 'on',
                        smoothScrolling: true,
                        lineHeight: 1.6
                      }}
                    />
                  ) : (
                    <Box sx={{ 
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#f8fafc'
                    }}>
                      <Typography sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem' }}>
                        Select a programming language to start coding
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              
              {/* Resizable Divider */}
              <Box
                sx={{
                  height: '3px',
                  cursor: 'row-resize',
                  bgcolor: '#e2e8f0',
                  position: 'relative',
                  zIndex: 200,
                  transition: 'background 0.2s',
                  '&:hover': {
                    bgcolor: '#6366f1'
                  }
                }}
                onMouseDown={() => setIsCompilerDragging(true)}
              />
              
              {/* Test Cases Section */}
              <Box sx={{ height: `${100 - compilerSplit}%`, display: 'flex', flexDirection: 'column', zIndex: 100, position: 'relative', bgcolor: '#ffffff', minHeight: 0, overflow: 'hidden', maxHeight: `${100 - compilerSplit}%` }}>
                {(() => {
                  const publicTestCases = questions[currentQuestionIndex]?.testCases?.filter(tc => tc.isPublic) || [];
                  const allTestCases = [...publicTestCases, ...customTestCases];
                  const canAddMore = publicTestCases.length >= 3 && customTestCases.length < 4;
                  
                  return (
                    <>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5, 
                        px: 2,
                        py: 1.25, 
                        bgcolor: '#f8fafc', 
                        borderBottom: '1px solid #f1f5f9', 
                        overflowX: 'auto', 
                        minHeight: '52px',
                        flexShrink: 0,
                        '&::-webkit-scrollbar': { height: '3px' },
                        '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0' }
                      }}>
                        {allTestCases.map((tc, index) => {
                          const result = testCaseResults[index];
                          const isCustom = index >= publicTestCases.length;
                          const isPassed = !isCustom && result && !result.loading && !result.error && 
                            result.output?.trim() === (tc.expectedOutput || tc.output)?.toString().trim();
                          const isFailed = !isCustom && result && !result.loading && (result.error || 
                            result.output?.trim() !== (tc.expectedOutput || tc.output)?.toString().trim());
                          const isActive = index === currentTestCaseTab;
                          
                          return (
                            <Box
                              key={index}
                              onClick={() => setCurrentTestCaseTab(index)}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 2,
                                py: 0.75,
                                bgcolor: isActive ? '#ffffff' : 'transparent',
                                color: isActive ? '#0f172a' : '#64748b',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: isActive 
                                  ? (isPassed ? '#bbf7d0' : isFailed ? '#fecaca' : '#e2e8f0')
                                  : 'transparent',
                                boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.04)' : 'none',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap',
                                '&:hover': { bgcolor: isActive ? '#ffffff' : 'rgba(0,0,0,0.03)' }
                              }}
                            >
                              {isPassed && <CheckCircle sx={{ fontSize: 14, color: '#10b981' }} />}
                              {isFailed && <Close sx={{ fontSize: 14, color: '#ef4444' }} />}
                              <Typography variant="body2" sx={{ fontWeight: isActive ? 800 : 700, fontSize: '0.8rem', letterSpacing: '-0.01em' }}>
                                {isCustom ? `Custom ${index - publicTestCases.length + 1}` : `Case ${index + 1}`}
                              </Typography>
                              {result?.loading && <CircularProgress size={14} sx={{ color: '#6366f1' }} />}
                            </Box>
                          );
                        })}
                        {canAddMore && (
                          <Box
                            onClick={() => setShowAddCustomInput(true)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              px: 2,
                              py: 0.75,
                              cursor: 'pointer',
                              borderRadius: '8px',
                              color: '#6366f1',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              transition: 'all 0.15s ease',
                              '&:hover': { bgcolor: '#f5f3ff' }
                            }}
                          >
                            <Add sx={{ fontSize: 16 }} />
                            <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.8rem' }}>Custom</Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Box sx={{ p: 3, flexGrow: 1, flexShrink: 1, overflowY: 'auto', pb: 8, bgcolor: '#ffffff', minHeight: 0, maxHeight: '100%', '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: '4px' } }}>
                        {allTestCases.length > 0 && allTestCases[currentTestCaseTab] ? (
                          <>
                            <Box sx={{ mb: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Typography sx={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                                  Input
                                </Typography>
                                {currentTestCaseTab >= publicTestCases.length && (
                                  <Box
                                    onClick={() => {
                                      const customIndex = currentTestCaseTab - publicTestCases.length;
                                      setCustomInput(customTestCases[customIndex].input);
                                      setEditingCustomIndex(customIndex);
                                      setShowAddCustomInput(true);
                                    }}
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 0.5, 
                                      color: 'secondary.main',
                                      cursor: 'pointer',
                                      '&:hover': { opacity: 0.8 }
                                    }}
                                  >
                                    <Edit fontSize="small" />
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Edit</Typography>
                                  </Box>
                                )}
                              </Box>
                              <Box sx={{ 
                                bgcolor: '#f8fafc',
                                border: '1px solid #f1f5f9',
                                p: 2.5,
                                borderRadius: '12px',
                                fontFamily: "'JetBrains Mono', monospace",
                                whiteSpace: 'pre-wrap',
                                fontSize: '0.9rem',
                                color: '#1e293b',
                                lineHeight: 1.6
                              }}>
                                {allTestCases[currentTestCaseTab].input}
                              </Box>
                            </Box>
                            
                            {testCaseResults[currentTestCaseTab] && (
                              <Box sx={{ mb: 3 }}>
                                <Typography sx={{ fontWeight: 800, mb: 1.5, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                                  Your Output
                                </Typography>
                                <Box sx={{ 
                                  bgcolor: testCaseResults[currentTestCaseTab].error ? '#fef2f2' : (currentTestCaseTab >= publicTestCases.length ? '#f8fafc' : '#f0fdf4'),
                                  border: '1px solid',
                                  borderColor: testCaseResults[currentTestCaseTab].error ? '#fecaca' : (currentTestCaseTab >= publicTestCases.length ? '#f1f5f9' : '#bbf7d0'),
                                  p: 2.5,
                                  borderRadius: '12px',
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: '0.9rem',
                                  color: '#1e293b',
                                  whiteSpace: 'pre',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: testCaseResults[currentTestCaseTab].loading ? 'center' : 'flex-start',
                                  minHeight: '60px',
                                  lineHeight: 1.6
                                }}>
                                  {testCaseResults[currentTestCaseTab].loading ? (
                                    <CircularProgress size={24} sx={{ color: '#6366f1' }} />
                                  ) : testCaseResults[currentTestCaseTab].error ? (
                                    <Typography sx={{ color: '#dc2626', whiteSpace: 'pre-wrap', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}>
                                      {testCaseResults[currentTestCaseTab].error}
                                    </Typography>
                                  ) : (
                                    testCaseResults[currentTestCaseTab].output || 'No output'
                                  )}
                                </Box>
                              </Box>
                            )}
                            
                            {currentTestCaseTab < publicTestCases.length && (
                              <Box sx={{ mb: 3 }}>
                                <Typography sx={{ fontWeight: 800, mb: 1.5, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                                  Expected Output
                                </Typography>
                                <Box sx={{ 
                                  bgcolor: '#f8fafc',
                                  border: '1px solid #f1f5f9',
                                  p: 2.5,
                                  borderRadius: '12px',
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: '0.9rem',
                                  color: '#1e293b',
                                  whiteSpace: 'pre',
                                  lineHeight: 1.6
                                }}>
                                  {typeof (allTestCases[currentTestCaseTab].expectedOutput || allTestCases[currentTestCaseTab].output) === 'object' 
                                    ? JSON.stringify(allTestCases[currentTestCaseTab].expectedOutput || allTestCases[currentTestCaseTab].output, null, 2)
                                    : (allTestCases[currentTestCaseTab].expectedOutput || allTestCases[currentTestCaseTab].output)}
                                </Box>
                              </Box>
                            )}
                            
                            {allTestCases[currentTestCaseTab].explanation && (
                              <Box sx={{ mb: 3 }}>
                                <Typography sx={{ fontWeight: 800, mb: 1.5, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                                  Explanation
                                </Typography>
                                <Box sx={{ 
                                  bgcolor: '#f8fafc',
                                  border: '1px solid #f1f5f9',
                                  p: 2.5,
                                  borderRadius: '12px',
                                  fontSize: '0.9rem',
                                  color: '#1e293b',
                                  lineHeight: 1.6
                                }}>
                                  {allTestCases[currentTestCaseTab].explanation}
                                </Box>
                              </Box>
                            )}
                          </>
                        ) : (
                          <Typography sx={{ color: '#94a3b8', textAlign: 'center', mt: 4, fontWeight: 600, fontSize: '0.9rem' }}>
                            No public test cases available
                          </Typography>
                        )}
                      </Box>
                    </>
                  );
                })()}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton={false}
        disableCloseOnEsc
        disableOverlayClose
        hideCloseButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#6a0dad',
            zIndex: 10000,
          },
          tooltip: {
            fontSize: '1.1rem',
          },
          buttonNext: {
            backgroundColor: '#6a0dad',
            fontSize: '1rem',
            padding: '10px 20px'
          },
          buttonBack: {
            color: '#6a0dad',
            fontSize: '1rem'
          }
        }}
        locale={{
          back: 'Back',
          last: 'Finish',
          next: 'Next'
        }}
      />

      <Modal open={showFullscreenWarning} disableEscapeKeyDown>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#ffffff',
          boxShadow: '0 0 60px rgba(239,68,68,0.12), 0 25px 50px -12px rgba(0,0,0,0.15)',
          borderRadius: '24px',
          overflow: 'hidden',
          minWidth: 480,
          maxWidth: 520,
          border: '1px solid #fecaca'
        }}>
          {/* Red accent bar */}
          <Box sx={{
            height: '4px',
            background: 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)',
            backgroundSize: '200% 100%',
            animation: 'fsShimmer2 2s linear infinite',
            '@keyframes fsShimmer2': {
              '0%': { backgroundPosition: '200% 0' },
              '100%': { backgroundPosition: '-200% 0' }
            }
          }} />

          <Box sx={{ p: 5, textAlign: 'center' }}>
            {/* Icon */}
            <Box sx={{
              width: 64, height: 64, borderRadius: '18px',
              background: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)',
              border: '1px solid #fecaca',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 3
            }}>
              <FullscreenExit sx={{ fontSize: 32, color: '#dc2626' }} />
            </Box>

            <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.5rem', letterSpacing: '-0.02em', mb: 1 }}>
              Fullscreen Required
            </Typography>
            <Typography sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.95rem', mb: 4 }}>
              Assessment will auto-submit if you don't return to fullscreen
            </Typography>

            {/* Countdown ring */}
            <Box sx={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: `conic-gradient(#ef4444 ${((30 - fullscreenWarningTimer) / 30) * 360}deg, #fee2e2 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 4px 20px rgba(239,68,68,0.15)'
            }}>
              <Box sx={{
                width: 112,
                height: 112,
                borderRadius: '50%',
                bgcolor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <Typography sx={{
                  fontWeight: 900,
                  color: '#dc2626',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '2.5rem',
                  lineHeight: 1
                }}>
                  {fullscreenWarningTimer}
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, mt: 0.5 }}>
                  seconds
                </Typography>
              </Box>
            </Box>

            {/* Exit count badge */}
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              px: 2.5, py: 1, borderRadius: '10px',
              bgcolor: '#fef2f2', border: '1px solid #fecaca', mb: 4
            }}>
              <Warning sx={{ fontSize: 16, color: '#dc2626' }} />
              <Typography sx={{ fontWeight: 700, color: '#991b1b', fontSize: '0.85rem' }}>
                Fullscreen exits: {fullscreenExitCount}
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleEnterFullscreen}
              sx={{
                py: 1.8, fontSize: '1rem', fontWeight: 800, textTransform: 'none',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                boxShadow: '0 8px 24px -4px rgba(220,38,38,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 12px 28px -4px rgba(220,38,38,0.45)'
                },
                transition: 'all 0.2s ease'
              }}
              startIcon={<FullscreenExit />}
            >
              Return to Fullscreen
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Tab Switch Warning Modal */}
      <Dialog
        open={showTabSwitchWarning}
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiBackdrop-root': {
            background: 'rgba(15,23,42,0.25)',
            backdropFilter: 'blur(6px)'
          },
          '& .MuiDialog-paper': {
            borderRadius: '24px',
            bgcolor: '#ffffff',
            boxShadow: '0 0 60px rgba(245,158,11,0.1), 0 25px 50px -12px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            border: '1px solid #fde68a'
          }
        }}
      >
        {/* Amber accent bar */}
        <Box sx={{
          height: '4px',
          background: 'linear-gradient(90deg, #f59e0b, #f97316, #f59e0b)',
          backgroundSize: '200% 100%',
          animation: 'tabShimmer2 2s linear infinite',
          '@keyframes tabShimmer2': {
            '0%': { backgroundPosition: '200% 0' },
            '100%': { backgroundPosition: '-200% 0' }
          }
        }} />

        <Box sx={{ p: 5, textAlign: 'center' }}>
          {/* Icon */}
          <Box sx={{
            width: 64, height: 64, borderRadius: '18px',
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1px solid #fde68a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 3
          }}>
            <TabUnselected sx={{ fontSize: 32, color: '#d97706' }} />
          </Box>

          <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.5rem', letterSpacing: '-0.02em', mb: 1 }}>
            Tab Switch Detected!
          </Typography>
          <Typography sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.95rem', mb: 3 }}>
            You switched away from the assessment tab
          </Typography>

          {/* Tab switch count badge */}
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 1.5,
            px: 3, py: 1.5, borderRadius: '12px',
            bgcolor: '#fffbeb', border: '1px solid #fde68a', mb: 3
          }}>
            <Typography sx={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>
              Tab switches: <strong>{tabSwitchCount}</strong>
              {assessment?.maxTabSwitches && assessment.maxTabSwitches !== -1 && (
                <> / <strong>{assessment.maxTabSwitches}</strong> allowed</>
              )}
              {assessment?.maxTabSwitches === -1 && (
                <> (Unlimited allowed)</>
              )}
            </Typography>
          </Box>

          <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500, mb: 4, lineHeight: 1.6, px: 2 }}>
            Please stay on this tab. Excessive tab switching may result in automatic assessment termination.
          </Typography>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => setShowTabSwitchWarning(false)}
            sx={{
              py: 1.8, fontSize: '1rem', fontWeight: 800, textTransform: 'none',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              boxShadow: '0 8px 24px -4px rgba(245,158,11,0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 12px 28px -4px rgba(245,158,11,0.45)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Continue Assessment
          </Button>
        </Box>
      </Dialog>

      {/* Submit Results Modal */}
      <Dialog 
        open={showSubmitModal} 
        onClose={!isSubmitting ? () => setShowSubmitModal(false) : undefined}
        maxWidth="md" 
        fullWidth 
        disableEscapeKeyDown={isSubmitting}
        PaperProps={{ sx: { borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' } }}
      >
        <DialogTitle sx={{ p: 4, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', fontSize: '1.75rem' }}>
              Execution Summary
            </Typography>
            {!isSubmitting && (
              <IconButton onClick={() => setShowSubmitModal(false)} sx={{ color: '#94a3b8' }}>
                <Close />
              </IconButton>
            )}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 4, bgcolor: '#ffffff' }}>
          {isSubmitting ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <CircularProgress size={48} sx={{ color: '#6366f1', mb: 3 }} />
              <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '1.1rem' }}>Executing test cases...</Typography>
            </Box>
          ) : (
            <Box>
              {/* Summary Cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 5 }}>
                <Box sx={{ p: 3, borderRadius: '24px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <Typography sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em', mb: 1 }}>Test Results</Typography>
                  <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '2rem' }}>
                    {submitResults.filter(r => r.passed === true).length}{' '}
                    <Typography component="span" sx={{ fontSize: '1rem', color: '#64748b', fontWeight: 700 }}>out of</Typography>{' '}
                    {submitResults.length}
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', mt: 0.5 }}>Test Cases Passed</Typography>
                </Box>

                {(() => {
                  const passRate = submitResults.length > 0 ? Math.round((submitResults.filter(r => r.passed === true).length / submitResults.length) * 100) : 0;
                  return (
                    <Box sx={{ p: 3, borderRadius: '24px', bgcolor: passRate >= 70 ? '#f0fdf4' : '#fef2f2', border: '1px solid', borderColor: passRate >= 70 ? '#dcfce7' : '#fee2e2' }}>
                      <Typography sx={{ color: passRate >= 70 ? '#22c55e' : '#ef4444', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em', mb: 1 }}>Pass Rate</Typography>
                      <Typography sx={{ fontWeight: 900, color: passRate >= 70 ? '#14532d' : '#991b1b', fontSize: '2rem' }}>
                        {passRate}%
                      </Typography>
                      <Box sx={{ width: '100%', height: 6, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 3, mt: 1.5, overflow: 'hidden' }}>
                        <Box sx={{ width: `${passRate}%`, height: '100%', bgcolor: passRate >= 70 ? '#22c55e' : '#ef4444', transition: 'width 0.5s ease' }} />
                      </Box>
                    </Box>
                  );
                })()}
              </Box>

              {/* Test Case List */}
              <Typography sx={{ fontWeight: 800, color: '#0f172a', mb: 2.5, fontSize: '1.15rem' }}>Test Case Diagnostics</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {submitResults.map((result) => (
                  <Box key={result.index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2.5, 
                    p: 2.5, 
                    bgcolor: '#f8fafc',
                    borderRadius: '20px',
                    border: '1px solid #f1f5f9',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateX(8px)', borderColor: '#cbd5e1' }
                  }}>
                    <Box sx={{ 
                      width: 40, height: 40, borderRadius: '14px', flexShrink: 0,
                      bgcolor: result.passed === true ? '#dcfce7' : result.passed === false ? '#fee2e2' : '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {result.passed === true && <CheckCircle sx={{ color: '#22c55e', fontSize: 20 }} />}
                      {result.passed === false && <Close sx={{ color: '#ef4444', fontSize: 20 }} />}
                      {result.passed === null && result.status === 'Running' && <CircularProgress size={18} sx={{ color: '#6366f1' }} />}
                      {result.passed === null && result.status === 'Pending' && <AccessTime sx={{ color: '#94a3b8', fontSize: 20 }} />}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>Test Case {result.index}</Typography>
                        <Box sx={{
                          px: 1.5, py: 0.25, borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800,
                          bgcolor: result.type === 'Public' ? '#eef2ff' : '#faf5ff',
                          color: result.type === 'Public' ? '#6366f1' : '#8b5cf6',
                          letterSpacing: '0.05em'
                        }}>
                          {result.type}
                        </Box>
                      </Box>
                      <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem', mt: 0.25 }}>
                        {result.passed === true ? 'Scenario verified successfully' : result.passed === false ? 'Output mismatch detected' : result.status}
                      </Typography>
                    </Box>
                    <Typography sx={{ 
                      fontWeight: 800, fontSize: '0.8rem',
                      color: result.passed === true ? '#10b981' : result.passed === false ? '#ef4444' : '#94a3b8'
                    }}>
                      {result.passed === true ? 'PASSED' : result.passed === false ? 'FAILED' : result.status?.toUpperCase()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        {!isSubmitting && (
          <DialogActions sx={{ p: 4, pt: 2 }}>
            <Button 
              onClick={() => setShowSubmitModal(false)} 
              variant="contained"
              fullWidth
              sx={{ 
                borderRadius: '16px', 
                py: 2, 
                fontWeight: 900,
                fontSize: '1rem',
                textTransform: 'none',
                bgcolor: '#0f172a',
                '&:hover': { bgcolor: '#1e293b' } 
              }}
            >
              Return to Editor
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Final Submit Modal — Light Theme */}
      <Dialog
        open={showFinalSubmitModal}
        onClose={isTimeUp ? undefined : () => { setShowFinalSubmitModal(false); setEndTestInput(''); }}
        disableEscapeKeyDown={isTimeUp}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiBackdrop-root': {
            background: isTimeUp
              ? 'rgba(127,29,29,0.35)'
              : 'rgba(15,23,42,0.25)',
            backdropFilter: 'blur(8px)'
          },
          '& .MuiDialog-paper': {
            borderRadius: '24px',
            bgcolor: '#ffffff',
            boxShadow: isTimeUp
              ? '0 0 60px rgba(239,68,68,0.15), 0 25px 50px -12px rgba(0,0,0,0.15)'
              : '0 0 60px rgba(99,102,241,0.1), 0 25px 50px -12px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            border: isTimeUp ? '1px solid #fecaca' : '1px solid #e2e8f0',
            animation: isTimeUp ? 'subtlePulse 2s ease-in-out infinite' : 'none'
          },
          '@keyframes subtlePulse': {
            '0%, 100%': { boxShadow: '0 0 60px rgba(239,68,68,0.15), 0 25px 50px -12px rgba(0,0,0,0.15)' },
            '50%': { boxShadow: '0 0 80px rgba(239,68,68,0.25), 0 25px 50px -12px rgba(0,0,0,0.15)' }
          },
          '@keyframes countdownPulse': {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.08)' }
          },
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }}
      >
        {/* Top accent bar */}
        <Box sx={{
          height: '4px',
          background: isTimeUp
            ? 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)'
            : 'linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite',
          '@keyframes shimmer': {
            '0%': { backgroundPosition: '200% 0' },
            '100%': { backgroundPosition: '-200% 0' }
          }
        }} />

        {/* Header section */}
        <Box sx={{ px: 4, pt: 4, pb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
            {/* Icon */}
            <Box sx={{
              width: 56, height: 56, borderRadius: '16px',
              background: isTimeUp
                ? 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)'
                : 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: isTimeUp ? '1px solid #fecaca' : '1px solid #c7d2fe',
              flexShrink: 0
            }}>
              {isTimeUp
                ? <TimerOff sx={{ fontSize: 28, color: '#dc2626' }} />
                : <CheckCircle sx={{ fontSize: 28, color: '#6366f1' }} />
              }
            </Box>

            {/* Title & subtitle */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{
                fontWeight: 800, color: '#0f172a', fontSize: '1.6rem',
                letterSpacing: '-0.02em', lineHeight: 1.3, mb: 0.5
              }}>
                {isTimeUp ? 'Time\'s Up!' : 'Submit Assessment'}
              </Typography>
              <Typography sx={{
                color: isTimeUp ? '#b91c1c' : '#64748b',
                fontWeight: 500, fontSize: '1rem', lineHeight: 1.5
              }}>
                {isTimeUp
                  ? 'Your assessment is being submitted automatically.'
                  : 'Review your progress and confirm submission.'}
              </Typography>
            </Box>

            {/* Countdown badge when time is up */}
            {isTimeUp && (
              <Box sx={{
                position: 'relative',
                width: 64, height: 64, flexShrink: 0
              }}>
                {/* Spinning ring */}
                <Box sx={{
                  position: 'absolute', inset: 0,
                  borderRadius: '50%',
                  border: '3px solid #fee2e2',
                  borderTopColor: '#ef4444',
                  animation: 'spin 1s linear infinite'
                }} />
                {/* Inner circle with countdown */}
                <Box sx={{
                  position: 'absolute', inset: '6px',
                  borderRadius: '50%',
                  background: '#fef2f2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'countdownPulse 1s ease-in-out infinite'
                }}>
                  <Typography sx={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 900, color: '#dc2626', fontSize: '1.25rem'
                  }}>
                    {timeRemaining}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Close button — only if NOT timeUp */}
            {!isTimeUp && (
              <IconButton
                onClick={() => { setShowFinalSubmitModal(false); setEndTestInput(''); }}
                sx={{
                  color: '#94a3b8', mt: -0.5, mr: -1,
                  '&:hover': { bgcolor: '#f1f5f9', color: '#64748b' }
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        <DialogContent sx={{ px: 4, pb: 3, pt: 0 }}>
          {/* Question Status Grid */}
          <Box sx={{
            bgcolor: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            p: 2.5, mb: 2.5
          }}>
            {[{ type: 'quiz', label: 'Quiz', color: '#3b82f6' }, { type: 'frontend', label: 'Frontend', color: '#f59e0b' }, { type: 'mongodb', label: 'MongoDB', color: '#06b6d4' }, { type: 'programming', label: 'Programming', color: '#8b5cf6' }]
              .filter(({ type }) => questions.filter(q => q.type === type).length > 0)
              .map(({ type, label, color }, sectionIdx, arr) => {
                const partIndex = arr.slice(0, sectionIdx).length;
                const partLabel = `Part ${String.fromCharCode(65 + partIndex)} — ${label}`;
                const typeQuestions = questions.filter(q => q.type === type);
                const completedCount = typeQuestions.filter((q) => {
                  const origIdx = questions.findIndex(oq => oq._id === q._id);
                  return type === 'frontend'
                    ? frontendCompletedQuestions.has(origIdx)
                    : savedQuestions.has(origIdx);
                }).length;
                return (
                  <Box key={type} sx={{ mb: sectionIdx < arr.length - 1 ? 2.5 : 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                        <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                          {partLabel}
                        </Typography>
                      </Box>
                      <Typography sx={{
                        fontWeight: 700, fontSize: '0.85rem',
                        color: completedCount === typeQuestions.length ? '#059669' : '#94a3b8'
                      }}>
                        {completedCount}/{typeQuestions.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {typeQuestions.map((q, idx) => {
                        const origIdx = questions.findIndex(oq => oq._id === q._id);
                        const isCompleted = type === 'frontend'
                          ? frontendCompletedQuestions.has(origIdx)
                          : savedQuestions.has(origIdx);
                        const isPartial = type === 'frontend' && !isCompleted && (frontendQuestionPercentages[origIdx] || 0) > 0;
                        const isVisited = visitedQuestions.has(origIdx);
                        const bg = isCompleted ? '#10b981' : isPartial ? '#f59e0b' : isVisited ? '#f97316' : '#e2e8f0';
                        return (
                          <Box key={q._id} sx={{
                            width: 42, height: 42, borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '0.9rem',
                            bgcolor: bg,
                            color: isCompleted || isPartial || isVisited ? 'white' : '#94a3b8',
                            border: isCompleted ? '1px solid rgba(16,185,129,0.4)' : '1px solid transparent',
                            transition: 'all 0.15s ease'
                          }}>
                            {idx + 1}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })
            }
          </Box>

          {/* Legend */}
          <Box sx={{
            display: 'flex', gap: 2.5, flexWrap: 'wrap',
            px: 2, py: 1.5, borderRadius: '12px',
            bgcolor: '#f8fafc',
            border: '1px solid #f1f5f9',
            mb: 2.5
          }}>
            {[
              { color: '#10b981', label: 'Submitted' },
              { color: '#f59e0b', label: 'Partial' },
              { color: '#f97316', label: 'Visited' },
              { color: '#e2e8f0', label: 'Not Visited' }
            ].map(({ color, label }) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '4px', bgcolor: color }} />
                <Typography sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.8rem' }}>{label}</Typography>
              </Box>
            ))}
          </Box>

          {/* Time-up locked banner */}
          {isTimeUp && (
            <Box sx={{
              p: 2.5, borderRadius: '14px',
              background: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)',
              border: '1px solid #fecaca',
              display: 'flex', alignItems: 'center', gap: 2
            }}>
              <Lock sx={{ color: '#dc2626', fontSize: 22, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontWeight: 700, color: '#991b1b', fontSize: '0.95rem', mb: 0.25 }}>
                  Assessment Locked
                </Typography>
                <Typography sx={{ color: '#b91c1c', fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.4 }}>
                  Time has expired. Your responses are being submitted automatically — please do not close this window.
                </Typography>
              </Box>
            </Box>
          )}

          {/* Confirmation input — hidden when time is up */}
          {!isTimeUp && (
            <Box sx={{
              p: 2.5, borderRadius: '14px',
              border: '1px solid',
              borderColor: endTestInput === 'END' ? '#bbf7d0' : '#e2e8f0',
              bgcolor: endTestInput === 'END' ? '#f0fdf4' : '#f8fafc',
              transition: 'all 0.25s ease'
            }}>
              <Typography sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5, fontSize: '1rem' }}>
                Confirm Submission
              </Typography>
              <Typography sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.85rem', display: 'block', mb: 1.5 }}>
                Type <Box component="span" sx={{
                  fontFamily: 'JetBrains Mono, monospace', fontWeight: 900,
                  color: '#6366f1', bgcolor: '#eef2ff',
                  px: 0.75, py: 0.25, borderRadius: '6px', fontSize: '0.9rem'
                }}>END</Box> to unlock the submit button
              </Typography>
              <Box
                component="input"
                value={endTestInput}
                onChange={(e) => setEndTestInput(e.target.value.toUpperCase())}
                placeholder="Type END here"
                autoComplete="off"
                sx={{
                  width: '100%',
                  p: '12px 16px',
                  border: '2px solid',
                  borderColor: endTestInput === 'END' ? '#10b981' : '#e2e8f0',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  fontFamily: 'JetBrains Mono, monospace',
                  textAlign: 'center',
                  outline: 'none',
                  bgcolor: '#ffffff',
                  color: '#0f172a',
                  letterSpacing: '0.2em',
                  transition: 'all 0.2s ease',
                  '&:focus': { borderColor: '#6366f1', boxShadow: '0 0 0 3px rgba(99,102,241,0.1)' },
                  '&::placeholder': { color: '#cbd5e1', fontWeight: 600, letterSpacing: '0.05em' },
                  boxSizing: 'border-box'
                }}
              />
            </Box>
          )}
        </DialogContent>

        {/* Footer */}
        <Box sx={{
          px: 4, py: 3,
          borderTop: '1px solid #f1f5f9',
          bgcolor: '#f8fafc',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2
        }}>
          {!isTimeUp ? (
            <Button
              onClick={() => { setShowFinalSubmitModal(false); setEndTestInput(''); }}
              disabled={isSubmittingAssessment}
              sx={{
                color: '#64748b', fontWeight: 700, textTransform: 'none',
                px: 3, py: 1.2, borderRadius: '12px', fontSize: '0.9rem',
                border: '1px solid #e2e8f0',
                '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' }
              }}
            >
              Cancel
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} sx={{ color: '#dc2626' }} />
              <Typography sx={{ color: '#dc2626', fontWeight: 600, fontSize: '0.8rem' }}>
                Submitting…
              </Typography>
            </Box>
          )}
          <Button
            onClick={handleFinalSubmit}
            variant="contained"
            disabled={(!isTimeUp && endTestInput !== 'END') || isSubmittingAssessment}
            startIcon={
              isSubmittingAssessment
                ? <CircularProgress size={16} sx={{ color: 'white' }} />
                : isTimeUp
                  ? <TimerOff sx={{ fontSize: 18 }} />
                  : <CheckCircle sx={{ fontSize: 18 }} />
            }
            sx={{
              px: 4, py: 1.4, borderRadius: '12px',
              fontWeight: 800, fontSize: '0.9rem', textTransform: 'none',
              background: isTimeUp
                ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: 'white',
              boxShadow: isTimeUp
                ? '0 8px 24px -4px rgba(220,38,38,0.35)'
                : '0 8px 24px -4px rgba(99,102,241,0.35)',
              '&:hover': {
                background: isTimeUp
                  ? 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                transform: 'translateY(-1px)',
                boxShadow: isTimeUp
                  ? '0 12px 28px -4px rgba(220,38,38,0.45)'
                  : '0 12px 28px -4px rgba(99,102,241,0.45)'
              },
              '&:disabled': { opacity: 0.4, transform: 'none', boxShadow: 'none' },
              transition: 'all 0.2s ease'
            }}
          >
            {isSubmittingAssessment ? 'Submitting...' : isTimeUp ? 'Auto Submitting...' : 'Submit Assessment ✓'}
          </Button>
        </Box>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar 
        open={showToast} 
        autoHideDuration={3000} 
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setShowToast(false)} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>

      <Dialog open={showLastCodeModal} onClose={() => setShowLastCodeModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Last Executed Code</DialogTitle>
        <DialogContent>
          {lastCodeData ? (
            <Box sx={{ bgcolor: '#f5f5f5', color: '#333', p: 2, borderRadius: 1, overflow: 'auto', fontFamily: 'monospace', fontSize: '18px', whiteSpace: 'pre', border: '1px solid #e0e0e0', lineHeight: 1.6 }}>
              {lastCodeData}
            </Box>
          ) : (
            <Typography>No executed code found for this question</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLastCodeModal(false)}>Close</Button>
          {lastCodeData && (
            <Button variant="contained" onClick={() => {
              setCode(lastCodeData);
              setShowLastCodeModal(false);
              setToastMessage('Code loaded successfully!');
              setToastSeverity('success');
              setShowToast(true);
            }}>
              Load Code
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Add Custom Input Dialog */}
      <Dialog open={showAddCustomInput} onClose={() => {
        setShowAddCustomInput(false);
        setCustomInput('');
        setEditingCustomIndex(null);
      }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCustomIndex !== null ? 'Edit Custom Test Input' : 'Add Custom Test Input'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            {editingCustomIndex !== null ? 'Edit your custom input' : 'Enter your custom input (max 4 custom inputs allowed)'}
          </Typography>
          <Box
            component="textarea"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Enter custom input here..."
            sx={{
              width: '100%',
              minHeight: '150px',
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none',
              '&:focus': {
                borderColor: 'secondary.main'
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowAddCustomInput(false);
            setCustomInput('');
            setEditingCustomIndex(null);
          }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              if (customInput.trim()) {
                if (editingCustomIndex !== null) {
                  // Edit existing custom test case
                  setCustomTestCases(prev => {
                    const updated = [...prev];
                    updated[editingCustomIndex] = { input: customInput, isCustom: true };
                    return updated;
                  });
                  setEditingCustomIndex(null);
                } else {
                  // Add new custom test case
                  setCustomTestCases(prev => [...prev, { input: customInput, isCustom: true }]);
                  setCurrentTestCaseTab((questions[currentQuestionIndex]?.testCases?.filter(tc => tc.isPublic) || []).length + customTestCases.length);
                }
                setShowAddCustomInput(false);
                setCustomInput('');
              }
            }}
            disabled={!customInput.trim()}
          >
            {editingCustomIndex !== null ? 'Update' : 'Add Input'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
