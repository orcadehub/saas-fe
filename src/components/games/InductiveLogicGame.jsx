import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Card, LinearProgress } from '@mui/material';

const generatePattern = (difficulty, questionNumber) => {
  const seed = questionNumber * (difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 100 : 1000);
  const random = () => {
    const x = Math.sin(seed + questionNumber) * 10000;
    return x - Math.floor(x);
  };
  
  const patternTypes = difficulty === 'Easy' 
    ? ['arithmetic', 'geometric', 'squares', 'cubes']
    : difficulty === 'Medium'
    ? ['arithmetic', 'geometric', 'squares', 'cubes', 'fibonacci', 'prime', 'triangular']
    : ['arithmetic', 'geometric', 'squares', 'cubes', 'fibonacci', 'prime', 'triangular', 'harmonic', 'factorial', 'powers'];
  
  const type = patternTypes[Math.floor(random() * patternTypes.length)];
  
  if (type === 'arithmetic') {
    const start = Math.floor(random() * 20) + 1;
    const diff = Math.floor(random() * 10) + 2;
    const sequence = [start, start + diff, start + 2*diff, start + 3*diff];
    const answer = start + 4*diff;
    return { sequence, answer, options: [answer, answer + diff, answer - diff, answer + 2*diff].sort(() => random() - 0.5) };
  } else if (type === 'geometric') {
    const start = Math.floor(random() * 5) + 2;
    const ratio = Math.floor(random() * 3) + 2;
    const sequence = [start, start*ratio, start*ratio*ratio, start*ratio*ratio*ratio];
    const answer = start*ratio*ratio*ratio*ratio;
    return { sequence, answer, options: [answer, answer*ratio, answer/ratio, answer+start].sort(() => random() - 0.5) };
  } else if (type === 'squares') {
    const start = Math.floor(random() * 5) + 1;
    const sequence = [start*start, (start+1)*(start+1), (start+2)*(start+2), (start+3)*(start+3)];
    const answer = (start+4)*(start+4);
    return { sequence, answer, options: [answer, answer+1, answer-1, answer+5].sort(() => random() - 0.5) };
  } else if (type === 'cubes') {
    const start = Math.floor(random() * 4) + 1;
    const sequence = [start**3, (start+1)**3, (start+2)**3, (start+3)**3];
    const answer = (start+4)**3;
    return { sequence, answer, options: [answer, answer+1, answer-1, answer+10].sort(() => random() - 0.5) };
  } else if (type === 'fibonacci') {
    const a = Math.floor(random() * 5) + 1;
    const b = Math.floor(random() * 5) + 2;
    const sequence = [a, b, a+b, a+2*b];
    const answer = 2*a + 3*b;
    return { sequence, answer, options: [answer, answer+1, answer-1, answer+2].sort(() => random() - 0.5) };
  } else if (type === 'prime') {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const start = Math.floor(random() * 8);
    const sequence = primes.slice(start, start + 4);
    const answer = primes[start + 4];
    return { sequence, answer, options: [answer, answer+1, answer+2, answer-1].sort(() => random() - 0.5) };
  } else if (type === 'triangular') {
    const start = Math.floor(random() * 5) + 1;
    const tri = (n) => n * (n + 1) / 2;
    const sequence = [tri(start), tri(start+1), tri(start+2), tri(start+3)];
    const answer = tri(start+4);
    return { sequence, answer, options: [answer, answer+1, answer-1, answer+2].sort(() => random() - 0.5) };
  } else if (type === 'harmonic') {
    const mult = Math.floor(random() * 50) + 20;
    const sequence = [mult/1, mult/2, mult/3, mult/4].map(n => Math.round(n));
    const answer = Math.round(mult/5);
    return { sequence, answer, options: [answer, answer+1, answer-1, answer+2].sort(() => random() - 0.5) };
  } else if (type === 'factorial') {
    const start = Math.floor(random() * 3) + 2;
    const fact = (n) => n <= 1 ? 1 : n * fact(n-1);
    const sequence = [fact(start), fact(start+1), fact(start+2), fact(start+3)];
    const answer = fact(start+4);
    return { sequence, answer, options: [answer, answer+10, answer-10, answer+20].sort(() => random() - 0.5) };
  } else if (type === 'powers') {
    const base = Math.floor(random() * 3) + 2;
    const start = Math.floor(random() * 3) + 1;
    const sequence = [base**start, base**(start+1), base**(start+2), base**(start+3)];
    const answer = base**(start+4);
    return { sequence, answer, options: [answer, answer+base, answer-base, answer+10].sort(() => random() - 0.5) };
  }
};

const InductiveLogicGame = ({ difficulty = 'Easy', onComplete }) => {
  const totalQuestions = 20;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [pattern, setPattern] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    startNewQuestion();
  }, [currentQuestion]);

  const startNewQuestion = () => {
    setPattern(generatePattern(difficulty, currentQuestion));
    setSelected(null);
    setFeedback('');
  };

  const handleSubmit = () => {
    const isCorrect = selected === pattern.answer;
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback('✓ Correct!');
    } else {
      setFeedback(`✗ Wrong! Correct: ${pattern.answer}`);
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

  if (!pattern) return null;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
          Find the next number in the sequence:
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          {pattern.sequence.map((num, idx) => (
            <Box
              key={idx}
              sx={{
                width: 70,
                height: 70,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid',
                borderColor: 'primary.main',
                borderRadius: 2,
                bgcolor: 'primary.light'
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.dark' }}>{num}</Typography>
            </Box>
          ))}
          <Box
            sx={{
              width: 70,
              height: 70,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid',
              borderColor: 'warning.main',
              borderRadius: 2,
              bgcolor: 'warning.light'
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.dark' }}>?</Typography>
          </Box>
        </Box>

        <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>Select your answer:</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {pattern.options.map((option) => (
            <Box
              key={option}
              onClick={() => !feedback && setSelected(option)}
              sx={{
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid',
                borderColor: selected === option ? 'primary.main' : 'grey.400',
                borderRadius: 2,
                bgcolor: selected === option ? 'primary.light' : 'background.paper',
                cursor: feedback ? 'default' : 'pointer',
                transition: 'all 0.2s',
                '&:hover': feedback ? {} : { borderColor: 'primary.main', transform: 'scale(1.1)' }
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{option}</Typography>
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

export default InductiveLogicGame;
