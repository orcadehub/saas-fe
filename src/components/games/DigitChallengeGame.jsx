import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Card, TextField, LinearProgress } from '@mui/material';

const generateEquation = (numDigits) => {
  const operators = ['+', '-', '*'];
  let digits = [];
  let ops = [];
  
  // Generate unique random digits (1-9)
  const availableDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < numDigits; i++) {
    const randomIndex = Math.floor(Math.random() * availableDigits.length);
    digits.push(availableDigits[randomIndex]);
    availableDigits.splice(randomIndex, 1);
  }
  
  // Generate operators (one less than digits)
  for (let i = 0; i < numDigits - 1; i++) {
    ops.push(operators[Math.floor(Math.random() * operators.length)]);
  }
  
  // Build equation string and calculate answer
  let equation = '';
  for (let i = 0; i < numDigits; i++) {
    equation += 'x';
    if (i < ops.length) {
      equation += ops[i];
    }
  }
  
  // Calculate answer
  let answerEquation = '';
  for (let i = 0; i < numDigits; i++) {
    answerEquation += digits[i];
    if (i < ops.length) {
      answerEquation += ops[i];
    }
  }
  const answer = eval(answerEquation);
  
  // Generate 3x3 matrix including the correct digits
  const matrixDigits = [...digits]; // Start with correct digits
  
  // Add random digits to fill the matrix
  while (matrixDigits.length < 9) {
    const randomDigit = Math.floor(Math.random() * 9) + 1;
    if (!matrixDigits.includes(randomDigit)) {
      matrixDigits.push(randomDigit);
    }
  }
  
  // Shuffle matrix digits
  for (let i = matrixDigits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [matrixDigits[i], matrixDigits[j]] = [matrixDigits[j], matrixDigits[i]];
  }
  const matrix = [
    matrixDigits.slice(0, 3),
    matrixDigits.slice(3, 6),
    matrixDigits.slice(6, 9)
  ];
  
  return { equation, digits, answer, matrix };
};

const DigitChallengeGame = ({ difficulty = 'Easy', onComplete }) => {
  const config = {
    Easy: { numDigits: 3, questions: 20 },
    Medium: { numDigits: 4, questions: 20 },
    Hard: { numDigits: 5, questions: 20 }
  };

  const { numDigits, questions: totalQuestions } = config[difficulty];
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [equation, setEquation] = useState('');
  const [correctDigits, setCorrectDigits] = useState([]);
  const [answer, setAnswer] = useState(0);
  const [matrix, setMatrix] = useState([]);
  const [userInputs, setUserInputs] = useState([]);
  const [usedDigits, setUsedDigits] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    startNewQuestion();
  }, [currentQuestion]);

  const startNewQuestion = () => {
    const { equation: eq, digits, answer: ans, matrix: mat } = generateEquation(numDigits);
    setEquation(eq);
    setCorrectDigits(digits);
    setAnswer(ans);
    setMatrix(mat);
    setUserInputs(Array(numDigits).fill(''));
    setUsedDigits([]);
    setFeedback('');
    setSelectedIndex(null);
  };

  const handleMatrixClick = (num) => {
    if (selectedIndex !== null && !feedback && !usedDigits.includes(num)) {
      const newInputs = [...userInputs];
      const oldValue = newInputs[selectedIndex];
      newInputs[selectedIndex] = num.toString();
      setUserInputs(newInputs);
      
      const newUsedDigits = [...usedDigits];
      if (oldValue) {
        const oldIndex = newUsedDigits.indexOf(parseInt(oldValue));
        if (oldIndex > -1) newUsedDigits.splice(oldIndex, 1);
      }
      newUsedDigits.push(num);
      setUsedDigits(newUsedDigits);
      
      setSelectedIndex(null);
    }
  };

  const handleInputClick = (index) => {
    if (!feedback) {
      setSelectedIndex(index);
    }
  };

  const handleRemove = (index) => {
    if (!feedback) {
      const newInputs = [...userInputs];
      const removedValue = newInputs[index];
      newInputs[index] = '';
      setUserInputs(newInputs);
      
      if (removedValue) {
        const newUsedDigits = [...usedDigits];
        const digitIndex = newUsedDigits.indexOf(parseInt(removedValue));
        if (digitIndex > -1) newUsedDigits.splice(digitIndex, 1);
        setUsedDigits(newUsedDigits);
      }
    }
  };

  const handleSubmit = () => {
    const isCorrect = userInputs.every((input, idx) => parseInt(input) === correctDigits[idx]);
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback('✓ Correct!');
    } else {
      setFeedback(`✗ Wrong! Correct: ${correctDigits.join(', ')}`);
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
        <Typography variant="h5" sx={{ mb: 3 }}>
          Score: {score}/{totalQuestions}
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Accuracy: {((score / totalQuestions) * 100).toFixed(1)}%
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Play Again
        </Button>
      </Box>
    );
  }

  const equationParts = equation.split('x').filter(p => p);
  const allFilled = userInputs.every(input => input !== '');

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Card sx={{ p: 4, textAlign: 'center', minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
          Click on a box below, then select a digit from the grid:
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {userInputs.map((input, idx) => (
            <React.Fragment key={idx}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Box
                  onClick={() => handleInputClick(idx)}
                  sx={{
                    width: 70,
                    height: 70,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid',
                    borderColor: selectedIndex === idx ? 'primary.main' : 'grey.400',
                    borderRadius: 2,
                    fontSize: '2rem',
                    fontWeight: 600,
                    bgcolor: selectedIndex === idx ? 'primary.light' : 'background.paper',
                    cursor: feedback ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': feedback ? {} : { borderColor: 'primary.main', transform: 'scale(1.05)' }
                  }}
                >
                  {input || '?'}
                </Box>
                {input && !feedback && (
                  <Button
                    size="small"
                    onClick={() => handleRemove(idx)}
                    sx={{ minWidth: 'auto', px: 1, py: 0.5, fontSize: '0.7rem' }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
              {idx < equationParts.length && (
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {equationParts[idx]}
                </Typography>
              )}
            </React.Fragment>
          ))}
          <Typography variant="h4" sx={{ fontWeight: 600, ml: 1 }}>
            = {answer}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>
          Select digits from the grid:
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 3 }}>
          {matrix.map((row, rowIdx) => (
            <Box key={rowIdx} sx={{ display: 'flex', gap: 1 }}>
              {row.map((num, colIdx) => (
                <Box
                  key={colIdx}
                  onClick={() => handleMatrixClick(num)}
                  sx={{
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid',
                    borderColor: usedDigits.includes(num) ? 'grey.300' : 'primary.main',
                    borderRadius: 1,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    bgcolor: usedDigits.includes(num) ? 'grey.200' : 'background.paper',
                    cursor: selectedIndex !== null && !feedback && !usedDigits.includes(num) ? 'pointer' : 'default',
                    opacity: usedDigits.includes(num) ? 0.4 : 1,
                    transition: 'all 0.2s',
                    '&:hover': selectedIndex !== null && !feedback && !usedDigits.includes(num) ? { bgcolor: 'primary.light', transform: 'scale(1.1)' } : {}
                  }}
                >
                  {num}
                </Box>
              ))}
            </Box>
          ))}
        </Box>

        {feedback && (
          <Typography 
            variant="h6" 
            sx={{ 
              mt: 3, 
              color: feedback.includes('✓') ? 'success.main' : 'error.main',
              fontWeight: 600
            }}
          >
            {feedback}
          </Typography>
        )}
        
        {!feedback && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!allFilled}
            sx={{ mt: 3, px: 4, py: 1.5 }}
          >
            Submit
          </Button>
        )}
      </Card>
    </Box>
  );
};

export default DigitChallengeGame;
