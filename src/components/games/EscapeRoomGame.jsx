import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';

const EscapeRoomGame = ({ level, onSubmit }) => {
  const [gameData, setGameData] = useState(null);
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [playerPosition, setPlayerPosition] = useState(0);

  useEffect(() => {
    if (level?.correctAnswer) {
      const data = JSON.parse(level.correctAnswer);
      setGameData(data);
      setCurrentPuzzle(0);
      setSelectedAnswer('');
      setPlayerPosition(0);
    }
  }, [level?.id]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitPuzzle = () => {
    if (!selectedAnswer) return;

    const puzzle = gameData.puzzles[currentPuzzle];
    const isCorrect = selectedAnswer === puzzle.answer;

    if (isCorrect) {
      const newPosition = playerPosition + 1;
      setPlayerPosition(newPosition);

      if (currentPuzzle < gameData.puzzles.length - 1) {
        setTimeout(() => {
          setCurrentPuzzle(currentPuzzle + 1);
          setSelectedAnswer('');
        }, 500);
      } else {
        setTimeout(() => onSubmit(true), 1000);
      }
    } else {
      setSelectedAnswer('');
    }
  };

  if (!gameData) return null;

  const puzzle = gameData.puzzles[currentPuzzle];

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left Side - Path */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Start */}
            <Box sx={{
              width: 80,
              height: 80,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: playerPosition === 0 ? '#d4f4dd' : '#f3e8ff',
              border: '3px solid #6a0dad',
              borderRadius: 2,
              transition: 'all 0.5s'
            }}>
              {playerPosition === 0 && (
                <Typography sx={{ fontSize: '2.5rem' }}>🚶</Typography>
              )}
              <Typography sx={{ fontSize: '0.8rem', color: '#6a0dad', fontWeight: 600 }}>
                START
              </Typography>
            </Box>

            {/* Doors */}
            {gameData.puzzles.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 80,
                  height: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: playerPosition > index ? '#d4f4dd' : playerPosition === index + 1 ? '#fff4e6' : '#f3e8ff',
                  border: '3px solid',
                  borderColor: playerPosition > index ? '#10b981' : '#6a0dad',
                  borderRadius: 2,
                  transition: 'all 0.5s'
                }}
              >
                {playerPosition === index + 1 ? (
                  <Typography sx={{ fontSize: '2.5rem' }}>🚶</Typography>
                ) : playerPosition > index ? (
                  <Typography sx={{ fontSize: '2.5rem' }}>✅</Typography>
                ) : (
                  <Typography sx={{ fontSize: '2.5rem' }}>🚪</Typography>
                )}
                <Typography sx={{ fontSize: '0.7rem', color: '#6a0dad', fontWeight: 600 }}>
                  DOOR {index + 1}
                </Typography>
              </Box>
            ))}

            {/* Exit */}
            <Box sx={{
              width: 80,
              height: 80,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: playerPosition === gameData.puzzles.length + 1 ? '#ffd700' : '#f3e8ff',
              border: '3px solid',
              borderColor: playerPosition === gameData.puzzles.length + 1 ? '#10b981' : '#6a0dad',
              borderRadius: 2,
              transition: 'all 0.5s'
            }}>
              {playerPosition === gameData.puzzles.length + 1 ? (
                <Typography sx={{ fontSize: '2.5rem' }}>🎉</Typography>
              ) : (
                <Typography sx={{ fontSize: '2.5rem' }}>🏆</Typography>
              )}
              <Typography sx={{ fontSize: '0.8rem', color: '#6a0dad', fontWeight: 600 }}>
                EXIT
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Side - Puzzle */}
        <Box sx={{ flex: 1 }}>
          {playerPosition <= gameData.puzzles.length && (
            <Box sx={{ 
              bgcolor: '#f8f9fa', 
              p: 3, 
              borderRadius: 2, 
              border: '2px solid #6a0dad'
            }}>
              <Typography variant="h6" sx={{ color: '#6a0dad', fontWeight: 600, mb: 3 }}>
                🔐 Door {currentPuzzle + 1}: {puzzle.question}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                {puzzle.options.map((option, index) => (
                  <Box
                    key={index}
                    onClick={() => handleAnswerSelect(option.toString())}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: selectedAnswer === option.toString() ? '#6a0dad' : '#e5e7eb',
                      bgcolor: selectedAnswer === option.toString() ? '#f3e8ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#6a0dad',
                        transform: 'scale(1.02)'
                      }
                    }}
                  >
                    <Typography sx={{ 
                      color: selectedAnswer === option.toString() ? '#6a0dad' : '#374151',
                      fontWeight: selectedAnswer === option.toString() ? 600 : 400,
                      fontSize: '1.1rem'
                    }}>
                      {option}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleSubmitPuzzle}
                  disabled={!selectedAnswer}
                  sx={{
                    bgcolor: '#6a0dad',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': { bgcolor: '#5a0c9d' },
                    '&:disabled': { bgcolor: '#d1d5db' }
                  }}
                >
                  Unlock Door
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default EscapeRoomGame;
