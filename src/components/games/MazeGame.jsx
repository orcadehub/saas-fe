import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { DirectionsWalk, KeyboardArrowUp, KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowRight, Home, Block } from '@mui/icons-material';

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

const MazeGame = ({ level, onComplete, showPath = false, onNoPathCheck, disabled = false, themeColor = '#6a0dad' }) => {
  const levelData = JSON.parse(level.correctAnswer);
  const mazeData = useMemo(() => generateMaze(levelData.rows, levelData.cols), [level.levelNumber, levelData.rows, levelData.cols]);
  const [playerPos, setPlayerPos] = useState([mazeData.start[0], mazeData.start[1]]);
  const [completed, setCompleted] = useState(false);
  const [direction, setDirection] = useState('down');
  const [hitWall, setHitWall] = useState(false);
  const [hitWallPos, setHitWallPos] = useState(null);
  const [solutionPath, setSolutionPath] = useState([]);

  useEffect(() => {
    setPlayerPos([mazeData.start[0], mazeData.start[1]]);
    setCompleted(false);
    setHitWall(false);
    setHitWallPos(null);
  }, [level.levelNumber, mazeData.start[0], mazeData.start[1]]);

  const checkWin = useCallback((pos) => {
    if (pos[0] === mazeData.end[0] && pos[1] === mazeData.end[1]) {
      setCompleted(true);
      onComplete(true);
    }
  }, [mazeData.end, onComplete]);

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

  const hasPath = useMemo(() => {
    const pathExists = findPath().length > 0;
    console.log('Maze hasPath:', pathExists);
    return pathExists;
  }, [findPath]);

  useEffect(() => {
    if (onNoPathCheck) {
      // Use setTimeout to ensure this runs after all synchronous updates
      const timer = setTimeout(() => {
        onNoPathCheck(hasPath);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [hasPath]);

  const handleNoPath = () => {
    setCompleted(true);
    if (hasPath) {
      setSolutionPath(findPath());
    }
    onComplete(!hasPath);
  };

  useEffect(() => {
    if (showPath) {
      const path = findPath();
      setSolutionPath(path);
    } else {
      setSolutionPath([]);
    }
  }, [showPath, findPath]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (completed || disabled) return;
      
      const [row, col] = playerPos;
      let newRow = row;
      let newCol = col;
      let newDirection = direction;

      if (e.key === 'ArrowUp') {
        newRow = Math.max(0, row - 1);
        newDirection = 'up';
      } else if (e.key === 'ArrowDown') {
        newRow = Math.min(mazeData.grid.length - 1, row + 1);
        newDirection = 'down';
      } else if (e.key === 'ArrowLeft') {
        newCol = Math.max(0, col - 1);
        newDirection = 'left';
      } else if (e.key === 'ArrowRight') {
        newCol = Math.min(mazeData.grid[0].length - 1, col + 1);
        newDirection = 'right';
      } else return;

      if (mazeData.grid[newRow][newCol] === 0) {
        const newPos = [newRow, newCol];
        setPlayerPos(newPos);
        setDirection(newDirection);
        checkWin(newPos);
      } else {
        setHitWall(true);
        setTimeout(() => {
          setPlayerPos([mazeData.start[0], mazeData.start[1]]);
          setHitWall(false);
          setHitWallPos(null);
        }, 500);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPos, completed, mazeData, checkWin, direction, disabled]);

  const cellSize = Math.min(Math.floor(600 / mazeData.grid.length), Math.floor(600 / mazeData.grid[0].length));

  return (
    <Box sx={{ mb: 3, display: 'flex', gap: 3, alignItems: 'flex-start' }}>
      <Box sx={{ flex: 1 }}>
        {completed && (
          <Typography sx={{ mt: 2, color: '#10b981', fontWeight: 700, fontSize: '1.25rem' }}>
            ✅ Maze Completed!
          </Typography>
        )}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ mb: 2, color: themeColor, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          Use arrow keys to navigate:
          <KeyboardArrowUp sx={{ fontSize: 24, bgcolor: `${themeColor}14`, borderRadius: 1, p: 0.5 }} />
          <KeyboardArrowDown sx={{ fontSize: 24, bgcolor: `${themeColor}14`, borderRadius: 1, p: 0.5 }} />
          <KeyboardArrowLeft sx={{ fontSize: 24, bgcolor: `${themeColor}14`, borderRadius: 1, p: 0.5 }} />
          <KeyboardArrowRight sx={{ fontSize: 24, bgcolor: `${themeColor}14`, borderRadius: 1, p: 0.5 }} />
        </Typography>
        <Box sx={{ 
        display: 'inline-block', 
        display: 'inline-block', 
        border: `3px solid ${themeColor}`, 
        borderRadius: 2,
        p: 1,
        bgcolor: `${themeColor}0D`,
        maxWidth: '100%',
        overflowX: 'auto'
      }}>
        {mazeData.grid.map((row, rowIdx) => (
          <Box key={rowIdx} sx={{ display: 'flex' }}>
            {row.map((cell, colIdx) => {
              const isPlayer = playerPos[0] === rowIdx && playerPos[1] === colIdx;
              const isStart = mazeData.start[0] === rowIdx && mazeData.start[1] === colIdx;
              const isEnd = mazeData.end[0] === rowIdx && mazeData.end[1] === colIdx;
              const isHitWall = hitWallPos && hitWallPos[0] === rowIdx && hitWallPos[1] === colIdx;
              const isPath = solutionPath.some(p => p[0] === rowIdx && p[1] === colIdx);
              
              const isWall = cell === 1;
              
              return (
                <Box
                  key={colIdx}
                  sx={{
                    width: cellSize,
                    height: cellSize,
                    bgcolor: isEnd ? '#10b981' : isStart ? '#fef3c7' : isPath ? '#fbbf24' : 'white',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: cellSize * 0.6,
                    transition: 'all 0.2s'
                  }}
                >
                  {isEnd && !isPlayer && (
                    <Home sx={{ fontSize: cellSize * 0.7, color: 'white' }} />
                  )}
                  {isPlayer && (
                    <DirectionsWalk 
                      sx={{ 
                        fontSize: cellSize * 0.8,
                        color: hitWall ? '#ef4444' : themeColor,
                        animation: hitWall ? 'shake 0.5s' : 'walk 0.6s steps(2) infinite'
                      }} 
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
      </Box>
      <style>{`
        @keyframes walk {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-2px) scale(1.05); }
          75% { transform: translateY(-2px) scale(0.95); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </Box>
  );
};

export default MazeGame;
