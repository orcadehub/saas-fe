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
  Tab,
  Skeleton,
  Avatar,
  useTheme
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

const CodeBlock = ({ code, language, title }) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const codeString = code && typeof code === 'string' ? code : String(code || '');
  
  if (!codeString.trim()) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontStyle: 'italic' }}>
          No source code available
        </Typography>
      </Box>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic "pretty" formatting for indentation
  let formattedCode = codeString.trim();
  try {
    if (formattedCode.startsWith('{') || formattedCode.startsWith('[')) {
      formattedCode = JSON.stringify(JSON.parse(formattedCode), null, 2);
    }
  } catch (e) {}

  return (
    <Box sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #0f172a', bgcolor: '#0f172a', mt: 1.5, position: 'relative' }}>
      <Box sx={{ bgcolor: '#1e293b', px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff5f56' }} />
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#27c93f' }} />
          </Box>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            {title || 'Source Code'}
          </Typography>
        </Box>
        <Button 
          onClick={handleCopy}
          size="small"
          sx={{ 
            color: copied ? '#10b981' : '#94a3b8', 
            minWidth: 'auto', 
            px: 1, 
            textTransform: 'none',
            fontSize: '0.65rem',
            fontWeight: 800,
            '&:hover': { color: '#e2e8f0' }
          }}
        >
          {copied ? 'COPIED!' : 'COPY'}
        </Button>
      </Box>
      <Box sx={{ 
        p: 3, 
        maxHeight: '400px',
        overflow: 'auto',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.85rem',
        lineHeight: 1.7,
        color: '#e2e8f0',
        whiteSpace: 'pre',
        '&::-webkit-scrollbar': { height: 8, width: 8 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#334155', borderRadius: 4 },
        '&::-webkit-scrollbar-track': { bgcolor: '#0f172a' }
      }}>
        <code>{formattedCode}</code>
      </Box>
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
        const durationLimit = assessmentData.duration || 60;
        const endTime = startTime + (durationLimit * 60 * 1000);
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
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (!canViewResults) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, bgcolor: '#f8fafc' }}>
        <Card sx={{ 
          maxWidth: 550, textAlign: 'center', p: 6, borderRadius: '40px',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
          border: '1px solid #f1f5f9'
        }}>
          <Box sx={{ width: 100, height: 100, bgcolor: '#eef2ff', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 4 }}>
            <Timer sx={{ fontSize: 50, color: '#6366f1' }} />
          </Box>
          <Typography variant="h2" gutterBottom sx={{ fontWeight: 900, color: '#0f172a', fontSize: '2.25rem' }}>Results Pending</Typography>
          <Typography variant="body1" sx={{ color: '#64748b', mb: 5, fontSize: '1.1rem', fontWeight: 500 }}>The assessment results are currently locked and will be automatically released once the timer expires.</Typography>
          <Box sx={{ bgcolor: '#6366f1', color: 'white', borderRadius: '24px', p: 3, mb: 4 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, fontFamily: "'JetBrains Mono', monospace" }}>{formatTime(timeRemaining)}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>Time to Unlock</Typography>
          </Box>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/assessments')} sx={{ fontWeight: 800, color: '#6366f1' }}>Return to Dashboard</Button>
        </Card>
      </Box>
    );
  }

  // Calculate Metrics
  const qCounts = assessment?.questionCounts || {
    programming: assessment?.questions?.length || 0,
    frontend: assessment?.frontendQuestions?.length || 0,
    mongodb: assessment?.mongodbPlaygroundQuestions?.length || 0,
    quiz: assessment?.quizQuestions?.length || 0
  };

  const totalPossible = qCounts.programming + qCounts.frontend + qCounts.mongodb + qCounts.quiz;
  const attemptedCount = (Object.keys(attempt?.successfulCodes || {}).length) + (Object.keys(attempt?.quizAnswers || {}).length);
  const overallScore = attempt?.overallPercentage || 0;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 8 }}>
      <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #f1f5f9', pt: 4, pb: 2, mb: 6 }}>
        <Box sx={{ px: { xs: 3, md: 6 }, maxWidth: 1400, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, cursor: 'pointer' }} onClick={() => navigate('/assessments')}>
              <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowBack sx={{ color: '#6366f1' }} />
              </Box>
              <Box>
                <Typography variant="h2" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '2.25rem' }}>Assessment Analysis</Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>{assessment?.title || 'Assessment Results'}</Typography>
              </Box>
            </Box>
            
            {(qCounts.programming > 0 || qCounts.frontend > 0 || qCounts.mongodb > 0) && (
              <Button
                variant="contained"
                onClick={() => {
                  if (assessment.type === 'frontend') navigate(`/assessments/${id}/practice-frontend`);
                  else if (assessment.type === 'mongodb') navigate(`/assessments/${id}/practice-mongodb`);
                  else navigate(`/assessments/${id}/practice`);
                }}
                sx={{ borderRadius: '16px', px: 4, py: 1.5, fontWeight: 800, bgcolor: '#6366f1', textTransform: 'none' }}
              >
                Launch Practice
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 3, md: 6 }, maxWidth: 1400, mx: 'auto' }}>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {/* 1. Achievement */}
          <Grid item xs={12} sm={6} md={3}>
            <MainCard
              border={false}
              content={false}
              sx={{
                bgcolor: overallScore >= 70 ? 'success.dark' : 'warning.dark',
                color: '#fff',
                overflow: 'hidden',
                position: 'relative',
                borderRadius: '32px',
                height: 280,
                display: 'flex',
                alignItems: 'center',
                '&:after': {
                  content: '""', position: 'absolute', width: 210, height: 210,
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '50%', top: -85, right: -95
                },
                '&:before': {
                  content: '""', position: 'absolute', width: 210, height: 210,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%', top: -125, right: -15, opacity: 0.5
                }
              }}
            >
              <Box sx={{ p: 4, width: '100%', position: 'relative', zIndex: 1 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Achievement</Typography>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: '3rem', fontFamily: "'JetBrains Mono', monospace" }}>{overallScore.toFixed(0)}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 800, fontSize: '1.25rem' }}>%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={overallScore} 
                  sx={{ mt: 3, height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#fff' }}} 
                />
              </Box>
            </MainCard>
          </Grid>

          {/* 2. Time Used */}
          <Grid item xs={12} sm={6} md={3}>
            <MainCard
              border={false}
              content={false}
              sx={{
                bgcolor: 'secondary.dark', color: '#fff', overflow: 'hidden', position: 'relative', borderRadius: '32px', height: 280, display: 'flex', alignItems: 'center',
                '&:after': { content: '""', position: 'absolute', width: 210, height: 210, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', top: -85, right: -95 },
                '&:before': { content: '""', position: 'absolute', width: 210, height: 210, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', top: -125, right: -15 }
              }}
            >
              <Box sx={{ p: 4, width: '100%', position: 'relative', zIndex: 1 }}>
                <Avatar variant="rounded" sx={{ bgcolor: 'secondary.800', color: '#fff', mb: 2.5, width: 44, height: 44, borderRadius: '12px' }}>
                  <Timer />
                </Avatar>
                <Typography sx={{ color: 'secondary.200', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time Used</Typography>
                <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: '2rem', mt: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatTime((attempt?.timeUsedSeconds || 0) * 1000)}
                </Typography>
              </Box>
            </MainCard>
          </Grid>

          {/* 3. Accuracy */}
          <Grid item xs={12} sm={6} md={3}>
            <MainCard
              border={false}
              content={false}
              sx={{
                bgcolor: 'primary.dark', color: '#fff', overflow: 'hidden', position: 'relative', borderRadius: '32px', height: 280, display: 'flex', alignItems: 'center',
                '&:after': { content: '""', position: 'absolute', width: 210, height: 210, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', top: -85, right: -95 },
                '&:before': { content: '""', position: 'absolute', width: 210, height: 210, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', top: -125, right: -15 }
              }}
            >
              <Box sx={{ p: 4, width: '100%', position: 'relative', zIndex: 1 }}>
                <Avatar variant="rounded" sx={{ bgcolor: 'primary.800', color: '#fff', mb: 2.5, width: 44, height: 44, borderRadius: '12px' }}>
                  <CheckCircle />
                </Avatar>
                <Typography sx={{ color: 'primary.200', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accuracy</Typography>
                <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: '2rem', mt: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>{attempt?.accuracy || 0}%</Typography>
              </Box>
            </MainCard>
          </Grid>

          {/* 4. Violations */}
          <Grid item xs={12} sm={6} md={3}>
            <MainCard
              border={false}
              content={false}
              sx={{
                bgcolor: 'error.dark', color: '#fff', overflow: 'hidden', position: 'relative', borderRadius: '32px', height: 280, display: 'flex', alignItems: 'center',
                '&:after': { content: '""', position: 'absolute', width: 210, height: 210, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', top: -85, right: -95 },
                '&:before': { content: '""', position: 'absolute', width: 210, height: 210, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', top: -125, right: -15 }
              }}
            >
              <Box sx={{ p: 4, width: '100%', position: 'relative', zIndex: 1 }}>
                <Avatar variant="rounded" sx={{ bgcolor: 'error.main', color: '#fff', mb: 2.5, width: 44, height: 44, borderRadius: '12px' }}>
                  <Cancel />
                </Avatar>
                <Typography sx={{ color: '#ffcdd2', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Violations</Typography>
                <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: '2rem', mt: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>
                  {(attempt?.tabSwitchCount || 0) + (attempt?.fullscreenExitCount || 0)}
                </Typography>
              </Box>
            </MainCard>
          </Grid>

          {/* 5. Progress */}
          <Grid item xs={12} sm={6} md={3}>
            <MainCard
              border={false}
              content={false}
              sx={{
                bgcolor: 'orange.dark', color: '#fff', overflow: 'hidden', position: 'relative', borderRadius: '32px', height: 280, display: 'flex', alignItems: 'center',
                '&:after': { content: '""', position: 'absolute', width: 210, height: 210, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', top: -85, right: -95 },
                '&:before': { content: '""', position: 'absolute', width: 210, height: 210, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', top: -125, right: -15 }
              }}
            >
              <Box sx={{ p: 4, width: '100%', position: 'relative', zIndex: 1 }}>
                <Avatar variant="rounded" sx={{ bgcolor: 'orange.main', color: '#fff', mb: 2.5, width: 44, height: 44, borderRadius: '12px' }}>
                  <Code />
                </Avatar>
                <Typography sx={{ color: '#ffe0b2', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress</Typography>
                <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: '2rem', mt: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>{attemptedCount}/{totalPossible}</Typography>
              </Box>
            </MainCard>
          </Grid>

          {/* 6. Sectional Efficiency */}
          <Grid item xs={12} sm={6} md={3}>
            <MainCard
              border={false}
              content={false}
              sx={{
                bgcolor: '#1e293b', color: '#fff', overflow: 'hidden', position: 'relative', borderRadius: '32px', height: 280, display: 'flex', alignItems: 'center',
                '&:after': { content: '""', position: 'absolute', width: 210, height: 210, background: 'rgba(99,102,241,0.1)', borderRadius: '50%', top: -85, right: -95 }
              }}
            >
              <Box sx={{ p: 3.5, width: '100%', position: 'relative', zIndex: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Section Efficiency</Typography>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {qCounts.quiz > 0 && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ color: '#f8fafc', fontWeight: 700 }}>Quiz</Typography>
                        <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 900 }}>{(attempt?.quizPercentage || 0).toFixed(0)}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={attempt?.quizPercentage || 0} sx={{ height: 4, borderRadius: 2, bgcolor: '#334155', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' } }} />
                    </Box>
                  )}
                  {qCounts.programming > 0 && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ color: '#f8fafc', fontWeight: 700 }}>Logic</Typography>
                        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 900 }}>{(attempt?.programmingPercentage || 0).toFixed(0)}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={attempt?.programmingPercentage || 0} sx={{ height: 4, borderRadius: 2, bgcolor: '#334155', '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }} />
                    </Box>
                  )}
                </Box>
              </Box>
            </MainCard>
          </Grid>
        </Grid>

        <Box sx={{ bgcolor: '#ffffff', borderRadius: '24px', p: 1.5, mb: 4, display: 'flex', gap: 1.5, border: '1px solid #f1f5f9', overflow: 'auto' }}>
          {[
            { label: 'Quiz Section', count: qCounts.quiz, index: 0, show: qCounts.quiz > 0 },
            { label: 'Coding Logic', count: qCounts.programming, index: 1, show: qCounts.programming > 0 },
            { label: 'Frontend Design', count: qCounts.frontend, index: 2, show: qCounts.frontend > 0 },
            { label: 'Database Architect', count: qCounts.mongodb, index: 3, show: qCounts.mongodb > 0 }
          ].filter(t => t.show).map((t) => (
            <Box key={t.index} onClick={() => setTabValue(t.index)} sx={{ 
              flex: 1, px: 3, py: 1.5, borderRadius: '16px', cursor: 'pointer', textAlign: 'center',
              bgcolor: tabValue === t.index ? '#6366f1' : 'transparent',
              color: tabValue === t.index ? '#ffffff' : '#64748b'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{t.label} ({t.count})</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tabValue === 0 && assessment?.quizQuestions?.map((q, i) => {
            const answer = attempt?.quizAnswers?.[q._id];
            const correct = answer?.isCorrect || false;
            return (
              <Card key={q._id} sx={{ borderRadius: '32px', p: 4, border: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: correct ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {correct ? <CheckCircle sx={{ fontSize: 18, color: '#16a34a' }} /> : <Cancel sx={{ fontSize: 18, color: '#dc2626' }} />}
                    </Box>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.25rem' }}>Question {i + 1}</Typography>
                  </Box>
                </Box>
                <Typography sx={{ color: '#334155', fontWeight: 600, fontSize: '1.1rem', mb: 3 }}>{decodeAndFormat(q.title)}</Typography>
                {q.codeSnippet && <CodeBlock code={decodeAndFormat(q.codeSnippet)} title="Question Context" />}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 3 }}>
                  {q.options?.map((opt, idx) => {
                    const selected = answer?.selectedAnswer === idx;
                    const isCorrect = q.correctAnswer === idx;
                    let border = '2px solid #f1f5f9';
                    let bg = '#ffffff';
                    if (isCorrect) { border = '2px solid #10b981'; bg = '#f0fdf4'; }
                    else if (selected) { border = '2px solid #ef4444'; bg = '#fef2f2'; }
                    return (
                      <Box key={idx} sx={{ p: 2, borderRadius: '16px', border, bgcolor: bg, display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ width: 24, height: 24, borderRadius: '6px', bgcolor: isCorrect ? '#10b981' : selected ? '#ef4444' : '#f1f5f9', color: isCorrect || selected ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{String.fromCharCode(65+idx)}</Box>
                        <Typography sx={{ fontWeight: 700 }}>{decodeAndFormat(opt.text)}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Card>
            );
          })}

          {tabValue === 1 && assessment?.questions?.map((q, i) => {
            const score = attempt?.questionPercentages?.[q._id] || 0;
            const code = attempt?.successfulCodes?.[q._id];
            return (
              <Card key={q._id} sx={{ borderRadius: '32px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                <Box sx={{ bgcolor: score >= 70 ? '#dcfce7' : '#fef3c7', p: 3, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 900 }}>Question {i + 1}</Typography>
                  <Typography sx={{ fontWeight: 900 }}>{score.toFixed(0)}%</Typography>
                </Box>
                <Box sx={{ p: 4 }}>
                  <Typography sx={{ mb: 3 }}>{q.description}</Typography>
                  <CodeBlock code={code || 'No solution submitted'} />
                </Box>
              </Card>
            );
          })}

          {tabValue === 2 && assessment?.frontendQuestions?.map((q, i) => {
            const fCode = attempt?.lastExecutedFrontendCode?.[q._id];
            return (
              <Card key={q._id} sx={{ borderRadius: '32px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                <Box sx={{ bgcolor: '#e0f2fe', p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <Code sx={{ color: '#0ea5e9' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.25rem' }}>UI Project {i + 1}</Typography>
                    <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 800 }}>{q.title}</Typography>
                  </Box>
                </Box>
                <Box sx={{ p: 4 }}>
                  <Typography sx={{ mb: 3, fontWeight: 600, color: '#475569', lineHeight: 1.7 }}>{q.problemStatement}</Typography>
                  {fCode ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {['html', 'css', 'js'].filter(l => fCode[l]).map(l => (
                        <Accordion key={l} sx={{ border: '1px solid #f1f5f9', borderRadius: '16px !important', boxShadow: 'none', '&:before': { display: 'none' } }}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography sx={{ fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', fontSize: '0.75rem' }}>{l} source</Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 0 }}>
                            <CodeBlock code={fCode[l]} title={`${l.toUpperCase()} Implementation`} />
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  ) : <CodeBlock code="No solution submitted" />}
                </Box>
              </Card>
            );
          })}

          {tabValue === 3 && assessment?.mongodbPlaygroundQuestions?.map((q, i) => {
            const dbCode = attempt?.successfulCodes?.[q._id];
            return (
              <Card key={q._id} sx={{ borderRadius: '32px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                <Box sx={{ bgcolor: '#fdf2f8', p: 3 }}><Typography sx={{ fontWeight: 900 }}>Database Query {i + 1}</Typography></Box>
                <Box sx={{ p: 4 }}>
                  <Typography sx={{ mb: 3 }}>{q.description}</Typography>
                  <CodeBlock code={typeof dbCode === 'string' ? dbCode : JSON.stringify(dbCode, null, 2)} />
                </Box>
              </Card>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
