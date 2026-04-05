import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Chip, Skeleton, Card } from '@mui/material';
import { ArrowBack, Fullscreen, FullscreenExit, Lock } from '@mui/icons-material';
import tenantConfig from 'config/tenantConfig';
import apiService from 'services/apiService';
import MongoDBPlaygroundEditor from './components/MongoDBPlaygroundEditor';

export default function MongoDBPractice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(40);
  const [timeToUnlock, setTimeToUnlock] = useState(null);
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
      
      const questionsData = await apiService.getAssessmentQuestions(token, id);
      setQuestions(questionsData.mongodbPlaygroundQuestions || []);
    } catch (error) {
      console.error('Error fetching assessment:', error);
    } finally {
      setLoading(false);
    }
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

  // Live countdown timer for expiry guard
  useEffect(() => {
    if (!assessment) return;
    const startTime = new Date(assessment.startTime).getTime();
    const endTime = startTime + (assessment.duration * 60 * 1000);
    const tick = () => {
      const now = Date.now();
      setTimeToUnlock(now >= endTime ? 0 : endTime - now);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [assessment]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#fbfcfe' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(226, 232, 240, 0.8)', bgcolor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}>
          <Skeleton variant="rectangular" height={48} sx={{ borderRadius: '12px' }} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '50% 1px 50%', flexGrow: 1 }}>
          <Box sx={{ p: 4 }}>
            <Skeleton variant="text" height={48} width="60%" sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '16px' }} />
          </Box>
          <Box sx={{ bgcolor: 'rgba(226, 232, 240, 0.8)' }} />
          <Box sx={{ p: 4 }}>
            <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: '16px' }} />
          </Box>
        </Box>
      </Box>
    );
  }

  // Guard: Block practice if assessment is still live
  if (timeToUnlock > 0) {
    const hours = Math.floor(timeToUnlock / (1000 * 60 * 60));
    const minutes = Math.floor((timeToUnlock % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeToUnlock % (1000 * 60)) / 1000);
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, bgcolor: '#f8fafc' }}>
        <Card sx={{ maxWidth: 550, textAlign: 'center', p: 6, borderRadius: '40px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', border: '1px solid #f1f5f9' }}>
          <Box sx={{ width: 100, height: 100, bgcolor: '#fef2f2', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 4 }}>
            <Lock sx={{ fontSize: 50, color: '#ef4444' }} />
          </Box>
          <Typography variant="h2" gutterBottom sx={{ fontWeight: 900, color: '#0f172a', fontSize: '2.25rem' }}>Practice Locked</Typography>
          <Typography variant="body1" sx={{ color: '#64748b', mb: 5, fontSize: '1.1rem', fontWeight: 500 }}>Practice mode will be available after the assessment window expires.</Typography>
          <Box sx={{ bgcolor: '#6366f1', color: 'white', borderRadius: '24px', p: 3, mb: 4 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, fontFamily: "'JetBrains Mono', monospace" }}>{hours > 0 ? `${hours}h ` : ''}{minutes}m {seconds}s</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>Time Until Practice Unlocks</Typography>
          </Box>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/assessments')} sx={{ fontWeight: 800, color: '#6366f1' }}>Return to Assessments</Button>
        </Card>
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
            {assessment.title} <Typography component="span" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.9rem', ml: 1 }}>• MongoDB Practice</Typography>
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
        <Box sx={{ overflow: 'auto', height: '100%', bgcolor: '#fff', borderRight: '1px solid rgba(226, 232, 240, 0.8)' }}>
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
              {isFullscreen && (
                <IconButton onClick={toggleFullscreen} sx={{ ml: 'auto', color: '#64748b' }}>
                  <FullscreenExit />
                </IconButton>
              )}
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
                Problem Statement
              </Typography>
              <Typography sx={{ lineHeight: 1.8, color: '#475569', fontSize: '1.1rem', fontWeight: 600 }}>
                {currentQuestion.description || currentQuestion.problemStatement}
              </Typography>
            </Box>
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

        <Box sx={{ bgcolor: '#fff', height: '100%', minWidth: 0 }}>
          <MongoDBPlaygroundEditor assessment={assessment} question={currentQuestion} attemptId={null} onTestComplete={() => {}} />
        </Box>
      </Box>
    </Box>
  );
}
