import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';

const StarryBackground = () => {
  const [activeStar, setActiveStar] = useState(null);

  const stars = useMemo(() => 
    Array.from({ length: 150 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    })), []);

  useEffect(() => {
    let timeoutId;
    
    const triggerShootingStar = () => {
      const duration = 1500; // 1.5s animation
      const nextDelay = [1000, 2000, 3000, 4000][Math.floor(Math.random() * 4)];
      
      const newStar = {
        id: Date.now(),
        left: `${Math.random() * 80 + 10}%`,
        top: `${Math.random() * 60 + 10}%`,
        rotate: `${Math.random() * 360}deg`,
        speed: duration / 1000
      };

      setActiveStar(newStar);
      
      // Remove star after it finishes
      setTimeout(() => setActiveStar(null), duration);
      
      // Schedule next one
      timeoutId = setTimeout(triggerShootingStar, nextDelay + duration);
    };

    triggerShootingStar();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blink {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes shootingStar {
          0% { transform: translateY(0); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(800px); opacity: 0; }
        }
      ` }} />
      {stars.map((star) => (
        <Box
          key={star.id}
          sx={{
            position: 'absolute',
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            borderRadius: '50%',
            bgcolor: '#ffffff',
            boxShadow: '0 0 4px #ffffff',
            animation: `blink ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
      
      {activeStar && (
        <Box
          sx={{
            position: 'absolute',
            left: activeStar.left,
            top: activeStar.top,
            transform: `rotate(${activeStar.rotate})`,
            zIndex: 1
          }}
        >
          <Box
            sx={{
              width: '2px',
              height: '120px',
              background: 'linear-gradient(to bottom, #ffffff, transparent)',
              animation: `shootingStar ${activeStar.speed}s linear forwards`,
              opacity: 0,
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default StarryBackground;
