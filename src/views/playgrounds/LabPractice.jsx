import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent } from '@mui/material';
import { ArrowBack, PlayArrow, Add, Remove, CheckCircle, Close } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { submitCode } from 'services/pistonService';

const labQuestions = {
  'c-programming': [
    { 
      id: 1, 
      title: 'Hello World Program', 
      difficulty: 'Easy', 
      description: 'Write a C program to print "Hello, World!" to the console.',
      constraints: ['Use printf() function', 'Include stdio.h header', 'Return 0 from main'],
      example: {
        input: 'No input required',
        output: 'Hello, World!',
        explanation: 'The program should print the exact string "Hello, World!" followed by a newline.'
      },
      intuition: {
        keyInsights: [
          'This is the most basic C program',
          'printf() is used for output in C',
          'Every C program starts execution from main()'
        ],
        algorithmSteps: [
          'Include the standard input/output library',
          'Define the main function',
          'Use printf to output the string',
          'Return 0 to indicate successful execution'
        ],
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)'
      },
      defaultCode: '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    printf("Hello, World!\\n");\n    return 0;\n}',
      testCases: [
        { input: '', output: 'Hello, World!', isPublic: true }
      ]
    }
  ],
  'cpp-programming': [
    { 
      id: 1, 
      title: 'Hello World with Namespace', 
      difficulty: 'Easy', 
      description: 'Write a C++ program to print "Hello, World!" using namespace std.',
      constraints: ['Use cout for output', 'Include iostream header', 'Use namespace std'],
      example: {
        input: 'No input required',
        output: 'Hello, World!',
        explanation: 'The program should print "Hello, World!" using C++ iostream.'
      },
      intuition: {
        keyInsights: [
          'C++ uses cout for console output',
          'namespace std contains standard library functions',
          'endl adds a newline and flushes the buffer'
        ],
        algorithmSteps: [
          'Include iostream library',
          'Use namespace std',
          'Define main function',
          'Use cout to output the string'
        ],
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)'
      },
      defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
      testCases: [
        { input: '', output: 'Hello, World!', isPublic: true }
      ]
    }
  ],
  'java-programming': [
    { 
      id: 1, 
      title: 'Hello World Application', 
      difficulty: 'Easy', 
      description: 'Write a Java program to print "Hello, World!" to the console.',
      constraints: ['Use System.out.println()', 'Define a public class Main', 'Include main method'],
      example: {
        input: 'No input required',
        output: 'Hello, World!',
        explanation: 'The program should print "Hello, World!" using Java System.out.'
      },
      intuition: {
        keyInsights: [
          'Java programs must have a main method',
          'System.out.println() prints to console',
          'Every Java program needs a class definition'
        ],
        algorithmSteps: [
          'Define public class Main',
          'Define public static void main method',
          'Use System.out.println to output string'
        ],
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)'
      },
      defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n        System.out.println("Hello, World!");\n    }\n}',
      testCases: [
        { input: '', output: 'Hello, World!', isPublic: true }
      ]
    }
  ],
  'python-programming': [
    { 
      id: 1, 
      title: 'Hello World Script', 
      difficulty: 'Easy', 
      description: 'Write a Python program to print "Hello, World!" to the console.',
      constraints: ['Use print() function', 'No imports required', 'Single line solution possible'],
      example: {
        input: 'No input required',
        output: 'Hello, World!',
        explanation: 'The program should print "Hello, World!" using Python print function.'
      },
      intuition: {
        keyInsights: [
          'Python uses print() for console output',
          'No semicolons or braces needed',
          'Most concise Hello World implementation'
        ],
        algorithmSteps: [
          'Use print function with string argument'
        ],
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)'
      },
      defaultCode: '# Write your code here\nprint("Hello, World!")',
      testCases: [
        { input: '', output: 'Hello, World!', isPublic: true }
      ]
    }
  ]
};

const getMonacoLanguage = (labId) => {
  switch (labId) {
    case 'c-programming': return 'c';
    case 'cpp-programming': return 'cpp';
    case 'java-programming': return 'java';
    case 'python-programming': return 'python';
    default: return 'plaintext';
  }
};

const getLanguageId = (labId) => {
  switch (labId) {
    case 'c-programming': return 50;
    case 'cpp-programming': return 54;
    case 'java-programming': return 62;
    case 'python-programming': return 71;
    default: return 71;
  }
};

export default function LabPractice() {
  const { labId, questionId } = useParams();
  const navigate = useNavigate();
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

  const questions = labQuestions[labId] || [];
  const currentQuestion = questions.find(q => q.id === parseInt(questionId));

  useEffect(() => {
    if (currentQuestion) {
      const storageKey = `lab_${labId}_${questionId}`;
      const savedCode = localStorage.getItem(storageKey);
      setCode(savedCode || currentQuestion.defaultCode || '');
    }
  }, [questionId, labId, currentQuestion]);

  useEffect(() => {
    if (labId && questionId && code) {
      const storageKey = `lab_${labId}_${questionId}`;
      localStorage.setItem(storageKey, code);
    }
  }, [code, labId, questionId]);

  const handleRunCode = async () => {
    if (!code.trim()) return;
    
    setIsRunning(true);
    setTestCaseResults({});
    
    const languageId = getLanguageId(labId);
    
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
    
    const allTestCases = currentQuestion?.testCases || [];
    
    const initialResults = allTestCases.map((tc, i) => ({
      index: i + 1,
      type: tc.isPublic ? 'Public' : 'Private',
      status: 'Pending',
      passed: null
    }));
    
    setSubmitResults(initialResults);
    setShowSubmitModal(true);
    setIsSubmitting(true);
    
    const languageId = getLanguageId(labId);
    const results = [...initialResults];
    
    for (let i = 0; i < allTestCases.length; i++) {
      const testCase = allTestCases[i];
      
      results[i] = { ...results[i], status: 'Running' };
      setSubmitResults([...results]);
      
      try {
        const result = await submitCode(code, languageId, testCase.input || '');
        
        if (result.status.id === 3) {
          const userOutput = result.stdout ? result.stdout.trim() : '';
          const expectedOutput = testCase.output?.toString().trim();
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

  if (!currentQuestion) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h5">Question not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#ffffff' }}>
        <IconButton onClick={() => navigate(`/labs/${labId}`)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
          {currentQuestion.title}
        </Typography>
        <Chip label="Practice Mode" color="success" />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '50% 4px 50%', flexGrow: 1, height: '100%', overflow: 'hidden' }}>
        {/* Problem Statement */}
        <Box sx={{ overflow: 'auto', height: '100%', bgcolor: '#ffffff', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
          <Box sx={{ p: 4, maxWidth: '900px', mx: 'auto' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              {currentQuestion.title}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Chip label={currentQuestion.difficulty} size="small" color={currentQuestion.difficulty === 'Easy' ? 'success' : currentQuestion.difficulty === 'Medium' ? 'warning' : 'error'} />
            </Box>

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
                  {currentQuestion.constraints.map((constraint, idx) => (
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
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                    <strong>Input:</strong> {currentQuestion.example.input}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                    <strong>Output:</strong> {currentQuestion.example.output}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    <strong>Explanation:</strong> {currentQuestion.example.explanation}
                  </Typography>
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
                <Select value={labId} label="Language" disabled>
                  <MenuItem value={labId}>
                    {labId === 'c-programming' ? 'C' : labId === 'cpp-programming' ? 'C++' : labId === 'java-programming' ? 'Java' : 'Python'}
                  </MenuItem>
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
            </Box>

            <Box sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
              <Box sx={{ flexGrow: 1, minHeight: 0, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                <Editor
                  height="100%"
                  language={getMonacoLanguage(labId)}
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

            <Box sx={{ p: 4, flexGrow: 1, overflow: 'auto' }}>
              {testCaseResults[0] && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Output</Typography>
                  <Box sx={{ bgcolor: '#f5f5f5', border: '2px solid', borderColor: testCaseResults[0].error ? 'error.main' : 'success.main', p: 2.5, borderRadius: 2, fontFamily: 'monospace', whiteSpace: 'pre', minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                    {testCaseResults[0].loading ? <CircularProgress size={24} /> : testCaseResults[0].error || testCaseResults[0].output || 'No output'}
                  </Box>
                </Box>
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
