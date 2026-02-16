import { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Box, Chip,
  FormControl, InputLabel, Select, MenuItem, TextField, CircularProgress
} from '@mui/material';
import { IconCode } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import { useAuth } from 'contexts/AuthContext';
import tenantConfig from 'config/tenantConfig';

export default function AssessmentQuestions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  
  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  useEffect(() => {
    if (config && user?.token) {
      fetchQuestions();
    }
  }, [config, user]);

  useEffect(() => {
    applyFilters();
  }, [questions, difficultyFilter, searchQuery]);

  const getApiUrl = () => {
    return import.meta.env.DEV ? 'http://localhost:4000/api' : (config?.apiEndpoint || 'https://backend.orcode.in/api');
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token}`,
    'x-api-key': config?.apiKey || '',
    'x-tenant-id': config?.tenantId || ''
  });

  const fetchQuestions = async () => {
    try {
      // Fetch assessment questions
      const questionsResponse = await fetch(`${getApiUrl()}/assessment-questions`, {
        headers: getHeaders()
      });
      
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        
        // Fetch assessments older than 6 days
        const assessmentsResponse = await fetch(`${getApiUrl()}/assessments`, {
          headers: getHeaders()
        });
        
        if (assessmentsResponse.ok) {
          const assessmentsData = await assessmentsResponse.json();
          const sixDaysAgo = new Date();
          sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
          
          // Filter assessments older than 6 days
          const oldAssessments = assessmentsData.filter(assessment => {
            const startTime = new Date(assessment.startTime);
            return startTime < sixDaysAgo;
          });
          
          // Extract all question IDs from old assessments
          const oldAssessmentQuestionIds = new Set();
          oldAssessments.forEach(assessment => {
            assessment.questions?.forEach(q => {
              oldAssessmentQuestionIds.add(q._id || q);
            });
          });
          
          // Combine both sources and remove duplicates
          const allQuestions = [...questionsData];
          
          // Add assessment questions that aren't already in the list
          oldAssessments.forEach(assessment => {
            assessment.questions?.forEach(question => {
              if (question._id && !allQuestions.find(q => q._id === question._id)) {
                allQuestions.push(question);
              }
            });
          });
          
          setQuestions(allQuestions);
        } else {
          setQuestions(questionsData);
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...questions];

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(q => q.difficulty === difficultyFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredQuestions(filtered);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
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

  return (
    <MainCard title="Assessment Questions">
      <Box sx={{ mb: 4 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)'
          },
          gap: 2
        }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficultyFilter}
              label="Difficulty"
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="Easy">Easy</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Hard">Hard</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Showing {filteredQuestions.length} of {questions.length} questions
      </Typography>

      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)'
        },
        gap: 2
      }}>
        {filteredQuestions.map((question) => (
          <Card
            key={question._id}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s',
              borderRadius: 4,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              },
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
            onClick={() => navigate(`/practice/assessment/${question._id}`)}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <IconCode size={24} color="#1976d2" />
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                  {question.title}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                {question.description?.substring(0, 100) || 'No description'}...
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 'auto' }}>
                <Chip
                  label={question.difficulty}
                  size="small"
                  color={getDifficultyColor(question.difficulty)}
                />
                {question.tags?.slice(0, 2).map((tag, idx) => (
                  <Chip
                    key={idx}
                    label={tag}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {filteredQuestions.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No questions found matching your filters
          </Typography>
        </Box>
      )}
    </MainCard>
  );
}
