import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Card, LinearProgress } from '@mui/material';
import { Lightbulb, LightbulbOutlined } from '@mui/icons-material';

const generateSwitch = (difficulty) => {
  const numBulbs = 5;
  const initialState = Array(numBulbs).fill(false);
  
  // Generate random switch operations
  const operations = [];
  const numOps = difficulty === 'Easy' ? 5 : difficulty === 'Medium' ? 10 : 15;
  
  for (let i = 0; i < numOps; i++) {
    const switchNum = Math.floor(Math.random() * numBulbs) + 1;
    operations.push(switchNum);
  }
  
  // Calculate final state
  const finalState = [...initialState];
  operations.forEach(switchNum => {
    finalState[switchNum - 1] = !finalState[switchNum - 1];
  });
  
  const onCount = finalState.filter(b => b).length;
  
  return { numBulbs, operations, answer: onCount, finalState };
};

const SwitchChallengeGame = ({ difficulty = 'Easy', onComplete }) => {
  const totalQuestions = 20;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [switchData, setSwitchData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    startNewQuestion();
  }, [currentQuestion]);

  const startNewQuestion = () => {
    setSwitchData(generateSwitch(difficulty));
    setSelected(null);
    setFeedback('');
  };

  const handleSubmit = () => {
    const isCorrect = selected === switchData.answer;
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback('✓ Correct!');
    } else {
      setFeedback(`✗ Wrong! Correct: ${switchData.answer}`);
    }

    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setGameOver(true);
        if (onComplete) onComplete(score);
      }
    }, 1500);
  };

  if (gameOver) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Game Complete!</Typography>
        <Typography variant="h5" sx={{ mb: 3 }}>Score: {score}/{totalQuestions}</Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>Accuracy: {((score / totalQuestions) * 100).toFixed(1)}%</Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>Play Again</Button>
      </Box>
    );
  }

  if (!switchData) return null;

  const options = Array.from({ length: switchData.numBulbs + 1 }, (_, i) => i);

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
          All bulbs start OFF. Each switch toggles a bulb (ON↔OFF).
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          How many bulbs are ON after all switches?
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
          {Array(switchData.numBulbs).fill(null).map((_, idx) => (
            <Box
              key={idx}
              sx={{
                width: 50,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid',
                borderColor: 'grey.400',
                borderRadius: 2,
                bgcolor: 'background.paper'
              }}
            >
              <LightbulbOutlined sx={{ fontSize: 30, color: 'grey.400' }} />
            </Box>
          ))}
        </Box>

        <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>Switch Operations:</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {switchData.operations.map((switchNum, idx) => (
            <Box
              key={idx}
              sx={{
                px: 3,
                py: 2,
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 2,
                bgcolor: 'primary.light'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                {switchNum}
              </Typography>
            </Box>
          ))}
        </Box>

        <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>How many bulbs are ON?</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {options.map((num) => (
            <Box
              key={num}
              onClick={() => !feedback && setSelected(num)}
              sx={{
                width: 60,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid',
                borderColor: selected === num ? 'primary.main' : 'grey.400',
                borderRadius: 2,
                bgcolor: selected === num ? 'primary.light' : 'background.paper',
                cursor: feedback ? 'default' : 'pointer',
                transition: 'all 0.2s',
                '&:hover': feedback ? {} : { borderColor: 'primary.main', transform: 'scale(1.1)' }
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{num}</Typography>
            </Box>
          ))}
        </Box>

        {feedback && (
          <Typography variant="h6" sx={{ mb: 2, color: feedback.includes('✓') ? 'success.main' : 'error.main', fontWeight: 600 }}>
            {feedback}
          </Typography>
        )}
        
        {!feedback && (
          <Button variant="contained" onClick={handleSubmit} disabled={selected === null} sx={{ px: 4, py: 1.5 }}>
            Submit
          </Button>
        )}
      </Card>
    </Box>
  );
};

export default SwitchChallengeGame;
