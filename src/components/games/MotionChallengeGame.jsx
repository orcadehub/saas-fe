import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Card } from '@mui/material';
import { RotateRight, DirectionsRun, Home } from '@mui/icons-material';

const TILE_TYPES = [
  { id: 'straight-h', paths: [[1,0,1,2]] },
  { id: 'straight-v', paths: [[0,1,2,1]] },
  { id: 'l-top-right', paths: [[1,0,2,1]] },
  { id: 'l-right-bottom', paths: [[2,1,1,2]] },
  { id: 'l-bottom-left', paths: [[1,2,0,1]] },
  { id: 'l-left-top', paths: [[0,1,1,0]] }
];

const generateMotion = (difficulty) => {
  const startRow = Math.floor(Math.random() * 4);
  const endRow = Math.floor(Math.random() * 4);
  
  const grid = Array(4).fill(null).map(() => Array(4).fill(null));
  const solution = Array(4).fill(null).map(() => Array(4).fill(null));
  const visited = new Set();
  const path = [];
  
  // DFS with random direction priority to find path
  const dfs = (row, col, fromDir) => {
    if (row < 0 || row >= 4 || col < 0 || col >= 4) return false;
    if (visited.has(`${row},${col}`)) return false;
    
    visited.add(`${row},${col}`);
    path.push({ row, col, fromDir });
    
    // Reached end
    if (col === 3 && row === endRow) return true;
    
    // Randomize direction order for each cell
    const directions = [
      { dr: -1, dc: 0, dir: 'top', entry: 'bottom' },
      { dr: 0, dc: -1, dir: 'left', entry: 'right' },
      { dr: 1, dc: 0, dir: 'bottom', entry: 'top' },
      { dr: 0, dc: 1, dir: 'right', entry: 'left' }
    ];
    
    // Shuffle directions randomly
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }
    
    for (const { dr, dc, dir, entry } of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      // Don't go back
      if (dir === fromDir) continue;
      
      if (dfs(newRow, newCol, entry)) return true;
    }
    
    // Backtrack
    path.pop();
    visited.delete(`${row},${col}`);
    return false;
  };
  
  // Find path from start
  dfs(startRow, 0, 'left');
  
  // Place tiles on path
  for (let i = 0; i < path.length; i++) {
    const curr = path[i];
    const prev = i > 0 ? path[i - 1] : null;
    const next = i < path.length - 1 ? path[i + 1] : null;
    
    let fromSide = curr.fromDir;
    let toSide = null;
    
    if (next) {
      if (next.row < curr.row) toSide = 'top';
      else if (next.row > curr.row) toSide = 'bottom';
      else if (next.col < curr.col) toSide = 'left';
      else if (next.col > curr.col) toSide = 'right';
    } else {
      toSide = 'right'; // Exit at end
    }
    
    // Determine tile type and rotation
    let tileType, rotation = 0;
    
    if ((fromSide === 'left' && toSide === 'right') || (fromSide === 'right' && toSide === 'left')) {
      tileType = 'straight-h';
    } else if ((fromSide === 'top' && toSide === 'bottom') || (fromSide === 'bottom' && toSide === 'top')) {
      tileType = 'straight-v';
    } else {
      tileType = 'l-top-right';
      // Calculate rotation for L-shape
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
  
  // Randomize rotations for puzzle and fill empty tiles
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j]) {
        grid[i][j].rotation = Math.floor(Math.random() * 4);
      } else {
        // Add random tile to empty cells
        const tileType = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
        grid[i][j] = { type: tileType.id, rotation: Math.floor(Math.random() * 4) };
      }
    }
  }
  
  return { grid, startRow, endRow, solution };
};

const drawTile = (ctx, type, rotation, size) => {
  ctx.clearRect(0, 0, size, size);
  
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, size, size);
  
  ctx.save();
  ctx.translate(size/2, size/2);
  ctx.rotate((rotation * Math.PI) / 2);
  ctx.translate(-size/2, -size/2);
  
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = size / 30;
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(37, 99, 235, 0.3)';
  ctx.shadowBlur = 4;
  
  if (type.startsWith('straight-h')) {
    ctx.beginPath();
    ctx.moveTo(0, size/2);
    ctx.lineTo(size, size/2);
    ctx.stroke();
  } else if (type.startsWith('straight-v')) {
    ctx.beginPath();
    ctx.moveTo(size/2, 0);
    ctx.lineTo(size/2, size);
    ctx.stroke();
  } else if (type.startsWith('l-')) {
    ctx.beginPath();
    ctx.moveTo(size/2, 0);
    ctx.lineTo(size/2, size/2);
    ctx.lineTo(size, size/2);
    ctx.stroke();
  }
  
  ctx.restore();
};

const checkPath = (grid, startRow, endRow, returnPath = false) => {
  const visited = new Set();
  const path = [];
  const rows = grid.length;
  const cols = grid[0].length;
  
  const dfs = (row, col, fromSide) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return false;
    
    const key = `${row},${col},${fromSide}`;
    if (visited.has(key)) return false;
    visited.add(key);
    path.push([row, col]);
    
    const tile = grid[row][col];
    if (!tile) {
      path.pop();
      return false;
    }
    
    if (col === cols - 1 && row === endRow) {
      const exits = getTileExits(tile.type, tile.rotation);
      if (exits.includes('right')) return true;
    }
    
    const exits = getTileExits(tile.type, tile.rotation);
    
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
      
      if (nextCol === cols && nextRow === endRow) return true;
      
      if (dfs(nextRow, nextCol, nextEntry)) return true;
    }
    
    path.pop();
    return false;
  };
  
  const result = dfs(startRow, 0, 'left');
  return returnPath ? (result ? path : []) : result;
};

const getTileExits = (type, rotation) => {
  let exits = [];
  
  if (type === 'straight-h') {
    exits = ['left', 'right'];
  } else if (type === 'straight-v') {
    exits = ['top', 'bottom'];
  } else if (type.startsWith('l-')) {
    exits = ['top', 'right'];
  }
  
  // Rotate exits based on rotation count
  for (let i = 0; i < rotation; i++) {
    exits = exits.map(e => {
      if (e === 'top') return 'right';
      if (e === 'right') return 'bottom';
      if (e === 'bottom') return 'left';
      if (e === 'left') return 'top';
    });
  }
  
  return exits;
};

const MotionChallengeGame = ({ difficulty = 'Easy', onComplete }) => {
  const totalQuestions = 20;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [motion, setMotion] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [canvasRefs, setCanvasRefs] = useState({});
  const [selectedTile, setSelectedTile] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [highlightPath, setHighlightPath] = useState([]);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    startNewQuestion();
  }, [currentQuestion]);

  useEffect(() => {
    if (motion) {
      Object.entries(canvasRefs).forEach(([idx, ref]) => {
        if (ref) {
          const row = Math.floor(idx / 4);
          const col = idx % 4;
          const tile = motion.grid[row]?.[col];
          if (!tile) return;
          const ctx = ref.getContext('2d');
          
          drawTile(ctx, tile.type, tile.rotation, 80);
          
          // Animate path if available
          if (highlightPath.length > 0 && animationProgress > 0) {
            const pathIndex = highlightPath.findIndex(([r, c]) => r === row && c === col);
            if (pathIndex !== -1 && pathIndex < animationProgress) {
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 8;
              ctx.lineCap = 'round';
              ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
              ctx.shadowBlur = 10;
              
              const exits = getTileExits(tile.type, tile.rotation);
              const size = 80;
              
              ctx.save();
              ctx.beginPath();
              
              if (tile.type === 'straight-h') {
                if (tile.rotation % 2 === 0) {
                  ctx.moveTo(0, size/2);
                  ctx.lineTo(size, size/2);
                } else {
                  ctx.moveTo(size/2, 0);
                  ctx.lineTo(size/2, size);
                }
              } else if (tile.type === 'straight-v') {
                if (tile.rotation % 2 === 0) {
                  ctx.moveTo(size/2, 0);
                  ctx.lineTo(size/2, size);
                } else {
                  ctx.moveTo(0, size/2);
                  ctx.lineTo(size, size/2);
                }
              } else if (tile.type.startsWith('l-')) {
                ctx.translate(size/2, size/2);
                ctx.rotate((tile.rotation * Math.PI) / 2);
                ctx.moveTo(0, -size/2);
                ctx.lineTo(0, 0);
                ctx.lineTo(size/2, 0);
              }
              
              ctx.stroke();
              ctx.restore();
            }
          }
          
          if (showHint) {
            const ctx = ref.getContext('2d');
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 8;
            ctx.globalAlpha = 0.7;
            ctx.lineCap = 'round';
            
            if (tile.type.startsWith('straight-h')) {
              const angle = tile.rotation * Math.PI / 2;
              ctx.save();
              ctx.translate(50, 50);
              ctx.rotate(angle);
              ctx.beginPath();
              ctx.moveTo(-50, 0);
              ctx.lineTo(50, 0);
              ctx.stroke();
              ctx.restore();
            } else if (tile.type.startsWith('straight-v')) {
              const angle = tile.rotation * Math.PI / 2;
              ctx.save();
              ctx.translate(50, 50);
              ctx.rotate(angle);
              ctx.beginPath();
              ctx.moveTo(0, -50);
              ctx.lineTo(0, 50);
              ctx.stroke();
              ctx.restore();
            } else if (tile.type.startsWith('l-')) {
              const angle = tile.rotation * Math.PI / 2;
              ctx.save();
              ctx.translate(50, 50);
              ctx.rotate(angle);
              ctx.beginPath();
              ctx.moveTo(0, -50);
              ctx.lineTo(0, 0);
              ctx.lineTo(50, 0);
              ctx.stroke();
              ctx.restore();
            }
            
            ctx.globalAlpha = 1;
          }
        }
      });
    }
  }, [motion, canvasRefs, showHint, highlightPath, animationProgress]);

  const startNewQuestion = () => {
    const newMotion = generateMotion(difficulty);
    setMotion(newMotion);
    setSelectedTile(null);
    setFeedback('');
    setHighlightPath([]);
  };

  const rotateTile = () => {
    if (selectedTile === null) return;
    const [row, col] = selectedTile;
    if (!motion.grid[row][col]) return;
    const newGrid = motion.grid.map(r => r.map(c => c ? {...c} : null));
    newGrid[row][col].rotation = (newGrid[row][col].rotation + 1) % 4;
    setMotion({...motion, grid: newGrid});
  };

  const handleHint = () => {
    setShowHint(true);
    
    // Auto-rotate tiles to solution
    const newGrid = motion.grid.map((row, i) => 
      row.map((tile, j) => ({
        ...tile,
        rotation: motion.solution[i][j].rotation
      }))
    );
    setMotion({...motion, grid: newGrid});
    
    setTimeout(() => {
      setShowHint(false);
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setGameOver(true);
        if (onComplete) onComplete(score);
      }
    }, 4000);
  };

  const handleSubmit = () => {
    const pathResult = checkPath(motion.grid, motion.startRow, motion.endRow, true);
    
    if (pathResult && pathResult.length > 0) {
      setScore(score + 1);
      setFeedback('✓ Path Connected!');
      setHighlightPath(pathResult);
      setAnimationProgress(0);
      
      // Animate path
      let progress = 0;
      const animationDuration = 2000; // 2 seconds total
      const stepDelay = animationDuration / pathResult.length;
      const interval = setInterval(() => {
        progress++;
        setAnimationProgress(progress);
        setUserPosition(pathResult[progress - 1]);
        if (progress >= pathResult.length) {
          clearInterval(interval);
          setTimeout(() => {
            setHighlightPath([]);
            setAnimationProgress(0);
            setUserPosition(null);
            if (currentQuestion < totalQuestions - 1) {
              setCurrentQuestion(currentQuestion + 1);
            } else {
              setGameOver(true);
              if (onComplete) onComplete(score + 1);
            }
          }, 500);
        }
      }, stepDelay);
    } else {
      setFeedback('✗ No valid path. Keep rotating!');
      setHighlightPath([]);
      setAnimationProgress(0);
      setUserPosition(null);
    }
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

  if (!motion) return null;

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto', p: 3, pt: 0 }}>
      <Card sx={{ p: 4, pt: 0, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 1, mt: 0, color: 'text.secondary' }}>
          Click a tile to select, then rotate it to create a path from START to END
        </Typography>
        
        <Box sx={{ display: 'inline-block', position: 'relative', mb: 3, mt: 0, p: 2, bgcolor: '#f1f5f9', borderRadius: 2 }}>
          <Box sx={{ position: 'absolute', left: -50, top: motion.startRow * 80 + 40, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#10b981', color: 'white', width: 40, height: 40, borderRadius: '50%', boxShadow: 2 }}>
            <DirectionsRun sx={{ fontSize: 24 }} />
          </Box>
          <Box sx={{ position: 'absolute', right: -50, top: motion.endRow * 80 + 40, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#ef4444', color: 'white', width: 40, height: 40, borderRadius: '50%', boxShadow: 2 }}>
            <Home sx={{ fontSize: 24 }} />
          </Box>
          
          {userPosition && (
            <Box sx={{ 
              position: 'absolute', 
              left: userPosition[1] * 80 + 40, 
              top: userPosition[0] * 80 + 40, 
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#3b82f6',
              color: 'white',
              width: 30,
              height: 30,
              borderRadius: '50%',
              boxShadow: 3,
              transition: 'all 0.3s ease',
              zIndex: 10
            }}>
              <DirectionsRun sx={{ fontSize: 20 }} />
            </Box>
          )}
          
          {Array.from({ length: 4 }).map((_, blockRow) => (
            <Box key={blockRow} sx={{ display: 'flex', gap: 1 }}>
              {Array.from({ length: 4 }).map((_, blockCol) => {
                const idx = blockRow * 4 + blockCol;
                const tile = motion.grid[blockRow][blockCol];
                return (
                  <Box key={blockCol} sx={{ border: '2px solid #cbd5e1', borderRadius: 1, bgcolor: 'white' }}>
                    <Box
                      onClick={() => setSelectedTile([blockRow, blockCol])}
                      sx={{
                        border: selectedTile && selectedTile[0] === blockRow && selectedTile[1] === blockCol ? '4px solid #10b981' : '2px solid #e2e8f0',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: '#10b981',
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      <canvas
                        ref={ref => {
                          if (ref && !canvasRefs[idx]) {
                            setCanvasRefs(prev => ({...prev, [idx]: ref}));
                          }
                        }}
                        width={80}
                        height={80}
                        style={{ display: 'block', borderRadius: '6px' }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RotateRight />}
            onClick={rotateTile}
            disabled={selectedTile === null}
            sx={{ 
              px: 3, 
              py: 1.5,
              borderColor: '#10b981',
              color: '#10b981',
              '&:hover': {
                borderColor: '#059669',
                bgcolor: '#10b98114'
              },
              '&:disabled': {
                borderColor: '#d1d5db',
                color: '#9ca3af'
              }
            }}
          >
            Rotate Selected
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ 
              px: 4, 
              py: 1.5,
              bgcolor: '#2563eb',
              '&:hover': {
                bgcolor: '#1d4ed8'
              }
            }}
          >
            Check Path
          </Button>
        </Box>

        {feedback && (
          <Typography variant="h6" sx={{ color: feedback.includes('✓') ? 'success.main' : 'error.main', fontWeight: 600 }}>
            {feedback}
          </Typography>
        )}
      </Card>
    </Box>
  );
};

export default MotionChallengeGame;
