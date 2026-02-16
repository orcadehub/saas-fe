import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Card, LinearProgress } from '@mui/material';

const generateGrid = (difficulty) => {
  const size = difficulty === 'Easy' ? 3 : difficulty === 'Medium' ? 5 : 7;
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];
  const grid = Array(size).fill(null).map(() => Array(size).fill(null));
  
  const patternTypes = ['diagonal', 'anti-diagonal', 'L-shape', 'cross', 'checkerboard', 'spiral', 'blocks'];
  const pattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];
  
  if (pattern === 'diagonal') {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        grid[i][j] = colors[(i - j + size) % colors.length];
      }
    }
  } else if (pattern === 'anti-diagonal') {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        grid[i][j] = colors[(i + j) % colors.length];
      }
    }
  } else if (pattern === 'L-shape') {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const lPattern = Math.floor(i / 2) + Math.floor(j / 2);
        grid[i][j] = colors[lPattern % colors.length];
      }
    }
  } else if (pattern === 'cross') {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const dist = Math.min(Math.abs(i - j), Math.abs(i + j - size + 1));
        grid[i][j] = colors[dist % colors.length];
      }
    }
  } else if (pattern === 'checkerboard') {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        grid[i][j] = colors[((i + j) % 2) * 2 + (i % 2)];
      }
    }
  } else if (pattern === 'spiral') {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const layer = Math.min(i, j, size - 1 - i, size - 1 - j);
        grid[i][j] = colors[layer % colors.length];
      }
    }
  } else if (pattern === 'blocks') {
    const blockSize = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 2;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const blockRow = Math.floor(i / blockSize);
        const blockCol = Math.floor(j / blockSize);
        grid[i][j] = colors[(blockRow * 3 + blockCol) % colors.length];
      }
    }
  }
  
  // Remove one cell
  const row = Math.floor(Math.random() * size);
  const col = Math.floor(Math.random() * size);
  const answer = grid[row][col];
  grid[row][col] = null;
  
  // Generate options
  const options = [answer];
  while (options.length < 4) {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    if (!options.includes(randomColor)) {
      options.push(randomColor);
    }
  }
  options.sort(() => Math.random() - 0.5);
  
  return { grid, answer, questionPos: [row, col], options };
};

const GridChallengeGame = ({ difficulty = 'Easy', onComplete }) => {
  const totalQuestions = 20;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [gridData, setGridData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    startNewQuestion();
  }, [currentQuestion]);

  const startNewQuestion = () => {
    setGridData(generateGrid(difficulty));
    setSelected(null);
    setFeedback('');
  };

  const handleSubmit = () => {
    const isCorrect = selected === gridData.answer;
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback('✓ Correct!');
    } else {
      setFeedback('✗ Wrong!');
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

  if (!gridData) return null;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
          Which color completes the pattern?
        </Typography>
        
        <Box sx={{ display: 'inline-block', mb: 3 }}>
          {gridData.grid.map((row, rowIdx) => (
            <Box key={rowIdx} sx={{ display: 'flex' }}>
              {row.map((cell, colIdx) => {
                const isQuestion = rowIdx === gridData.questionPos[0] && colIdx === gridData.questionPos[1];
                
                return (
                  <Box
                    key={colIdx}
                    sx={{
                      width: difficulty === 'Easy' ? 80 : difficulty === 'Medium' ? 60 : 50,
                      height: difficulty === 'Easy' ? 80 : difficulty === 'Medium' ? 60 : 50,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid',
                      borderColor: 'grey.400',
                      bgcolor: cell || 'background.paper'
                    }}
                  >
                    {isQuestion && (
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'grey.700' }}>?</Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>

        <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>Select your answer:</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          {gridData.options.map((color, idx) => (
            <Box
              key={idx}
              onClick={() => !feedback && setSelected(color)}
              sx={{
                width: 70,
                height: 70,
                bgcolor: color,
                border: '3px solid',
                borderColor: selected === color ? 'black' : 'grey.400',
                borderRadius: 2,
                cursor: feedback ? 'default' : 'pointer',
                transition: 'all 0.2s',
                '&:hover': feedback ? {} : { borderColor: 'black', transform: 'scale(1.1)' }
              }}
            />
          ))}
        </Box>

        {feedback && (
          <Typography variant="h6" sx={{ mb: 2, color: feedback.includes('✓') ? 'success.main' : 'error.main', fontWeight: 600 }}>
            {feedback}
          </Typography>
        )}
        
        {!feedback && (
          <Button variant="contained" onClick={handleSubmit} disabled={!selected} sx={{ px: 4, py: 1.5 }}>
            Submit
          </Button>
        )}
      </Card>
    </Box>
  );
};

export default GridChallengeGame;
