import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Card, LinearProgress } from '@mui/material';
import { Square, Circle, Star, ChangeHistory } from '@mui/icons-material';

const SHAPES = ['square', 'circle', 'star', 'triangle'];
const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];

const generateGeoSudo = (difficulty) => {
  const grid = Array(4).fill(null).map(() => Array(4).fill(null));
  const patterns = [
    [0, 1, 2, 3, 1, 0, 3, 2, 2, 3, 0, 1, 3, 2, 1, 0],
    [0, 1, 2, 3, 2, 3, 0, 1, 1, 0, 3, 2, 3, 2, 1, 0]
  ];
  
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  let idx = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      grid[i][j] = { shape: SHAPES[pattern[idx]], color: COLORS[pattern[idx]] };
      idx++;
    }
  }
  
  const emptyCells = difficulty === 'Easy' ? 4 : difficulty === 'Medium' ? 6 : 8;
  const positions = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) positions.push([i, j]);
  }
  
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  const questionPos = positions[0];
  const answer = grid[questionPos[0]][questionPos[1]];
  
  const puzzle = grid.map(row => row.map(cell => ({ ...cell })));
  for (let i = 0; i < emptyCells; i++) {
    const [row, col] = positions[i];
    puzzle[row][col] = null;
  }
  
  return { puzzle, answer, questionPos };
};

const GeoSudoGame = ({ difficulty = 'Easy', onComplete }) => {
  const totalQuestions = 20;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [puzzle, setPuzzle] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [questionPos, setQuestionPos] = useState([0, 0]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    startNewQuestion();
  }, [currentQuestion]);

  const startNewQuestion = () => {
    const { puzzle: p, answer: a, questionPos: pos } = generateGeoSudo(difficulty);
    setPuzzle(p);
    setAnswer(a);
    setQuestionPos(pos);
    setSelected(null);
    setFeedback('');
  };

  const handleSubmit = () => {
    const isCorrect = selected && selected.shape === answer.shape && selected.color === answer.color;
    
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

  const ShapeIcon = ({ shape, color, size = 40 }) => {
    const icons = { square: Square, circle: Circle, star: Star, triangle: ChangeHistory };
    const Icon = icons[shape];
    return <Icon sx={{ fontSize: size, color }} />;
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
          Which shape and color fits in the ? cell?
        </Typography>
        
        <Box sx={{ display: 'inline-block', mb: 3 }}>
          {puzzle.map((row, rowIdx) => (
            <Box key={rowIdx} sx={{ display: 'flex' }}>
              {row.map((cell, colIdx) => {
                const isQuestion = rowIdx === questionPos[0] && colIdx === questionPos[1];
                const isRightBorder = colIdx === 1;
                const isBottomBorder = rowIdx === 1;
                
                return (
                  <Box
                    key={colIdx}
                    sx={{
                      width: 70,
                      height: 70,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid',
                      borderColor: 'grey.400',
                      borderRightWidth: isRightBorder ? '4px' : '2px',
                      borderRightColor: isRightBorder ? 'primary.main' : 'grey.400',
                      borderBottomWidth: isBottomBorder ? '4px' : '2px',
                      borderBottomColor: isBottomBorder ? 'primary.main' : 'grey.400',
                      bgcolor: isQuestion ? 'warning.light' : 'background.paper'
                    }}
                  >
                    {isQuestion ? (
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.dark' }}>?</Typography>
                    ) : cell ? (
                      <ShapeIcon shape={cell.shape} color={cell.color} />
                    ) : null}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>

        <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>Select your answer:</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {SHAPES.map((shape, idx) => (
            <Box
              key={`${shape}-${COLORS[idx]}`}
              onClick={() => !feedback && setSelected({ shape, color: COLORS[idx] })}
              sx={{
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid',
                borderColor: selected?.shape === shape && selected?.color === COLORS[idx] ? 'primary.main' : 'grey.400',
                borderRadius: 2,
                bgcolor: selected?.shape === shape && selected?.color === COLORS[idx] ? 'primary.light' : 'background.paper',
                cursor: feedback ? 'default' : 'pointer',
                transition: 'all 0.2s',
                '&:hover': feedback ? {} : { borderColor: 'primary.main', transform: 'scale(1.1)' }
              }}
            >
              <ShapeIcon shape={shape} color={COLORS[idx]} />
            </Box>
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

export default GeoSudoGame;
