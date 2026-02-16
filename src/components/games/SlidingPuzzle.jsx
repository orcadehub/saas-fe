import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';

const SlidingPuzzle = ({ level, onSubmit, themeColor = '#6a0dad' }) => {
  const [gameData, setGameData] = useState(null);
  const [tiles, setTiles] = useState([]);

  const shufflePuzzle = (initialTiles, rows, cols) => {
    const tiles = [...initialTiles];
    let emptyIndex = tiles.indexOf(0);
    
    // Make 200 random valid moves
    for (let i = 0; i < 200; i++) {
      const emptyRow = Math.floor(emptyIndex / cols);
      const emptyCol = emptyIndex % cols;
      const validMoves = [];
      
      if (emptyRow > 0) validMoves.push(emptyIndex - cols);
      if (emptyRow < rows - 1) validMoves.push(emptyIndex + cols);
      if (emptyCol > 0) validMoves.push(emptyIndex - 1);
      if (emptyCol < cols - 1) validMoves.push(emptyIndex + 1);
      
      const moveIndex = validMoves[Math.floor(Math.random() * validMoves.length)];
      [tiles[emptyIndex], tiles[moveIndex]] = [tiles[moveIndex], tiles[emptyIndex]];
      emptyIndex = moveIndex;
    }
    
    return tiles;
  };

  useEffect(() => {
    if (level?.correctAnswer) {
      const data = JSON.parse(level.correctAnswer);
      setGameData(data);
      
      // Create ordered tiles
      const orderedTiles = [];
      for (let i = 1; i < data.rows * data.cols; i++) {
        orderedTiles.push(i);
      }
      orderedTiles.push(0);
      
      // Shuffle them
      setTiles(shufflePuzzle(orderedTiles, data.rows, data.cols));
    }
  }, [level]);

  const handleReset = () => {
    const orderedTiles = [];
    for (let i = 1; i < gameData.rows * gameData.cols; i++) {
      orderedTiles.push(i);
    }
    orderedTiles.push(0);
    setTiles(shufflePuzzle(orderedTiles, gameData.rows, gameData.cols));
  };

  const handleTileClick = (index) => {
    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(index / gameData.cols);
    const col = index % gameData.cols;
    const emptyRow = Math.floor(emptyIndex / gameData.cols);
    const emptyCol = emptyIndex % gameData.cols;

    // Check if tile is adjacent to empty space
    const isAdjacent = 
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1);

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);

      // Check if puzzle is solved
      const isSolved = newTiles.every((tile, idx) => {
        if (idx === newTiles.length - 1) return tile === 0;
        return tile === idx + 1;
      });

      if (isSolved) {
        setTimeout(() => onSubmit(true), 500);
      }
    }
  };

  if (!gameData) return null;

  const tileSize = 80;

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ color: themeColor, fontWeight: 600 }}>
          Slide tiles to arrange them in order (1 to {gameData.rows * gameData.cols - 1})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleReset}
          sx={{ borderColor: themeColor, color: themeColor }}
        >
          Reset
        </Button>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gameData.cols}, ${tileSize}px)`,
        gap: 1,
        p: 2,
        bgcolor: `${themeColor}14`,
        borderRadius: 2,
        border: `2px solid ${themeColor}`
      }}>
        {tiles.map((tile, index) => {
          const isEmpty = tile === 0;
          const isCorrect = isEmpty ? index === tiles.length - 1 : tile === index + 1;

          return (
            <Box
              key={index}
              onClick={() => !isEmpty && handleTileClick(index)}
              sx={{
                width: `${tileSize}px`,
                height: `${tileSize}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isEmpty ? 'transparent' : isCorrect ? '#d4f4dd' : 'white',
                border: isEmpty ? 'none' : '2px solid',
                borderColor: isCorrect ? '#10b981' : themeColor,
                borderRadius: 1,
                cursor: isEmpty ? 'default' : 'pointer',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: themeColor,
                transition: 'all 0.2s',
                '&:hover': isEmpty ? {} : {
                  transform: 'scale(1.05)',
                  boxShadow: `0 4px 12px ${themeColor}4D`
                }
              }}
            >
              {!isEmpty && tile}
            </Box>
          );
        })}
      </Box>

      <Typography sx={{ mt: 2, color: themeColor, fontSize: '0.9rem', opacity: 0.8 }}>
        Click on a tile next to the empty space to slide it
      </Typography>
    </Box>
  );
};

export default SlidingPuzzle;
