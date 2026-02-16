import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Modal, Radio, RadioGroup, FormControlLabel, IconButton, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Chip, Snackbar, Alert } from '@mui/material';
import { ChevronLeft, ChevronRight, PlayArrow, CheckCircle, Close, Add, Remove } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import tenantConfig from 'config/tenantConfig';
import AssessmentHeader from './components/AssessmentHeader';
import { QuestionCache } from 'utils/questionCache';
import apiService from 'services/apiService';
import { submitCode } from 'services/pistonService';

import FrontendEditor from './components/FrontendEditor';

export default function AssessmentTaking() {
  const isProduction = import.meta.env.MODE === 'production';
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showPreparation, setShowPreparation] = useState(true);
  const [preparationTime, setPreparationTime] = useState(15);
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
  const [showFinalSubmitModal, setShowFinalSubmitModal] = useState(false);
  const [endTestInput, setEndTestInput] = useState('');
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');
  const [showLastCodeModal, setShowLastCodeModal] = useState(false);
  const [lastCodeData, setLastCodeData] = useState(null);
  const [fontSize, setFontSize] = useState(18);
  const [frontendCompletedQuestions, setFrontendCompletedQuestions] = useState(new Set());

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

  // Load code from session storage when question or language changes
  useEffect(() => {
    if (questions[currentQuestionIndex]?._id && language) {
      const storageKey = `assessment_${id}_question_${questions[currentQuestionIndex]._id}_${language}`;
      const savedCode = sessionStorage.getItem(storageKey);
      setCode(savedCode || getLanguageTemplate(language));
    }
  }, [currentQuestionIndex, language, questions, id]);

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
    const languageId = getLanguageId(language);
    
    for (let i = 0; i < publicTestCases.length; i++) {
      const testCase = publicTestCases[i];
      
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
    // Reset test case tab when question changes
    setCurrentTestCaseTab(0);
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
          ...(questionsData.quizQuestions || []).map(q => ({ ...q, type: 'quiz' }))
        ];
        
        // Shuffle questions and options
        const shuffledQuestions = allQuestions.map(q => {
          if (q.type === 'quiz' && q.options) {
            // Store original index before shuffling
            const optionsWithOriginalIndex = q.options.map((opt, idx) => ({ ...opt, originalIndex: idx }));
            return { ...q, options: [...optionsWithOriginalIndex].sort(() => Math.random() - 0.5) };
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
        if (assessmentData?.attemptId) {
          setAttemptId(assessmentData.attemptId);
        } else if (assessmentData?.attempt?._id) {
          setAttemptId(assessmentData.attempt._id);
        } else {
          try {
            const attemptResponse = await apiService.getAssessmentAttempt(token, id);
            if (attemptResponse._id) {
              setAttemptId(attemptResponse._id);
            }
          } catch (error) {
            console.error('Error fetching attempt:', error);
          }
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
    if (showPreparation && preparationTime > 0) {
      const timer = setInterval(() => {
        setPreparationTime(prev => {
          if (prev <= 1) {
            setShowPreparation(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (!showPreparation && !loading) {
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
    // Set initial time from assessment start time + duration
    if (assessment?.startTime && assessment?.duration) {
      const now = Date.now();
      const startTime = new Date(assessment.startTime).getTime();
      const endTime = startTime + (assessment.duration * 60 * 1000);
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeRemaining(remaining);
    }
  }, [assessment]);

  useEffect(() => {
    // Timer countdown
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
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
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, navigate, attemptId, assessment, id]);

  const handleEnterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleFinalSubmit = async () => {
    if (endTestInput !== 'END' || isSubmittingAssessment) return;
    
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

  if (showPreparation) {
    return (
      <Box 
        onClick={() => {
          if (!document.fullscreenElement) {
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
          cursor: 'pointer'
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
          background: `conic-gradient(#6a0dad ${((15 - preparationTime) / 15) * 360}deg, #e0e0e0 0deg)`,
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
        
        <Typography variant="body1" sx={{ 
          textAlign: 'center', 
          maxWidth: 400,
          color: 'text.secondary',
          fontSize: '1.2rem'
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
            mt: 2
          }}>
            Click anywhere to enter fullscreen mode
          </Typography>
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
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 8,
            borderRadius: 3,
            textAlign: 'center',
            minWidth: 500
          }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 3, color: 'error.main', fontSize: '2.5rem' }}>
              Fullscreen Required
            </Typography>
            <Typography variant="h5" sx={{ color: 'text.secondary', mb: 3, fontSize: '1.3rem' }}>
              Assessment will auto-submit in:
            </Typography>
            
            <Box sx={{
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: `conic-gradient(#f44336 ${((30 - fullscreenWarningTimer) / 30) * 360}deg, #e0e0e0 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}>
              <Box sx={{ 
                width: 150,
                height: 150,
                borderRadius: '50%',
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="h1" sx={{ 
                  fontWeight: 900, 
                  color: 'error.main',
                  fontFamily: 'monospace',
                  fontSize: '4rem'
                }}>
                  {fullscreenWarningTimer}
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 5, color: 'text.secondary' }}>
              Fullscreen exits: <strong>{fullscreenExitCount}</strong>
            </Typography>
            
            <Button 
              variant="contained" 
              color="error"
              size="large"
              fullWidth
              onClick={handleEnterFullscreen}
              sx={{ py: 2, fontSize: '1.2rem', fontWeight: 700 }}
            >
              Enter Fullscreen
            </Button>
          </Box>
        </Modal>

        <Dialog open={showTabSwitchWarning} disableEscapeKeyDown maxWidth="sm" fullWidth>
          <Box sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: '#fff3cd',
            borderTop: '4px solid #ff9800'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#ff6f00' }}>
              Tab Switch Detected!
            </Typography>
            <Typography variant="h6" sx={{ color: '#856404', mb: 4 }}>
              Warning: You switched tabs during the assessment
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: '#856404' }}>
              Tab switches: <strong>{tabSwitchCount}</strong>
              {assessment?.maxTabSwitches && assessment.maxTabSwitches !== -1 && (
                <> / <strong>{assessment.maxTabSwitches}</strong> allowed</>
              )}
              {assessment?.maxTabSwitches === -1 && (
                <> (Unlimited allowed)</>
              )}
            </Typography>
            <Typography variant="body2" sx={{ color: '#856404', mb: 4 }}>
              Please stay on this tab. Excessive tab switching may result in assessment termination.
            </Typography>
            <Button 
              variant="contained" 
              color="warning"
              size="large"
              fullWidth
              onClick={() => setShowTabSwitchWarning(false)}
              sx={{ py: 2, fontSize: '1.1rem', fontWeight: 700 }}
            >
              Continue Assessment
            </Button>
          </Box>
        </Dialog>

        <Dialog open={showFinalSubmitModal} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Submit Assessment
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
              Are you sure you want to submit this assessment?
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 600, color: 'error.main' }}>
                Type "END" to confirm submission:
              </Typography>
              <Box
                component="input"
                value={endTestInput}
                onChange={(e) => setEndTestInput(e.target.value.toUpperCase())}
                placeholder="Type END here"
                sx={{
                  width: '100%',
                  p: 2,
                  border: '2px solid',
                  borderColor: endTestInput === 'END' ? 'success.main' : '#e0e0e0',
                  borderRadius: 1,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  outline: 'none',
                  '&:focus': {
                    borderColor: 'primary.main'
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
            <Button onClick={() => {
              setShowFinalSubmitModal(false);
              setEndTestInput('');
            }} variant="outlined" disabled={isSubmittingAssessment}>
              Cancel
            </Button>
            <Button 
              onClick={handleFinalSubmit}
              variant="contained" 
              color="error"
              disabled={endTestInput !== 'END' || isSubmittingAssessment}
              startIcon={isSubmittingAssessment ? <CircularProgress size={20} sx={{ color: 'white' }} /> : null}
            >
              {isSubmittingAssessment ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          </DialogActions>
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
          scrollbarWidth: 'none'
        }}>
          {/* Question Navigation */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 99 }}>
            {/* Part A/B Toggle */}
            {(() => {
              const hasQuiz = questions.filter(q => q.type === 'quiz').length > 0;
              const hasFrontend = questions.filter(q => q.type === 'frontend').length > 0;
              const hasProgramming = questions.filter(q => q.type === 'programming').length > 0;
              const totalParts = [hasQuiz, hasFrontend, hasProgramming].filter(Boolean).length;
              
              if (totalParts <= 1) return null;
              
              const currentType = showPartB ? (hasProgramming ? 'programming' : 'frontend') : (hasQuiz ? 'quiz' : 'frontend');
              const partLabel = hasQuiz && hasFrontend && hasProgramming 
                ? (currentType === 'quiz' ? 'Part A - Quiz' : currentType === 'frontend' ? 'Part B - Frontend' : 'Part C - Programming')
                : hasQuiz && hasFrontend
                ? (currentType === 'quiz' ? 'Part A - Quiz' : 'Part B - Frontend')
                : hasQuiz && hasProgramming
                ? (currentType === 'quiz' ? 'Part A - Quiz' : 'Part B - Programming')
                : hasFrontend && hasProgramming
                ? (currentType === 'frontend' ? 'Part A - Frontend' : 'Part B - Programming')
                : '';
              
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>
                    {partLabel} ({questions.filter(q => q.type === currentType).length})
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      const types = [];
                      if (hasQuiz) types.push('quiz');
                      if (hasFrontend) types.push('frontend');
                      if (hasProgramming) types.push('programming');
                      
                      const currentIndex = types.indexOf(currentType);
                      const nextType = types[(currentIndex + 1) % types.length];
                      
                      setShowPartB(nextType !== 'quiz');
                      const firstQuestionIndex = questions.findIndex(q => q.type === nextType);
                      if (firstQuestionIndex !== -1) {
                        setCurrentQuestionIndex(firstQuestionIndex);
                      }
                    }}
                    sx={{
                      bgcolor: 'secondary.main',
                      color: 'white',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      '&:hover': { bgcolor: 'secondary.dark' }
                    }}
                  >
                    Next Part
                  </Button>
                </Box>
              );
            })()}
            
            
            {/* Question Numbers */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showLeftScroll && (
                <IconButton 
                  size="small" 
                  onClick={() => {
                    const container = document.getElementById('question-buttons');
                    container.scrollBy({ left: -200, behavior: 'smooth' });
                  }}
                  sx={{ bgcolor: 'secondary.light' }}
                >
                  <ChevronLeft />
                </IconButton>
              )}
              <Box 
                id="question-buttons"
                sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  overflow: 'auto',
                  flexGrow: 1,
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                  scrollBehavior: 'smooth'
                }}
              >
                {(() => {
                  const hasQuiz = questions.filter(q => q.type === 'quiz').length > 0;
                  const hasFrontend = questions.filter(q => q.type === 'frontend').length > 0;
                  const hasProgramming = questions.filter(q => q.type === 'programming').length > 0;
                  const currentType = showPartB ? (hasProgramming ? 'programming' : 'frontend') : (hasQuiz ? 'quiz' : 'frontend');
                  
                  return (questions || [])
                    .filter(q => q.type === currentType)
                    .map((q, filteredIndex) => {
                    const originalIndex = questions.findIndex(originalQ => originalQ._id === q._id);
                    const isCompleted = q.type === 'frontend' 
                      ? frontendCompletedQuestions.has(originalIndex)
                      : savedQuestions.has(originalIndex);
                    
                    return (
                      <Button
                        key={originalIndex}
                        variant={originalIndex === currentQuestionIndex ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => {
                          setCurrentQuestionIndex(originalIndex);
                          setVisitedQuestions(prev => new Set([...prev, originalIndex]));
                        }}
                        sx={{
                          minWidth: '48px',
                          height: '48px',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          ...(originalIndex === currentQuestionIndex && isCompleted && {
                            bgcolor: '#4caf50',
                            color: 'white',
                            '&:hover': { bgcolor: '#45a049' }
                          }),
                          ...(originalIndex === currentQuestionIndex && !isCompleted && {
                            bgcolor: 'secondary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'secondary.dark' }
                          }),
                          ...(originalIndex !== currentQuestionIndex && isCompleted && {
                            bgcolor: '#4caf50',
                            color: 'white',
                            borderColor: '#4caf50',
                            '&:hover': { bgcolor: '#45a049' }
                          }),
                          ...(originalIndex !== currentQuestionIndex && !isCompleted && visitedQuestions.has(originalIndex) && {
                            bgcolor: '#ff9800',
                            color: 'white',
                            borderColor: '#ff9800',
                            '&:hover': { bgcolor: '#f57c00' }
                          }),
                          ...(originalIndex !== currentQuestionIndex && !isCompleted && !visitedQuestions.has(originalIndex) && {
                            borderColor: 'secondary.main',
                            color: 'secondary.main',
                            '&:hover': { borderColor: 'secondary.dark', bgcolor: 'secondary.light' }
                          })
                        }}
                      >
                        {filteredIndex + 1}
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
                  sx={{ bgcolor: 'secondary.light' }}
                >
                  <ChevronRight />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Question Content */}
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '900px', mx: 'auto', '& *': { fontSize: { xs: '16px', sm: '18px', md: '20px' } } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '22px !important', sm: '25px !important', md: '28px !important' } }}>
              {questions[currentQuestionIndex]?.title || 'Loading...'}
            </Typography>
            
            {questions[currentQuestionIndex]?.type === 'frontend' && (
              <>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '18px !important', sm: '20px !important', md: '22px !important' } }}>Problem Statement</Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>
                    {questions[currentQuestionIndex]?.problemStatement}
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '18px !important', sm: '20px !important', md: '22px !important' } }}>Requirements</Typography>
                  <Box component="ul" sx={{ pl: 3, m: 0 }}>
                    {questions[currentQuestionIndex]?.requirements?.map((req, idx) => (
                      <Typography key={idx} component="li" variant="body1" sx={{ mb: 1, fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>
                        {req}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '18px !important', sm: '20px !important', md: '22px !important' } }}>Acceptance Criteria</Typography>
                  <Box component="ul" sx={{ pl: 3, m: 0 }}>
                    {questions[currentQuestionIndex]?.acceptanceCriteria?.map((criteria, idx) => (
                      <Typography key={idx} component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8, fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>
                        {criteria}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </>
            )}
            
            {/* Tags/Topics */}
            {showPartB && questions[currentQuestionIndex]?.tags && questions[currentQuestionIndex].tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
                {questions[currentQuestionIndex].tags.map((tag, idx) => (
                  <Box key={idx} sx={{ px: 2, py: 0.5, bgcolor: 'secondary.light', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '14px !important', sm: '15px !important', md: '16px !important' } }}>{tag}</Typography>
                  </Box>
                ))}
              </Box>
            )}
            
            {/* Quiz Question - Code Snippet */}
            {!showPartB && questions[currentQuestionIndex]?.codeSnippet && (
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                bgcolor: '#f1f5f9', 
                borderRadius: 2, 
                border: '1px solid #cbd5e1',
                fontFamily: 'monospace'
              }}>
                <Typography variant="body1" component="pre" sx={{ 
                  whiteSpace: 'pre-wrap',
                  fontSize: { xs: '16px', sm: '18px', md: '20px' },
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {questions[currentQuestionIndex].codeSnippet.replace(/\\n/g, '\n').replace(/\\t/g, '\t')}
                </Typography>
              </Box>
            )}
            
            {/* Programming Question - Description */}
            {showPartB && questions[currentQuestionIndex]?.description && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '18px !important', sm: '20px !important', md: '22px !important' } }}>Description</Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>
                  {questions[currentQuestionIndex].description}
                </Typography>
              </Box>
            )}
            
            {/* Constraints */}
            {showPartB && questions[currentQuestionIndex]?.constraints && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '18px !important', sm: '20px !important', md: '22px !important' } }}>Constraints</Typography>
                <Box component="ul" sx={{ pl: 3, m: 0 }}>
                  {(Array.isArray(questions[currentQuestionIndex].constraints) 
                    ? questions[currentQuestionIndex].constraints 
                    : [questions[currentQuestionIndex].constraints]
                  ).map((constraint, idx) => (
                    <Typography key={idx} component="li" variant="body1" sx={{ mb: 1, fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>
                      {constraint}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Example */}
            {showPartB && questions[currentQuestionIndex]?.example && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '18px !important', sm: '20px !important', md: '22px !important' } }}>Example</Typography>
                <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                  {questions[currentQuestionIndex].example.input && (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1, fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>
                      <strong>Input:</strong> {questions[currentQuestionIndex].example.input}
                    </Typography>
                  )}
                  {questions[currentQuestionIndex].example.output && (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1, fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>
                      <strong>Output:</strong> {questions[currentQuestionIndex].example.output}
                    </Typography>
                  )}
                  {questions[currentQuestionIndex].example.explanation && (
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>
                      <strong>Explanation:</strong> {questions[currentQuestionIndex].example.explanation}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
            
            {/* Key Insights */}
            {showPartB && questions[currentQuestionIndex]?.intuition?.keyInsights && assessment?.showKeyInsights && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '18px !important', sm: '20px !important', md: '22px !important' } }}>Key Insights</Typography>
                <Box component="ul" sx={{ pl: 3, m: 0 }}>
                  {questions[currentQuestionIndex].intuition.keyInsights.map((insight, idx) => (
                    <Typography key={idx} component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8, fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>
                      {insight}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Algorithm Steps */}
            {showPartB && questions[currentQuestionIndex]?.intuition?.algorithmSteps && assessment?.showAlgorithm && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '18px !important', sm: '20px !important', md: '22px !important' } }}>Algorithm</Typography>
                <Box component="ol" sx={{ pl: 3, m: 0 }}>
                  {questions[currentQuestionIndex].intuition.algorithmSteps.map((step, idx) => (
                    <Typography key={idx} component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8, fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>
                      {step}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Complexity */}
            {showPartB && (questions[currentQuestionIndex]?.intuition?.timeComplexity || questions[currentQuestionIndex]?.intuition?.spaceComplexity) && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '18px !important', sm: '20px !important', md: '22px !important' } }}>Complexity</Typography>
                <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                  {questions[currentQuestionIndex].intuition.timeComplexity && (
                    <Typography variant="body1" sx={{ mb: 1, fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>
                      <strong>Time Complexity:</strong> {questions[currentQuestionIndex].intuition.timeComplexity}
                    </Typography>
                  )}
                  {questions[currentQuestionIndex].intuition.spaceComplexity && (
                    <Typography variant="body1" sx={{ fontSize: { xs: '16px', sm: '18px', md: '20px' } }}>
                      <strong>Space Complexity:</strong> {questions[currentQuestionIndex].intuition.spaceComplexity}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Divider */}
        <Box 
          sx={{ 
            bgcolor: '#6a0dad', 
            cursor: 'col-resize',
            '&:hover': { bgcolor: '#5a0d9d' }
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
          {!showPartB && questions[currentQuestionIndex]?.type === 'quiz' ? (
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, '& *': { fontSize: { xs: '16px', sm: '18px', md: '20px' } } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, fontSize: { xs: '20px !important', sm: '22px !important', md: '24px !important' } }}>
                Select Your Answer
              </Typography>
              
              <RadioGroup
                value={answers[questions[currentQuestionIndex]?._id] || ''}
                onChange={async (e) => {
                  const selectedOptionId = e.target.value;
                  setAnswers(prev => ({
                    ...prev,
                    [questions[currentQuestionIndex]._id]: selectedOptionId
                  }));
                  
                  // Save to backend with original index
                  if (attemptId) {
                    try {
                      const token = localStorage.getItem('studentToken');
                      const selectedOption = questions[currentQuestionIndex].options.find(opt => opt._id === selectedOptionId);
                      const originalIndex = selectedOption?.originalIndex ?? 0;
                      await apiService.saveQuizAnswer(token, attemptId, questions[currentQuestionIndex]._id, originalIndex);
                      
                      // Mark as saved to update percentage
                      setSavedQuestions(prev => new Set([...prev, currentQuestionIndex]));
                    } catch (error) {
                      console.error('Error saving quiz answer:', error);
                    }
                  }
                }}
              >
                {(questions[currentQuestionIndex]?.options || []).map((option, index) => (
                  <FormControlLabel
                    key={option._id || index}
                    value={option._id}
                    control={<Radio />}
                    label={
                      <Typography variant="body1" sx={{ fontSize: { xs: '16px', sm: '18px', md: '20px' }, py: 1 }}>
                        {option.text}
                      </Typography>
                    }
                    sx={{
                      mb: 2,
                      p: 2,
                      border: '2px solid',
                      borderColor: answers[questions[currentQuestionIndex]?._id] === option._id ? 'secondary.main' : 'grey.300',
                      borderRadius: 2,
                      bgcolor: answers[questions[currentQuestionIndex]?._id] === option._id ? 'secondary.light' : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'secondary.main',
                        bgcolor: 'secondary.light'
                      }
                    }}
                  />
                ))}
              </RadioGroup>
              
              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    const hasQuiz = questions.filter(q => q.type === 'quiz').length > 0;
                    const hasFrontend = questions.filter(q => q.type === 'frontend').length > 0;
                    const hasProgramming = questions.filter(q => q.type === 'programming').length > 0;
                    const currentType = showPartB ? (hasProgramming ? 'programming' : 'frontend') : (hasQuiz ? 'quiz' : 'frontend');
                    const filteredQuestions = questions.filter(q => q.type === currentType);
                    const currentFilteredIndex = filteredQuestions.findIndex(q => q._id === questions[currentQuestionIndex]._id);
                    if (currentFilteredIndex > 0) {
                      const prevQuestion = filteredQuestions[currentFilteredIndex - 1];
                      const prevIndex = questions.findIndex(q => q._id === prevQuestion._id);
                      setCurrentQuestionIndex(prevIndex);
                    }
                  }}
                  disabled={(() => {
                    const hasQuiz = questions.filter(q => q.type === 'quiz').length > 0;
                    const hasFrontend = questions.filter(q => q.type === 'frontend').length > 0;
                    const hasProgramming = questions.filter(q => q.type === 'programming').length > 0;
                    const currentType = showPartB ? (hasProgramming ? 'programming' : 'frontend') : (hasQuiz ? 'quiz' : 'frontend');
                    const filteredQuestions = questions.filter(q => q.type === currentType);
                    const currentFilteredIndex = filteredQuestions.findIndex(q => q._id === questions[currentQuestionIndex]._id);
                    return currentFilteredIndex === 0;
                  })()}
                  sx={{ width: { xs: '150px', sm: '180px', md: '200px' }, height: '48px', borderColor: 'secondary.main', color: 'secondary.main' }}
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setSavedQuestions(prev => new Set([...prev, currentQuestionIndex]));
                    const hasQuiz = questions.filter(q => q.type === 'quiz').length > 0;
                    const hasFrontend = questions.filter(q => q.type === 'frontend').length > 0;
                    const hasProgramming = questions.filter(q => q.type === 'programming').length > 0;
                    const currentType = showPartB ? (hasProgramming ? 'programming' : 'frontend') : (hasQuiz ? 'quiz' : 'frontend');
                    const filteredQuestions = questions.filter(q => q.type === currentType);
                    const currentFilteredIndex = filteredQuestions.findIndex(q => q._id === questions[currentQuestionIndex]._id);
                    if (currentFilteredIndex < filteredQuestions.length - 1) {
                      const nextQuestion = filteredQuestions[currentFilteredIndex + 1];
                      const nextIndex = questions.findIndex(q => q._id === nextQuestion._id);
                      setCurrentQuestionIndex(nextIndex);
                      setVisitedQuestions(prev => new Set([...prev, nextIndex]));
                    }
                  }}
                  sx={{ width: { xs: '150px', sm: '180px', md: '200px' }, height: '48px', bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
                >
                  Save & Next
                </Button>
              </Box>
            </Box>
          ) : questions[currentQuestionIndex]?.type === 'frontend' ? (
            <FrontendEditor 
              assessment={assessment} 
              question={questions[currentQuestionIndex]} 
              attemptId={attemptId}
              onTestComplete={(passed, total) => {
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
                borderColor: '#e0e0e0', 
                bgcolor: '#ffffff',
                overflow: 'hidden'
              }}>
                {/* Editor Header */}
                <Box sx={{ 
                  p: 2, 
                  borderBottom: '1px solid #e0e0e0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  bgcolor: '#ffffff',
                  flexWrap: 'wrap'
                }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={language}
                      label="Language"
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      {(assessment?.allowedLanguages || ['python', 'cpp', 'java', 'c']).map((lang) => (
                        <MenuItem key={lang} value={lang}>
                          {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant="outlined"
                    onClick={async () => {
                      if (attemptId && questions[currentQuestionIndex]?._id) {
                        try {
                          const token = localStorage.getItem('studentToken');
                          const response = await apiService.getLastExecutedCode(token, attemptId);
                          const lastExecutedCode = response.lastExecutedCode;
                          const savedCode = lastExecutedCode?.[questions[currentQuestionIndex]._id]?.[language];
                          
                          if (savedCode) {
                            setLastCodeData(savedCode);
                            setShowLastCodeModal(true);
                          } else {
                            setLastCodeData(null);
                            setShowLastCodeModal(true);
                          }
                        } catch (error) {
                          console.error('Error loading last executed code:', error);
                          setLastCodeData(null);
                          setShowLastCodeModal(true);
                        }
                      }
                    }}
                    disabled={!language}
                    sx={{
                      borderColor: 'secondary.main',
                      color: 'secondary.main',
                      '&:hover': { borderColor: 'secondary.dark', bgcolor: 'secondary.light' }
                    }}
                  >
                    Last Code
                  </Button>
                  
                  <Box sx={{ flex: 1 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" onClick={() => setFontSize(prev => Math.max(12, prev - 2))}>
                      <Remove fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" sx={{ minWidth: '30px', textAlign: 'center' }}>
                      {fontSize}
                    </Typography>
                    <IconButton size="small" onClick={() => setFontSize(prev => Math.min(32, prev + 2))}>
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ flex: 1 }} />
                  
                  <Button
                    variant="outlined"
                    startIcon={isRunning ? <CircularProgress size={16} /> : <PlayArrow />}
                    onClick={handleRunCode}
                    disabled={!code.trim() || isRunning}
                    sx={{
                      borderColor: 'secondary.main',
                      color: 'secondary.main',
                      '&:hover': { borderColor: 'secondary.dark', bgcolor: 'secondary.light' }
                    }}
                  >
                    {isRunning ? 'Running...' : 'Run Code'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!code.trim() || isSubmitting}
                    sx={{
                      bgcolor: 'secondary.main',
                      '&:hover': { bgcolor: 'secondary.dark' }
                    }}
                  >
                    Submit
                  </Button>
                </Box>
                
                {/* Editor Area */}
                <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                  {language ? (
                    <Box sx={{ 
                      flexGrow: 1,
                      minHeight: 0,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}>
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
                          formatOnType: true
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ 
                      flexGrow: 1,
                      minHeight: 0,
                      border: '2px dashed #e0e0e0',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Please select a programming language to start coding
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              
              {/* Resizable Divider */}
              <Box
                sx={{
                  height: '4px',
                  cursor: 'row-resize',
                  bgcolor: 'secondary.main',
                  position: 'relative',
                  zIndex: 200,
                  '&:hover': {
                    bgcolor: 'secondary.dark'
                  }
                }}
                onMouseDown={() => setIsCompilerDragging(true)}
              />
              
              {/* Test Cases Section */}
              <Box sx={{ height: `${100 - compilerSplit}%`, display: 'flex', flexDirection: 'column', zIndex: 100, position: 'relative', bgcolor: '#ffffff', minHeight: 0 }}>
                {(() => {
                  const publicTestCases = questions[currentQuestionIndex]?.testCases?.filter(tc => tc.isPublic) || [];
                  
                  return (
                    <>
                      <Box sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: '#ffffff' }}>
                        <Tabs 
                          value={currentTestCaseTab} 
                          onChange={(e, newValue) => setCurrentTestCaseTab(newValue)}
                          variant="scrollable"
                          scrollButtons="auto"
                          sx={{ 
                            '& .MuiTabs-indicator': {
                              height: 4,
                              borderRadius: '4px 4px 0 0',
                              bgcolor: 'secondary.main'
                            },
                            '& .MuiTab-root': {
                              fontSize: { xs: '14px', sm: '16px', md: '18px' },
                              fontWeight: 600,
                              minHeight: { xs: 48, sm: 56, md: 64 },
                              px: { xs: 2, sm: 3, md: 4 },
                              py: { xs: 1, sm: 1.5, md: 2 }
                            }
                          }}
                        >
                          {publicTestCases.map((tc, index) => {
                            const result = testCaseResults[index];
                            const isPassed = result && !result.loading && !result.error && 
                              result.output?.trim() === (tc.expectedOutput || tc.output)?.toString().trim();
                            const isFailed = result && !result.loading && (result.error || 
                              result.output?.trim() !== (tc.expectedOutput || tc.output)?.toString().trim());
                            
                            return (
                              <Tab 
                                key={index} 
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    Test Case {index + 1}
                                    {result?.loading && <CircularProgress size={16} />}
                                  </Box>
                                }
                                sx={{
                                  bgcolor: isPassed ? '#e8f5e9' : isFailed ? '#ffebee' : 'transparent',
                                  '&.Mui-selected': {
                                    bgcolor: isPassed ? '#c8e6c9' : isFailed ? '#ffcdd2' : 'transparent'
                                  }
                                }}
                              />
                            );
                          })}
                        </Tabs>
                      </Box>
                      
                      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, flexGrow: 1, overflow: 'auto', pb: 8, bgcolor: '#ffffff' }}>
                        {publicTestCases.length > 0 && publicTestCases[currentTestCaseTab] ? (
                          <>
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: { xs: '14px', sm: '15px', md: '16px' } }}>
                                Input
                              </Typography>
                              <Box sx={{ 
                                bgcolor: '#f5f5f5',
                                border: '1px solid #e0e0e0',
                                p: 2.5,
                                borderRadius: 2,
                                fontFamily: 'monospace',
                                whiteSpace: 'pre-wrap',
                                fontSize: { xs: '14px', sm: '16px', md: '18px' }
                              }}>
                                {publicTestCases[currentTestCaseTab].input}
                              </Box>
                            </Box>
                            
                            {testCaseResults[currentTestCaseTab] && (
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: { xs: '14px', sm: '15px', md: '16px' } }}>
                                  Your Output
                                </Typography>
                                <Box sx={{ 
                                  bgcolor: '#f5f5f5',
                                  border: '2px solid',
                                  borderColor: testCaseResults[currentTestCaseTab].error ? 'error.main' : 'success.main',
                                  p: 2.5,
                                  borderRadius: 2,
                                  fontFamily: 'monospace',
                                  fontSize: { xs: '14px', sm: '16px', md: '18px' },
                                  whiteSpace: 'pre',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: testCaseResults[currentTestCaseTab].loading ? 'center' : 'flex-start',
                                  minHeight: '60px'
                                }}>
                                  {testCaseResults[currentTestCaseTab].loading ? (
                                    <CircularProgress size={24} />
                                  ) : testCaseResults[currentTestCaseTab].error ? (
                                    <Typography sx={{ color: 'error.main', whiteSpace: 'pre-wrap' }}>
                                      {testCaseResults[currentTestCaseTab].error}
                                    </Typography>
                                  ) : (
                                    testCaseResults[currentTestCaseTab].output || 'No output'
                                  )}
                                </Box>
                              </Box>
                            )}
                            
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: { xs: '14px', sm: '15px', md: '16px' } }}>
                                Expected Output
                              </Typography>
                              <Box sx={{ 
                                bgcolor: '#f5f5f5',
                                border: '1px solid #e0e0e0',
                                p: 2.5,
                                borderRadius: 2,
                                fontFamily: 'monospace',
                                fontSize: { xs: '14px', sm: '16px', md: '18px' },
                                whiteSpace: 'pre'
                              }}>
                                {publicTestCases[currentTestCaseTab].expectedOutput || publicTestCases[currentTestCaseTab].output}
                              </Box>
                            </Box>
                            
                            {publicTestCases[currentTestCaseTab].explanation && (
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: { xs: '14px', sm: '15px', md: '16px' } }}>
                                  Explanation
                                </Typography>
                                <Box sx={{ 
                                  bgcolor: '#f5f5f5',
                                  border: '1px solid #e0e0e0',
                                  p: 2.5,
                                  borderRadius: 2,
                                  fontSize: { xs: '14px', sm: '16px', md: '18px' },
                                  lineHeight: 1.6
                                }}>
                                  {publicTestCases[currentTestCaseTab].explanation}
                                </Box>
                              </Box>
                            )}
                          </>
                        ) : (
                          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 4 }}>
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

      <Modal open={showFullscreenWarning} disableEscapeKeyDown>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 8,
          borderRadius: 3,
          textAlign: 'center',
          minWidth: 500
        }}>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 3, color: 'error.main', fontSize: '2.5rem' }}>
            Fullscreen Required
          </Typography>
          <Typography variant="h5" sx={{ color: 'text.secondary', mb: 3, fontSize: '1.3rem' }}>
            Assessment will auto-submit in:
          </Typography>
          
          <Box sx={{
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: `conic-gradient(#f44336 ${((30 - fullscreenWarningTimer) / 30) * 360}deg, #e0e0e0 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3
          }}>
            <Box sx={{ 
              width: 150,
              height: 150,
              borderRadius: '50%',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="h1" sx={{ 
                fontWeight: 900, 
                color: 'error.main',
                fontFamily: 'monospace',
                fontSize: '4rem'
              }}>
                {fullscreenWarningTimer}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 5, color: 'text.secondary' }}>
            Fullscreen exits: <strong>{fullscreenExitCount}</strong>
          </Typography>
          
          <Button 
            variant="contained" 
            color="error"
            size="large"
            fullWidth
            onClick={handleEnterFullscreen}
            sx={{ py: 2, fontSize: '1.2rem', fontWeight: 700 }}
          >
            Enter Fullscreen
          </Button>
        </Box>
      </Modal>

      {/* Tab Switch Warning Modal */}
      <Dialog open={showTabSwitchWarning} disableEscapeKeyDown maxWidth="sm" fullWidth>
        <Box sx={{
          p: 6,
          textAlign: 'center',
          bgcolor: '#fff3cd',
          borderTop: '4px solid #ff9800'
        }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#ff6f00' }}>
            Tab Switch Detected!
          </Typography>
          <Typography variant="h6" sx={{ color: '#856404', mb: 4 }}>
            Warning: You switched tabs during the assessment
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: '#856404' }}>
            Tab switches: <strong>{tabSwitchCount}</strong>
            {assessment?.maxTabSwitches && assessment.maxTabSwitches !== -1 && (
              <> / <strong>{assessment.maxTabSwitches}</strong> allowed</>
            )}
            {assessment?.maxTabSwitches === -1 && (
              <> (Unlimited allowed)</>
            )}
          </Typography>
          <Typography variant="body2" sx={{ color: '#856404', mb: 4 }}>
            Please stay on this tab. Excessive tab switching may result in assessment termination.
          </Typography>
          <Button 
            variant="contained" 
            color="warning"
            size="large"
            fullWidth
            onClick={() => setShowTabSwitchWarning(false)}
            sx={{ py: 2, fontSize: '1.1rem', fontWeight: 700 }}
          >
            Continue Assessment
          </Button>
        </Box>
      </Dialog>

      {/* Submit Results Modal */}
      <Dialog open={showSubmitModal} maxWidth="lg" fullWidth disableEscapeKeyDown={isSubmitting}>
        <DialogTitle sx={{ bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Test Case Execution Results
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            {isSubmitting ? 'Executing test cases...' : 'All test cases executed'}
          </Typography>
          
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {submitResults.map((result) => (
              <Card key={result.index} sx={{ 
                border: '1px solid',
                borderColor: result.passed === true ? 'success.main' : 
                           result.passed === false ? 'error.main' : '#e0e0e0'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Test Case {result.index}
                      </Typography>
                      <Chip 
                        label={result.type} 
                        size="small" 
                        sx={{ 
                          bgcolor: result.type === 'Public' ? '#e3f2fd' : '#f3e5f5',
                          color: result.type === 'Public' ? '#1976d2' : '#9c27b0'
                        }} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {result.passed === true && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                          <CheckCircle />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>PASSED</Typography>
                        </Box>
                      )}
                      {result.passed === false && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                          <Close />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>FAILED</Typography>
                        </Box>
                      )}
                      {result.passed === null && result.status === 'Running' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={20} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Running</Typography>
                        </Box>
                      )}
                      {result.passed === null && result.status === 'Pending' && (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>Pending</Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          {!isSubmitting && (
            <Button onClick={() => setShowSubmitModal(false)} variant="outlined">
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Final Submit Modal */}
      <Dialog open={showFinalSubmitModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Assessment Summary
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Review your progress before submitting:
          </Typography>

          {/* Part A - Quiz Questions */}
          {questions.filter(q => q.type === 'quiz').length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                Part A - Quiz Questions ({questions.filter(q => q.type === 'quiz').length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {questions.filter(q => q.type === 'quiz').map((q, idx) => {
                  const originalIndex = questions.findIndex(oq => oq._id === q._id);
                  const isCompleted = savedQuestions.has(originalIndex);
                  const isVisited = visitedQuestions.has(originalIndex);
                  
                  return (
                    <Box
                      key={q._id}
                      sx={{
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        fontWeight: 600,
                        bgcolor: isCompleted ? '#4caf50' : isVisited ? '#ff9800' : '#e0e0e0',
                        color: isCompleted || isVisited ? 'white' : 'text.secondary'
                      }}
                    >
                      {idx + 1}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Part B - Frontend Questions */}
          {questions.filter(q => q.type === 'frontend').length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#ff9800' }}>
                {questions.filter(q => q.type === 'quiz').length > 0 ? 'Part B' : 'Part A'} - Frontend Questions ({questions.filter(q => q.type === 'frontend').length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {questions.filter(q => q.type === 'frontend').map((q, idx) => {
                  const originalIndex = questions.findIndex(oq => oq._id === q._id);
                  const isCompleted = frontendCompletedQuestions.has(originalIndex);
                  const isVisited = visitedQuestions.has(originalIndex);
                  
                  return (
                    <Box
                      key={q._id}
                      sx={{
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        fontWeight: 600,
                        bgcolor: isCompleted ? '#4caf50' : isVisited ? '#ff9800' : '#e0e0e0',
                        color: isCompleted || isVisited ? 'white' : 'text.secondary'
                      }}
                    >
                      {idx + 1}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Part C - Programming Questions */}
          {questions.filter(q => q.type === 'programming').length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#9c27b0' }}>
                {(() => {
                  const hasQuiz = questions.filter(q => q.type === 'quiz').length > 0;
                  const hasFrontend = questions.filter(q => q.type === 'frontend').length > 0;
                  if (hasQuiz && hasFrontend) return 'Part C';
                  if (hasQuiz || hasFrontend) return 'Part B';
                  return 'Part A';
                })()} - Programming Questions ({questions.filter(q => q.type === 'programming').length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {questions.filter(q => q.type === 'programming').map((q, idx) => {
                  const originalIndex = questions.findIndex(oq => oq._id === q._id);
                  const isCompleted = savedQuestions.has(originalIndex);
                  const isVisited = visitedQuestions.has(originalIndex);
                  
                  return (
                    <Box
                      key={q._id}
                      sx={{
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        fontWeight: 600,
                        bgcolor: isCompleted ? '#4caf50' : isVisited ? '#ff9800' : '#e0e0e0',
                        color: isCompleted || isVisited ? 'white' : 'text.secondary'
                      }}
                    >
                      {idx + 1}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Legend */}
          <Box sx={{ display: 'flex', gap: 3, mt: 4, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 24, height: 24, bgcolor: '#4caf50', borderRadius: 0.5 }} />
              <Typography variant="body2">Saved</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 24, height: 24, bgcolor: '#ff9800', borderRadius: 0.5 }} />
              <Typography variant="body2">Visited</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 24, height: 24, bgcolor: '#e0e0e0', borderRadius: 0.5 }} />
              <Typography variant="body2">Not Visited</Typography>
            </Box>
          </Box>

          {/* Confirmation Input */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 600, color: 'error.main' }}>
              Type "END" to confirm submission:
            </Typography>
            <Box
              component="input"
              value={endTestInput}
              onChange={(e) => setEndTestInput(e.target.value.toUpperCase())}
              placeholder="Type END here"
              sx={{
                width: '100%',
                p: 2,
                border: '2px solid',
                borderColor: endTestInput === 'END' ? 'success.main' : '#e0e0e0',
                borderRadius: 1,
                fontSize: '1.1rem',
                fontWeight: 600,
                textAlign: 'center',
                outline: 'none',
                '&:focus': {
                  borderColor: 'primary.main'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => {
            setShowFinalSubmitModal(false);
            setEndTestInput('');
          }} variant="outlined" disabled={isSubmittingAssessment}>
            Cancel
          </Button>
          <Button 
            onClick={handleFinalSubmit}
            variant="contained" 
            color="error"
            disabled={endTestInput !== 'END' || isSubmittingAssessment}
            startIcon={isSubmittingAssessment ? <CircularProgress size={20} sx={{ color: 'white' }} /> : null}
          >
            {isSubmittingAssessment ? 'Submitting...' : 'Submit Assessment'}
          </Button>
        </DialogActions>
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
            <Box sx={{ bgcolor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 1, overflow: 'auto', fontFamily: 'monospace', fontSize: '14px', whiteSpace: 'pre' }}>
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
    </Box>
  );
}
