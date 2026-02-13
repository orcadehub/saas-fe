import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  CircularProgress,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';
import { 
  ArrowBack, 
  ExpandMore, 
  CheckCircle, 
  Cancel, 
  Code,
  Timer
} from '@mui/icons-material';
import apiService from 'services/apiService';
import MainCard from 'ui-component/cards/MainCard';

const CodeBlock = ({ code, language }) => {
  const codeString = code && typeof code === 'string' ? code : String(code || '');
  
  if (!codeString.trim()) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        No code available
      </Typography>
    );
  }
  
  return (
    <Box sx={{ 
      bgcolor: '#1e1e1e', 
      color: '#d4d4d4',
      p: 2, 
      borderRadius: 1, 
      overflow: 'auto',
      fontFamily: 'monospace',
      fontSize: '14px',
      whiteSpace: 'pre',
      '& *': { fontFamily: 'monospace' }
    }}>
      {codeString}
    </Box>
  );
};

export default function AssessmentResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canViewResults, setCanViewResults] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const decodeAndFormat = (text) => {
    if (!text) return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const [assessmentData, attemptData] = await Promise.all([
          apiService.getAssessmentDetails(token, id),
          apiService.getAssessmentAttempt(token, id)
        ]);
        
        setAssessment(assessmentData);
        setAttempt(attemptData);
        
        const startTime = new Date(assessmentData.startTime).getTime();
        const endTime = startTime + (assessmentData.duration * 60 * 1000);
        const now = new Date().getTime();
        
        if (now >= endTime) {
          setCanViewResults(true);
        } else {
          setTimeRemaining(endTime - now);
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
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            setCanViewResults(true);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getLanguageFromCode = (code) => {
    if (!code || typeof code !== 'string') return 'text';
    if (code.includes('def ') || code.includes('import ')) return 'python';
    if (code.includes('function ') || code.includes('const ') || code.includes('let ')) return 'javascript';
    if (code.includes('public class') || code.includes('System.out')) return 'java';
    if (code.includes('#include') || code.includes('cout')) return 'cpp';
    return 'text';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Loading Results...</Typography>
        </Box>
      </Box>
    );
  }

  if (!canViewResults) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Card sx={{ maxWidth: 500, textAlign: 'center', p: 4, boxShadow: 3 }}>
          <Timer sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Results Locked
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Assessment results will be available after the assessment time expires.
          </Typography>
          <Box sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 2, p: 2, mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {formatTime(timeRemaining)}
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/assessments')}>
            Back to Assessments
          </Button>
        </Card>
      </Box>
    );
  }

  const attemptedQuestions = Object.keys(attempt?.successfulCodes || {}).length;
  const totalQuestions = assessment?.questions?.length || 0;
  const totalQuizQuestions = assessment?.quizQuestions?.length || 0;
  const overallScore = attempt?.overallPercentage || 0;
  const quizScore = attempt?.quizPercentage || 0;
  const programmingScore = attempt?.programmingPercentage || 0;

  const metricCardStyle = {
    minWidth: 200,
    height: 100,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
    }
  };

  return (
    <MainCard>
      <Box sx={{ px: 4, mb: 4, maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => navigate('/assessments')}>
            <ArrowBack />
            <Typography variant="h4" fontWeight={600}>
              {assessment?.title}
            </Typography>
          </Box>
          {totalQuestions > 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/assessments/${id}/practice`)}
            >
              Practice
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ px: 4, maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Card sx={metricCardStyle}>
            <Chip 
              label={attempt?.attemptStatus || 'N/A'} 
              color={attempt?.attemptStatus === 'COMPLETED' ? 'success' : 
                     attempt?.attemptStatus === 'RESUME_ALLOWED' ? 'warning' : 
                     attempt?.attemptStatus === 'RETAKE_ALLOWED' ? 'info' : 'default'}
              size="small"
              sx={{ mb: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Status
            </Typography>
          </Card>
          
          <Card sx={metricCardStyle}>
            <Typography variant="h2" fontWeight={700} color={overallScore >= 70 ? 'success.main' : 'error.main'}>
              {overallScore.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Overall
            </Typography>
          </Card>
          
          <Card sx={metricCardStyle}>
            <Typography variant="h2" fontWeight={700}>
              {(() => {
                const totalSeconds = attempt?.timeUsedSeconds || 0;
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
              })()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Time
            </Typography>
          </Card>
          
          <Card sx={metricCardStyle}>
            <Typography variant="h2" fontWeight={700} color="success.main">
              {attempt?.accuracy || 0}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Accuracy
            </Typography>
          </Card>
          
          <Card sx={metricCardStyle}>
            <Typography variant="h2" fontWeight={700} color="#ff9800">
              {attempt?.tabSwitchCount || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Tab Switch
            </Typography>
          </Card>
          
          <Card sx={metricCardStyle}>
            <Typography variant="h2" fontWeight={700} color="primary.main">
              {totalQuestions + totalQuizQuestions}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Total
            </Typography>
          </Card>
          
          <Card sx={metricCardStyle}>
            <Typography variant="h2" fontWeight={700} color="info.main">
              {attemptedQuestions + Object.keys(attempt?.quizAnswers || {}).length}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Attempted
            </Typography>
          </Card>
          
          <Card sx={metricCardStyle}>
            <Typography variant="h2" fontWeight={700} color="#e91e63">
              {attempt?.fullscreenExitCount || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              FS Exits
            </Typography>
          </Card>
          
          {totalQuizQuestions > 0 && (
            <>
              <Card sx={metricCardStyle}>
                <Typography variant="h2" fontWeight={700} color="secondary.main">
                  {quizScore.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  Quiz
                </Typography>
              </Card>
              
              <Card sx={metricCardStyle}>
                <Typography variant="h2" fontWeight={700} color="primary.main">
                  {programmingScore.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  Programming
                </Typography>
              </Card>
            </>
          )}
        </Box>

        {totalQuizQuestions > 0 && totalQuestions > 0 && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label={`Quiz Results (${totalQuizQuestions})`} />
              <Tab label={`Programming Results (${totalQuestions})`} />
            </Tabs>
          </Box>
        )}

        {totalQuizQuestions > 0 && (tabValue === 0 || totalQuestions === 0) && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
            {assessment?.quizQuestions?.map((question, index) => {
              const questionId = question._id;
              const quizAnswer = attempt?.quizAnswers?.[questionId];
              const isCorrect = quizAnswer?.isCorrect || false;
              const selectedAnswer = quizAnswer?.selectedAnswer;
              
              return (
                <Card key={questionId} sx={{ width: '100%', borderRadius: 3, border: `2px solid ${isCorrect ? '#4caf50' : '#f44336'}` }}>
                    <Box sx={{ bgcolor: isCorrect ? 'success.main' : 'error.main', color: 'white', p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            Quiz Question {index + 1}
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9, whiteSpace: 'pre-wrap' }}>
                            {decodeAndFormat(question.title)}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {isCorrect ? '100%' : '0%'}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ p: 3 }}>
                      {question.codeSnippet && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Code Snippet:
                          </Typography>
                          <pre style={{ margin: 0, fontSize: '14px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                            {decodeAndFormat(question.codeSnippet)}
                          </pre>
                        </Box>
                      )}
                      
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Options:
                      </Typography>
                      
                      {question.options?.map((option, optionIndex) => {
                        const isSelected = selectedAnswer === optionIndex;
                        const isCorrectOption = question.correctAnswer === optionIndex;
                        
                        return (
                          <Box 
                            key={optionIndex}
                            sx={{ 
                              p: 2, 
                              mb: 1, 
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: isCorrectOption ? 'success.main' : 
                                         isSelected && !isCorrectOption ? 'error.main' : 'grey.300',
                              bgcolor: isCorrectOption ? 'success.light' : 
                                      isSelected && !isCorrectOption ? 'error.light' : 'transparent'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {String.fromCharCode(65 + optionIndex)}.
                              </Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {decodeAndFormat(option.text)}
                              </Typography>
                              {isSelected && (
                                <Chip 
                                  label="Your Answer" 
                                  size="small" 
                                  color={isCorrectOption ? 'success' : 'error'}
                                  sx={{ ml: 'auto' }}
                                />
                              )}
                              {isCorrectOption && (
                                <Chip 
                                  label="Correct" 
                                  size="small" 
                                  color="success"
                                  sx={{ ml: isSelected ? 1 : 'auto' }}
                                />
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                      
                      {selectedAnswer === undefined && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'text.secondary', bgcolor: 'grey.50', p: 3, borderRadius: 1, mt: 2 }}>
                          <Cancel sx={{ fontSize: 24 }} />
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            No answer selected for this question
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}

          {totalQuestions > 0 && (tabValue === 1 || totalQuizQuestions === 0) && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {assessment?.questions?.map((question, index) => {
              const questionId = question._id;
              const percentage = attempt?.questionPercentages?.[questionId] || 0;
              const submittedCodeObj = attempt?.successfulCodes?.[questionId];
              const lastCodeObj = attempt?.lastExecutedCode?.[questionId];
              
              let submittedCode = null;
              let lastCode = null;
              
              if (submittedCodeObj) {
                if (typeof submittedCodeObj === 'string') {
                  submittedCode = submittedCodeObj;
                } else if (typeof submittedCodeObj === 'object') {
                  submittedCode = Object.values(submittedCodeObj).find(val => typeof val === 'string' && val.trim());
                }
              }
              
              if (lastCodeObj) {
                if (typeof lastCodeObj === 'string') {
                  lastCode = lastCodeObj;
                } else if (typeof lastCodeObj === 'object') {
                  lastCode = Object.values(lastCodeObj).find(val => typeof val === 'string' && val.trim());
                }
              }
              
              return (
                <Card key={questionId} sx={{ width: '100%', borderRadius: 3, border: `2px solid ${percentage >= 70 ? '#4caf50' : percentage > 0 ? '#ff9800' : '#f44336'}` }}>
                    <Box sx={{ bgcolor: percentage >= 70 ? 'success.main' : percentage > 0 ? 'warning.main' : 'error.main', color: 'white', p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            Question {index + 1}
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {question.title}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {percentage.toFixed(1)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={percentage} 
                            sx={{ 
                              width: 100, 
                              height: 6,
                              backgroundColor: 'rgba(255,255,255,0.3)',
                              '& .MuiLinearProgress-bar': { backgroundColor: 'white' }
                            }} 
                          />
                        </Box>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {question.description}
                      </Typography>

                      {submittedCode && typeof submittedCode === 'string' && submittedCode.trim() && (
                        <Accordion sx={{ mb: 2 }}>
                          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Submitted Solution
                              </Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 0 }}>
                            <CodeBlock code={submittedCode} language={getLanguageFromCode(submittedCode)} />
                          </AccordionDetails>
                        </Accordion>
                      )}

                      {lastCode && typeof lastCode === 'string' && lastCode.trim() && lastCode !== submittedCode && (
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Code sx={{ color: 'info.main', fontSize: 20 }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Last Executed Code
                              </Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 0 }}>
                            <CodeBlock code={lastCode} language={getLanguageFromCode(lastCode)} />
                          </AccordionDetails>
                        </Accordion>
                      )}

                      {(!submittedCode || typeof submittedCode !== 'string' || !submittedCode.trim()) && 
                       (!lastCode || typeof lastCode !== 'string' || !lastCode.trim()) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'text.secondary', bgcolor: 'grey.50', p: 3, borderRadius: 1 }}>
                          <Cancel sx={{ fontSize: 24 }} />
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            No code submitted for this question
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
      </Box>
    </MainCard>
  );
}
