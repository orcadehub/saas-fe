import { Typography, Grid, Card, CardContent, Button, Chip, Box, Tabs, Tab, CircularProgress, Skeleton, Stack } from '@mui/material';
import { Assessment, AccessTime, CheckCircle } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import useConfig from 'hooks/useConfig';
import { useAssessments } from 'contexts/AssessmentsContext';

// Custom constants for premium theme
const whiteGlassSx = {
  p: 4, borderRadius: '24px', 
  background: 'rgba(255, 255, 255, 0.8)', 
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.06)'
};

const LightBackground = () => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#fbfcfe' }} />
    <Box sx={{
      position: 'absolute', top: '-10%', right: '-5%',
      width: '60vw', height: '60vw',
      background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
      borderRadius: '50%', filter: 'blur(80px)',
    }} />
    <Box sx={{
      position: 'absolute', bottom: '-15%', left: '-10%',
      width: '50vw', height: '50vw',
      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
      borderRadius: '50%', filter: 'blur(100px)',
    }} />
  </Box>
);

export default function Assessments() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const { state: { borderRadius } } = useConfig();
  const { assessments, assessmentAttempts, loading } = useAssessments();
  const [, forceUpdate] = useState();

  const now = new Date().getTime();
  
  const availableAssessments = assessments.filter(assessment => {
    const startTime = new Date(assessment.startTime).getTime();
    const endTime = startTime + (assessment.duration * 60 * 1000);
    const attempt = assessmentAttempts[assessment._id];
    
    return (assessment.status === 'active' || assessment.status === 'live') && 
           now < endTime && 
           (!attempt || (attempt.attemptStatus !== 'COMPLETED' && attempt.attemptStatus !== 'TAB_SWITCH_VIOLATION' && attempt.attemptStatus !== 'TERMINATED') || attempt.attemptStatus === 'RESUMED' || attempt.attemptStatus === 'RETAKE_ALLOWED');
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  
  const completedAssessments = assessments.filter(assessment => {
    const attempt = assessmentAttempts[assessment._id];
    return attempt && (attempt.attemptStatus === 'COMPLETED' || attempt.attemptStatus === 'TAB_SWITCH_VIOLATION');
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  
  const expiredAssessments = assessments.filter(assessment => {
    const startTime = new Date(assessment.startTime).getTime();
    const endTime = startTime + (assessment.duration * 60 * 1000);
    const attempt = assessmentAttempts[assessment._id];
    
    return now >= endTime && 
           (!attempt || (attempt.attemptStatus !== 'COMPLETED' && attempt.attemptStatus !== 'TAB_SWITCH_VIOLATION'));
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const renderAssessmentCards = (assessmentList, tabType) => (
    <Box sx={{ 
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(4, 1fr)'
      },
      gap: { xs: 2.5, sm: 3 },
      width: '100%'
    }}>
      {assessmentList.map((assessment) => {
        const startTime = new Date(assessment.startTime).getTime();
        const endTime = startTime + (assessment.duration * 60 * 1000);
        const canViewResults = now >= endTime;
        const timeRemaining = endTime - now;
        const minutes = Math.floor(timeRemaining / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        return (
        <Card key={assessment._id} sx={{ 
            borderRadius: '24px', 
            bgcolor: '#fff', 
            border: '1px solid #f1f5f9',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            height: '100%',
            '&:hover': { 
              transform: 'translateY(-5px)', 
              boxShadow: '0 20px 40px rgba(99, 102, 241, 0.08)',
              borderColor: 'rgba(99, 102, 241, 0.1)'
            } 
        }}>
          <CardContent sx={{ flexGrow: 1, p: { xs: 2.5, sm: 3 }, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <Box sx={{ 
                  width: 44, height: 44, borderRadius: '12px', 
                  bgcolor: 'rgba(99, 102, 241, 0.08)', color: '#6366f1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
               }}>
                  <Assessment />
               </Box>
               <Chip 
                  label={tabType === 'available' ? 'Live' : tabType === 'completed' ? 'Done' : 'Past'}
                  size="small"
                  sx={{ 
                    fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase',
                    bgcolor: tabType === 'available' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(100, 116, 139, 0.08)',
                    color: tabType === 'available' ? '#22c55e' : '#64748b',
                    borderRadius: '8px'
                  }}
               />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: '#1e293b', lineHeight: 1.3, height: '3.4em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {assessment.title}
            </Typography>
            
            <Box display="flex" flexWrap="wrap" gap={1} mb={2.5}>
              <Chip 
                label={`${assessment.duration}m`}
                size="small"
                sx={{ fontWeight: 700, bgcolor: '#eff6ff', color: '#3b82f6', borderRadius: '8px' }}
              />
              <Chip 
                label={`${assessment.codingQuestionCount || 0} coding`}
                size="small"
                sx={{ fontWeight: 700, bgcolor: '#f0fdf4', color: '#10b981', borderRadius: '8px' }}
              />
              {assessment.questionCounts?.sql > 0 && (
                <Chip 
                  label={`${assessment.questionCounts.sql} sql`}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: '#eff6ff', color: '#3b82f6', borderRadius: '8px' }}
                />
              )}
              {assessment.quizQuestionCount > 0 && (
                <Chip 
                  label={`${assessment.quizQuestionCount} quiz`}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: '#fff7ed', color: '#ea580c', borderRadius: '8px' }}
                />
              )}
            </Box>
            <Box sx={{ 
              p: 2, bgcolor: '#f8fafc', borderRadius: '16px', mb: 3,
              border: '1px solid #f1f5f9'
            }}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.65rem' }}>Start Schedule</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {new Date(assessment.startTime).toLocaleDateString('en-GB')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.08)', px: 1, py: 0.2, borderRadius: '6px' }}>
                      {new Date(assessment.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </Typography>
                  </Box>
                </Stack>
            </Box>
            
            <Button 
              variant="contained" 
              fullWidth
              disableElevation
              disabled={tabType === 'completed' && !canViewResults}
              onClick={() => {
                if (tabType === 'available') {
                  navigate(`/assessments/${assessment._id}`);
                } else if (tabType === 'completed') {
                  navigate(`/assessments/${assessment._id}/results`);
                } else if (tabType === 'expired') {
                  if (assessment.type === 'frontend') {
                    navigate(`/assessments/${assessment._id}/practice-frontend`);
                  } else if (assessment.type === 'mongodb') {
                    navigate(`/assessments/${assessment._id}/practice-mongodb`);
                  } else if (assessment.type === 'sql') {
                    navigate(`/assessments/${assessment._id}/practice-sql`);
                  } else {
                    navigate(`/assessments/${assessment._id}/practice`);
                  }
                }
              }}
              sx={{ 
                mt: 'auto',
                py: 1.5,
                fontWeight: 800,
                borderRadius: '12px',
                textTransform: 'none',
                bgcolor: tabType === 'available' ? '#6366f1' : '#f1f5f9',
                color: tabType === 'available' ? '#fff' : '#475569',
                '&:hover': {
                  bgcolor: tabType === 'available' ? '#4f46e5' : '#e2e8f0',
                }
              }}
            >
              {tabType === 'available' ? 'Resume/Start' : 
               tabType === 'completed' ? (canViewResults ? 'View Results' : (
                 <Box sx={{ textAlign: 'center' }}>
                   <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1 }}>Results Locked</Typography>
                   <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>Available in {minutes}m {seconds}s</Typography>
                 </Box>
               )) : 'Practice Mode'}
            </Button>
          </CardContent>
        </Card>
        );
      })}
    </Box>
  );

  useEffect(() => {
    if (tabValue === 1) {
      const interval = setInterval(() => forceUpdate({}), 1000);
      return () => clearInterval(interval);
    }
  }, [tabValue]);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      p: { xs: 2, sm: 3, md: 4.5 }, 
      bgcolor: '#fbfcfe',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <LightBackground />
      
      <Box sx={{ position: 'relative', zIndex: 10 }}>
        <Box sx={{ 
          ...whiteGlassSx,
          p: 1.5,
          borderRadius: '20px',
          mb: 4,
          display: 'inline-flex',
          width: 'auto'
        }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              minHeight: 48,
              '& .MuiTabs-indicator': {
                display: 'none'
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '0.875rem',
                minHeight: 48,
                borderRadius: '12px',
                px: 3,
                color: '#64748b',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&.Mui-selected': {
                  color: '#6366f1',
                  bgcolor: 'rgba(99, 102, 241, 0.08)',
                },
                '&:hover:not(.Mui-selected)': {
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                }
              }
            }}
          >
            <Tab label={`Available (${availableAssessments.length})`} />
            <Tab label={`Completed (${completedAssessments.length})`} />
            <Tab label={`Expired (${expiredAssessments.length})`} />
          </Tabs>
        </Box>

        <Box sx={{ width: '100%' }}>
          {loading && assessments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
               <CircularProgress sx={{ color: '#6366f1' }} />
            </Box>
          ) : (
            <>
              {tabValue === 0 && (availableAssessments.length > 0 ? renderAssessmentCards(availableAssessments, 'available') : (
                <Box sx={{ ...whiteGlassSx, textAlign: 'center', py: 8 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>No live assessments found</Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', mt: 1 }}>Check back later for scheduled tasks</Typography>
                </Box>
              ))}
              {tabValue === 1 && (completedAssessments.length > 0 ? renderAssessmentCards(completedAssessments, 'completed') : (
                <Box sx={{ ...whiteGlassSx, textAlign: 'center', py: 8 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>No completed exams</Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', mt: 1 }}>Your submitted assessments will appear here</Typography>
                </Box>
              ))}
              {tabValue === 2 && (expiredAssessments.length > 0 ? renderAssessmentCards(expiredAssessments, 'expired') : (
                <Box sx={{ ...whiteGlassSx, textAlign: 'center', py: 8 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>Empty history</Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', mt: 1 }}>No previous assessment records</Typography>
                </Box>
              ))}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
