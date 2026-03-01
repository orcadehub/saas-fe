import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box, Chip, IconButton, Button } from '@mui/material';
import { ArrowBack, Code, CheckCircle } from '@mui/icons-material';
import MainCard from 'ui-component/cards/MainCard';

const labQuestions = {
  'c-programming': [
    { id: 1, title: 'Hello World Program', difficulty: 'Easy', topics: ['Basics', 'Syntax'], completed: false }
  ],
  'cpp-programming': [
    { id: 1, title: 'Hello World with Namespace', difficulty: 'Easy', topics: ['Basics', 'Namespace'], completed: false }
  ],
  'java-programming': [
    { id: 1, title: 'Hello World Application', difficulty: 'Easy', topics: ['Basics', 'Syntax'], completed: false }
  ],
  'python-programming': [
    { id: 1, title: 'Hello World Script', difficulty: 'Easy', topics: ['Basics', 'Print'], completed: false }
  ]
};

const labNames = {
  'c-programming': 'C Programming Lab',
  'cpp-programming': 'C++ Programming Lab',
  'java-programming': 'Java Programming Lab',
  'python-programming': 'Python Programming Lab'
};

const difficultyColors = {
  'Easy': 'success',
  'Medium': 'warning',
  'Hard': 'error'
};

export default function LabDetail() {
  const { labId } = useParams();
  const navigate = useNavigate();
  const questions = labQuestions[labId] || [];
  const labName = labNames[labId] || 'Lab';

  return (
    <MainCard
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/labs')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h3">{labName}</Typography>
        </Box>
      }
    >
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 3
      }}>
        {questions.map((question) => (
          <Card
            key={question.id}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s',
              borderRadius: 2,
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
              border: '1px solid',
              borderColor: 'divider'
            }}
            onClick={() => navigate(`/labs/${labId}/${question.id}`)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                  <Code sx={{ color: 'primary.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {question.id}.
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, flex: 1 }}>
                    {question.title}
                  </Typography>
                </Box>
                {question.completed && (
                  <CheckCircle sx={{ color: 'success.main' }} />
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip 
                  label={question.difficulty} 
                  size="small" 
                  color={difficultyColors[question.difficulty]}
                />
                {question.topics.map((topic, idx) => (
                  <Chip key={idx} label={topic} size="small" variant="outlined" />
                ))}
              </Box>

              <Button 
                variant="contained" 
                fullWidth
                sx={{ mt: 1 }}
              >
                Start Practice
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </MainCard>
  );
}
