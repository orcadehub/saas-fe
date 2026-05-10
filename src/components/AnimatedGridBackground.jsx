import React from 'react';
import { Box } from '@mui/material';

const AnimatedGridBackground = () => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    {/* Base light */}
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#f8fafc' }} />

    {/* Animated grid */}
    <Box sx={{
      position: 'absolute', inset: 0,
      backgroundImage: `
        linear-gradient(rgba(100, 116, 139, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(100, 116, 139, 0.05) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
      animation: 'gridMove 20s linear infinite',
    }} />

    {/* Glow orb 1 – soft purple */}
    <Box sx={{
      position: 'absolute', top: '-15%', left: '-10%',
      width: '70vw', height: '70vw',
      background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)',
      borderRadius: '50%', filter: 'blur(80px)',
      animation: 'floatOrb1 18s ease-in-out infinite alternate',
    }} />

    {/* Glow orb 2 – soft blue */}
    <Box sx={{
      position: 'absolute', bottom: '-20%', right: '-15%',
      width: '60vw', height: '60vw',
      background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)',
      borderRadius: '50%', filter: 'blur(100px)',
      animation: 'floatOrb2 22s ease-in-out infinite alternate',
    }} />

    {/* Glow orb 3 – soft pink */}
    <Box sx={{
      position: 'absolute', top: '40%', right: '10%',
      width: '35vw', height: '35vw',
      background: 'radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 65%)',
      borderRadius: '50%', filter: 'blur(60px)',
      animation: 'floatOrb3 15s ease-in-out infinite alternate',
    }} />

    {/* Subtle noise texture overlay */}
    <Box sx={{
      position: 'absolute', inset: 0, opacity: 0.02,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    }} />

    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes gridMove {
        0% { transform: translate(0, 0); }
        100% { transform: translate(60px, 60px); }
      }
      @keyframes floatOrb1 {
        0% { transform: translate(0, 0) scale(1); }
        100% { transform: translate(8%, 12%) scale(1.15); }
      }
      @keyframes floatOrb2 {
        0% { transform: translate(0, 0) scale(1); }
        100% { transform: translate(-10%, -8%) scale(1.1); }
      }
      @keyframes floatOrb3 {
        0% { transform: translate(0, 0) scale(0.9); }
        100% { transform: translate(-6%, 10%) scale(1.05); }
      }
      body { cursor: default; }
      a, button, [role="button"], .interactive { cursor: pointer; }
    ` }} />
  </Box>
);


export default AnimatedGridBackground;
