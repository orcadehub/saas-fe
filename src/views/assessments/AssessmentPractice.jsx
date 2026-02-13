import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Select, MenuItem, FormControl, InputLabel, Tabs, Tab } from '@mui/material';
import { ArrowBack, PlayArrow } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { submitCode } from 'services/pistonService';
import apiService from 'services/apiService';

export default function AssessmentPractice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [language, setLanguage] = useState('');
  const [code, setCode] = useState('');
  const editorRef = useRef(null);
  const [compilerSplit, setCompilerSplit] = useState(60);
  const [isCompilerDragging, setIsCompilerDragging] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testCaseResults, setTestCaseResults] = useState({});
  const [currentTestCaseTab, setCurrentTestCaseTab] = useState(0);

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

  useEffect(() => {
    if (questions[currentQuestionIndex]?._id && language) {
      const storageKey = `practice_${id}_question_${questions[currentQuestionIndex]._id}_${language}`;
      const savedCode = sessionStorage.getItem(storageKey);
      setCode(savedCode || getLanguageTemplate(language));
    }
  }, [currentQuestionIndex, language, questions, id]);

  useEffect(() => {
    if (questions[currentQuestionIndex]?._id && language && code) {
      const storageKey = `practice_${id}_question_${questions[currentQuestionIndex]._id}_${language}`;
      sessionStorage.setItem(storageKey, code);
    }
  }, [code, currentQuestionIndex, language, questions, id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const [assessmentData, questionsData] = await Promise.all([
          apiService.getAssessmentDetails(token, id),
          apiService.getAssessmentQuestions(token, id)
        ]);
        
        setAssessment(assessmentData);
        const programmingQuestions = (questionsData.programmingQuestions || []).map(q => ({ ...q, type: 'programming' }));
        setQuestions(programmingQuestions);
        
        if (programmingQuestions.length > 0) {
          setLanguage(assessmentData.allowedLanguages?.[0] || 'python');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  const handleRunCode = async () => {
    if (!code.trim() || !language) return;
    
    setIsRunning(true);
    setTestCaseResults({});
    
    const allTestCases = questions[currentQuestionIndex]?.testCases || [];
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
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(`/assessments/${id}/results`)}>
            Back
          </Button>
          <Typography variant="h5" fontWeight={600}>
            {assessment?.title} - Practice Mode
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: '50% 4px 50%', flexGrow: 1, height: '100%', overflow: 'hidden' }}>
        <Box sx={{ overflow: 'auto', height: '100%', bgcolor: '#ffffff', '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#888', borderRadius: '4px' } }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', gap: 1, overflow: 'auto' }}>
              {questions.map((q, idx) => (
                <Button
                  key={q._id}
                  variant={idx === currentQuestionIndex ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  sx={{ minWidth: '48px', height: '48px', fontSize: '1.1rem', fontWeight: 600 }}
                >
                  {idx + 1}
                </Button>
              ))}
            </Box>
          </Box>

          <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              {questions[currentQuestionIndex]?.title || 'Loading...'}
            </Typography>
            
            {questions[currentQuestionIndex]?.tags && questions[currentQuestionIndex].tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
                {questions[currentQuestionIndex].tags.map((tag, idx) => (
                  <Box key={idx} sx={{ px: 2, py: 0.5, bgcolor: 'secondary.light', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{tag}</Typography>
                  </Box>
                ))}
              </Box>
            )}
            
            {questions[currentQuestionIndex]?.description && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Description</Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  {questions[currentQuestionIndex].description}
                </Typography>
              </Box>
            )}
            
            {questions[currentQuestionIndex]?.constraints && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Constraints</Typography>
                <Box component="ul" sx={{ pl: 3, m: 0 }}>
                  {(Array.isArray(questions[currentQuestionIndex].constraints) 
                    ? questions[currentQuestionIndex].constraints 
                    : [questions[currentQuestionIndex].constraints]
                  ).map((constraint, idx) => (
                    <Typography key={idx} component="li" variant="body1" sx={{ mb: 1 }}>
                      {constraint}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
            
            {questions[currentQuestionIndex]?.example && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Example</Typography>
                <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                  {questions[currentQuestionIndex].example.input && (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                      <strong>Input:</strong> {questions[currentQuestionIndex].example.input}
                    </Typography>
                  )}
                  {questions[currentQuestionIndex].example.output && (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                      <strong>Output:</strong> {questions[currentQuestionIndex].example.output}
                    </Typography>
                  )}
                  {questions[currentQuestionIndex].example.explanation && (
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      <strong>Explanation:</strong> {questions[currentQuestionIndex].example.explanation}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
            
            {questions[currentQuestionIndex]?.intuition?.keyInsights && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Key Insights</Typography>
                <Box component="ul" sx={{ pl: 3, m: 0 }}>
                  {questions[currentQuestionIndex].intuition.keyInsights.map((insight, idx) => (
                    <Typography key={idx} component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                      {insight}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
            
            {questions[currentQuestionIndex]?.intuition?.algorithmSteps && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Algorithm</Typography>
                <Box component="ol" sx={{ pl: 3, m: 0 }}>
                  {questions[currentQuestionIndex].intuition.algorithmSteps.map((step, idx) => (
                    <Typography key={idx} component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.8 }}>
                      {step}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
            
            {(questions[currentQuestionIndex]?.intuition?.timeComplexity || questions[currentQuestionIndex]?.intuition?.spaceComplexity) && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Complexity</Typography>
                <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                  {questions[currentQuestionIndex].intuition.timeComplexity && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Time Complexity:</strong> {questions[currentQuestionIndex].intuition.timeComplexity}
                    </Typography>
                  )}
                  {questions[currentQuestionIndex].intuition.spaceComplexity && (
                    <Typography variant="body1">
                      <strong>Space Complexity:</strong> {questions[currentQuestionIndex].intuition.spaceComplexity}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ bgcolor: '#6a0dad', cursor: 'col-resize' }} />

        <Box sx={{ bgcolor: '#ffffff', overflow: 'auto', height: '100%' }} data-compiler-container>
          <Box sx={{ height: `${compilerSplit}%`, display: 'flex', flexDirection: 'column', borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
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
              
              <Button
                variant="outlined"
                startIcon={isRunning ? <CircularProgress size={16} /> : <PlayArrow />}
                onClick={handleRunCode}
                disabled={!code.trim() || isRunning}
              >
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
            </Box>
            
            <Box sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Box sx={{ flexGrow: 1, minHeight: 0, border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                <Editor
                  height="100%"
                  language={getMonacoLanguage(language)}
                  value={code}
                  theme="vs-dark"
                  onChange={(value) => setCode(value || '')}
                  onMount={(editor) => { editorRef.current = editor; }}
                  options={{ fontSize: 18, minimap: { enabled: false } }}
                />
              </Box>
            </Box>
          </Box>
          
          <Box
            sx={{ height: '4px', cursor: 'row-resize', bgcolor: 'secondary.main' }}
            onMouseDown={() => setIsCompilerDragging(true)}
          />
          
          <Box sx={{ height: `${100 - compilerSplit}%`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ borderBottom: '1px solid #e0e0e0' }}>
              <Tabs value={currentTestCaseTab} onChange={(e, newValue) => setCurrentTestCaseTab(newValue)} variant="scrollable" scrollButtons="auto">
                {(questions[currentQuestionIndex]?.testCases || []).map((tc, index) => {
                  const result = testCaseResults[index];
                  const isPassed = result && !result.loading && !result.error && 
                    result.output?.trim() === (tc.expectedOutput || tc.output)?.toString().trim();
                  const isFailed = result && !result.loading && (result.error || 
                    result.output?.trim() !== (tc.expectedOutput || tc.output)?.toString().trim());
                  
                  return (
                    <Tab 
                      key={index} 
                      label={`TC ${index + 1} (${tc.isPublic ? 'Pub' : 'Pvt'})`}
                      sx={{
                        bgcolor: isPassed ? '#e8f5e9' : isFailed ? '#ffebee' : 'transparent',
                        '&.Mui-selected': { bgcolor: isPassed ? '#c8e6c9' : isFailed ? '#ffcdd2' : 'transparent' }
                      }}
                    />
                  );
                })}
              </Tabs>
            </Box>
            
            <Box sx={{ p: 4, flexGrow: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#888', borderRadius: '4px' } }}>
              {(() => {
                const allTestCases = questions[currentQuestionIndex]?.testCases || [];
                const testCase = allTestCases[currentTestCaseTab];
                
                if (!testCase) return <Typography>No test cases available</Typography>;
                
                return (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Input</Typography>
                      <Box sx={{ bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', p: 2.5, borderRadius: 2, fontFamily: 'monospace' }}>
                        {testCase.input}
                      </Box>
                    </Box>
                    
                    {testCaseResults[currentTestCaseTab] && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Your Output</Typography>
                        <Box sx={{ 
                          bgcolor: '#f5f5f5',
                          border: '2px solid',
                          borderColor: testCaseResults[currentTestCaseTab].error ? 'error.main' : 'success.main',
                          p: 2.5,
                          borderRadius: 2,
                          fontFamily: 'monospace',
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
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Expected Output</Typography>
                      <Box sx={{ bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', p: 2.5, borderRadius: 2, fontFamily: 'monospace' }}>
                        {testCase.expectedOutput || testCase.output}
                      </Box>
                    </Box>
                    
                    {testCase.explanation && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Explanation</Typography>
                        <Box sx={{ bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', p: 2.5, borderRadius: 2, lineHeight: 1.6 }}>
                          {testCase.explanation}
                        </Box>
                      </Box>
                    )}
                  </>
                );
              })()}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
