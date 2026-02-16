import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography } from '@mui/material';

const emojiSets = [
  ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🍑', '🥝', '🍍', '🥭', '🍋', '🍈', '🫐', '🥥', '🍅', '🥑', '🥦'],
  ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦆'],
  ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥊', '🥋', '⛳', '🎯'],
  ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛵', '🏍️', '🚲', '🛴', '🚁'],
  ['🌸', '🌺', '🌻', '🌷', '🌹', '🏵️', '🌼', '💐', '🌾', '🌿', '🍀', '🍁', '🍂', '🍃', '🌱', '🌴', '🌵', '🌳'],
  ['⭐', '🌟', '✨', '💫', '🌙', '☀️', '🌈', '☁️', '⛅', '🌤️', '⛈️', '🌥️', '🌦️', '🌧️', '🌨️', '🌩️', '❄️', '☃️'],
  ['🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎼', '🎹', '🎺', '🎸', '🎻', '🥁', '🎲', '🎯', '🎳', '🎮', '🎰', '🧩'],
  ['📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '💾', '💿', '📀', '📷', '📹', '📺', '📻', '⏰', '⌚', '📡', '🔋', '💡']
];

const generateMemoryCards = (rows, cols) => {
  const totalPairs = (rows * cols) / 2;
  const emojiSet = emojiSets[Math.floor(Math.random() * emojiSets.length)];
  const selectedEmojis = [];
  
  while (selectedEmojis.length < totalPairs) {
    const emoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];
    if (!selectedEmojis.includes(emoji)) {
      selectedEmojis.push(emoji);
    }
  }
  
  const cards = [...selectedEmojis, ...selectedEmojis];
  
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  
  return { rows, cols, cards };
};

const MemoryCardGame = ({ level, onSubmit, themeColor = '#6a0dad' }) => {
  const levelData = JSON.parse(level.correctAnswer);
  const gameData = useMemo(() => generateMemoryCards(levelData.rows, levelData.cols), [level.levelNumber, levelData.rows, levelData.cols]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    setFlippedCards([]);
    setMatchedCards([]);
    setIsChecking(false);
  }, [level.levelNumber]);

  const handleCardClick = (index) => {
    if (isChecking || flippedCards.includes(index) || matchedCards.includes(index) || flippedCards.length >= 2) return;

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsChecking(true);
      const [first, second] = newFlipped;
      
      if (gameData.cards[first] === gameData.cards[second]) {
        const newMatched = [...matchedCards, first, second];
        setMatchedCards(newMatched);
        setFlippedCards([]);
        setIsChecking(false);
        
        // Check if all cards are matched
        if (newMatched.length === gameData.cards.length) {
          setTimeout(() => onSubmit(true), 500);
        }
      } else {
        setTimeout(() => {
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  if (!gameData) return null;

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', p: 3 }}>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gameData.cols}, 1fr)`,
        gap: 2,
        maxWidth: '600px'
      }}>
        {gameData.cards.map((emoji, index) => {
          const isFlipped = flippedCards.includes(index) || matchedCards.includes(index);
          const isMatched = matchedCards.includes(index);

          return (
            <Box
              key={index}
              onClick={() => handleCardClick(index)}
              sx={{
                width: '80px',
                height: '80px',
                position: 'relative',
                cursor: isMatched || isChecking ? 'default' : 'pointer',
                perspective: '1000px'
              }}
            >
              <Box sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}>
                {/* Back of card */}
                <Box sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: themeColor,
                  borderRadius: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}CC 100%)`,
                  '&:hover': !isMatched && !isChecking ? {
                    transform: 'scale(1.05)',
                    boxShadow: `0 6px 12px ${themeColor}66`
                  } : {}
                }}>
                  <Typography sx={{ fontSize: '2rem', color: 'white' }}>?</Typography>
                </Box>

                {/* Front of card */}
                <Box sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isMatched ? '#10b981' : 'white',
                  borderRadius: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  border: '2px solid',
                  borderColor: isMatched ? '#059669' : '#e5e7eb'
                }}>
                  <Typography sx={{ fontSize: '2.5rem' }}>{emoji}</Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default MemoryCardGame;
