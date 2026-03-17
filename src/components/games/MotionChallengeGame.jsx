import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Card } from '@mui/material';
import { Flag, MotionPhotosAuto } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

// ── Deterministic RNG ──
const createRNG = (seedStr) => {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
    hash |= 0;
  }
  let a = hash + 0x6D2B79F5;
  return () => {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

const TILE_TYPES = [
  { id: 'straight-h', paths: [[1,0,1,2]] },
  { id: 'straight-v', paths: [[0,1,2,1]] },
  { id: 'l-top-right', paths: [[1,0,2,1]] },
  { id: 'l-right-bottom', paths: [[2,1,1,2]] },
  { id: 'l-bottom-left', paths: [[1,2,0,1]] },
  { id: 'l-left-top', paths: [[0,1,1,0]] }
];

const generateMotion = (difficulty) => {
  const rng = () => Math.random();
  
  let boardSize = 4;
  if (difficulty === 'Medium') boardSize = 5;
  if (difficulty === 'Hard') boardSize = 6;
  
  const startRow = Math.floor(rng() * boardSize);
  const endRow = Math.floor(rng() * boardSize);
  
  const grid = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
  const solution = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
  const visited = new Set();
  const path = [];
  
  const dfs = (row, col, fromDir) => {
    if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) return false;
    if (visited.has(`${row},${col}`)) return false;
    
    visited.add(`${row},${col}`);
    path.push({ row, col, fromDir });
    
    if (col === boardSize - 1 && row === endRow) return true;
    
    const directions = [
      { dr: -1, dc: 0, dir: 'top', entry: 'bottom' },
      { dr: 0, dc: -1, dir: 'left', entry: 'right' },
      { dr: 1, dc: 0, dir: 'bottom', entry: 'top' },
      { dr: 0, dc: 1, dir: 'right', entry: 'left' }
    ];
    
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }
    
    for (const { dr, dc, dir, entry } of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (dir === fromDir) continue;
      if (dfs(newRow, newCol, entry)) return true;
    }
    
    path.pop();
    visited.delete(`${row},${col}`);
    return false;
  };
  
  dfs(startRow, 0, 'left');
  
  for (let i = 0; i < path.length; i++) {
    const curr = path[i];
    const next = i < path.length - 1 ? path[i + 1] : null;
    
    let fromSide = curr.fromDir;
    let toSide = null;
    
    if (next) {
      if (next.row < curr.row) toSide = 'top';
      else if (next.row > curr.row) toSide = 'bottom';
      else if (next.col < curr.col) toSide = 'left';
      else if (next.col > curr.col) toSide = 'right';
    } else {
      toSide = 'right'; // Exit output
    }
    
    let tileType, rotation = 0;
    if ((fromSide === 'left' && toSide === 'right') || (fromSide === 'right' && toSide === 'left')) {
      tileType = 'straight-h';
    } else if ((fromSide === 'top' && toSide === 'bottom') || (fromSide === 'bottom' && toSide === 'top')) {
      tileType = 'straight-v';
    } else {
      tileType = 'l-top-right';
      if (fromSide === 'left' && toSide === 'top') rotation = 3;
      else if (fromSide === 'top' && toSide === 'right') rotation = 0;
      else if (fromSide === 'right' && toSide === 'bottom') rotation = 1;
      else if (fromSide === 'bottom' && toSide === 'left') rotation = 2;
      else if (fromSide === 'left' && toSide === 'bottom') rotation = 2;
      else if (fromSide === 'bottom' && toSide === 'right') rotation = 1;
      else if (fromSide === 'right' && toSide === 'top') rotation = 0;
      else if (fromSide === 'top' && toSide === 'left') rotation = 3;
    }
    grid[curr.row][curr.col] = { type: tileType, rotation };
    solution[curr.row][curr.col] = { type: tileType, rotation };
  }
  
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (grid[i][j]) {
        grid[i][j].rotation = Math.floor(rng() * 4);
      } else {
        const typeIndex = Math.floor(rng() * TILE_TYPES.length);
        const tileType = TILE_TYPES[typeIndex];
        grid[i][j] = { type: tileType.id, rotation: Math.floor(rng() * 4) };
      }
    }
  }
  
  return { grid, startRow, endRow, solution, boardSize };
};

const drawTile = (ctx, type, rotation, size) => {
  ctx.clearRect(0, 0, size, size);
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  
  ctx.save();
  ctx.translate(size/2, size/2);
  ctx.rotate((rotation * Math.PI) / 2);
  ctx.translate(-size/2, -size/2);
  
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = size / 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  const mid = size / 2;
  
  ctx.beginPath();
  if (type.startsWith('straight-h')) {
    ctx.moveTo(0, mid);
    ctx.lineTo(size, mid);
  } else if (type.startsWith('straight-v')) {
    ctx.moveTo(mid, 0);
    ctx.lineTo(mid, size);
  } else if (type.startsWith('l-')) {
    ctx.moveTo(mid, 0);
    ctx.quadraticCurveTo(mid, mid, size, mid);
  }
  ctx.stroke();
  
  ctx.fillStyle = '#4f46e5';
  ctx.beginPath();
  if (type.startsWith('straight-h') || type.startsWith('straight-v')) {
    ctx.arc(mid, mid, size / 10, 0, Math.PI * 2);
  } else {
    ctx.arc(mid + (size * 0.08), mid - (size * 0.08), size / 10, 0, Math.PI * 2);
  }
  ctx.fill();

  ctx.restore();
};

const getTileExits = (type, rotation) => {
  let exits = [];
  if (type === 'straight-h') exits = ['left', 'right'];
  else if (type === 'straight-v') exits = ['top', 'bottom'];
  else if (type.startsWith('l-')) exits = ['top', 'right'];
  
  for (let i = 0; i < rotation; i++) {
    exits = exits.map(e => {
      if (e === 'top') return 'right';
      if (e === 'right') return 'bottom';
      if (e === 'bottom') return 'left';
      if (e === 'left') return 'top';
      return e;
    });
  }
  return exits;
};

const checkPath = (grid, startRow, endRow, boardSize, returnPath = false) => {
  const visited = new Set();
  const path = [];
  
  const dfs = (row, col, fromSide) => {
    if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) return false;
    
    const key = `${row},${col},${fromSide}`;
    if (visited.has(key)) return false;
    visited.add(key);
    path.push([row, col]);
    
    const tile = grid[row][col];
    if (!tile) {
      path.pop();
      return false;
    }
    
    const exits = getTileExits(tile.type, tile.rotation);
    if (col === boardSize - 1 && row === endRow) {
      if (exits.includes('right')) return true;
    }
    
    if (!exits.includes(fromSide)) {
      path.pop();
      return false;
    }
    
    for (const exit of exits) {
      if (exit === fromSide) continue;
      
      let nextRow = row, nextCol = col, nextEntry;
      if (exit === 'top') { nextRow--; nextEntry = 'bottom'; }
      else if (exit === 'bottom') { nextRow++; nextEntry = 'top'; }
      else if (exit === 'left') { nextCol--; nextEntry = 'right'; }
      else if (exit === 'right') { nextCol++; nextEntry = 'left'; }
      
      if (nextCol === boardSize && nextRow === endRow) return true;
      if (dfs(nextRow, nextCol, nextEntry)) return true;
    }
    
    path.pop();
    return false;
  };
  
  const result = dfs(startRow, 0, 'left');
  return returnPath ? (result ? path : []) : result;
};

const MotionChallengeGame = ({ level, difficulty, onComplete }) => {
  const diff = difficulty || level?.difficulty || 'Easy';
  const targetScore = level?.pointsForLevel || 10;
  
  const [motion, setMotion] = useState(null);
  const [canvasRefs, setCanvasRefs] = useState({});
  const [rotateCount, setRotateCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  
  const [highlightPath, setHighlightPath] = useState([]);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [userPosition, setUserPosition] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCanvasRefs({});
    setMotion(generateMotion(diff));
    setFeedback(null);
    setHighlightPath([]);
    setAnimationProgress(0);
    setUserPosition(null);
    setIsSubmitting(false);
    setRotateCount(0);
  }, [diff, level]);

  useEffect(() => {
    if (motion) {
      Object.entries(canvasRefs).forEach(([idx, ref]) => {
        if (ref) {
          const row = Math.floor(idx / motion.boardSize);
          const col = idx % motion.boardSize;
          const tile = motion.grid[row]?.[col];
          if (!tile) return;
          const ctx = ref.getContext('2d');
          
          const size = ref.width;
          drawTile(ctx, tile.type, tile.rotation, size);
          
          if (highlightPath.length > 0 && animationProgress > 0) {
            const pathIndex = highlightPath.findIndex(([r, c]) => r === row && c === col);
            if (pathIndex !== -1 && pathIndex < animationProgress) {
              ctx.strokeStyle = '#10b981'; 
              ctx.lineWidth = size / 4;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              
              const exits = getTileExits(tile.type, tile.rotation);
              ctx.save();
              ctx.beginPath();
              
              if (tile.type === 'straight-h') {
                if (tile.rotation % 2 === 0) { ctx.moveTo(0, size/2); ctx.lineTo(size, size/2); }
                else { ctx.moveTo(size/2, 0); ctx.lineTo(size/2, size); }
              } else if (tile.type === 'straight-v') {
                if (tile.rotation % 2 === 0) { ctx.moveTo(size/2, 0); ctx.lineTo(size/2, size); }
                else { ctx.moveTo(0, size/2); ctx.lineTo(size, size/2); }
              } else if (tile.type.startsWith('l-')) {
                ctx.translate(size/2, size/2);
                ctx.rotate((tile.rotation * Math.PI) / 2);
                ctx.moveTo(0, -size/2);
                ctx.quadraticCurveTo(0, 0, size/2, 0);
              }
              
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      });
    }
  }, [motion, canvasRefs, highlightPath, animationProgress]);

  const handleTileClick = (row, col) => {
    if (isSubmitting) return;
    if (!motion.grid[row][col]) return;
    const newGrid = motion.grid.map(r => r.map(c => c ? {...c} : null));
    newGrid[row][col].rotation = (newGrid[row][col].rotation + 1) % 4;
    setFeedback(null);
    setRotateCount(prev => prev + 1);
    const updatedMotion = {...motion, grid: newGrid};
    setMotion(updatedMotion);

    // Auto-check path after each rotation
    const pathResult = checkPath(newGrid, motion.startRow, motion.endRow, motion.boardSize, true);
    if (pathResult && pathResult.length > 0) {
      setHighlightPath(pathResult);
      setAnimationProgress(0);
      setIsSubmitting(true);

      let progress = 0;
      const stepDelay = 1200 / pathResult.length;
      const interval = setInterval(() => {
        progress++;
        setAnimationProgress(progress);
        setUserPosition(pathResult[progress - 1]);
        if (progress >= pathResult.length) {
          clearInterval(interval);
          setTimeout(() => {
            if (onComplete) onComplete(targetScore);
          }, 800);
        }
      }, stepDelay);
    }
  };

  if (!motion) return null;

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
          🔌 Click tiles to rotate them and connect the path from <b style={{ color: '#3b82f6' }}>Source</b> to <b style={{ color: '#10b981' }}>Exit</b>
        </Typography>

        <Box sx={{ 
          position: 'relative', 
          mx: 'auto', 
          p: { xs: 1, sm: 2 }, 
          bgcolor: '#f8fafc', 
          borderRadius: '20px',
          border: '2px dashed #e2e8f0',
          mb: 4,
          maxWidth: motion.boardSize === 6 ? 880 : motion.boardSize === 5 ? 760 : 620
        }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: `50px repeat(${motion.boardSize}, 1fr) 50px`, 
            gap: { xs: 0.5, sm: 1 },
            alignItems: 'center'
          }}>
            {Array.from({ length: motion.boardSize }).map((_, blockRow) => (
              <React.Fragment key={blockRow}>
                {/* Start marker column */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  {blockRow === motion.startRow && (
                    <MotionBox 
                      animate={{ scale: [1, 1.15, 1] }} 
                      transition={{ repeat: Infinity, duration: 2 }}
                      sx={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        bgcolor: '#3b82f6', color: 'white', 
                        width: { xs: 34, sm: 44 }, height: { xs: 34, sm: 44 }, 
                        borderRadius: '50%', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                      }}
                    >
                      <MotionPhotosAuto sx={{ fontSize: { xs: 18, sm: 22 } }} />
                    </MotionBox>
                  )}
                </Box>

                {/* Tile columns */}
                {Array.from({ length: motion.boardSize }).map((_, blockCol) => {
                  const idx = blockRow * motion.boardSize + blockCol;
                  
                  return (
                    <Box
                      key={idx}
                      onClick={() => handleTileClick(blockRow, blockCol)}
                      sx={{
                        width: '100%',
                        aspectRatio: '1',
                        border: '2px solid #cbd5e1',
                        borderRadius: '14px',
                        bgcolor: '#fff',
                        cursor: isSubmitting ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                        '&:hover': {
                          borderColor: isSubmitting ? undefined : '#6366f1',
                          boxShadow: isSubmitting ? undefined : '0 6px 18px rgba(99, 102, 241, 0.18)',
                          transform: isSubmitting ? undefined : 'scale(1.06)'
                        },
                        '&:active': {
                          transform: isSubmitting ? undefined : 'scale(0.95)'
                        }
                      }}
                    >
                      <canvas
                        ref={ref => {
                          if (ref && !canvasRefs[idx]) {
                            setCanvasRefs(prev => ({...prev, [idx]: ref}));
                          }
                        }}
                        width={120}
                        height={120}
                        style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
                      />
                    </Box>
                  );
                })}

                {/* End marker column */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  {blockRow === motion.endRow && (
                    <MotionBox 
                      animate={{ scale: [1, 1.15, 1] }} 
                      transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                      sx={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        bgcolor: '#10b981', color: 'white', 
                        width: { xs: 34, sm: 44 }, height: { xs: 34, sm: 44 }, 
                        borderRadius: '50%', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      <Flag sx={{ fontSize: { xs: 18, sm: 22 } }} />
                    </MotionBox>
                  )}
                </Box>
              </React.Fragment>
            ))}
          </Box>
        </Box>
      </MotionCard>
    </Box>
  );
};

export default MotionChallengeGame;
