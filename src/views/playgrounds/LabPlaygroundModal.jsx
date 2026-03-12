import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Typography, Button, IconButton, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, CircularProgress, Chip, Card, CardContent } from '@mui/material';
import { Close, PlayArrow, Add, Remove, CheckCircle } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { submitCode } from 'services/pistonService';

const getMonacoLanguage = (technology) => {
  const langMap = {
    'C': 'c',
    'C++': 'cpp',
    'Java': 'java',
    'Python': 'python',
    'JavaScript': 'javascript',
    'React': 'javascript'
  };
  return langMap[technology] || 'plaintext';
};

const getLanguageId = (technology) => {
  const langMap = {
    'C': 50,
    'C++': 54,
    'Java': 62,
    'Python': 71,
    'JavaScript': 63,
    'React': 63
  };
  return langMap[technology] || 71;
};

export default function LabPlaygroundModal({ open, lab, onClose }) {
  const [code, setCode] = useState('');
  const [fontSize, setFontSize] = useState(18);
  const [isRunning, setIsRunning] = useState(false);
  const [testCaseResults, setTestCaseResults] = useState({});
  const [compilerSplit, setCompilerSplit] = useState(60);
  const [isCompilerDragging, setIsCompilerDragging] = useState(false);
  const [currentTestCaseTab, setCurrentTestCaseTab] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResults, setSubmitResults] = useState([]);
  const editorRef = useRef(null);

  useEffect(() => {
    if (lab) {
      const storageKey = `lab_${lab._id}`;
      const savedCode = localStorage.getItem(storageKey);
      setCode(savedCode || lab.initialFiles?.[0]?.content || '');
    }
  }, [lab]);

  useEffect(() => {
    if (lab && code) {
      const storageKey = `lab_${lab._id}`;
      localStorage.setItem(storageKey, code);
    }
  }, [code, lab]);

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
    if (!code.trim()) return;
    
    setIsRunning(true);
    setTestCaseResults({});
    
    const languageId = getLanguageId(lab.technology);
    setTestCaseResults({ 0: { loading: true } });
    
    try {
      const result = await submitCode(code, languageId, '');
      
      if (result.status.id === 3) {
        const userOutput = result.stdout ? result.stdout.trim() : '';
        setTestCaseResults({ 0: { loading: false, output: userOutput, error: null } });
      } else {
        let errorOutput = result.stderr || 'Execution Error';
        if (errorOutput.includes('fatal signal')) {
          errorOutput = 'Error: Program exceeded time/memory limits';
        }
        setTestCaseResults({ 0: { loading: false, output: null, error: errorOutput } });
      }
    } catch (error) {
      setTestCaseResults({ 0: { loading: false, output: null, error: error.message } });
    }
    
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    
    const allTestCases = lab.testCases || [];
    
    const initialResults = allTestCases.map((tc, i) => ({
      index: i + 1,
      type: tc.isPublic ? 'Public' : 'Private',
      status: 'Pending',
      passed: null
    }));
    
    setSubmitResults(initialResults);
    setShowSubmitModal(true);
    setIsSubmitting(true);
    
    const languageId = getLanguageId(lab.technology);
    const results = [...initialResults];
    
    for (let i = 0; i < allTestCases.length; i++) {
      const testCase = allTestCases[i];
      
      results[i] = { ...results[i], status: 'Running' };
      setSubmitResults([...results]);
      
      try {
        const result = await submitCode(code, languageId, testCase.input || '');
        
        if (result.status.id === 3) {
          const userOutput = result.stdout ? result.stdout.trim() : '';
          const expectedOutput = testCase.expectedOutput?.toString().trim();
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

  if (!lab) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth sx={{ '& .MuiDialog-paper': { height: '90vh' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {lab.title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '50% 4px 50%', flexGrow: 1, height: '100%', overflow: 'hidden' }}>
            {/* Problem Statement */}
            <Box sx={{ overflow: 'auto', height: '100%', bgcolor: '#ffffff', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
              <Box sx={{ p: 3, maxWidth: '900px', mx: 'auto' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  {lab.title}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Chip label={lab.difficulty} size="small" color={lab.difficulty === 'Easy' ? 'success' : lab.difficulty === 'Medium' ? 'warning' : 'error'} />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Description</Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                    {lab.description}
                  </Typography>
                </Box>

                {lab.srs?.objectives && lab.srs.objectives.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Objectives</Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {lab.srs.objectives.map((obj, idx) => (
                        <Typography key={idx} component="li" variant="body2" sx={{ mb: 0.5 }}>
                          {obj}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}

                {lab.srs?.requirements && lab.srs.requirements.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Requirements</Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {lab.srs.requirements.map((req, idx) => (
                        <Typography key={idx} component="li" variant="body2" sx={{ mb: 0.5 }}>
                          {req}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}

                {lab.srs?.constraints && lab.srs.constraints.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Constraints</Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {lab.srs.constraints.map((constraint, idx) => (
                        <Typography key={idx} component="li" variant="body2" sx={{ mb: 0.5 }}>
                          {constraint}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}

                {lab.testCases && lab.testCases.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Test Cases</Typography>
                    {lab.testCases.map((tc, idx) => (
                      <Box key={idx} sx={{ p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1, mb: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                          <strong>Input:</strong> {tc.input || 'None'}
                        </Typography>
                        {tc.isPublic && (
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            <strong>Output:</strong> {tc.expectedOutput}
                          </Typography>
                        )}
                      </Box>
                    ))}
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
                    <Select value={lab.technology} label="Language" disabled>
                      <MenuItem value={lab.technology}>{lab.technology}</MenuItem>
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

                  <Button variant="outlined" startIcon={isRunning ? <CircularProgress size={16} /> : <PlayArrow />} onClick={handleRunCode} disabled={!code.trim() || isRunning} size="small">
                    {isRunning ? 'Running...' : 'Run'}
                  </Button>
                  <Button variant="contained" onClick={handleSubmit} disabled={!code.trim() || isSubmitting} size="small">
                    Submit
                  </Button>
                </Box>

                <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                  <Box sx={{ flexGrow: 1, minHeight: 0, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                    <Editor
                      height="100%"
                      language={getMonacoLanguage(lab.technology)}
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
                </Box>
              </Box>

              <Box sx={{ height: '4px', cursor: 'row-resize', bgcolor: '#6a0dad', '&:hover': { bgcolor: '#5a0d9d' } }} onMouseDown={() => setIsCompilerDragging(true)} />

              <Box sx={{ height: `${100 - compilerSplit}%`, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Box sx={{ borderBottom: '1px solid #e0e0e0' }}>
                  <Tabs value={currentTestCaseTab} onChange={(e, newValue) => setCurrentTestCaseTab(newValue)} variant="scrollable" scrollButtons="auto">
                    <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Output{testCaseResults[0]?.loading && <CircularProgress size={16} />}</Box>} sx={{ bgcolor: testCaseResults[0]?.error ? '#ffebee' : testCaseResults[0]?.output ? '#e8f5e9' : 'transparent' }} />
                  </Tabs>
                </Box>

                <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
                  {testCaseResults[0] && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Output</Typography>
                      <Box sx={{ bgcolor: '#f5f5f5', border: '2px solid', borderColor: testCaseResults[0].error ? 'error.main' : 'success.main', p: 2, borderRadius: 1, fontFamily: 'monospace', whiteSpace: 'pre', minHeight: '60px', display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                        {testCaseResults[0].loading ? <CircularProgress size={24} /> : testCaseResults[0].error || testCaseResults[0].output || 'No output'}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Submit Results Modal */}
      <Dialog open={showSubmitModal} maxWidth="sm" fullWidth>
        <DialogTitle>Test Case Results</DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            {isSubmitting ? 'Executing test cases...' : 'All test cases executed'}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {submitResults.map((result) => (
              <Card key={result.index} sx={{ border: '1px solid', borderColor: result.passed === true ? 'success.main' : result.passed === false ? 'error.main' : '#e0e0e0' }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Test Case {result.index}</Typography>
                      <Chip label={result.type} size="small" sx={{ mt: 0.5 }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {result.passed === true && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}><CheckCircle sx={{ fontSize: 20 }} /><Typography variant="body2" sx={{ fontWeight: 600 }}>PASSED</Typography></Box>}
                      {result.passed === false && <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>FAILED</Typography>}
                      {result.passed === null && result.status === 'Running' && <CircularProgress size={20} />}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
