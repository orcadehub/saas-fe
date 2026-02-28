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
  const [fontSize, setFontSize] = useState(18);
  const [currentTestCaseTab, setCurrentTestCaseTab] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [testCaseResults, setTestCaseResults] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResults, setSubmitResults] = useState([]);
  const [compilerSplit, setCompilerSplit] = useState(60);
  const [isCompilerDragging, setIsCompilerDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef(null);
  const containerRef = useRef(null);

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
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Skeleton variant="rectangular" height={48} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '50% 4px 50%', flexGrow: 1 }}>
          <Box sx={{ p: 4 }}>
            <Skeleton variant="text" height={48} width="60%" sx={{ mb: 3 }} />
            <Skeleton variant="text" height={24} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={24} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
          </Box>
          <Box sx={{ bgcolor: '#6a0dad' }} />
          <Box sx={{ p: 4 }}>
            <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height="calc(100vh - 300px)" />
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
    <Box ref={containerRef} sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#ffffff' }}>
      {/* Header */}
      {!isFullscreen && (
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#ffffff' }}>
          <IconButton onClick={() => navigate('/assessments')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
            {assessment.title} - Practice Mode
          </Typography>
          <Chip label="Practice Mode" color="success" />
          <IconButton onClick={toggleFullscreen}>
            <Fullscreen />
          </IconButton>
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: '50% 4px 50%', flexGrow: 1, height: '100%', overflow: 'hidden' }}>
        {/* Problem Statement */}
        <Box sx={{ overflow: 'auto', height: '100%', bgcolor: '#ffffff', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
          {/* Question Navigation */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 10 }}>
            <Box sx={{ display: 'flex', gap: 1, overflow: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
              {questions.map((q, index) => (
                <Button
                  key={index}
                  variant={index === currentQuestionIndex ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setCurrentQuestionIndex(index)}
                  sx={{
                    minWidth: '48px',
                    height: '48px',
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </Box>
          </Box>

          <Box sx={{ p: 4, maxWidth: '900px', mx: 'auto' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              {currentQuestion.title}
            </Typography>

            {currentQuestion.tags && currentQuestion.tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {currentQuestion.tags.map((tag, idx) => (
                  <Chip key={idx} label={tag} size="small" />
                ))}
              </Box>
            )}

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Description</Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                {currentQuestion.description}
              </Typography>
            </Box>

            {currentQuestion.constraints && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Constraints</Typography>
                <Box component="ul" sx={{ pl: 3, m: 0 }}>
                  {(Array.isArray(currentQuestion.constraints) ? currentQuestion.constraints : [currentQuestion.constraints]).map((constraint, idx) => (
                    <Typography key={idx} component="li" variant="body1" sx={{ mb: 1 }}>
                      {constraint}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {currentQuestion.example && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Example</Typography>
                <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                  {currentQuestion.example.input && (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                      <strong>Input:</strong> {currentQuestion.example.input}
                    </Typography>
                  )}
                  {currentQuestion.example.output && (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                      <strong>Output:</strong> {currentQuestion.example.output}
                    </Typography>
                  )}
                  {currentQuestion.example.explanation && (
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      <strong>Explanation:</strong> {currentQuestion.example.explanation}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {currentQuestion.intuition?.keyInsights && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Key Insights</Typography>
                <Box component="ul" sx={{ pl: 3, m: 0 }}>
                  {currentQuestion.intuition.keyInsights.map((insight, idx) => (
                    <Typography key={idx} component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                      {insight}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {currentQuestion.intuition?.algorithmSteps && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Algorithm</Typography>
                <Box component="ol" sx={{ pl: 3, m: 0 }}>
                  {currentQuestion.intuition.algorithmSteps.map((step, idx) => (
                    <Typography key={idx} component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                      {step}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {(currentQuestion.intuition?.timeComplexity || currentQuestion.intuition?.spaceComplexity) && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Complexity</Typography>
                <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                  {currentQuestion.intuition.timeComplexity && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Time Complexity:</strong> {currentQuestion.intuition.timeComplexity}
                    </Typography>
                  )}
                  {currentQuestion.intuition.spaceComplexity && (
                    <Typography variant="body1">
                      <strong>Space Complexity:</strong> {currentQuestion.intuition.spaceComplexity}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Divider */}
        <Box sx={{ bgcolor: '#6a0dad', cursor: 'col-resize' }} />

        {/* Code Editor */}
        <Box sx={{ bgcolor: '#ffffff', display: 'flex', flexDirection: 'column', height: '100%' }} data-compiler-container>
          <Box sx={{ height: `${compilerSplit}%`, display: 'flex', flexDirection: 'column', borderBottom: '1px solid #e0e0e0', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Language</InputLabel>
                <Select value={language} label="Language" onChange={(e) => setLanguage(e.target.value)}>
                  {(assessment?.allowedLanguages || ['python', 'cpp', 'java', 'c']).map((lang) => (
                    <MenuItem key={lang} value={lang}>
                      {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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

              <Button variant="outlined" startIcon={isRunning ? <CircularProgress size={16} /> : <PlayArrow />} onClick={handleRunCode} disabled={!code.trim() || isRunning}>
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
              <Button variant="contained" onClick={handleSubmit} disabled={!code.trim() || isSubmitting}>
                Submit
              </Button>
              {isFullscreen && (
                <IconButton onClick={toggleFullscreen} sx={{ ml: 1 }}>
                  <FullscreenExit />
                </IconButton>
              )}
            </Box>

            <Box sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
              {language ? (
                <Box sx={{ flexGrow: 1, minHeight: 0, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
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
                      wordWrap: 'on'
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ flexGrow: 1, border: '2px dashed #e0e0e0', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Please select a programming language to start coding
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ height: '4px', cursor: 'row-resize', bgcolor: '#6a0dad', '&:hover': { bgcolor: '#5a0d9d' } }} onMouseDown={() => setIsCompilerDragging(true)} />

          <Box sx={{ height: `${100 - compilerSplit}%`, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Box sx={{ borderBottom: '1px solid #e0e0e0' }}>
              <Tabs value={currentTestCaseTab} onChange={(e, newValue) => setCurrentTestCaseTab(newValue)} variant="scrollable" scrollButtons="auto">
                {(currentQuestion.testCases?.filter(tc => tc.isPublic) || []).map((tc, index) => {
                  const result = testCaseResults[index];
                  const isPassed = result && !result.loading && !result.error && result.output?.trim() === (tc.output?.value || tc.output)?.toString().trim();
                  const isFailed = result && !result.loading && (result.error || result.output?.trim() !== (tc.output?.value || tc.output)?.toString().trim());
                  
                  return (
                    <Tab key={index} label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Test Case {index + 1}{result?.loading && <CircularProgress size={16} />}</Box>} sx={{ bgcolor: isPassed ? '#e8f5e9' : isFailed ? '#ffebee' : 'transparent' }} />
                  );
                })}
              </Tabs>
            </Box>

            <Box sx={{ p: 4, flexGrow: 1, overflow: 'auto' }}>
              {currentQuestion.testCases?.filter(tc => tc.isPublic)[currentTestCaseTab] && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Input</Typography>
                    <Box sx={{ bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', p: 2.5, borderRadius: 2, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                      {currentQuestion.testCases.filter(tc => tc.isPublic)[currentTestCaseTab].input?.value || currentQuestion.testCases.filter(tc => tc.isPublic)[currentTestCaseTab].input}
                    </Box>
                  </Box>

                  {testCaseResults[currentTestCaseTab] && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Your Output</Typography>
                      <Box sx={{ bgcolor: '#f5f5f5', border: '2px solid', borderColor: testCaseResults[currentTestCaseTab].error ? 'error.main' : 'success.main', p: 2.5, borderRadius: 2, fontFamily: 'monospace', whiteSpace: 'pre', minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                        {testCaseResults[currentTestCaseTab].loading ? <CircularProgress size={24} /> : testCaseResults[currentTestCaseTab].error || testCaseResults[currentTestCaseTab].output || 'No output'}
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Expected Output</Typography>
                    <Box sx={{ bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', p: 2.5, borderRadius: 2, fontFamily: 'monospace', whiteSpace: 'pre' }}>
                      {currentQuestion.testCases.filter(tc => tc.isPublic)[currentTestCaseTab].output?.value || currentQuestion.testCases.filter(tc => tc.isPublic)[currentTestCaseTab].output}
                    </Box>
                  </Box>
                </>
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
