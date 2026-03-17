import React, { useState, useEffect } from 'react';
import { Box, Typography, Card } from '@mui/material';
import { Square, Circle, Star, ChangeHistory, Hexagon, Diamond } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

const SHAPES = ['square', 'circle', 'star', 'triangle', 'hexagon', 'diamond'];
const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#06b6d4', '#a855f7'];
const COLOR_NAMES = ['Indigo', 'Rose', 'Emerald', 'Amber', 'Cyan', 'Purple'];

const ShapeIcon = ({ shape, color, size = 40 }) => {
  const icons = { square: Square, circle: Circle, star: Star, triangle: ChangeHistory, hexagon: Hexagon, diamond: Diamond };
  const Icon = icons[shape];
  return Icon ? <Icon sx={{ fontSize: size, color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }} /> : null;
};

// Generate a random Latin Square of size N (guarantees rows and cols have unique symbols)
const generateRandomLatinSquare = (n) => {
  const base = Array(n).fill(0).map((_, i) =>
    Array(n).fill(0).map((_, j) => (i + j) % n)
  );

  let rows = Array(n).fill(0).map((_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }

  let cols = Array(n).fill(0).map((_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cols[i], cols[j]] = [cols[j], cols[i]];
  }

  let symbols = Array(n).fill(0).map((_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
  }

  const result = Array(n).fill(0).map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[i][j] = symbols[base[rows[i]][cols[j]]];
    }
  }
  
  return result;
};

const generateGeoSudo = (difficulty) => {
  // Determine board size based on difficulty
  const n = difficulty === 'Hard' ? 6 : difficulty === 'Medium' ? 5 : 4;

  // Build the full solved grid using Latin square
  const ls = generateRandomLatinSquare(n);
  const grid = Array(n).fill(null).map((_, i) =>
    Array(n).fill(null).map((_, j) => {
      const val = ls[i][j];
      return { shape: SHAPES[val], color: COLORS[val], value: val };
    })
  );

  // Determine how many cells to blank out
  const emptyCells = difficulty === 'Easy' ? 4 : difficulty === 'Medium' ? 8 : 12;

  // Build shuffled position list
  const positions = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) positions.push([i, j]);
  }
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // First blank position is the question
  const questionPos = positions[0];
  const answer = grid[questionPos[0]][questionPos[1]];

  // Create the puzzle with blanked cells
  const puzzle = grid.map(row => row.map(cell => ({ ...cell })));
  for (let i = 0; i < emptyCells; i++) {
    const [row, col] = positions[i];
    puzzle[row][col] = null;
  }

  return { puzzle, answer, questionPos, solution: grid, boardSize: n };
};

const GeoSudoGame = ({ level, difficulty, onComplete }) => {
  const diff = difficulty || level?.difficulty || 'Easy';
  const targetScore = level?.pointsForLevel || 10;

  const [puzzle, setPuzzle] = useState([]);
  const [boardSize, setBoardSize] = useState(4);
  const [answer, setAnswer] = useState(null);
  const [questionPos, setQuestionPos] = useState([0, 0]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const { puzzle: p, answer: a, questionPos: pos, boardSize: sz } = generateGeoSudo(diff);
    setBoardSize(sz);
    setPuzzle(p);
    setAnswer(a);
    setQuestionPos(pos);
    setSelected(null);
    setFeedback(null);
    setIsSubmitting(false);
  }, [diff, level]);

  const handleSelect = (shape, color) => {
    if (isSubmitting || feedback) return;
    
    const selection = { shape, color };
    setSelected(selection);
    setIsSubmitting(true);

    const isCorrect = shape === answer.shape && color === answer.color;

    // Show selected in grid
    const newPuzzle = puzzle.map(row => row.map(cell => cell ? { ...cell } : null));
    newPuzzle[questionPos[0]][questionPos[1]] = { shape, color, isGuess: true, isCorrect };
    setPuzzle(newPuzzle);

    if (isCorrect) {
      setFeedback({ type: 'success', msg: 'Perfect Match! 🎉' });
      setTimeout(() => {
        if (onComplete) onComplete(targetScore);
      }, 1200);
    } else {
      setFeedback({ type: 'error', msg: `Wrong! It was the ${SHAPES[answer.value]} shape.` });
      setTimeout(() => {
        if (onComplete) onComplete(0);
      }, 2000);
    }
  };

  if (puzzle.length === 0) return null;

  return (
    <Box sx={{ width: '100%', mx: 'auto', p: { xs: 1, sm: 2 } }}>
      <MotionCard
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          textAlign: 'center',
          overflow: 'hidden'
        }}
      >
        <Typography variant="body1" sx={{ color: '#64748b', mb: 3, fontWeight: 500 }}>
          🧩 Find the correct shape and color for the <b style={{ color: '#f59e0b' }}>highlighted</b> cell
        </Typography>

        {/* Puzzle Grid */}
        <Box sx={{
          display: 'inline-block',
          mb: 4,
          p: { xs: 1, sm: 2 },
          bgcolor: '#f8fafc',
          borderRadius: '20px',
          border: '2px dashed #e2e8f0'
        }}>
          {puzzle.map((row, rowIdx) => (
            <Box key={rowIdx} sx={{ display: 'flex', gap: 1, mb: rowIdx < boardSize - 1 ? 1 : 0 }}>
              {row.map((cell, colIdx) => {
                const isQuestion = rowIdx === questionPos[0] && colIdx === questionPos[1];

                return (
                  <MotionBox
                    key={colIdx}
                    initial={isQuestion && cell?.isGuess ? { scale: 0.8 } : {}}
                    animate={isQuestion && cell?.isGuess ? { scale: 1 } : {}}
                    sx={{
                      width: { xs: 45, sm: boardSize === 6 ? 55 : boardSize === 5 ? 65 : 75 },
                      height: { xs: 45, sm: boardSize === 6 ? 55 : boardSize === 5 ? 65 : 75 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '12px',
                      border: isQuestion
                        ? (cell?.isGuess 
                          ? `3px solid ${cell.isCorrect ? '#10b981' : '#ef4444'}` 
                          : '3px dashed #f59e0b')
                        : '2px solid #e2e8f0',
                      bgcolor: isQuestion
                        ? (cell?.isGuess
                          ? (cell.isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)')
                          : 'rgba(245,158,11,0.06)')
                        : '#fff',
                      boxShadow: isQuestion && !cell?.isGuess ? '0 0 15px rgba(245,158,11,0.15)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isQuestion && !cell ? (
                      <MotionBox
                        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <Typography variant={boardSize === 6 ? "h5" : "h4"} sx={{ fontWeight: 900, color: '#f59e0b' }}>?</Typography>
                      </MotionBox>
                    ) : cell ? (
                      <ShapeIcon shape={cell.shape} color={cell.color} size={cell.isGuess ? (boardSize === 6 ? 30 : 36) : (boardSize === 6 ? 26 : 30)} />
                    ) : (
                      <Box sx={{ width: '40%', height: '40%', bgcolor: '#f1f5f9', borderRadius: '8px' }} />
                    )}
                  </MotionBox>
                );
              })}
            </Box>
          ))}
        </Box>

        {/* Answer Options */}
        {!feedback && (
          <Box>
            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Select the correct shape
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
              {Array.from({ length: boardSize }).map((_, idx) => (
                <MotionBox
                  key={`${SHAPES[idx]}-${COLORS[idx]}`}
                  whileHover={{ scale: 1.1, y: -4 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleSelect(SHAPES[idx], COLORS[idx])}
                  sx={{
                    width: { xs: 60, sm: boardSize >= 5 ? 75 : 85 },
                    height: { xs: 60, sm: boardSize >= 5 ? 75 : 85 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #e2e8f0',
                    borderRadius: '16px',
                    bgcolor: '#fff',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      borderColor: COLORS[idx],
                      boxShadow: `0 8px 24px ${COLORS[idx]}25`
                    }
                  }}
                >
                  <ShapeIcon shape={SHAPES[idx]} color={COLORS[idx]} size={30} />
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, mt: 0.5, fontSize: '0.65rem', display: { xs: 'none', sm: 'block' } }}>
                    {COLOR_NAMES[idx]}
                  </Typography>
                </MotionBox>
              ))}
            </Box>
          </Box>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <MotionBox
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              sx={{
                mt: 3,
                p: 2,
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'inline-block',
                bgcolor: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
                color: feedback.type === 'success' ? '#16a34a' : '#dc2626',
                border: '1px solid',
                borderColor: feedback.type === 'success' ? '#bbf7d0' : '#fecaca'
              }}
            >
              {feedback.msg}
            </MotionBox>
          )}
        </AnimatePresence>
      </MotionCard>
    </Box>
  );
};

export default GeoSudoGame;
