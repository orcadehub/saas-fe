import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const OrderingGame = ({ level, onComplete }) => {
  const [items, setItems] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const shuffled = [...level.options].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setSubmitted(false);
    setIsCorrect(false);
  }, [level]);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null) return;
    
    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    
    setItems(newItems);
    setDraggedIndex(null);
  };

  const handleSubmit = () => {
    const userOrder = items.map(item => item.text);
    const correctOrder = JSON.parse(level.correctAnswer);
    
    const correct = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
    setIsCorrect(correct);
    setSubmitted(true);
    
    if (correct) {
      setTimeout(() => onComplete(true), 1000);
    }
  };

  const handleReset = () => {
    const shuffled = [...level.options].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
        {items.map((item, index) => (
          <Box
            key={item.id}
            draggable={!submitted}
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            sx={{
              minWidth: 150,
              p: 2,
              bgcolor: submitted ? (isCorrect ? '#d1fae5' : '#fee2e2') : '#f3e8ff',
              border: '2px solid',
              borderColor: submitted ? (isCorrect ? '#10b981' : '#ef4444') : '#9d4edd',
              borderRadius: 2,
              cursor: submitted ? 'default' : 'move',
              textAlign: 'center',
              fontWeight: 600,
              color: '#6a0dad',
              transition: 'all 0.2s',
              '&:hover': submitted ? {} : {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(106, 13, 173, 0.2)'
              }
            }}
          >
            <Typography sx={{ fontSize: '0.9rem', color: '#9d4edd', mb: 0.5 }}>
              {index + 1}
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {item.text}
            </Typography>
          </Box>
        ))}
      </Box>

      {!submitted ? (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              bgcolor: '#6a0dad',
              '&:hover': { bgcolor: '#5a0b8d' },
              px: 4,
              py: 1
            }}
          >
            Submit Order
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{
              borderColor: '#6a0dad',
              color: '#6a0dad',
              '&:hover': { borderColor: '#5a0b8d', bgcolor: '#f3e8ff' }
            }}
          >
            Reset
          </Button>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          {isCorrect ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: '#10b981', fontSize: 32 }} />
              <Typography sx={{ color: '#10b981', fontWeight: 700, fontSize: '1.25rem' }}>
                Correct Order!
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Cancel sx={{ color: '#ef4444', fontSize: 32 }} />
                <Typography sx={{ color: '#ef4444', fontWeight: 700, fontSize: '1.25rem' }}>
                  Incorrect Order
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={handleReset}
                sx={{
                  bgcolor: '#6a0dad',
                  '&:hover': { bgcolor: '#5a0b8d' }
                }}
              >
                Try Again
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default OrderingGame;
