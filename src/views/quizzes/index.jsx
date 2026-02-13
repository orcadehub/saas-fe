import { Typography, Grid, Card, CardContent, Button, Chip, Box, Tabs, Tab } from '@mui/material';
import { Assessment, AccessTime, CheckCircle } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import useConfig from 'hooks/useConfig';

export default function Quizzes() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const { state: { borderRadius } } = useConfig();

  const dummyQuizzes = [
    { _id: '1', title: 'Python Fundamentals', duration: 60, questions: 5, quizQuestions: 10, startTime: new Date().toISOString(), status: 'active' },
    { _id: '2', title: 'Data Structures', duration: 90, questions: 8, quizQuestions: 15, startTime: new Date().toISOString(), status: 'active' },
    { _id: '3', title: 'Algorithms', duration: 120, questions: 10, quizQuestions: 20, startTime: new Date().toISOString(), status: 'active' },
    { _id: '4', title: 'JavaScript Basics', duration: 45, questions: 4, quizQuestions: 8, startTime: new Date().toISOString(), status: 'active' },
    { _id: '5', title: 'React Development', duration: 75, questions: 6, quizQuestions: 12, startTime: new Date().toISOString(), status: 'active' },
    { _id: '6', title: 'Database Design', duration: 90, questions: 7, quizQuestions: 14, startTime: new Date().toISOString(), status: 'active' },
    { _id: '7', title: 'Web Security', duration: 60, questions: 5, quizQuestions: 10, startTime: new Date().toISOString(), status: 'active' },
    { _id: '8', title: 'Cloud Computing', duration: 100, questions: 9, quizQuestions: 18, startTime: new Date().toISOString(), status: 'active' },
    { _id: '9', title: 'Machine Learning', duration: 120, questions: 10, quizQuestions: 20, startTime: new Date().toISOString(), status: 'active' },
    { _id: '10', title: 'System Design', duration: 150, questions: 12, quizQuestions: 25, startTime: new Date().toISOString(), status: 'active' },
  ];

  const renderQuizCards = (quizList) => (
    <Grid container spacing={3}>
      {quizList.map((quiz) => (
        <Grid item xs={12} sm={6} md={4} xl={3} key={quiz._id}>
          <Card sx={{ 
            height: 300,
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
            <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5, lineHeight: 1.3, color: '#1e293b' }}>
                {quiz.title}
              </Typography>
              
              <Box display="flex" flexWrap="wrap" gap={1} mb={2.5}>
                <Chip 
                  icon={<AccessTime sx={{ fontSize: 16 }} />}
                  label={`${quiz.duration} min`}
                  size="small"
                  sx={{ 
                    fontWeight: 600,
                    backgroundColor: '#eff6ff',
                    color: '#1e40af',
                    border: 'none'
                  }}
                />
                <Chip 
                  label={`${quiz.questions} coding`}
                  size="small"
                  sx={{ 
                    fontWeight: 600,
                    backgroundColor: '#f0fdf4',
                    color: '#166534',
                    border: 'none'
                  }}
                />
                <Chip 
                  label={`${quiz.quizQuestions} quiz`}
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
                p: 2
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
                    {new Date(quiz.startTime).toLocaleDateString('en-GB')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {new Date(quiz.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </Typography>
                </Box>
              </Box>
              
              <Button 
                variant="contained" 
                fullWidth
                size="large"
                onClick={() => navigate(`/quizzes/${quiz._id}`)}
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
                  '&:hover': {
                    backgroundColor: 'secondary.light',
                    boxShadow: 'none'
                  }
                }}
              >
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <MainCard>
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{
            minHeight: 'auto',
            '& .MuiTabs-flexContainer': {
              gap: 2
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
              minHeight: 48,
              color: '#64748b',
              borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
              background: '#f8fafc',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease'
              },
              '&:hover': {
                color: '#475569',
                background: '#ffffff',
                '&::before': {
                  opacity: 1
                }
              },
              '&.Mui-selected': {
                color: '#5e35b1',
                fontWeight: 600,
                background: '#ffffff',
                boxShadow: '0 -2px 12px rgba(102, 126, 234, 0.15)',
                '&::before': {
                  opacity: 1
                }
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
                  label={10} 
                  size="small" 
                  sx={{
                    background: tabValue === 0 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0f2fe',
                    color: tabValue === 0 ? '#ffffff' : '#0369a1',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 22,
                    minWidth: 28,
                    '& .MuiChip-label': { px: 1 }
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
                    background: tabValue === 1 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#dcfce7',
                    color: tabValue === 1 ? '#ffffff' : '#166534',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 22,
                    minWidth: 28,
                    '& .MuiChip-label': { px: 1 }
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
                    background: tabValue === 2 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fee2e2',
                    color: tabValue === 2 ? '#ffffff' : '#dc2626',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 22,
                    minWidth: 28,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              </Box>
            }
          />
        </Tabs>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        {tabValue === 0 && renderQuizCards(dummyQuizzes)}
      </Box>
      {tabValue === 1 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">No completed quizzes</Typography>
        </Box>
      )}
      {tabValue === 2 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">No expired quizzes</Typography>
        </Box>
      )}
    </MainCard>
  );
}
