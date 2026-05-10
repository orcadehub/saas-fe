import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

// --- Shared Glass Card ---
export const GlassCard = ({ children, sx, ...props }) => (
  <Box
    sx={{
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      borderRadius: '24px',
      overflow: 'hidden',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(0, 0, 0, 0.15)',
        transform: 'translateY(-4px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
      },
      ...sx,
    }}
    {...props}
  >
    {children}
  </Box>
);

// --- Shared Glowing Text ---
export const GlowingText = ({ children, variant = "h1", sx = {} }) => (
  <Typography
    variant={variant}
    sx={{
      background: 'linear-gradient(180deg, #1A202C 0%, #4A5568 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent',
      ...sx
    }}
  >
    {children}
  </Typography>
);

// --- Interactive Cursor ---
export const InteractiveCursor = () => {
    const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        const handleMouseOver = (e) => {
            if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.interactive')) {
               setIsHovering(true);
            } else {
               setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <motion.div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: 32,
                height: 32,
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                bgcolor: '#6a0dad', 
                borderRadius: '50%',
                boxShadow: '0 0 15px 2px rgba(106,13,173,0.4)',
                opacity: 0.6
            }} />
        </motion.div>
    );
};

// --- Particle Background ---
export const ParticleBackground = () => (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box sx={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '60vw',
            height: '60vw',
            background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, rgba(255,255,255,0) 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            animation: 'pulse 15s infinite alternate',
        }}/>
        <Box sx={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '50vw',
            height: '50vw',
            background: 'radial-gradient(circle, rgba(168,85,247,0.03) 0%, rgba(255,255,255,0) 70%)',
            borderRadius: '50%',
            filter: 'blur(80px)',
        }}/>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0% { transform: scale(1) translate(0, 0); }
            50% { transform: scale(1.1) translate(2%, 2%); }
            100% { transform: scale(0.9) translate(-2%, -2%); }
          }
          body { cursor: default; }
          a, button, [role="button"], .interactive { cursor: pointer; }
        `}} />
    </Box>
);
// --- Letter-by-letter animated text ---
export const LetterByLetterText = ({ text, delay = 0, sx = {}, variant = "h1" }) => {
  const letters = React.useMemo(() => text.split(''), [text]);

  return (
    <Typography
      variant={variant}
      sx={{
        fontWeight: 900,
        fontSize: { xs: '3rem', sm: '4.5rem', md: '5.5rem', lg: '6.5rem' },
        lineHeight: 1.05,
        letterSpacing: '-3px',
        textAlign: 'center',
        ...sx,
      }}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.4,
            delay: delay + i * 0.035,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            display: 'inline-block',
            background: letter === ' '
              ? 'transparent'
              : 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 70%, #475569 100%)',
            WebkitBackgroundClip: letter === ' ' ? 'unset' : 'text',
            WebkitTextFillColor: letter === ' ' ? 'transparent' : 'transparent',
            backgroundClip: letter === ' ' ? 'unset' : 'text',
            whiteSpace: letter === ' ' ? 'pre' : 'normal',
            minWidth: letter === ' ' ? '0.3em' : 'auto',
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </Typography>
  );
};
