import { Typography, Grid, Card, CardContent, Button, Chip, Box, Tabs, Tab, CircularProgress, Skeleton } from '@mui/material';
import { Assessment, AccessTime, CheckCircle } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import useConfig from 'hooks/useConfig';
import { useAssessments } from 'contexts/AssessmentsContext';

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
      gap: { xs: 2, sm: 2.5, md: 3 },
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
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            borderColor: 'primary.main'
          }
        }}>
          <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5, md: 3 }, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5, lineHeight: 1.3, color: '#1e293b', flexShrink: 0, fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}>
              {assessment.title}
            </Typography>
            
            <Box display="flex" flexWrap="wrap" gap={1} mb={2.5} sx={{ flexShrink: 0 }}>
              <Chip 
                icon={<AccessTime sx={{ fontSize: 16 }} />}
                label={`${assessment.duration} min`}
                size="small"
                sx={{ 
                  fontWeight: 600,
                  backgroundColor: '#eff6ff',
                  color: '#1e40af',
                  border: 'none'
                }}
              />
              <Chip 
                label={`${(assessment.codingQuestionCount || assessment.questionCounts?.programming + assessment.questionCounts?.frontend + assessment.questionCounts?.mongodb || 0)} coding`}
                size="small"
                sx={{ 
                  fontWeight: 600,
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  border: 'none'
                }}
              />
              <Chip 
                label={`${(assessment.quizQuestionCount || assessment.questionCounts?.quiz || 0)} quiz`}
                size="small"
                sx={{ 
                  fontWeight: 600,
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  border: 'none'
                }}
              />
            </Box>

            <Box mb={3} sx={{ 
              backgroundColor: '#f8fafc',
              borderRadius: `${borderRadius}px`,
              p: { xs: 1.5, sm: 2 },
              flexShrink: 0
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Start Date
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Start Time
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {new Date(assessment.startTime).toLocaleDateString('en-GB')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {new Date(assessment.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </Typography>
              </Box>
            </Box>
            
            <Button 
              variant="contained" 
              fullWidth
              size="large"
              disabled={tabType === 'completed' && !canViewResults}
              onClick={() => {
                if (tabType === 'available') {
                  navigate(`/assessments/${assessment._id}`);
                } else if (tabType === 'completed') {
                  navigate(`/assessments/${assessment._id}/results`);
                } else if (tabType === 'expired') {
                  // Route based on assessment type
                  if (assessment.type === 'frontend') {
                    navigate(`/assessments/${assessment._id}/practice-frontend`);
                  } else if (assessment.type === 'mongodb') {
                    navigate(`/assessments/${assessment._id}/practice-mongodb`);
                  } else {
                    navigate(`/assessments/${assessment._id}/practice`);
                  }
                }
              }}
              sx={{ 
                mt: 'auto',
                py: 1.5,
                fontWeight: 700,
                borderRadius: `${borderRadius}px`,
                textTransform: 'none',
                fontSize: '1rem',
                backgroundColor: 'secondary.light',
                color: 'secondary.main',
                boxShadow: 'none',
                flexShrink: 0,
                '&:hover': {
                  backgroundColor: 'secondary.light',
                  boxShadow: 'none'
                }
              }}
            >
              {tabType === 'available' ? 'Start Assessment' : 
               tabType === 'completed' ? (canViewResults ? 'View Results' : (
                 <Box>
                   <Typography>Results Locked</Typography>
                   <Typography variant="caption">{minutes}m {seconds}s</Typography>
                 </Box>
               )) : 'Practice'}
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

  if (loading || assessments.length === 0) {
    return (
      <MainCard>
        <Box sx={{ mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '4px 4px 0 0',
                bgcolor: 'secondary.main'
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                minHeight: 56,
                color: '#94a3b8',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'secondary.main',
                  bgcolor: 'secondary.lighter'
                },
                '&.Mui-selected': {
                  color: 'secondary.main',
                  fontWeight: 700
                }
              }
            }}
          >
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1.5}>
                  <CheckCircle sx={{ fontSize: 18 }} />
                  <Typography fontWeight="inherit" fontSize="inherit">Available</Typography>
                  <Chip 
                    label={0} 
                    size="small" 
                    sx={{
                      bgcolor: tabValue === 0 ? 'secondary.main' : 'secondary.light',
                      color: tabValue === 0 ? '#ffffff' : 'secondary.main',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      height: 24,
                      minWidth: 32
                    }}
                  />
                </Box>
              }
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Assessment sx={{ fontSize: 18 }} />
                  <Typography fontWeight="inherit" fontSize="inherit">Completed</Typography>
                  <Chip 
                    label={0} 
                    size="small" 
                    sx={{
                      bgcolor: tabValue === 1 ? 'secondary.main' : 'secondary.light',
                      color: tabValue === 1 ? '#ffffff' : 'secondary.main',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      height: 24,
                      minWidth: 32
                    }}
                  />
                </Box>
              }
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1.5}>
                  <AccessTime sx={{ fontSize: 18 }} />
                  <Typography fontWeight="inherit" fontSize="inherit">Expired</Typography>
                  <Chip 
                    label={0} 
                    size="small" 
                    sx={{
                      bgcolor: tabValue === 2 ? 'secondary.main' : 'secondary.light',
                      color: tabValue === 2 ? '#ffffff' : 'secondary.main',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      height: 24,
                      minWidth: 32
                    }}
                  />
                </Box>
              }
            />
          </Tabs>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <Card key={idx} sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Skeleton variant="text" height={32} sx={{ mb: 2 }} />
                <Box display="flex" gap={1} mb={2}>
                  <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 2 }} />
                </Box>
                <Skeleton variant="rectangular" height={80} sx={{ mb: 2, borderRadius: 2 }} />
                <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 2 }} />
              </CardContent>
            </Card>
          ))}
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard>
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTabs-indicator': {
              height: 4,
              borderRadius: '4px 4px 0 0',
              bgcolor: 'secondary.main'
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              minHeight: 56,
              color: '#94a3b8',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'secondary.main',
                bgcolor: 'secondary.lighter'
              },
              '&.Mui-selected': {
                color: 'secondary.main',
                fontWeight: 700
              }
            }
          }}
        >
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1.5}>
                <CheckCircle sx={{ fontSize: 18 }} />
                <Typography fontWeight="inherit" fontSize="inherit">Available</Typography>
                <Chip 
                  label={availableAssessments.length} 
                  size="small" 
                  sx={{
                    bgcolor: tabValue === 0 ? 'secondary.main' : 'secondary.light',
                    color: tabValue === 0 ? '#ffffff' : 'secondary.main',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    height: 24,
                    minWidth: 32
                  }}
                />
              </Box>
            }
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1.5}>
                <Assessment sx={{ fontSize: 18 }} />
                <Typography fontWeight="inherit" fontSize="inherit">Completed</Typography>
                <Chip 
                  label={completedAssessments.length} 
                  size="small" 
                  sx={{
                    bgcolor: tabValue === 1 ? 'secondary.main' : 'secondary.light',
                    color: tabValue === 1 ? '#ffffff' : 'secondary.main',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    height: 24,
                    minWidth: 32
                  }}
                />
              </Box>
            }
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1.5}>
                <AccessTime sx={{ fontSize: 18 }} />
                <Typography fontWeight="inherit" fontSize="inherit">Expired</Typography>
                <Chip 
                  label={expiredAssessments.length} 
                  size="small" 
                  sx={{
                    bgcolor: tabValue === 2 ? 'secondary.main' : 'secondary.light',
                    color: tabValue === 2 ? '#ffffff' : 'secondary.main',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    height: 24,
                    minWidth: 32
                  }}
                />
              </Box>
            }
          />
        </Tabs>
      </Box>
      <Box sx={{ width: '100%' }}>
        {tabValue === 0 && (
          availableAssessments.length > 0 ? renderAssessmentCards(availableAssessments, 'available') : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">No available assessments</Typography>
            </Box>
          )
        )}
      </Box>
      {tabValue === 1 && (
        completedAssessments.length > 0 ? renderAssessmentCards(completedAssessments, 'completed') : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">No completed assessments</Typography>
          </Box>
        )
      )}
      {tabValue === 2 && (
        expiredAssessments.length > 0 ? renderAssessmentCards(expiredAssessments, 'expired') : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">No expired assessments</Typography>
          </Box>
        )
      )}
    </MainCard>
  );
}
