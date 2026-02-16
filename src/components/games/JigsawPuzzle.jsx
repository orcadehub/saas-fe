import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const JigsawPuzzle = ({ level, onSubmit }) => {
  const [gameData, setGameData] = useState(null);
  const [currentPieces, setCurrentPieces] = useState([]);
  const [draggedPiece, setDraggedPiece] = useState(null);

  useEffect(() => {
    if (level?.correctAnswer) {
      const data = JSON.parse(level.correctAnswer);
      setGameData(data);
      setCurrentPieces(data.pieces.map((p, idx) => ({ ...p, currentPosition: idx })));
    }
  }, [level]);

  const handleDragStart = (e, index) => {
    setDraggedPiece(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedPiece === null || draggedPiece === dropIndex) return;

    const newPieces = [...currentPieces];
    [newPieces[draggedPiece], newPieces[dropIndex]] = [newPieces[dropIndex], newPieces[draggedPiece]];
    
    newPieces[draggedPiece].currentPosition = draggedPiece;
    newPieces[dropIndex].currentPosition = dropIndex;
    
    setCurrentPieces(newPieces);
    setDraggedPiece(null);

    // Check if puzzle is solved
    const isSolved = newPieces.every((piece, idx) => piece.correctPosition === idx);
    if (isSolved) {
      setTimeout(() => onSubmit(true), 500);
    }
  };

  if (!gameData) return null;

  const pieceSize = 100;

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, color: '#6a0dad', fontWeight: 600 }}>
        {gameData.pattern.name} Puzzle
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gameData.cols}, ${pieceSize}px)`,
        gap: 1,
        p: 2,
        bgcolor: '#f3e8ff',
        borderRadius: 2,
        border: '2px solid #6a0dad'
      }}>
        {currentPieces.map((piece, index) => {
          const row = Math.floor(piece.correctPosition / gameData.cols);
          const col = piece.correctPosition % gameData.cols;
          const isCorrect = piece.correctPosition === index;

          return (
            <Box
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              sx={{
                width: `${pieceSize}px`,
                height: `${pieceSize}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isCorrect ? '#d4f4dd' : 'white',
                border: '2px solid',
                borderColor: isCorrect ? '#10b981' : '#9d4edd',
                borderRadius: 1,
                cursor: 'grab',
                fontSize: '3rem',
                position: 'relative',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(106,13,173,0.3)',
                  zIndex: 10
                },
                '&:active': {
                  cursor: 'grabbing',
                  opacity: 0.7
                }
              }}
            >
              <Typography sx={{ fontSize: '3rem' }}>{gameData.pattern.emoji}</Typography>
              <Box sx={{
                position: 'absolute',
                top: 2,
                left: 2,
                bgcolor: 'rgba(106,13,173,0.8)',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                {piece.id + 1}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Typography sx={{ mt: 2, color: '#9d4edd', fontSize: '0.9rem' }}>
        Drag and drop pieces to complete the puzzle
      </Typography>
    </Box>
  );
};

export default JigsawPuzzle;
