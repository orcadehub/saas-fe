import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button
} from '@mui/material';

const MCQGame = ({ level, onSubmit, showResult, isCorrect, disabled }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [shuffledOptions, setShuffledOptions] = useState([]);

  useEffect(() => {
    if (level?.options) {
      if (level.shuffleOptions !== false) {
        setShuffledOptions(shuffleArray(level.options));
      } else {
        setShuffledOptions(level.options);
      }
    }
    setSelectedAnswer('');
  }, [level]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleSubmit = () => {
    onSubmit(selectedAnswer);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, lineHeight: 1.6 }}>
        {level?.question}
      </Typography>

      <RadioGroup value={selectedAnswer} onChange={(e) => setSelectedAnswer(e.target.value)}>
        {shuffledOptions.map((option) => (
          <FormControlLabel
            key={option.id}
            value={option.id}
            control={<Radio />}
            label={option.text}
            disabled={disabled || showResult}
            sx={{
              mb: 1,
              p: 2,
              border: '2px solid',
              borderColor: showResult && option.id === level.correctAnswer ? 'success.main' : 'divider',
              borderRadius: 2,
              bgcolor: showResult && option.id === level.correctAnswer ? 'success.light' : 'transparent',
              '&:hover': { bgcolor: disabled || showResult ? 'transparent' : 'action.hover' }
            }}
          />
        ))}
      </RadioGroup>

      {showResult && (
        <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: isCorrect ? 'success.light' : 'error.light' }}>
          <Typography variant="h6" color={isCorrect ? 'success.dark' : 'error.dark'}>
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {isCorrect ? `+${level.pointsForLevel} coins` : `Correct answer: ${level.correctAnswer}`}
          </Typography>
        </Box>
      )}

      {!showResult && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={!selectedAnswer || disabled}
          >
            Submit Answer
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default MCQGame;
