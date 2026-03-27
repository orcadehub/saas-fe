import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const CelestialCursor = () => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const newPos = { x: e.clientX, y: e.clientY };
      setMousePos(newPos);
      
      // Add a particle to the trail
      setTrail((prev) => [
        { id: Date.now(), x: e.clientX, y: e.clientY },
        ...prev.slice(0, 15), // Keep last 15 positions
      ]);
    };

    const handleMouseOver = (e) => {
      setIsHovering(!!(e.target.closest('button') || e.target.closest('a') || e.target.closest('.interactive')));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* White Trail Stars */}
      <AnimatePresence>
        {trail.map((point, index) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 0.8, scale: 1.2 }}
            animate={{ opacity: 0, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              position: 'fixed',
              left: point.x - 2,
              top: point.y - 2,
              width: Math.max(1, 6 - index * 0.4),
              height: Math.max(1, 6 - index * 0.4),
              borderRadius: '50%',
              background: 'white',
              boxShadow: '0 0 10px 2px rgba(255,255,255,0.8)',
              zIndex: 9998 - index,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Main Cursor Head */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
        animate={{
          x: mousePos.x - 16,
          y: mousePos.y - 16,
          scale: isHovering ? 2 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
      >
        <Box sx={{
          width: '8px',
          height: '8px',
          background: 'white',
          borderRadius: '50%',
          boxShadow: '0 0 15px 5px rgba(255,255,255,0.7), 0 0 30px 10px rgba(139,92,246,0.2)',
        }} />
      </motion.div>
    </Box>
  );
};

export default CelestialCursor;
