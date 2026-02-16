import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, Button, CircularProgress, Paper, Tabs, Tab
} from '@mui/material';
import { ArrowBack, Code } from '@mui/icons-material';
import MainCard from 'ui-component/cards/MainCard';
import { useAuth } from 'contexts/AuthContext';
import tenantConfig from 'config/tenantConfig';

export default function QuestionSolver() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  useEffect(() => {
    if (config) {
      fetchQuestion();
    }
  }, [config, id]);

  const getApiUrl = () => {
    return import.meta.env.DEV ? 'http://localhost:4000/api' : (config?.apiEndpoint || 'https://backend.orcode.in/api');
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-api-key': config?.apiKey || '',
    'x-tenant-id': config?.tenantId || ''
  });

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/assessment-questions/${id}`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuestion(data);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainCard>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (!question) {
    return (
      <MainCard>
        <Typography>Question not found</Typography>
      </MainCard>
    );
  }

  const difficultyColors = {
    Easy: { bg: '#d1fae5', color: '#065f46' },
    Medium: { bg: '#fef3c7', color: '#92400e' },
    Hard: { bg: '#fee2e2', color: '#991b1b' }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MainCard sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/practice/assessment')}
            variant="outlined"
          >
            Back
          </Button>
          <Code sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, flexGrow: 1 }}>
            {question.title}
          </Typography>
          <Chip
            label={question.difficulty}
            sx={{
              bgcolor: difficultyColors[question.difficulty]?.bg,
              color: difficultyColors[question.difficulty]?.color,
              fontWeight: 600
            }}
          />
          <Chip label={question.assessmentType} variant="outlined" />
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Problem Statement
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
              {question.description}
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Constraints
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              {question.constraints.map((constraint, idx) => (
                <Typography component="li" key={idx} variant="body2" sx={{ mb: 1 }}>
                  {constraint}
                </Typography>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Example
            </Typography>
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Input:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {question.example.input}
              </Typography>
            </Box>
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Output:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {question.example.output}
              </Typography>
            </Box>
            {question.example.explanation && (
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Explanation:
                </Typography>
                <Typography variant="body2">{question.example.explanation}</Typography>
              </Box>
            )}
          </Paper>

          {question.intuition && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Approach & Solution
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                {question.intuition.approach}
              </Typography>
              
              {question.intuition.keyInsights?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Key Insights:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3 }}>
                    {question.intuition.keyInsights.map((insight, idx) => (
                      <Typography component="li" key={idx} variant="body2" sx={{ mb: 1 }}>
                        {insight}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip
                  label={`Time: ${question.intuition.timeComplexity}`}
                  sx={{ bgcolor: '#d1fae5', color: '#065f46' }}
                />
                <Chip
                  label={`Space: ${question.intuition.spaceComplexity}`}
                  sx={{ bgcolor: '#fef3c7', color: '#92400e' }}
                />
              </Box>
            </Paper>
          )}
        </Box>
      </MainCard>
    </Box>
  );
}
