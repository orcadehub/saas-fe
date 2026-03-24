import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export default function Avatar3D({ isSpeaking }) {
  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#1a1a2e',
        position: 'relative'
      }}
    >
      {/* Background Pulse Effect */}
      {isSpeaking && (
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
            zIndex: 0
          }}
        />
      )}

      {/* Main Avatar Body (Simplified 3D-ish) */}
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div
          animate={isSpeaking ? { y: [0, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <Box sx={{ 
            width: 120, 
            height: 120, 
            borderRadius: '50%', 
            bgcolor: '#6366f1',
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid #fff'
          }}>
             <Typography variant="h1" sx={{ color: '#fff', fontWeight: 900 }}>AI</Typography>
          </Box>
        </motion.div>
        
        <Typography variant="h4" sx={{ mt: 3, color: '#94a3b8', fontWeight: 800, letterSpacing: '0.1em' }}>
          {isSpeaking ? 'AI INTERVIEWER SPEAKING...' : 'AI INTERVIEWER READY'}
        </Typography>
      </Box>

      {/* Waveform Visualization */}
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mt: 4, height: 40 }}>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={isSpeaking ? { height: [10, 30, 10] } : { height: 10 }}
            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
            style={{
              width: 4,
              backgroundColor: '#6366f1',
              borderRadius: 2
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
