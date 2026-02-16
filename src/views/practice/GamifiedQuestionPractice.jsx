import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Radio, RadioGroup, FormControlLabel, Chip, Breadcrumbs, Link, LinearProgress, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { IconTrophy, IconChevronRight, IconClock, IconStar } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import apiService from 'services/apiService';

export default function GamifiedQuestionPractice() {
  const navigate = useNavigate();
  const { topicId, subtopicId, questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchQuestion = async () => {
    try {
      const response = await apiService.get(`/student-practice/questions/${questionId}`);
      setQuestion(response.data);
      if (response.data.hasTimer && response.data.totalTimeLimit) {
        setTimeLeft(response.data.totalTimeLimit);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;

    const level = question.levels[currentLevel];
    const correct = level.options?.find(opt => opt.id === selectedAnswer)?.isCorrect || false;
    
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      setScore(prev => prev + (level.pointsForLevel || 10));
    }
  };

  const handleNext = () => {
    if (currentLevel < question.levels.length - 1) {
      setCurrentLevel(prev => prev + 1);
      setSelectedAnswer('');
      setShowResult(false);
      setIsCorrect(false);
    } else {
      navigate(`/practice/gamified/${topicId}/${subtopicId}`);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <MainCard><Typography>Loading...</Typography></MainCard>;
  if (!question) return <MainCard><Typography>Question not found</Typography></MainCard>;

  const level = question.levels[currentLevel];
  const progress = ((currentLevel + 1) / question.levels.length) * 100;

  return (
    <MainCard>
      <Breadcrumbs separator={<IconChevronRight size={16} />} sx={{ mb: 3 }}>
        <Link color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/practice'); }} sx={{ cursor: 'pointer' }}>
          Practice
        </Link>
        <Link color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/practice/gamified'); }} sx={{ cursor: 'pointer' }}>
          Gamified
        </Link>
        <Link color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate(`/practice/gamified/${topicId}`); }} sx={{ cursor: 'pointer' }}>
          Topic
        </Link>
        <Link color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate(`/practice/gamified/${topicId}/${subtopicId}`); }} sx={{ cursor: 'pointer' }}>
          Subtopic
        </Link>
        <Typography color="text.primary">{question.title}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconTrophy size={32} color="#1976d2" />
            {question.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {question.description}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {timeLeft !== null && (
            <Chip
              icon={<IconClock size={16} />}
              label={formatTime(timeLeft)}
              color={timeLeft < 30 ? 'error' : 'primary'}
            />
          )}
          <Chip
            icon={<IconStar size={16} />}
            label={`Score: ${score}`}
            color="secondary"
          />
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Level {currentLevel + 1} of {question.levels.length}</Typography>
          <Typography variant="body2">{Math.round(progress)}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} />
      </Box>

      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2 }}>
            {level.levelTitle || `Level ${currentLevel + 1}`}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {level.question}
          </Typography>

          {level.questionImage && (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <img src={level.questionImage} alt="Question" style={{ maxWidth: '100%', borderRadius: '8px' }} />
            </Box>
          )}

          {!showResult && (
            <RadioGroup value={selectedAnswer} onChange={(e) => setSelectedAnswer(e.target.value)}>
              {level.options?.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {option.text}
                      {option.image && (
                        <img src={option.image} alt="Option" style={{ maxHeight: '50px', borderRadius: '4px' }} />
                      )}
                    </Box>
                  }
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    mb: 1,
                    p: 1,
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                />
              ))}
            </RadioGroup>
          )}

          {showResult && (
            <Alert severity={isCorrect ? 'success' : 'error'} sx={{ mb: 2 }}>
              {isCorrect ? 'Correct! Well done!' : 'Incorrect. Try the next level!'}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        {!showResult ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selectedAnswer}
          >
            Submit Answer
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            {currentLevel < question.levels.length - 1 ? 'Next Level' : 'Finish'}
          </Button>
        )}
      </Box>
    </MainCard>
  );
}
