import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Chip, Skeleton } from '@mui/material';
import { ArrowBack, PlayArrow, CheckCircle, Close, Add, Remove, Fullscreen, FullscreenExit } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { submitCode } from 'services/pistonService';
import tenantConfig from 'config/tenantConfig';
import apiService from 'services/apiService';

export default function AssessmentPractice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [language, setLanguage] = useState('');
  const [code, setCode] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(40);
  const containerRef = useRef(null);
  const isResizing = useRef(false);

  const startResizing = (e) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    let newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setLeftWidth(newWidth);
    }
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };
  const [fontSize, setFontSize] = useState(18);
  const [currentTestCaseTab, setCurrentTestCaseTab] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [testCaseResults, setTestCaseResults] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResults, setSubmitResults] = useState([]);
  const [compilerSplit, setCompilerSplit] = useState(60);
  const [isCompilerDragging, setIsCompilerDragging] = useState(false);
  const editorRef = useRef(null);


  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  useEffect(() => {
    if (config) {
      fetchAssessment();
    }
  }, [config, id]);

  const fetchAssessment = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const assessmentData = await apiService.getAssessmentDetails(token, id);
      setAssessment(assessmentData);
      setQuestions(assessmentData.questions || []);
      if (assessmentData.questions?.length > 0) {
        setLanguage(assessmentData.allowedLanguages?.[0] || 'python');
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLanguageTemplate = (lang) => {
    switch (lang) {
      case 'python': return `# Write your code here\n`;
      case 'cpp': return `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`;
      case 'java': return `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`;
      case 'c': return `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}`;
      default: return '// Write your code here';
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

  useEffect(() => {
    if (questions[currentQuestionIndex]?._id && language) {
      const storageKey = `practice_assessment_${id}_question_${questions[currentQuestionIndex]._id}_${language}`;
      const savedCode = localStorage.getItem(storageKey);
      setCode(savedCode || getLanguageTemplate(language));
    }
  }, [currentQuestionIndex, language, questions, id]);

  useEffect(() => {
    if (questions[currentQuestionIndex]?._id && language && code) {
      const storageKey = `practice_assessment_${id}_question_${questions[currentQuestionIndex]._id}_${language}`;
      localStorage.setItem(storageKey, code);
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
        const result = await submitCode(code, languageId, testCase.input?.value || testCase.input);
        
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
  };

  const handleSubmit = async () => {
    if (!code.trim() || !language) return;
    
    const allTestCases = questions[currentQuestionIndex]?.testCases || [];
    
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
        const result = await submitCode(code, languageId, testCase.input?.value || testCase.input);
        
        if (result.status.id === 3) {
          const userOutput = result.stdout ? result.stdout.trim() : '';
          const expectedOutput = (testCase.output?.value || testCase.output)?.toString().trim();
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
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#fbfcfe' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(226, 232, 240, 0.8)', bgcolor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}>
          <Skeleton variant="rectangular" height={48} sx={{ borderRadius: '12px' }} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '50% 1px 50%', flexGrow: 1 }}>
          <Box sx={{ p: 4 }}>
            <Skeleton variant="text" height={48} width="60%" sx={{ mb: 3 }} />
            <Skeleton variant="text" height={24} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={24} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: '16px' }} />
          </Box>
          <Box sx={{ bgcolor: 'rgba(226, 232, 240, 0.8)' }} />
          <Box sx={{ p: 4 }}>
            <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: '12px' }} />
            <Skeleton variant="rectangular" height="calc(100vh - 300px)" sx={{ borderRadius: '16px' }} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (!assessment || questions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5">Assessment not found</Typography>
        <Button variant="outlined" onClick={() => navigate('/assessments')}>Back to Assessments</Button>
      </Box>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Box ref={containerRef} sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#fbfcfe' }}>
      {/* Header */}
      {!isFullscreen && (
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          zIndex: 100
        }}>
          <IconButton onClick={() => navigate('/assessments')} sx={{ color: '#64748b' }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 800, flexGrow: 1, color: '#1e293b' }}>
            {assessment.title} <Typography component="span" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.9rem', ml: 1 }}>• Practice</Typography>
          </Typography>
          <Chip 
            label="Practice Active" 
            sx={{ 
              fontWeight: 800, 
              bgcolor: 'rgba(34, 197, 94, 0.1)', 
              color: '#22c55e',
              border: 'none'
            }} 
          />
          <IconButton onClick={toggleFullscreen} sx={{ color: '#64748b' }}>
            <Fullscreen />
          </IconButton>
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: `${leftWidth}% 4px 1fr`, flexGrow: 1, height: '100%', overflow: 'hidden' }}>
        {/* Problem Statement */}
        <Box sx={{ overflow: 'auto', height: '100%', bgcolor: '#fff', borderRight: '1px solid rgba(226, 232, 240, 0.8)' }}>
          {/* Question Navigation */}
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(226, 232, 240, 0.6)', bgcolor: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(5px)', position: 'sticky', top: 0, zIndex: 10 }}>
            <Box sx={{ display: 'flex', gap: 1, overflow: 'auto', pb: 1 }}>
              {questions.map((q, index) => (
                <Button
                  key={index}
                  variant={index === currentQuestionIndex ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setCurrentQuestionIndex(index)}
                  sx={{
                    minWidth: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    bgcolor: index === currentQuestionIndex ? '#6366f1' : 'transparent',
                    color: index === currentQuestionIndex ? '#fff' : '#64748b',
                    borderColor: index === currentQuestionIndex ? '#6366f1' : 'rgba(226, 232, 240, 1)',
                    '&:hover': {
                      bgcolor: index === currentQuestionIndex ? '#4f46e5' : 'rgba(99, 102, 241, 0.04)',
                      borderColor: '#6366f1'
                    }
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </Box>
          </Box>

          <Box sx={{ p: 4, maxWidth: '900px', mx: 'auto' }}>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 1.5, color: '#1e293b', fontSize: '2.25rem', letterSpacing: '-0.02em' }}>
              {currentQuestion.title}
            </Typography>

            {currentQuestion.tags && currentQuestion.tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
                {currentQuestion.tags.map((tag, idx) => (
                  <Chip 
                    key={idx} 
                    label={tag} 
                    size="small" 
                    sx={{ 
                      fontWeight: 700, 
                      bgcolor: 'rgba(99, 102, 241, 0.05)', 
                      color: '#6366f1',
                      borderRadius: '8px',
                      border: '1px solid rgba(99, 102, 241, 0.1)'
                    }} 
                  />
                ))}
              </Box>
            )}

            <Box sx={{ mb: 5 }}>
              <Typography sx={{ 
                fontWeight: 800, 
                color: '#6366f1', 
                textTransform: 'uppercase', 
                fontSize: '0.85rem', 
                letterSpacing: '0.1em',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box sx={{ width: 4, height: 16, bgcolor: '#6366f1', borderRadius: 1 }} />
                Description
              </Typography>
              <Typography sx={{ lineHeight: 1.8, color: '#475569', fontSize: '1.1rem', fontWeight: 600 }}>
                {currentQuestion.description}
              </Typography>
            </Box>

            {currentQuestion.constraints && (
              <Box sx={{ mb: 5 }}>
                <Typography sx={{ 
                  fontWeight: 800, 
                  color: '#6366f1', 
                  textTransform: 'uppercase', 
                  fontSize: '0.85rem', 
                  letterSpacing: '0.1em',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ width: 4, height: 16, bgcolor: '#6366f1', borderRadius: 1 }} />
                  Constraints
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0 }}>
                  {(Array.isArray(currentQuestion.constraints) ? currentQuestion.constraints : [currentQuestion.constraints]).map((constraint, idx) => (
                    <Typography key={idx} component="li" sx={{ mb: 1, color: '#475569', fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.7 }}>
                      {constraint}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {currentQuestion.example && (
              <Box sx={{ mb: 5 }}>
                <Typography sx={{ 
                  fontWeight: 800, 
                  color: '#6366f1', 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem', 
                  letterSpacing: '0.1em',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ width: 4, height: 16, bgcolor: '#6366f1', borderRadius: 1 }} />
                  Example
                </Typography>
                <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                  {currentQuestion.example.input && (
                    <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", mb: 1.5, color: '#1e293b' }}>
                      <strong style={{ color: '#64748b' }}>Input:</strong> {currentQuestion.example.input}
                    </Typography>
                  )}
                  {currentQuestion.example.output && (
                    <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", mb: 1.5, color: '#10b981', fontWeight: 700 }}>
                      <strong style={{ color: '#64748b' }}>Output:</strong> {currentQuestion.example.output}
                    </Typography>
                  )}
                  {currentQuestion.example.explanation && (
                    <Typography variant="body2" sx={{ mt: 1.5, fontStyle: 'italic', color: '#64748b' }}>
                      <strong style={{ color: '#64748b', fontStyle: 'normal' }}>Explanation:</strong> {currentQuestion.example.explanation}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {currentQuestion.intuition?.keyInsights && (
              <Box sx={{ mb: 5 }}>
                <Typography sx={{ 
                  fontWeight: 800, 
                  color: '#6366f1', 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem', 
                  letterSpacing: '0.1em',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ width: 4, height: 16, bgcolor: '#6366f1', borderRadius: 1 }} />
                  Key Insights
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0 }}>
                  {currentQuestion.intuition.keyInsights.map((insight, idx) => (
                    <Typography key={idx} component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8, color: '#475569', fontWeight: 500 }}>
                      {insight}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {currentQuestion.intuition?.algorithmSteps && (
              <Box sx={{ mb: 5 }}>
                <Typography sx={{ 
                  fontWeight: 800, 
                  color: '#6366f1', 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem', 
                  letterSpacing: '0.1em',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ width: 4, height: 16, bgcolor: '#6366f1', borderRadius: 1 }} />
                  Algorithm
                </Typography>
                <Box component="ol" sx={{ pl: 3, m: 0 }}>
                  {currentQuestion.intuition.algorithmSteps.map((step, idx) => (
                    <Typography key={idx} component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8, color: '#475569', fontWeight: 500 }}>
                      {step}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {(currentQuestion.intuition?.timeComplexity || currentQuestion.intuition?.spaceComplexity) && (
              <Box sx={{ mb: 5 }}>
                <Typography sx={{ 
                  fontWeight: 800, 
                  color: '#6366f1', 
                  textTransform: 'uppercase', 
                  fontSize: '0.75rem', 
                  letterSpacing: '0.1em',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ width: 4, height: 16, bgcolor: '#6366f1', borderRadius: 1 }} />
                  Complexity Analysis
                </Typography>
                <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                  {currentQuestion.intuition.timeComplexity && (
                    <Typography variant="body1" sx={{ mb: 1, color: '#475569', fontWeight: 500 }}>
                      <strong style={{ color: '#1e293b' }}>Time Complexity:</strong> {currentQuestion.intuition.timeComplexity}
                    </Typography>
                  )}
                  {currentQuestion.intuition.spaceComplexity && (
                    <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500 }}>
                      <strong style={{ color: '#1e293b' }}>Space Complexity:</strong> {currentQuestion.intuition.spaceComplexity}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        <Box 
          onMouseDown={startResizing}
          sx={{ 
            width: '4px',
            bgcolor: 'rgba(226, 232, 240, 0.8)', 
            cursor: 'col-resize', 
            transition: 'background 0.2s',
            zIndex: 100,
            '&:hover': { bgcolor: '#6366f1' },
            '&:active': { bgcolor: '#4f46e5' }
          }} 
        />

        {/* Code Editor */}
        <Box sx={{ bgcolor: '#fff', display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }} data-compiler-container>
          <Box sx={{ height: `${compilerSplit}%`, display: 'flex', flexDirection: 'column', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden' }}>
            <Box sx={{ 
              p: 1.5, 
              borderBottom: '1px solid rgba(226, 232, 240, 0.8)', 
              bgcolor: '#fcfdfe', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: 2,
              overflowX: 'auto',
              minHeight: '64px',
              pb: 0.5,
              '&::-webkit-scrollbar': { height: '6px' },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(99, 102, 241, 0.2)', borderRadius: '10px' },
              '&:hover::-webkit-scrollbar-thumb': { bgcolor: 'rgba(99, 102, 241, 0.4)' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel sx={{ fontWeight: 700, color: '#64748b' }}>Language</InputLabel>
                  <Select 
                    value={language} 
                    label="Language" 
                    onChange={(e) => setLanguage(e.target.value)}
                    sx={{ 
                      borderRadius: '10px',
                      '& .MuiSelect-select': { fontWeight: 700, color: '#1e293b' }
                    }}
                  >
                    {(assessment?.allowedLanguages || ['python', 'cpp', 'java', 'c']).map((lang) => (
                      <MenuItem key={lang} value={lang} sx={{ fontWeight: 600 }}>
                        {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(0,0,0,0.03)', px: 1, borderRadius: '8px' }}>
                  <IconButton size="small" onClick={() => setFontSize(prev => Math.max(12, prev - 2))} sx={{ color: '#64748b' }}>
                    <Remove fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" sx={{ minWidth: '30px', textAlign: 'center', fontWeight: 800, color: '#1e293b' }}>
                    {fontSize}
                  </Typography>
                  <IconButton size="small" onClick={() => setFontSize(prev => Math.min(32, prev + 2))} sx={{ color: '#64748b' }}>
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={isRunning ? <CircularProgress size={16} color="inherit" /> : <PlayArrow />} 
                  onClick={handleRunCode} 
                  disabled={!code.trim() || isRunning}
                  sx={{ 
                    borderRadius: '10px', 
                    fontWeight: 800, 
                    textTransform: 'none',
                    borderColor: 'rgba(99, 102, 241, 0.2)',
                    color: '#6366f1',
                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.04)', borderColor: '#6366f1' }
                  }}
                >
                  {isRunning ? 'Running...' : 'Run Code'}
                </Button>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={handleSubmit} 
                  disabled={!code.trim() || isSubmitting}
                  sx={{ 
                    borderRadius: '10px', 
                    fontWeight: 800, 
                    textTransform: 'none',
                    bgcolor: '#6366f1',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                    '&:hover': { bgcolor: '#4f46e5', boxShadow: '0 6px 16px rgba(99, 102, 241, 0.3)' }
                  }}
                >
                  {isSubmitting ? <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} /> : null}
                  Submit Solutions
                </Button>
                {isFullscreen && (
                  <IconButton onClick={toggleFullscreen} sx={{ ml: 1, color: '#64748b' }}>
                    <FullscreenExit />
                  </IconButton>
                )}
              </Box>
            </Box>

            <Box sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
              {language ? (
                <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
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
                      padding: { top: 20 },
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                  <Typography variant="body1" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                    Select a language to activate the editor
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box 
            sx={{ 
              height: '8px', 
              cursor: 'row-resize', 
              bgcolor: 'rgba(226, 232, 240, 0.5)', 
              '&:hover': { bgcolor: '#6366f1' },
              transition: 'background 0.2s',
              zIndex: 10
            }} 
            onMouseDown={() => setIsCompilerDragging(true)} 
          />

          <Box sx={{ height: `${100 - compilerSplit}%`, display: 'flex', flexDirection: 'column', minHeight: 0, bgcolor: '#fff' }}>
            <Box sx={{ borderBottom: '1px solid rgba(226, 232, 240, 0.8)', bgcolor: '#fcfdfe' }}>
              <Tabs 
                value={currentTestCaseTab} 
                onChange={(e, newValue) => setCurrentTestCaseTab(newValue)} 
                variant="scrollable" 
                scrollButtons="auto"
                sx={{
                  minHeight: 44,
                  '& .MuiTabs-indicator': { bgcolor: '#6366f1', height: 3 },
                  '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', color: '#64748b', minHeight: 44 }
                }}
              >
                {(currentQuestion.testCases?.filter(tc => tc.isPublic) || []).map((tc, index) => {
                  const result = testCaseResults[index];
                  const isPassed = result && !result.loading && !result.error && result.output?.trim() === (tc.output?.value || tc.output)?.toString().trim();
                  const isFailed = result && !result.loading && (result.error || result.output?.trim() !== (tc.output?.value || tc.output)?.toString().trim());
                  
                  return (
                    <Tab 
                      key={index} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          Test Case {index + 1}
                          {result?.loading && <CircularProgress size={12} sx={{ color: '#6366f1' }} />}
                          {isPassed && <CheckCircle sx={{ fontSize: 14, color: '#22c55e' }} />}
                          {isFailed && <Close sx={{ fontSize: 14, color: '#ef4444' }} />}
                        </Box>
                      } 
                    />
                  );
                })}
              </Tabs>
            </Box>

            <Box sx={{ p: 4, flexGrow: 1, overflow: 'auto', bgcolor: '#fff' }}>
              {currentQuestion.testCases?.filter(tc => tc.isPublic)[currentTestCaseTab] && (
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', mb: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>Input</Typography>
                    <Box sx={{ bgcolor: '#f8fafc', border: '1px solid #f1f5f9', p: 2, borderRadius: '12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#1e293b' }}>
                      {currentQuestion.testCases.filter(tc => tc.isPublic)[currentTestCaseTab].input?.value || currentQuestion.testCases.filter(tc => tc.isPublic)[currentTestCaseTab].input}
                    </Box>
                  </Box>

                  {testCaseResults[currentTestCaseTab] && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', mb: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>Your Output</Typography>
                      <Box sx={{ 
                        bgcolor: testCaseResults[currentTestCaseTab].error ? 'rgba(239, 68, 68, 0.02)' : 'rgba(34, 197, 94, 0.02)', 
                        border: '1px solid', 
                        borderColor: testCaseResults[currentTestCaseTab].error ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)', 
                        p: 2, borderRadius: '12px', 
                        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem',
                        color: testCaseResults[currentTestCaseTab].error ? '#ef4444' : '#1e293b'
                      }}>
                        {testCaseResults[currentTestCaseTab].loading ? <CircularProgress size={20} /> : testCaseResults[currentTestCaseTab].error || testCaseResults[currentTestCaseTab].output || 'No output collected'}
                      </Box>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', mb: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>Expected Output</Typography>
                    <Box sx={{ bgcolor: '#f8fafc', border: '1px solid #f1f5f9', p: 2, borderRadius: '12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#1e293b' }}>
                      {currentQuestion.testCases.filter(tc => tc.isPublic)[currentTestCaseTab].output?.value || currentQuestion.testCases.filter(tc => tc.isPublic)[currentTestCaseTab].output}
                    </Box>
                  </Box>
                </Stack>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Dialog open={showSubmitModal} maxWidth="lg" fullWidth disableEscapeKeyDown={isSubmitting}>
        <DialogTitle>Test Case Execution Results</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            {isSubmitting ? 'Executing test cases...' : 'All test cases executed'}
          </Typography>
          
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {submitResults.map((result) => (
              <Card key={result.index} sx={{ border: '1px solid', borderColor: result.passed === true ? 'success.main' : result.passed === false ? 'error.main' : '#e0e0e0' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Test Case {result.index}</Typography>
                      <Chip label={result.type} size="small" sx={{ bgcolor: result.type === 'Public' ? '#e3f2fd' : '#f3e5f5', color: result.type === 'Public' ? '#1976d2' : '#9c27b0' }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {result.passed === true && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}><CheckCircle /><Typography variant="body2" sx={{ fontWeight: 600 }}>PASSED</Typography></Box>}
                      {result.passed === false && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}><Close /><Typography variant="body2" sx={{ fontWeight: 600 }}>FAILED</Typography></Box>}
                      {result.passed === null && result.status === 'Running' && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={20} /><Typography variant="body2" sx={{ fontWeight: 600 }}>Running</Typography></Box>}
                      {result.passed === null && result.status === 'Pending' && <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>Pending</Typography>}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          {!isSubmitting && <Button onClick={() => setShowSubmitModal(false)} variant="outlined">Close</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
