import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Button, Card } from '@mui/material';
import { DirectionsWalk, KeyboardArrowUp, KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowRight, Home, Block } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

const generateMaze = (rows, cols) => {
  const grid = Array(rows).fill(null).map(() => Array(cols).fill(1));
  const random = Math.random;
  
  // 30% chance to create a maze with no path
  const createNoPath = random() < 0.3;
  
  const startRow = Math.floor(random() * rows);
  const endRow = Math.floor(random() * rows);
  
  if (createNoPath) {
    // Create a maze with no path - just random open cells
    const numOpenCells = Math.floor(rows * cols * 0.4);
    for (let i = 0; i < numOpenCells; i++) {
      const r = Math.floor(random() * rows);
      const c = Math.floor(random() * cols);
      grid[r][c] = 0;
    }
    // Ensure start is open but end area is blocked
    grid[startRow][0] = 0;
    if (endRow > 0) grid[endRow - 1][cols - 1] = 1;
    grid[endRow][cols - 1] = 1;
    if (endRow < rows - 1) grid[endRow + 1][cols - 1] = 1;
  } else {
    // Create a maze with a valid path
    let row = startRow;
    let col = 0;
    
    const turn1Col = Math.floor(random() * (cols - 2)) + 1;
    for (let c = 0; c <= turn1Col; c++) {
      grid[row][c] = 0;
    }
    
    const turn2Row = row < endRow 
      ? Math.min(endRow, row + Math.floor(random() * (endRow - row + 1))) 
      : row > endRow 
        ? Math.max(endRow, row - Math.floor(random() * (row - endRow + 1)))
        : row;
    
    if (turn2Row !== row) {
      const step = row < turn2Row ? 1 : -1;
      for (let r = row; r !== turn2Row; r += step) {
        grid[r][turn1Col] = 0;
      }
    }
    row = turn2Row;
    grid[row][turn1Col] = 0;
    
    for (let c = turn1Col; c < cols; c++) {
      grid[row][c] = 0;
    }
    
    const numBranches = Math.floor(rows * cols * 0.3);
    for (let i = 0; i < numBranches; i++) {
      const r = Math.floor(random() * rows);
      const c = Math.floor(random() * cols);
      const branchLength = 2 + Math.floor(random() * 4);
      
      let br = r, bc = c;
      for (let j = 0; j < branchLength; j++) {
        if (br >= 0 && br < rows && bc >= 0 && bc < cols) {
          grid[br][bc] = 0;
          const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
          const dir = dirs[Math.floor(random() * 4)];
          br += dir[0];
          bc += dir[1];
        }
      }
    }
  }
  
  return { grid, start: [startRow, 0], end: [endRow, cols - 1] };
};

const MazeGame = ({ level, themeColor = '#6366f1', onComplete }) => {
  const levelData = level?.correctAnswer ? JSON.parse(level.correctAnswer) : { rows: 8, cols: 8 };
  const targetScore = level?.pointsForLevel || 10;
  
  // Re-generate maze on mount or level change
  const mazeData = useMemo(() => generateMaze(levelData.rows, levelData.cols), [level?.levelNumber, levelData.rows, levelData.cols]);
  
  const [playerPos, setPlayerPos] = useState([mazeData.start[0], mazeData.start[1]]);
  const [direction, setDirection] = useState('down');
  const [hitWall, setHitWall] = useState(false);
  const [hitWallPos, setHitWallPos] = useState(null);
  const [solutionPath, setSolutionPath] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state on new maze
  useEffect(() => {
    setPlayerPos([mazeData.start[0], mazeData.start[1]]);
    setHitWall(false);
    setHitWallPos(null);
    setSolutionPath([]);
    setFeedback(null);
    setIsSubmitting(false);
  }, [mazeData]);

  // Pathfinding algorithm to check if maze is solvable (BFS)
  const findPath = useCallback(() => {
    const queue = [[...mazeData.start, [mazeData.start]]];
    const visited = new Set([`${mazeData.start[0]},${mazeData.start[1]}`]);
    
    while (queue.length > 0) {
      const [row, col, path] = queue.shift();
      
      if (row === mazeData.end[0] && col === mazeData.end[1]) {
        return path;
      }
      
      const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (const [dr, dc] of dirs) {
        const newRow = row + dr;
        const newCol = col + dc;
        const key = `${newRow},${newCol}`;
        
        if (newRow >= 0 && newRow < mazeData.grid.length && 
            newCol >= 0 && newCol < mazeData.grid[0].length &&
            mazeData.grid[newRow][newCol] === 0 && !visited.has(key)) {
          visited.add(key);
          queue.push([newRow, newCol, [...path, [newRow, newCol]]]);
        }
      }
    }
    return [];
  }, [mazeData]);

  const hasPath = useMemo(() => findPath().length > 0, [findPath]);

  // Handle Win Condition
  const checkWin = useCallback((pos) => {
    if (pos[0] === mazeData.end[0] && pos[1] === mazeData.end[1]) {
      setIsSubmitting(true);
      setFeedback({ type: 'success', msg: 'You reached the end! 🎉' });
      setTimeout(() => {
        if (onComplete) onComplete(targetScore);
      }, 1500);
    }
  }, [mazeData.end, onComplete, targetScore]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isSubmitting || feedback) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault(); // Prevent page scroll
      } else return;
      
      const [row, col] = playerPos;
      let newRow = row, newCol = col, newDirection = direction;

      if (e.key === 'ArrowUp') { newRow = Math.max(0, row - 1); newDirection = 'up'; }
      if (e.key === 'ArrowDown') { newRow = Math.min(mazeData.grid.length - 1, row + 1); newDirection = 'down'; }
      if (e.key === 'ArrowLeft') { newCol = Math.max(0, col - 1); newDirection = 'left'; }
      if (e.key === 'ArrowRight') { newCol = Math.min(mazeData.grid[0].length - 1, col + 1); newDirection = 'right'; }

      if (mazeData.grid[newRow][newCol] === 0) {
        const newPos = [newRow, newCol];
        setPlayerPos(newPos);
        setDirection(newDirection);
        checkWin(newPos);
      } else {
        setHitWall(true);
        setHitWallPos([newRow, newCol]);
        setTimeout(() => {
          setPlayerPos([mazeData.start[0], mazeData.start[1]]);
          setHitWall(false);
          setHitWallPos(null);
        }, 500);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPos, isSubmitting, feedback, mazeData, checkWin, direction]);

  const handleNoPath = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!hasPath) {
      setFeedback({ type: 'success', msg: 'Correct! There is no possible path. 👏' });
      setTimeout(() => {
        if (onComplete) onComplete(targetScore);
      }, 2000);
    } else {
      setFeedback({ type: 'error', msg: 'Incorrect! A path exists. Look at the highlighted route.' });
      setSolutionPath(findPath());
      setTimeout(() => {
        if (onComplete) onComplete(0);
      }, 3000);
    }
  };

  const cellSize = Math.min(
    Math.floor(400 / mazeData.grid.length), 
    Math.floor(400 / mazeData.grid[0].length)
  );

  return (
    <Box sx={{ width: '100%', mx: 'auto', p: { xs: 1, sm: 2 } }}>
      <MotionCard
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          textAlign: 'center',
          overflow: 'hidden'
        }}
      >
        <Typography variant="body1" sx={{ color: '#64748b', mb: 1, fontWeight: 500 }}>
          Navigate the maze from the start (yellow) to the exit (green).
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 3 }}>
          <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600 }}>Use Arrow Keys:</Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Box sx={{ px: 0.5, py: 0.2, bgcolor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', borderBottomWidth: '2px' }}><KeyboardArrowUp sx={{ fontSize: 16 }} /></Box>
            <Box sx={{ px: 0.5, py: 0.2, bgcolor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', borderBottomWidth: '2px' }}><KeyboardArrowDown sx={{ fontSize: 16 }} /></Box>
            <Box sx={{ px: 0.5, py: 0.2, bgcolor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', borderBottomWidth: '2px' }}><KeyboardArrowLeft sx={{ fontSize: 16 }} /></Box>
            <Box sx={{ px: 0.5, py: 0.2, bgcolor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', borderBottomWidth: '2px' }}><KeyboardArrowRight sx={{ fontSize: 16 }} /></Box>
          </Box>
        </Box>

        {/* Maze Grid */}
        <Box sx={{ 
          display: 'inline-block', 
          p: 1.5,
          bgcolor: '#f8fafc',
          borderRadius: '20px',
          border: '2px dashed #e2e8f0',
          mb: 4
        }}>
          <Box sx={{ 
            border: `3px solid ${themeColor}`, 
            borderRadius: '12px',
            overflow: 'hidden',
            bgcolor: '#1e293b' // Dark background for the maze
          }}>
            {mazeData.grid.map((row, rowIdx) => (
              <Box key={rowIdx} sx={{ display: 'flex' }}>
                {row.map((cell, colIdx) => {
                  const isPlayer = playerPos[0] === rowIdx && playerPos[1] === colIdx;
                  const isStart = mazeData.start[0] === rowIdx && mazeData.start[1] === colIdx;
                  const isEnd = mazeData.end[0] === rowIdx && mazeData.end[1] === colIdx;
                  const isPathHint = solutionPath.some(p => p[0] === rowIdx && p[1] === colIdx);
                  const isWall = cell === 1;
                  
                  return (
                    <Box
                      key={colIdx}
                      sx={{
                        width: cellSize,
                        height: cellSize,
                        bgcolor: isWall ? '#334155' : isEnd ? '#10b981' : isStart ? '#fef3c7' : isPathHint ? '#fde047' : '#f8fafc',
                        border: '1px solid',
                        borderColor: isWall ? '#1e293b' : '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      {isEnd && !isPlayer && (
                        <MotionBox
                          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <Home sx={{ fontSize: cellSize * 0.7, color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                        </MotionBox>
                      )}
                      {isPlayer && (
                        <MotionBox
                          animate={hitWall ? { x: [-4, 4, -4, 4, 0] } : { y: [-2, 2, -2] }}
                          transition={{ duration: hitWall ? 0.3 : 0.8, repeat: hitWall ? 0 : Infinity }}
                        >
                          <DirectionsWalk 
                            sx={{ 
                              fontSize: cellSize * 0.8,
                              color: hitWall ? '#ef4444' : themeColor,
                              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                            }} 
                          />
                        </MotionBox>
                      )}
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>

        {/* No Path Logic Block */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {!feedback && (
            <Button
              variant="outlined"
              onClick={handleNoPath}
              disabled={isSubmitting}
              startIcon={<Block />}
              sx={{
                px: 3, py: 1, borderRadius: '12px', color: '#ef4444', borderColor: '#ef4444',
                fontWeight: 600, textTransform: 'none', fontSize: '1rem',
                '&:hover': { bgcolor: '#fef2f2', borderColor: '#ef4444' }
              }}
            >
              No Path Possible
            </Button>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <MotionBox
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                sx={{
                  mt: 2, p: 2, borderRadius: '14px', fontWeight: 700, fontSize: '1.05rem',
                  display: 'inline-block',
                  bgcolor: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  color: feedback.type === 'success' ? '#16a34a' : '#dc2626',
                  border: '1px solid',
                  borderColor: feedback.type === 'success' ? '#bbf7d0' : '#fecaca',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                {feedback.msg}
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>
      </MotionCard>
    </Box>
  );
};

export default MazeGame;
