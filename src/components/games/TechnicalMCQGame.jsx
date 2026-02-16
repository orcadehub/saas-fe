import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';

const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  const questions = [];
  
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(';');
    if (parts.length >= 6) {
      questions.push({
        question: parts[0],
        options: [
          { id: 'A', text: parts[1] },
          { id: 'B', text: parts[2] },
          { id: 'C', text: parts[3] },
          { id: 'D', text: parts[4] }
        ],
        correctAnswer: parts[5].trim()
      });
    }
  }
  return questions;
};

const TechnicalMCQGame = ({ dataset, onSubmit }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch(`/src/datasets/${dataset}`);
        const csvText = await response.text();
        const parsed = parseCSV(csvText);
        
        // Shuffle questions
        for (let i = parsed.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [parsed[i], parsed[j]] = [parsed[j], parsed[i]];
        }
        
        setQuestions(parsed.slice(0, 50)); // Take first 50 shuffled questions
        setLoading(false);
      } catch (error) {
        console.error('Error loading questions:', error);
        setLoading(false);
      }
    };

    loadQuestions();
  }, [dataset]);

  const currentQuestion = questions[currentIndex];

  const handleSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return;
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer('');
      setShowResult(false);
    } else {
      onSubmit(true); // Completed all questions
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography sx={{ color: '#6a0dad' }}>Loading questions...</Typography>
      </Box>
    );
  }

  if (!currentQuestion) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography sx={{ color: '#ef4444' }}>No questions available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ color: '#6a0dad', fontWeight: 600 }}>
          Question {currentIndex + 1} of {questions.length}
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ color: '#6a0dad', fontWeight: 600, mb: 3 }}>
        {currentQuestion.question}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        {currentQuestion.options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrectAnswer = showResult && option.id === currentQuestion.correctAnswer;
          const isWrongAnswer = showResult && isSelected && option.id !== currentQuestion.correctAnswer;

          return (
            <Box
              key={option.id}
              onClick={() => !showResult && setSelectedAnswer(option.id)}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '2px solid',
                borderColor: isCorrectAnswer ? '#10b981' : isWrongAnswer ? '#ef4444' : isSelected ? '#6a0dad' : '#e5e7eb',
                bgcolor: isCorrectAnswer ? '#d1fae5' : isWrongAnswer ? '#fee2e2' : isSelected ? '#f3e8ff' : 'white',
                cursor: showResult ? 'default' : 'pointer',
                transition: 'all 0.2s',
                '&:hover': showResult ? {} : {
                  borderColor: '#6a0dad',
                  transform: 'scale(1.02)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: isCorrectAnswer ? '#10b981' : isWrongAnswer ? '#ef4444' : isSelected ? '#6a0dad' : '#f3e8ff',
                    color: isCorrectAnswer || isWrongAnswer || isSelected ? 'white' : '#6a0dad',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.125rem'
                  }}
                >
                  {option.id}
                </Box>
                <Typography
                  sx={{
                    color: isCorrectAnswer ? '#059669' : isWrongAnswer ? '#dc2626' : isSelected ? '#6a0dad' : '#374151',
                    fontWeight: isSelected || isCorrectAnswer || isWrongAnswer ? 600 : 400,
                    fontSize: '1.125rem',
                    flex: 1
                  }}
                >
                  {option.text}
                </Typography>
                {isCorrectAnswer && <Typography sx={{ fontSize: '1.5rem' }}>✓</Typography>}
                {isWrongAnswer && <Typography sx={{ fontSize: '1.5rem' }}>✗</Typography>}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: '1.125rem',
              background: selectedAnswer ? 'linear-gradient(to right, #10b981, #059669)' : 'rgba(156,163,175,0.3)',
              color: selectedAnswer ? 'white' : '#9ca3af',
              boxShadow: selectedAnswer ? '0 10px 30px rgba(16,185,129,0.5)' : 'none',
              '&:hover': selectedAnswer ? { background: 'linear-gradient(to right, #059669, #047857)', transform: 'scale(1.05)' } : {},
              transition: 'all 0.3s'
            }}
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: '1.125rem',
              background: 'linear-gradient(to right, #6a0dad, #c77dff)',
              color: 'white',
              boxShadow: '0 10px 30px rgba(106,13,173,0.5)',
              '&:hover': { background: 'linear-gradient(to right, #560bad, #b5179e)', transform: 'scale(1.05)' },
              transition: 'all 0.3s'
            }}
          >
            {currentIndex < questions.length - 1 ? 'Next Question →' : 'Finish'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default TechnicalMCQGame;
