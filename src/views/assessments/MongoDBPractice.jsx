import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Chip, Skeleton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Skeleton variant="rectangular" height={48} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '50% 4px 50%', flexGrow: 1 }}>
          <Box sx={{ p: 4 }}>
            <Skeleton variant="text" height={48} width="60%" sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={200} />
          </Box>
          <Box sx={{ bgcolor: '#6a0dad' }} />
          <Box sx={{ p: 4 }}>
            <Skeleton variant="rectangular" height="100%" />
          </Box>
        </Box>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#ffffff' }}>
        <IconButton onClick={() => navigate('/assessments')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
          {assessment.title} - Practice Mode
        </Typography>
        <Chip label="Practice Mode" color="success" />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '50% 4px 50%', flexGrow: 1, height: '100%', overflow: 'hidden' }}>
        <Box sx={{ overflow: 'auto', height: '100%', bgcolor: '#ffffff', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 10 }}>
            <Box sx={{ display: 'flex', gap: 1, overflow: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
              {questions.map((q, index) => (
                <Button
                  key={index}
                  variant={index === currentQuestionIndex ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setCurrentQuestionIndex(index)}
                  sx={{ minWidth: '48px', height: '48px', fontSize: '1.1rem', fontWeight: 600 }}
                >
                  {index + 1}
                </Button>
              ))}
            </Box>
          </Box>

          <Box sx={{ p: 4, maxWidth: '900px', mx: 'auto' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              {currentQuestion.title}
            </Typography>

            {currentQuestion.tags && currentQuestion.tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {currentQuestion.tags.map((tag, idx) => (
                  <Chip key={idx} label={tag} size="small" />
                ))}
              </Box>
            )}

            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              {currentQuestion.problemStatement}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ bgcolor: '#6a0dad', cursor: 'col-resize' }} />

        <Box sx={{ bgcolor: '#ffffff', height: '100%' }}>
          <MongoDBPlaygroundEditor assessment={assessment} question={currentQuestion} attemptId={null} onTestComplete={() => {}} />
        </Box>
      </Box>
    </Box>
  );
}
