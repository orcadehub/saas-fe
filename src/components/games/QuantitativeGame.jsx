import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Card, LinearProgress } from '@mui/material';

const generateQuestion = () => {
  const types = ['percentage', 'ratio', 'average', 'profit', 'time', 'si', 'ci', 'age', 'work', 'mixture', 'pipes', 'boats', 'trains', 'lcm', 'hcf'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  switch(type) {
    case 'percentage':
      const num = Math.floor(Math.random() * 500) + 100;
      const percent = [10, 20, 25, 30, 40, 50][Math.floor(Math.random() * 6)];
      const answer = (num * percent) / 100;
      return {
        question: `What is ${percent}% of ${num}?`,
        options: [answer, answer + 10, answer - 10, answer + 20].sort(() => Math.random() - 0.5),
        answer
      };
    
    case 'ratio':
      const a = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 5) + 2;
      const total = (a + b) * 10;
      const answerA = (total * a) / (a + b);
      return {
        question: `Divide ${total} in ratio ${a}:${b}. Larger share?`,
        options: [Math.max(answerA, total - answerA), answerA + 10, answerA - 10, total / 2].sort(() => Math.random() - 0.5),
        answer: Math.max(answerA, total - answerA)
      };
    
    case 'average':
      const nums = Array.from({length: 4}, () => Math.floor(Math.random() * 50) + 10);
      const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
      return {
        question: `Average of ${nums.join(', ')}?`,
        options: [avg, avg + 5, avg - 5, avg + 10].sort(() => Math.random() - 0.5),
        answer: avg
      };
    
    case 'profit':
      const cp = Math.floor(Math.random() * 500) + 200;
      const profitPercent = [10, 20, 25, 30][Math.floor(Math.random() * 4)];
      const sp = cp + (cp * profitPercent) / 100;
      return {
        question: `CP = ₹${cp}, Profit = ${profitPercent}%. Find SP?`,
        options: [sp, sp + 50, sp - 50, cp].sort(() => Math.random() - 0.5),
        answer: sp
      };
    
    case 'time':
      const speed = [40, 50, 60, 80][Math.floor(Math.random() * 4)];
      const time = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
      const distance = speed * time;
      return {
        question: `Speed ${speed} km/h for ${time} hours. Distance?`,
        options: [distance, distance + 20, distance - 20, distance + 40].sort(() => Math.random() - 0.5),
        answer: distance
      };
    
    case 'si':
      const principal = Math.floor(Math.random() * 5) * 1000 + 5000;
      const rate = [5, 10, 12, 15][Math.floor(Math.random() * 4)];
      const years = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
      const si = (principal * rate * years) / 100;
      return {
        question: `P = ₹${principal}, R = ${rate}%, T = ${years}yr. SI?`,
        options: [si, si + 100, si - 100, si + 200].sort(() => Math.random() - 0.5),
        answer: si
      };
    
    case 'ci':
      const p = [1000, 2000, 5000][Math.floor(Math.random() * 3)];
      const r = [10, 20][Math.floor(Math.random() * 2)];
      const t = [2, 3][Math.floor(Math.random() * 2)];
      const ci = p * Math.pow((1 + r/100), t) - p;
      return {
        question: `P = ₹${p}, R = ${r}%, T = ${t}yr. CI?`,
        options: [Math.round(ci), Math.round(ci + 50), Math.round(ci - 50), Math.round(ci + 100)].sort(() => Math.random() - 0.5),
        answer: Math.round(ci)
      };
    
    case 'age':
      const currentAge = Math.floor(Math.random() * 20) + 20;
      const yearsAgo = [5, 10, 15][Math.floor(Math.random() * 3)];
      const pastAge = currentAge - yearsAgo;
      return {
        question: `Current age ${currentAge}. Age ${yearsAgo} years ago?`,
        options: [pastAge, pastAge + 2, pastAge - 2, pastAge + 5].sort(() => Math.random() - 0.5),
        answer: pastAge
      };
    
    case 'work':
      const days1 = [10, 12, 15, 20][Math.floor(Math.random() * 4)];
      const days2 = [15, 18, 20, 30][Math.floor(Math.random() * 4)];
      const combined = (days1 * days2) / (days1 + days2);
      return {
        question: `A completes in ${days1} days, B in ${days2} days. Together?`,
        options: [Math.round(combined * 10) / 10, Math.round((combined + 1) * 10) / 10, Math.round((combined - 1) * 10) / 10, Math.round((combined + 2) * 10) / 10].sort(() => Math.random() - 0.5),
        answer: Math.round(combined * 10) / 10
      };
    
    case 'mixture':
      const qty1 = Math.floor(Math.random() * 5) + 5;
      const qty2 = Math.floor(Math.random() * 5) + 5;
      const totalQty = qty1 + qty2;
      return {
        question: `Mix ${qty1}L of A with ${qty2}L of B. Total?`,
        options: [totalQty, totalQty + 1, totalQty - 1, totalQty + 2].sort(() => Math.random() - 0.5),
        answer: totalQty
      };
    
    case 'pipes':
      const fillTime = [10, 12, 15, 20][Math.floor(Math.random() * 4)];
      const emptyTime = [15, 20, 25, 30][Math.floor(Math.random() * 4)];
      const netTime = (fillTime * emptyTime) / (emptyTime - fillTime);
      return {
        question: `Pipe A fills in ${fillTime}h, B empties in ${emptyTime}h. Both open, time to fill?`,
        options: [Math.round(netTime), Math.round(netTime + 2), Math.round(netTime - 2), Math.round(netTime + 5)].sort(() => Math.random() - 0.5),
        answer: Math.round(netTime)
      };
    
    case 'boats':
      const boatSpeed = [10, 12, 15, 20][Math.floor(Math.random() * 4)];
      const streamSpeed = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
      const downstream = boatSpeed + streamSpeed;
      return {
        question: `Boat speed ${boatSpeed} km/h, stream ${streamSpeed} km/h. Downstream speed?`,
        options: [downstream, downstream + 2, downstream - 2, boatSpeed].sort(() => Math.random() - 0.5),
        answer: downstream
      };
    
    case 'trains':
      const trainSpeed = [60, 72, 90, 108][Math.floor(Math.random() * 4)];
      const trainLength = [100, 150, 200, 250][Math.floor(Math.random() * 4)];
      const timeSeconds = (trainLength / (trainSpeed * 1000 / 3600));
      return {
        question: `Train ${trainLength}m long, speed ${trainSpeed} km/h. Time to cross a pole?`,
        options: [Math.round(timeSeconds), Math.round(timeSeconds + 1), Math.round(timeSeconds - 1), Math.round(timeSeconds + 2)].sort(() => Math.random() - 0.5),
        answer: Math.round(timeSeconds)
      };
    
    case 'lcm':
      const num1 = [4, 6, 8, 10, 12][Math.floor(Math.random() * 5)];
      const num2 = [6, 8, 10, 12, 15][Math.floor(Math.random() * 5)];
      const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
      const lcm = (num1 * num2) / gcd(num1, num2);
      return {
        question: `LCM of ${num1} and ${num2}?`,
        options: [lcm, lcm + num1, lcm - num1, lcm + num2].sort(() => Math.random() - 0.5),
        answer: lcm
      };
    
    case 'hcf':
      const n1 = [12, 18, 24, 30, 36][Math.floor(Math.random() * 5)];
      const n2 = [18, 24, 30, 36, 48][Math.floor(Math.random() * 5)];
      const gcdFunc = (a, b) => b === 0 ? a : gcdFunc(b, a % b);
      const hcf = gcdFunc(n1, n2);
      return {
        question: `HCF of ${n1} and ${n2}?`,
        options: [hcf, hcf + 2, hcf - 2, hcf * 2].sort(() => Math.random() - 0.5),
        answer: hcf
      };
    
    default:
      return generateQuestion();
  }
};

const QuantitativeGame = ({ difficulty = 'Easy', onComplete, onQuestionChange }) => {
  const totalQuestions = 20;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setQuestion(generateQuestion());
    if (onQuestionChange) onQuestionChange(currentQuestion + 1, totalQuestions);
  }, [currentQuestion]);

  const handleSubmit = () => {
    const isCorrect = selected === question.answer;
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback('✓ Correct!');
    } else {
      setFeedback(`✗ Wrong! Correct: ${question.answer}`);
    }

    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelected(null);
        setFeedback('');
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

  if (!question) return null;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>{question.question}</Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          {question.options.map((option, idx) => (
            <Box
              key={idx}
              onClick={() => !feedback && setSelected(option)}
              sx={{
                p: 2,
                border: '3px solid',
                borderColor: selected === option ? 'primary.main' : 'grey.400',
                borderRadius: 2,
                bgcolor: selected === option ? 'primary.light' : 'background.paper',
                cursor: feedback ? 'default' : 'pointer',
                transition: 'all 0.2s',
                '&:hover': feedback ? {} : { borderColor: 'primary.main', transform: 'scale(1.02)' }
              }}
            >
              <Typography variant="h6">{option}</Typography>
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

export default QuantitativeGame;
