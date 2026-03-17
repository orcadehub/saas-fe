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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/practice/assessment')}
            variant="outlined"
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
          >
            Back
          </Button>
          <Code sx={{ color: '#6366f1', fontSize: 32 }} />
          <Typography variant="h2" sx={{ fontWeight: 900, flexGrow: 1, color: '#1e293b', fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
            {question.title}
          </Typography>
          <Chip
            label={question.difficulty}
            sx={{
              bgcolor: difficultyColors[question.difficulty]?.bg,
              color: difficultyColors[question.difficulty]?.color,
              fontWeight: 800,
              borderRadius: '8px'
            }}
          />
          <Chip 
            label={question.assessmentType} 
            variant="outlined" 
            sx={{ fontWeight: 700, borderRadius: '8px', borderColor: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' }} 
          />
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Paper sx={{ p: 4, mb: 3, borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <Typography sx={{ 
              fontWeight: 800, 
              color: '#6366f1', 
              textTransform: 'uppercase', 
              fontSize: '0.75rem', 
              letterSpacing: '0.1em',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Box sx={{ width: 4, height: 16, bgcolor: '#6366f1', borderRadius: 1 }} />
              Problem Statement
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 4, color: '#475569', lineHeight: 1.8, fontSize: '1rem', fontWeight: 500 }}>
              {question.description}
            </Typography>

            <Typography sx={{ 
              fontWeight: 800, 
              color: '#6366f1', 
              textTransform: 'uppercase', 
              fontSize: '0.75rem', 
              letterSpacing: '0.1em',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Box sx={{ width: 4, height: 16, bgcolor: '#6366f1', borderRadius: 1 }} />
              Constraints
            </Typography>
            <Box component="ul" sx={{ pl: 3, m: 0 }}>
              {question.constraints.map((constraint, idx) => (
                <Typography component="li" key={idx} variant="body1" sx={{ mb: 1, color: '#475569', fontWeight: 500 }}>
                  {constraint}
                </Typography>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 4, mb: 3, borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <Typography sx={{ 
              fontWeight: 800, 
              color: '#6366f1', 
              textTransform: 'uppercase', 
              fontSize: '0.75rem', 
              letterSpacing: '0.1em',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Box sx={{ width: 4, height: 16, bgcolor: '#6366f1', borderRadius: 1 }} />
              Example
            </Typography>
            <Box sx={{ bgcolor: 'rgba(248, 250, 252, 0.8)', p: 3, borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)', mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 1, fontFamily: 'JetBrains Mono, monospace' }}>
                <span style={{ color: '#6366f1' }}>Input:</span> {question.example.input}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 1, fontFamily: 'JetBrains Mono, monospace' }}>
                <span style={{ color: '#6366f1' }}>Output:</span> {question.example.output}
              </Typography>
              {question.example.explanation && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed rgba(226, 232, 240, 1)' }}>
                  <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic', fontWeight: 500 }}>
                    <span style={{ color: '#6366f1', fontStyle: 'normal', fontWeight: 700 }}>Explanation:</span> {question.example.explanation}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>

          {question.intuition && (
            <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <Typography sx={{ 
                fontWeight: 800, 
                color: '#6366f1', 
                textTransform: 'uppercase', 
                fontSize: '0.75rem', 
                letterSpacing: '0.1em',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box sx={{ width: 4, height: 16, bgcolor: '#6366f1', borderRadius: 1 }} />
                Approach & Solution
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, whiteSpace: 'pre-line', color: '#475569', lineHeight: 1.8, fontSize: '1rem', fontWeight: 500 }}>
                {question.intuition.approach}
              </Typography>
              
              {question.intuition.keyInsights?.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    Key Insights:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3, m: 0 }}>
                    {question.intuition.keyInsights.map((insight, idx) => (
                      <Typography component="li" key={idx} variant="body1" sx={{ mb: 1, color: '#475569', fontWeight: 500 }}>
                        {insight}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip
                  label={`Time: ${question.intuition.timeComplexity}`}
                  sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', fontWeight: 700, borderRadius: '8px' }}
                />
                <Chip
                  label={`Space: ${question.intuition.spaceComplexity}`}
                  sx={{ bgcolor: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', fontWeight: 700, borderRadius: '8px' }}
                />
              </Box>
            </Paper>
          )}
        </Box>
      </MainCard>
    </Box>
  );
}
