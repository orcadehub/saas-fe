import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Chip, FormControl, InputLabel, Select, MenuItem, Stack, ButtonGroup } from '@mui/material';
import { PlayArrow, CheckCircle, Close, Add, Remove, Edit, AccessTime, InfoOutlined } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { submitCode } from 'services/pistonService';
import apiService from 'services/apiService';

export default function ProgrammingEditor({ assessment, question, attemptId, onTestComplete, isPractice = false, assessmentId }) {
  const isProduction = import.meta.env.MODE === 'production';
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
  const [customTestCases, setCustomTestCases] = useState([]);
  const [showAddCustomInput, setShowAddCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [editingCustomIndex, setEditingCustomIndex] = useState(null);
  const editorRef = useRef(null);

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

  // Initialize language
  useEffect(() => {
    if (assessment?.allowedLanguages?.length > 0) {
      setLanguage(assessment.allowedLanguages[0]);
    } else if (question?.allowedLanguages?.length > 0) {
      setLanguage(question.allowedLanguages[0]);
    } else {
      setLanguage('python');
    }
  }, [assessment, question]);

  // Load saved code
  useEffect(() => {
    if (question?._id && language) {
      if (isPractice) {
        const storageKey = `practice_prog_${question._id}_${language}`;
        const savedCode = localStorage.getItem(storageKey);
        setCode(savedCode || question.starterCode || getLanguageTemplate(language));
      } else {
        const storageKey = `assessment_${assessmentId}_question_${question._id}_${language}`;
        const savedCode = sessionStorage.getItem(storageKey);
        setCode(savedCode || getLanguageTemplate(language));
      }
    }
  }, [question?._id, language, isPractice, assessmentId]);

  // Save code on change
  useEffect(() => {
    if (question?._id && language && code) {
      if (isPractice) {
        const storageKey = `practice_prog_${question._id}_${language}`;
        localStorage.setItem(storageKey, code);
      } else {
        const storageKey = `assessment_${assessmentId}_question_${question._id}_${language}`;
        sessionStorage.setItem(storageKey, code);
      }
    }
  }, [code, question?._id, language, isPractice, assessmentId]);

  // Reset state when question changes
  useEffect(() => {
    setCurrentTestCaseTab(0);
    setTestCaseResults({});
    setCustomTestCases([]);
    setSubmitResults([]);
  }, [question?._id]);

  // Split management
  useEffect(() => {
    if (isCompilerDragging) {
      const handleMouseMove = (e) => {
        const container = document.querySelector('[data-programming-editor-container]');
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const newPosition = ((e.clientY - rect.top) / rect.height) * 100;
        if (newPosition >= 20 && newPosition <= 85) {
          setCompilerSplit(newPosition);
        }
      };
      const handleMouseUp = () => setIsCompilerDragging(false);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isCompilerDragging]);

  const handleRecover = async () => {
    if (!attemptId || !question?._id || !language) return;
    setIsRunning(true);
    try {
      const token = localStorage.getItem('studentToken');
      const response = await apiService.getLastExecutedCode(token, attemptId);
      const progCodes = response.lastExecutedCode || response.successfulCodes;
      
      if (progCodes && progCodes[question._id] && progCodes[question._id][language]) {
        const savedCode = progCodes[question._id][language];
        setCode(savedCode);
        if (!isPractice) {
          sessionStorage.setItem(`assessment_${assessmentId}_question_${question._id}_${language}`, savedCode);
        } else {
          localStorage.setItem(`practice_prog_${question._id}_${language}`, savedCode);
        }
      }
    } catch (error) {
      console.error('Error recovering programming session:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim() || !language) return;
    
    setIsRunning(true);
    setTestCaseResults({});
    
    const publicTestCases = question?.testCases?.filter(tc => tc.isPublic) || [];
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
          const expectedOutput = (testCase.expectedOutput || testCase.output)?.toString().trim();
          const passed = userOutput === expectedOutput;
          
          setTestCaseResults(prev => ({
            ...prev,
            [i]: { loading: false, output: userOutput, error: null, passed }
          }));
        } else {
          let errorOutput = result.stderr || 'Execution Error';
          if (errorOutput.includes('fatal signal')) {
            errorOutput = 'Error: Program exceeded time/memory limits';
          }
          setTestCaseResults(prev => ({
            ...prev,
            [i]: { loading: false, output: null, error: errorOutput, passed: false }
          }));
        }
      } catch (error) {
        setTestCaseResults(prev => ({
          ...prev,
          [i]: { loading: false, output: null, error: error.message, passed: false }
        }));
      }
    }
    
    setIsRunning(false);

    // Save progress to backend if in assessment
    if (!isPractice && attemptId && question?._id) {
      try {
        const token = localStorage.getItem('studentToken');
        await apiService.saveAssessmentCode(token, attemptId, question._id, language, code, false);
      } catch (error) {
        console.error('Error auto-saving code after run:', error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!code.trim() || !language) return;
    
    const allTestCases = question?.testCases || [];
    
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
            passed,
            userOutput,
            expectedOutput
          };
        } else {
          results[i] = {
            ...results[i],
            status: 'Error',
            passed: false,
            error: result.stderr || 'Execution Error'
          };
        }
      } catch (error) {
        results[i] = {
          ...results[i],
          status: 'Error',
          passed: false,
          error: error.message
        };
      }
      setSubmitResults([...results]);
    }
    
    setIsSubmitting(false);
    
    const allPassed = results.every(r => r.passed === true);
    
    if (!isPractice && attemptId && question?._id) {
      try {
        const token = localStorage.getItem('studentToken');
        await apiService.saveAssessmentCode(
          token,
          attemptId,
          question._id,
          language,
          code,
          allPassed,
          results
        );
      } catch (error) {
        console.error('Error saving final code submission:', error);
      }
    }
    
    if (onTestComplete) {
      onTestComplete(results.filter(r => r.passed === true).length, results.length);
    }
  };

  const handleAddCustomTestCase = () => {
    if (!customInput.trim()) return;
    if (editingCustomIndex !== null) {
      setCustomTestCases(prev => {
        const updated = [...prev];
        updated[editingCustomIndex] = { input: customInput, isCustom: true };
        return updated;
      });
      setEditingCustomIndex(null);
    } else {
      setCustomTestCases(prev => [...prev, { input: customInput, isCustom: true }]);
    }
    setCustomInput('');
    setShowAddCustomInput(false);
  };

  const publicTestCases = question?.testCases?.filter(tc => tc.isPublic) || [];
  const allDisplayTestCases = [...publicTestCases, ...customTestCases];
  const canAddMore = publicTestCases.length >= 0 && customTestCases.length < 4;

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }} data-programming-editor-container>
        {/* Editor Pane */}
        <Box sx={{ height: `${compilerSplit}%`, display: 'flex', flexDirection: 'column', bgcolor: '#ffffff', minHeight: 0 }}>
          {/* Header Bar */}
          <Box sx={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            px: 2.5, py: 1.5, borderBottom: '1px solid #f1f5f9', bgcolor: '#ffffff',
            flexShrink: 0
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel sx={{ fontWeight: 700 }}>Language</InputLabel>
                <Select
                  value={language}
                  label="Language"
                  onChange={(e) => setLanguage(e.target.value)}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' }
                  }}
                >
                  {(assessment?.allowedLanguages || question?.allowedLanguages || ['python', 'cpp', 'java', 'c']).map((lang) => (
                    <MenuItem key={lang} value={lang}>
                      {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f8fafc', px: 1, py: 0.5, borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <IconButton size="small" onClick={() => setFontSize(prev => Math.max(12, prev - 2))} sx={{ color: '#64748b' }}>
                  <Remove fontSize="small" />
                </IconButton>
                <Typography sx={{ minWidth: '32px', textAlign: 'center', fontWeight: 900, fontSize: '0.85rem', fontFamily: 'JetBrains Mono' }}>
                  {fontSize}px
                </Typography>
                <IconButton size="small" onClick={() => setFontSize(prev => Math.min(32, prev + 2))} sx={{ color: '#64748b' }}>
                  <Add fontSize="small" />
                </IconButton>
              </Box>

              {!isPractice && attemptId && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRecover}
                  sx={{
                    textTransform: 'none', borderRadius: '12px', fontWeight: 800, px: 2,
                    borderColor: '#e2e8f0', color: '#475569',
                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                  }}
                >
                  Recover Session
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={isRunning ? <CircularProgress size={16} /> : <PlayArrow />}
                onClick={handleRunCode}
                disabled={!code.trim() || isRunning}
                sx={{ borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 3, py: 1 }}
              >
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!code.trim() || isSubmitting}
                sx={{ 
                  borderRadius: '12px', fontWeight: 900, textTransform: 'none', px: 3, py: 1,
                  bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }
                }}
              >
                Submit Code
              </Button>
            </Box>
          </Box>

          {/* Monaco Editor */}
          <Box sx={{ flexGrow: 1, bgcolor: '#1e1e1e', overflow: 'hidden' }}>
            <Editor
              height="100%"
              language={getMonacoLanguage(language)}
              value={code}
              theme="vs-dark"
              onChange={(v) => setCode(v || '')}
              onMount={(editor) => { editorRef.current = editor; }}
              options={{
                fontSize: fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 20 },
                fontFamily: "'JetBrains Mono', monospace",
                fontLigatures: true,
                lineHeight: 1.6
              }}
            />
          </Box>
        </Box>

        {/* Resize Handle */}
        <Box
          sx={{ height: '4px', cursor: 'row-resize', bgcolor: '#e2e8f0', '&:hover': { bgcolor: '#6366f1' } }}
          onMouseDown={() => setIsCompilerDragging(true)}
        />

        {/* Test Cases Pane */}
        <Box sx={{ height: `${100 - compilerSplit}%`, display: 'flex', flexDirection: 'column', bgcolor: '#ffffff', minHeight: 0 }}>
          {/* Tabs */}
          <Box sx={{ 
            display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, 
            bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9', overflowX: 'auto' 
          }}>
            {allDisplayTestCases.map((tc, idx) => {
              const res = testCaseResults[idx];
              const isActive = currentTestCaseTab === idx;
              const isPassed = res?.passed === true;
              const isFailed = res?.passed === false;
              
              return (
                <Box
                  key={idx}
                  onClick={() => setCurrentTestCaseTab(idx)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1,
                    cursor: 'pointer', borderRadius: '10px', transition: 'all 0.2s',
                    bgcolor: isActive ? '#ffffff' : 'transparent',
                    border: '1px solid',
                    borderColor: isActive ? (isPassed ? '#22c55e' : isFailed ? '#ef4444' : '#6366f1') : 'transparent',
                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    color: isActive ? '#0f172a' : '#64748b'
                  }}
                >
                  {isPassed && <CheckCircle sx={{ color: '#22c55e', fontSize: 16 }} />}
                  {isFailed && <Close sx={{ color: '#ef4444', fontSize: 16 }} />}
                  {res?.loading && <CircularProgress size={14} />}
                  <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
                    {idx < publicTestCases.length ? `Case ${idx+1}` : `Custom ${idx - publicTestCases.length + 1}`}
                  </Typography>
                </Box>
              );
            })}
            {canAddMore && (
              <IconButton size="small" onClick={() => setShowAddCustomInput(true)} sx={{ color: '#6366f1', bgcolor: '#eef2ff', borderRadius: '10px' }}>
                <Add fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Tab Content */}
          <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
            {allDisplayTestCases[currentTestCaseTab] ? (
              <Box>
                {/* Input */}
                <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', mb: 1.5 }}>Input</Typography>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', mb: 3, fontFamily: "'JetBrains Mono'", fontSize: '0.9rem' }}>
                  {allDisplayTestCases[currentTestCaseTab].input ? (
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {allDisplayTestCases[currentTestCaseTab].input}
                    </pre>
                  ) : (
                    <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>No input required</Typography>
                  )}
                </Box>

                {/* Output */}
                {testCaseResults[currentTestCaseTab] && (
                  <>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', mb: 1.5 }}>Your Output</Typography>
                    <Box sx={{ 
                      p: 2, borderRadius: '12px', border: '1px solid',
                      borderColor: testCaseResults[currentTestCaseTab].error ? '#fee2e2' : '#f1f5f9',
                      bgcolor: testCaseResults[currentTestCaseTab].error ? '#fff7ed' : '#ffffff',
                      mb: 3, fontFamily: "'JetBrains Mono'", fontSize: '0.9rem'
                    }}>
                      {testCaseResults[currentTestCaseTab].loading ? <CircularProgress size={20} /> : (
                        testCaseResults[currentTestCaseTab].error ? 
                          <Typography sx={{ color: '#ef4444' }}>{testCaseResults[currentTestCaseTab].error}</Typography> : 
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{testCaseResults[currentTestCaseTab].output || 'No output'}</pre>
                      )}
                    </Box>
                  </>
                )}

                {/* Expected */}
                {currentTestCaseTab < publicTestCases.length && (
                  <>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', mb: 1.5 }}>Expected Output</Typography>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', mb: 3, fontFamily: "'JetBrains Mono'", fontSize: '0.9rem' }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {allDisplayTestCases[currentTestCaseTab].expectedOutput || allDisplayTestCases[currentTestCaseTab].output}
                      </pre>
                    </Box>
                  </>
                )}

                {/* Explanation - User specifically asked for this */}
                {allDisplayTestCases[currentTestCaseTab].explanation && (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <InfoOutlined sx={{ fontSize: 16, color: '#6366f1' }} />
                      <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Explanation</Typography>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe', color: '#1e40af', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {allDisplayTestCases[currentTestCaseTab].explanation}
                    </Box>
                  </>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Select or add a test case to view details</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Execution Results Modal - Premium Design from AssessmentTaking */}
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
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 5 }}>
                <Box sx={{ p: 3, borderRadius: '24px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <Typography sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em', mb: 1 }}>Test Results</Typography>
                  <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '2.25rem' }}>
                    {submitResults.filter(r => r.passed === true).length}{' '}
                    <Typography component="span" sx={{ fontSize: '1.25rem', color: '#64748b', fontWeight: 700 }}>out of</Typography>{' '}
                    {submitResults.length}
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem', mt: 0.5 }}>Test Cases Passed</Typography>
                </Box>

                {(() => {
                  const passRate = submitResults.length > 0 ? Math.round((submitResults.filter(r => r.passed === true).length / submitResults.length) * 100) : 0;
                  return (
                    <Box sx={{ p: 3, borderRadius: '24px', bgcolor: passRate >= 70 ? '#f0fdf4' : '#fef2f2', border: '1px solid', borderColor: passRate >= 70 ? '#dcfce7' : '#fee2e2' }}>
                      <Typography sx={{ color: passRate >= 70 ? '#22c55e' : '#ef4444', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em', mb: 1 }}>Pass Rate</Typography>
                      <Typography sx={{ fontWeight: 900, color: passRate >= 70 ? '#14532d' : '#991b1b', fontSize: '2.25rem' }}>{passRate}%</Typography>
                      <Box sx={{ width: '100%', height: 8, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 4, mt: 1.5, overflow: 'hidden' }}>
                        <Box sx={{ width: `${passRate}%`, height: '100%', bgcolor: passRate >= 70 ? '#22c55e' : '#ef4444' }} />
                      </Box>
                    </Box>
                  );
                })()}
              </Box>

              <Typography sx={{ fontWeight: 800, color: '#0f172a', mb: 2.5, fontSize: '1.25rem' }}>Test Case Diagnostics</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {submitResults.map((result) => (
                  <Box key={result.index} sx={{ 
                    display: 'flex', alignItems: 'center', gap: 3, p: 2.5, bgcolor: '#f8fafc',
                    borderRadius: '20px', border: '1px solid #f1f5f9', transition: 'all 0.2s',
                    '&:hover': { transform: 'translateX(8px)', borderColor: '#cbd5e1' }
                  }}>
                    <Box sx={{ 
                      width: 44, height: 44, borderRadius: '16px', flexShrink: 0,
                      bgcolor: result.passed === true ? '#dcfce7' : result.passed === false ? '#fee2e2' : '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {result.passed === true && <CheckCircle sx={{ color: '#22c55e', fontSize: 24 }} />}
                      {result.passed === false && <Close sx={{ color: '#ef4444', fontSize: 24 }} />}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem' }}>Test Case {result.index}</Typography>
                        <Chip label={result.type} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 900, bgcolor: result.type === 'Public' ? '#e0e7ff' : '#f3e8ff', color: result.type === 'Public' ? '#4338ca' : '#7e22ce' }} />
                      </Box>
                      <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', mt: 0.5 }}>
                        {result.passed === true ? 'Scenario verified successfully' : result.passed === false ? 'Output mismatch detected' : 'Processing...'}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: result.passed === true ? '#10b981' : '#ef4444' }}>
                      {result.passed === true ? 'PASSED' : 'FAILED'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        {!isSubmitting && (
          <DialogActions sx={{ p: 4, pt: 2 }}>
            <Button onClick={() => setShowSubmitModal(false)} variant="contained" fullWidth sx={{ borderRadius: '16px', py: 2, fontWeight: 900, textTransform: 'none', bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}>
              Return to Editor
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Custom Input Modal */}
      <Dialog open={showAddCustomInput} onClose={() => setShowAddCustomInput(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingCustomIndex !== null ? 'Edit Custom Input' : 'Add Custom Test Input'}</DialogTitle>
        <DialogContent>
          <Box sx={{ component: 'textarea', width: '100%', minHeight: 120, p: 2, mt: 1, border: '1px solid #e2e8f0', borderRadius: '12px', fontFamily: "'JetBrains Mono'", fontSize: '0.9rem', outline: 'none', '&:focus': { borderColor: '#6366f1' } }} 
               contentEditable onChange={(e) => setCustomInput(e.target.value)} value={customInput}>
            <textarea 
              rows={5} 
              style={{ width: '100%', border: 'none', outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontSize: 'inherit' }} 
              placeholder="Paste your test input here..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowAddCustomInput(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleAddCustomTestCase} variant="contained" sx={{ borderRadius: '10px', px: 4, fontWeight: 700, bgcolor: '#6366f1' }}>{editingCustomIndex !== null ? 'Update' : 'Add Case'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
