import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Card, LinearProgress } from '@mui/material';

// ── Utility helpers ──
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const tri = (n) => (n * (n + 1)) / 2;
const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
};
const nthPrime = (n) => {
  let count = 0;
  let num = 1;
  while (count < n) {
    num++;
    if (isPrime(num)) count++;
  }
  return num;
};

// ── Sequence Generators ──
// Each returns { sequence: number[], answer: number }

const generators = {
  // ─── EASY PATTERNS ───
  // 1. Arithmetic: a, a+d, a+2d, ...
  arithmeticAdd: (diff) => {
    const d = diff === 'Hard' ? rand(7, 25) : diff === 'Medium' ? rand(3, 12) : rand(2, 8);
    const a = rand(1, 30);
    const len = diff === 'Hard' ? 6 : diff === 'Medium' ? 5 : 4;
    const seq = Array.from({ length: len }, (_, i) => a + i * d);
    return { sequence: seq, answer: a + len * d };
  },

  // 2. Arithmetic subtract: a, a-d, a-2d ...
  arithmeticSub: (diff) => {
    const d = diff === 'Hard' ? rand(5, 15) : rand(2, 8);
    const a = rand(80, 200);
    const len = diff === 'Hard' ? 6 : 4;
    const seq = Array.from({ length: len }, (_, i) => a - i * d);
    return { sequence: seq, answer: a - len * d };
  },

  // 3. Geometric multiply
  geometric: (diff) => {
    const r = diff === 'Hard' ? rand(3, 5) : rand(2, 4);
    const a = rand(1, 6);
    const len = diff === 'Hard' ? 5 : 4;
    const seq = Array.from({ length: len }, (_, i) => a * Math.pow(r, i));
    return { sequence: seq, answer: a * Math.pow(r, len) };
  },

  // 4. Geometric divide
  geometricDiv: (diff) => {
    const r = pick([2, 3, 4]);
    const power = diff === 'Hard' ? 6 : 5;
    const a = rand(1, 3) * Math.pow(r, power);
    const len = diff === 'Hard' ? 5 : 4;
    const seq = Array.from({ length: len }, (_, i) => a / Math.pow(r, i));
    return { sequence: seq, answer: a / Math.pow(r, len) };
  },

  // 5. Perfect squares: n², (n+1)², ...
  squares: (diff) => {
    const n = rand(1, diff === 'Hard' ? 12 : 7);
    const len = diff === 'Hard' ? 5 : 4;
    const seq = Array.from({ length: len }, (_, i) => (n + i) ** 2);
    return { sequence: seq, answer: (n + len) ** 2 };
  },

  // 6. Perfect cubes
  cubes: (diff) => {
    const n = rand(1, diff === 'Hard' ? 8 : 5);
    const len = diff === 'Hard' ? 5 : 4;
    const seq = Array.from({ length: len }, (_, i) => (n + i) ** 3);
    return { sequence: seq, answer: (n + len) ** 3 };
  },

  // ─── MEDIUM PATTERNS ───
  // 7. Fibonacci-style: each = sum of previous 2
  fibonacci: () => {
    const a = rand(1, 8),
      b = rand(1, 8);
    const seq = [a, b];
    for (let i = 2; i < 5; i++) seq.push(seq[i - 1] + seq[i - 2]);
    const answer = seq[4] + seq[3];
    return { sequence: seq, answer };
  },

  // 8. Prime sequence
  primeSeq: (diff) => {
    const start = rand(1, diff === 'Hard' ? 20 : 10);
    const len = diff === 'Hard' ? 6 : 5;
    const seq = Array.from({ length: len }, (_, i) => nthPrime(start + i));
    return { sequence: seq, answer: nthPrime(start + len) };
  },

  // 9. Triangular numbers: n(n+1)/2
  triangular: (diff) => {
    const n = rand(1, diff === 'Hard' ? 10 : 6);
    const len = diff === 'Hard' ? 5 : 4;
    const seq = Array.from({ length: len }, (_, i) => tri(n + i));
    return { sequence: seq, answer: tri(n + len) };
  },

  // 10. Alternating add/subtract: +a, -b, +a, -b
  alternating: (diff) => {
    const a = rand(3, diff === 'Hard' ? 15 : 8);
    const b = rand(1, diff === 'Hard' ? 10 : 5);
    const start = rand(10, 50);
    const seq = [start];
    for (let i = 1; i < (diff === 'Hard' ? 7 : 5); i++) {
      seq.push(seq[i - 1] + (i % 2 === 1 ? a : -b));
    }
    const len = seq.length;
    const answer = seq[len - 1] + (len % 2 === 1 ? a : -b);
    return { sequence: seq, answer };
  },

  // 11. Differences increase: d1, d2=d1+k, d3=d2+k, ...
  increasingDiff: (diff) => {
    const k = rand(1, diff === 'Hard' ? 7 : 4);
    const firstDiff = rand(1, 5);
    const start = rand(1, 20);
    const len = diff === 'Hard' ? 6 : 5;
    const seq = [start];
    let d = firstDiff;
    for (let i = 1; i < len; i++) {
      seq.push(seq[i - 1] + d);
      d += k;
    }
    return { sequence: seq, answer: seq[len - 1] + d };
  },

  // 12. Multiply then add: x*r + c
  multiplyAdd: (diff) => {
    const r = rand(2, diff === 'Hard' ? 4 : 3);
    const c = rand(1, diff === 'Hard' ? 10 : 5);
    const start = rand(1, 5);
    const len = diff === 'Hard' ? 5 : 4;
    const seq = [start];
    for (let i = 1; i < len; i++) seq.push(seq[i - 1] * r + c);
    return { sequence: seq, answer: seq[len - 1] * r + c };
  },

  // 13. Double and subtract
  doubleSub: (diff) => {
    const c = rand(1, diff === 'Hard' ? 8 : 4);
    const start = rand(2, 10);
    const len = diff === 'Hard' ? 6 : 4;
    const seq = [start];
    for (let i = 1; i < len; i++) seq.push(seq[i - 1] * 2 - c);
    return { sequence: seq, answer: seq[len - 1] * 2 - c };
  },

  // 14. Interleaved: two separate sequences interleaved
  interleaved: (diff) => {
    const a1 = rand(1, 10),
      d1 = rand(2, 6);
    const a2 = rand(20, 40),
      d2 = rand(3, 7);
    const len = diff === 'Hard' ? 8 : 6;
    const seq = [];
    for (let i = 0; i < len; i++) {
      seq.push(i % 2 === 0 ? a1 + (i / 2) * d1 : a2 + Math.floor(i / 2) * d2);
    }
    const answer = len % 2 === 0 ? a1 + (len / 2) * d1 : a2 + Math.floor(len / 2) * d2;
    return { sequence: seq, answer };
  },

  // ─── HARD PATTERNS ───
  // 15. n² + n: n(n+1)
  nSquarePlusN: () => {
    const s = rand(1, 6);
    const len = 5;
    const seq = Array.from({ length: len }, (_, i) => {
      const n = s + i;
      return n * n + n;
    });
    const n = s + len;
    return { sequence: seq, answer: n * n + n };
  },

  // 16. Sum of digits pattern: multiply by constant, take result
  powerAlternate: () => {
    const base = rand(2, 4);
    const seq = Array.from({ length: 5 }, (_, i) => base ** i + base ** (i + 1));
    return { sequence: seq, answer: base ** 5 + base ** 6 };
  },

  // 17. Factorial sequence
  factorial: () => {
    const s = rand(1, 4);
    const seq = Array.from({ length: 4 }, (_, i) => fact(s + i));
    return { sequence: seq, answer: fact(s + 4) };
  },

  // 18. Catalan-like: C(n) = (2n)! / ((n+1)! * n!)
  catalan: () => {
    const catNum = (n) => fact(2 * n) / (fact(n + 1) * fact(n));
    const seq = Array.from({ length: 5 }, (_, i) => catNum(i + 1));
    return { sequence: seq, answer: catNum(6) };
  },

  // 19. Pentagonal numbers: n(3n-1)/2
  pentagonal: () => {
    const s = rand(1, 5);
    const pent = (n) => (n * (3 * n - 1)) / 2;
    const seq = Array.from({ length: 5 }, (_, i) => pent(s + i));
    return { sequence: seq, answer: pent(s + 5) };
  },

  // 20. Hexagonal numbers: n(2n-1)
  hexagonal: () => {
    const s = rand(1, 5);
    const hex = (n) => n * (2 * n - 1);
    const seq = Array.from({ length: 5 }, (_, i) => hex(s + i));
    return { sequence: seq, answer: hex(s + 5) };
  },

  // 21. Square + constant offset
  squarePlusK: (diff) => {
    const k = rand(1, diff === 'Hard' ? 20 : 10);
    const s = rand(1, 6);
    const seq = Array.from({ length: 5 }, (_, i) => (s + i) ** 2 + k);
    return { sequence: seq, answer: (s + 5) ** 2 + k };
  },

  // 22. Multiply by position: a[i] = a[0] * (i+1)
  positionalMultiply: () => {
    const a = rand(3, 15);
    const seq = Array.from({ length: 5 }, (_, i) => a * (i + 1));
    return { sequence: seq, answer: a * 6 };
  },

  // 23. Cube minus square: n³ - n²
  cubeMinusSquare: () => {
    const s = rand(1, 5);
    const seq = Array.from({ length: 5 }, (_, i) => {
      const n = s + i;
      return n ** 3 - n ** 2;
    });
    return { sequence: seq, answer: (s + 5) ** 3 - (s + 5) ** 2 };
  },

  // 24. Differences are prime: diff between consecutive terms are consecutive primes
  diffPrime: () => {
    const start = rand(1, 20);
    const seq = [start];
    for (let i = 1; i <= 5; i++) seq.push(seq[i - 1] + nthPrime(i));
    return { sequence: seq, answer: seq[5] + nthPrime(6) };
  },

  // 25. Alternating multiply/divide
  altMultDiv: () => {
    const m = rand(2, 4);
    const start = rand(2, 6);
    const seq = [start];
    for (let i = 1; i < 6; i++) {
      seq.push(i % 2 === 1 ? seq[i - 1] * m : seq[i - 1] / 2);
    }
    if (seq.some((n) => !Number.isInteger(n))) return generators.arithmetic('Medium');
    const answer = 6 % 2 === 1 ? seq[5] * m : seq[5] / 2;
    return { sequence: seq, answer };
  },

  // 26. Running sum: each term = sum of all previous terms
  runningSum: () => {
    const seq = [rand(1, 5), rand(1, 5)];
    for (let i = 2; i < 5; i++) seq.push(seq.reduce((a, b) => a + b, 0));
    return { sequence: seq, answer: seq.reduce((a, b) => a + b, 0) };
  },

  // 27. Powers of 2 plus offset
  pow2Offset: () => {
    const k = rand(-5, 10);
    const s = rand(0, 3);
    const seq = Array.from({ length: 5 }, (_, i) => Math.pow(2, s + i) + k);
    return { sequence: seq, answer: Math.pow(2, s + 5) + k };
  },

  // 28. Differences are squares: diff = 1², 2², 3², ...
  diffSquares: () => {
    const start = rand(1, 15);
    const seq = [start];
    for (let i = 1; i <= 5; i++) seq.push(seq[i - 1] + i * i);
    return { sequence: seq, answer: seq[5] + 36 };
  },

  // 29. Product of digits of position
  multiplyPosition: () => {
    const base = rand(2, 8);
    const offset = rand(1, 5);
    const seq = Array.from({ length: 5 }, (_, i) => base * (i + offset) + (i + offset));
    return { sequence: seq, answer: base * (5 + offset) + (5 + offset) };
  },

  // 30. Oblong numbers: n(n+2)
  oblong: () => {
    const s = rand(1, 6);
    const seq = Array.from({ length: 5 }, (_, i) => (s + i) * (s + i + 2));
    return { sequence: seq, answer: (s + 5) * (s + 5 + 2) };
  },

  // 31. Star numbers: 6n(n-1)+1
  star: () => {
    const s = rand(1, 4);
    const star = (n) => 6 * n * (n - 1) + 1;
    const seq = Array.from({ length: 5 }, (_, i) => star(s + i));
    return { sequence: seq, answer: star(s + 5) };
  },

  // 32. Centered square: 2n²-2n+1
  centeredSquare: () => {
    const s = rand(1, 5);
    const cs = (n) => 2 * n * n - 2 * n + 1;
    const seq = Array.from({ length: 5 }, (_, i) => cs(s + i));
    return { sequence: seq, answer: cs(s + 5) };
  },

  // 33. Lazy Caterer: n²+n+2 / 2
  lazyCaterer: () => {
    const s = rand(1, 6);
    const lc = (n) => (n * n + n + 2) / 2;
    const seq = Array.from({ length: 5 }, (_, i) => lc(s + i));
    return { sequence: seq, answer: lc(s + 5) };
  },

  // 34. Differences are cubes
  diffCubes: () => {
    const start = rand(1, 10);
    const seq = [start];
    for (let i = 1; i <= 4; i++) seq.push(seq[i - 1] + i ** 3);
    return { sequence: seq, answer: seq[4] + 125 };
  },

  // 35. Arithmetic with alternating sign diff: +d, -d, +2d, -2d, +3d ...
  zigzagDiff: () => {
    const d = rand(2, 6);
    const start = rand(30, 60);
    const seq = [start];
    for (let i = 1; i <= 5; i++) {
      const mult = Math.ceil(i / 2);
      seq.push(seq[i - 1] + (i % 2 === 1 ? d * mult : -d * mult));
    }
    const nextI = 6;
    const mult = Math.ceil(nextI / 2);
    return { sequence: seq, answer: seq[5] + (nextI % 2 === 1 ? d * mult : -d * mult) };
  }
};

// ── Difficulty → generator mapping ──
const easyGens = ['arithmeticAdd', 'arithmeticSub', 'geometric', 'squares', 'cubes', 'positionalMultiply', 'increasingDiff'];
const mediumGens = [
  ...easyGens,
  'geometricDiv',
  'fibonacci',
  'primeSeq',
  'triangular',
  'alternating',
  'multiplyAdd',
  'doubleSub',
  'interleaved',
  'squarePlusK',
  'pow2Offset'
];
const hardGens = [
  ...mediumGens,
  'nSquarePlusN',
  'powerAlternate',
  'factorial',
  'catalan',
  'pentagonal',
  'hexagonal',
  'cubeMinusSquare',
  'diffPrime',
  'altMultDiv',
  'runningSum',
  'diffSquares',
  'multiplyPosition',
  'oblong',
  'star',
  'centeredSquare',
  'lazyCaterer',
  'diffCubes',
  'zigzagDiff'
];

const generatePattern = (difficulty) => {
  const pool = difficulty === 'Easy' ? easyGens : difficulty === 'Medium' ? mediumGens : hardGens;
  const genName = pick(pool);
  const gen = generators[genName];
  if (!gen) return generators.arithmeticAdd(difficulty);

  const { sequence, answer } = gen(difficulty);

  // Sanity check: ensure all numbers are finite integers
  if (!sequence.every((n) => Number.isFinite(n) && Number.isInteger(n)) || !Number.isFinite(answer) || !Number.isInteger(answer)) {
    return generators.arithmeticAdd(difficulty);
  }

  // Generate smart distractors
  const distractors = new Set();
  distractors.add(answer);

  // Close neighbours
  const offsets = difficulty === 'Hard' ? [1, -1, 2, -2, 3, -3, 5, -5, 10, -10] : [1, -1, 2, -2, 3, -3];

  for (const o of offsets) {
    if (distractors.size >= 4) break;
    distractors.add(answer + o);
  }

  // Pattern-based distractors (prev diff applied again, double diff, half diff)
  const lastDiff = sequence[sequence.length - 1] - sequence[sequence.length - 2];
  if (lastDiff !== 0) {
    distractors.add(sequence[sequence.length - 1] + lastDiff);
    distractors.add(answer + lastDiff);
    distractors.add(answer - lastDiff);
  }

  // Ensure exactly 4 unique options
  let options = [...distractors];
  if (options.length > 4) options = [answer, ...shuffle(options.filter((o) => o !== answer)).slice(0, 3)];
  while (options.length < 4) {
    const newOpt = answer + rand(-20, 20);
    if (!options.includes(newOpt) && newOpt !== answer) options.push(newOpt);
  }

  return { sequence, answer, options: shuffle(options) };
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
    setPattern(generatePattern(difficulty));
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
        <Typography variant="h4" sx={{ mb: 2 }}>
          Game Complete!
        </Typography>
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

  if (!pattern) return null;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
          Find the next number in the sequence:
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
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
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                {num}
              </Typography>
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
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.dark' }}>
              ?
            </Typography>
          </Box>
        </Box>

        <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
          Select your answer:
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {pattern.options.map((option, idx) => (
            <Box
              key={`${option}-${idx}`}
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
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {option}
              </Typography>
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
