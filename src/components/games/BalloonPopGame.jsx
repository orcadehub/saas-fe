import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Refresh, Lightbulb } from '@mui/icons-material';

const BalloonPopGame = ({ level, onSubmit, onHint, themeColor = '#6a0dad' }) => {
  const [gameData, setGameData] = useState(null);
  const [poppedBalloons, setPoppedBalloons] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [shuffledBalloons, setShuffledBalloons] = useState([]);
  const [poppingBalloon, setPoppingBalloon] = useState(null);

  useEffect(() => {
    if (level?.correctAnswer) {
      const data = JSON.parse(level.correctAnswer);
      
      // Generate math operations for balloons
      const operations = [];
      const usedResults = new Set();
      
      for (let i = 0; i < data.balloons.length; i++) {
        const targetResult = data.balloons[i];
        let operation;
        
        // Generate different types of operations
        const opType = Math.floor(Math.random() * 4);
        
        if (opType === 0) { // Addition
          const a = Math.floor(Math.random() * targetResult) + 1;
          const b = targetResult - a;
          operation = `${a} + ${b}`;
        } else if (opType === 1) { // Subtraction
          const a = targetResult + Math.floor(Math.random() * 20) + 1;
          const b = a - targetResult;
          operation = `${a} - ${b}`;
        } else if (opType === 2) { // Multiplication
          const factors = [];
          for (let j = 1; j <= targetResult; j++) {
            if (targetResult % j === 0 && j <= 12) factors.push(j);
          }
          if (factors.length > 1) {
            const a = factors[Math.floor(Math.random() * factors.length)];
            const b = targetResult / a;
            operation = `${a} × ${b}`;
          } else {
            const a = Math.floor(Math.random() * targetResult) + 1;
            operation = `${a} + ${targetResult - a}`;
          }
        } else { // Division
          const a = targetResult * (Math.floor(Math.random() * 10) + 2);
          const b = a / targetResult;
          operation = `${a} ÷ ${b}`;
        }
        
        operations.push({ operation, result: targetResult });
      }
      
      setGameData({ ...data, operations });
      setShuffledBalloons([...operations].sort(() => Math.random() - 0.5));
      setPoppedBalloons([]);
      setUserSequence([]);
      setShowHint(false);
    }
  }, [level]);

  const handleBalloonClick = (balloonData) => {
    if (poppedBalloons.includes(balloonData.result) || poppingBalloon) return;
    
    setPoppingBalloon(balloonData.result);
    
    setTimeout(() => {
      const newSequence = [...userSequence, balloonData.result];
      setPoppedBalloons([...poppedBalloons, balloonData.result]);
      setUserSequence(newSequence);
      setPoppingBalloon(null);
      
      // Auto-submit when all required balloons are popped
      if (newSequence.length === gameData.answer.length) {
        setTimeout(() => {
          const isCorrect = JSON.stringify(newSequence) === JSON.stringify(gameData.answer);
          onSubmit(isCorrect);
        }, 500);
      }
    }, 300);
  };

  const handleReset = () => {
    setPoppedBalloons([]);
    setUserSequence([]);
    setShowHint(false);
    setShuffledBalloons([...gameData.operations].sort(() => Math.random() - 0.5));
  };

  const handleHintClick = () => {
    setShowHint(true);
    onHint();
  };

  // Expose reset and hint functions to parent
  useEffect(() => {
    if (level) {
      level.resetGame = handleReset;
      level.showHintFunc = handleHintClick;
    }
  }, [level, gameData]);

  if (!gameData) return null;

  const balloonColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'];

  return (
    <Box sx={{ width: '100%', display: 'flex', gap: 3 }}>
      {/* Left Side - Instructions */}
      <Box sx={{ flex: 1 }}>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleReset}
          sx={{ borderColor: themeColor, color: themeColor, mb: 3 }}
        >
          Reset
        </Button>

        {userSequence.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
              Your Sequence:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {userSequence.map((num, idx) => (
                <Box
                  key={idx}
                  sx={{
                    px: 2,
                    py: 1,
                    bgcolor: themeColor,
                    color: '#fff',
                    borderRadius: '8px',
                    fontWeight: 600
                  }}
                >
                  {num}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Right Side - Balloons */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 4, 
          justifyContent: 'center',
          minHeight: '400px',
          alignItems: 'center',
          p: 3
        }}>
          {shuffledBalloons.map((balloonData, index) => {
          const isPopped = poppedBalloons.includes(balloonData.result);
          const isPopping = poppingBalloon === balloonData.result;
          const color = balloonColors[index % balloonColors.length];
          
          return (
            <Box
              key={index}
              onClick={() => handleBalloonClick(balloonData)}
              sx={{
                position: 'relative',
                cursor: isPopped || isPopping ? 'default' : 'pointer',
                animation: isPopping ? 'pop 0.3s ease-out forwards' : isPopped ? 'none' : 'float 3s ease-in-out infinite',
                animationDelay: isPopping ? '0s' : `${index * 0.2}s`,
                opacity: isPopped ? 0 : 1,
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-20px)' }
                },
                '@keyframes pop': {
                  '0%': { transform: 'scale(1)', opacity: 1 },
                  '50%': { transform: 'scale(1.4) rotate(10deg)', opacity: 0.8 },
                  '100%': { transform: 'scale(0) rotate(20deg)', opacity: 0 }
                }
              }}
            >
              {!isPopped && (
                <>
                  <Box sx={{
                    width: '100px',
                    height: '120px',
                    bgcolor: color,
                    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `inset -10px -10px 20px rgba(0,0,0,0.2), inset 10px 10px 20px rgba(255,255,255,0.3)`,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '20px',
                      left: '25px',
                      width: '20px',
                      height: '25px',
                      bgcolor: 'rgba(255,255,255,0.4)',
                      borderRadius: '50%',
                      filter: 'blur(3px)'
                    }
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: '#fff', 
                      fontWeight: 700,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                      zIndex: 1
                    }}>
                      {balloonData.operation}
                    </Typography>
                  </Box>
                  
                  <Box sx={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '2px',
                    height: '30px',
                    bgcolor: '#666'
                  }} />
                  
                  <Box sx={{
                    position: 'absolute',
                    bottom: '-35px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '8px',
                    height: '8px',
                    bgcolor: color,
                    borderRadius: '50%'
                  }} />
                </>
              )}
            </Box>
          );
        })}
        </Box>
      </Box>
    </Box>
  );
};

export default BalloonPopGame;
