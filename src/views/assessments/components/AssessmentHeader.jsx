import { Box, Typography, Button, Stack, Chip } from '@mui/material';
import { AccessTime, Person, Logout } from '@mui/icons-material';

export default function AssessmentHeader({ 
  logoUrl, 
  assessmentTitle, 
  studentName, 
  studentEmail, 
  timeRemaining, 
  duration,
  onSubmit 
}) {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerProgress = () => {
    const totalSeconds = duration * 60;
    return (timeRemaining / totalSeconds) * 100;
  };

  const getTimerColor = () => {
    const percentage = getTimerProgress();
    if (percentage < 10) return '#ef4444'; // Red-500
    if (percentage < 40) return '#f59e0b'; // Amber-500
    return '#10b981'; // Emerald-500
  };

  return (
    <Box sx={{ 
      px: { xs: 2, md: 4 }, 
      py: 1.5,
      bgcolor: 'white',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      gap: 3, 
      minHeight: '76px',
      borderBottom: '1px solid #f1f5f9',
      position: 'relative',
      zIndex: 1000
    }}>
      {/* Brand & Assessment Title */}
      <Stack direction="row" alignItems="center" spacing={3} sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo" 
              style={{ height: '36px', width: 'auto' }}
            />
          ) : (
             <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: 'white', fontWeight: 900, fontSize: '1.2rem' }}>O</Typography>
             </Box>
          )}
        </Box>
        
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 800, 
            color: '#0f172a',
            letterSpacing: '-0.02em',
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap'
          }}>
            {assessmentTitle}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
             <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} /> Active Assessment Session
          </Typography>
        </Box>
      </Stack>
      
      {/* Student & Timer Section */}
      <Stack direction="row" alignItems="center" spacing={4} sx={{ flexShrink: 0 }}>
        {/* Student Info */}
        <Box sx={{ 
          display: { xs: 'none', lg: 'flex' }, 
          alignItems: 'center', 
          gap: 1.5,
          bgcolor: '#f8fafc',
          pl: 1,
          pr: 2.5,
          py: 0.75,
          borderRadius: '16px',
          border: '1px solid #f1f5f9'
        }}>
          <Box sx={{ 
            width: 36, height: 36, borderRadius: '12px', 
            bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid #e2e8f0', color: '#6366f1'
          }}>
            <Person sx={{ fontSize: '1.1rem' }} />
          </Box>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
              {studentName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.7rem' }}>
              {studentEmail}
            </Typography>
          </Box>
        </Box>

        {/* Timer Display */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          bgcolor: '#0f172a',
          borderRadius: '16px',
          pl: 2,
          pr: 2.5,
          py: 1,
          flexShrink: 0,
          boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)',
          animation: timeRemaining <= 300 ? 'timer-pulse 2s infinite' : 'none',
          '@keyframes timer-pulse': {
            '0%': { boxShadow: '0 0 0 0px rgba(239, 68, 68, 0.4)' },
            '70%': { boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)' },
            '100%': { boxShadow: '0 0 0 0px rgba(239, 68, 68, 0)' }
          }
        }}>
          <AccessTime sx={{ color: getTimerColor(), fontSize: '1.25rem' }} />
          <Box sx={{ minWidth: '70px' }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 900, 
              color: 'white', 
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '-0.02em',
              lineHeight: 1
            }}>
              {formatTime(timeRemaining)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase' }}>
               Remains
            </Typography>
          </Box>
        </Box>

        {/* Action Button */}
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={timeRemaining <= 5}
          startIcon={<Logout />}
          sx={{ 
            px: 4, 
            py: 1.4, 
            fontWeight: 900, 
            textTransform: 'none', 
            borderRadius: '16px',
            bgcolor: '#ef4444',
            color: 'white',
            boxShadow: '0 8px 20px -6px rgba(239, 68, 68, 0.5)',
            '&:hover': { bgcolor: '#dc2626', transform: 'translateY(-1px)' },
            '&:active': { transform: 'translateY(0)' },
            display: timeRemaining <= 5 ? 'none' : 'flex',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          Final Submit
        </Button>
      </Stack>
    </Box>
  );
}
