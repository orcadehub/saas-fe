import { Box, Typography, Button } from '@mui/material';
import { AccessTime, Person } from '@mui/icons-material';

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

  return (
    <Box sx={{ 
      p: 2, 
      bgcolor: 'white',
      display: 'flex', 
      alignItems: 'center', 
      gap: 2, 
      minHeight: '70px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderBottom: '1px solid #e0e0e0'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {logoUrl && (
          <img 
            src={logoUrl} 
            alt="Logo" 
            style={{ height: '40px', width: 'auto', borderRadius: '6px' }}
          />
        )}
      </Box>
      
      <Typography variant="h5" sx={{ 
        fontWeight: 700, 
        flexShrink: 1, 
        overflow: 'hidden', 
        textOverflow: 'ellipsis', 
        whiteSpace: 'nowrap', 
        minWidth: 0
      }}>
        {assessmentTitle}
      </Typography>
      
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 0 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          bgcolor: '#f5f5f5',
          px: 2,
          py: 1,
          borderRadius: 2
        }}>
          <Person sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" sx={{ 
              fontWeight: 600,
              lineHeight: 1.2
            }}>
              {studentName}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'text.secondary',
              lineHeight: 1.2
            }}>
              {studentEmail}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        bgcolor: timeRemaining < (duration * 60 * 0.1) ? '#f44336' : 
                 timeRemaining < (duration * 60 * 0.4) ? '#ff9800' : 
                 '#4caf50',
        borderRadius: 2,
        px: 2,
        py: 1,
        flexShrink: 0,
        height: '36.5px',
        animation: timeRemaining <= 120 ? 'pulse 1s infinite' : 'none',
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' }
        }
      }}>
        <AccessTime sx={{ color: 'white', fontSize: '1.2rem' }} />
        <Typography variant="body1" sx={{ 
          fontWeight: 600, 
          color: 'white', 
          minWidth: '80px',
          fontFamily: 'monospace'
        }}>
          {formatTime(timeRemaining)}
        </Typography>
      </Box>
      
      <Button
        variant="contained"
        color="error"
        onClick={onSubmit}
        disabled={timeRemaining <= 5}
        sx={{ 
          px: 3, 
          py: 1, 
          fontWeight: 600, 
          textTransform: 'none', 
          borderRadius: 2,
          flexShrink: 0,
          display: timeRemaining <= 5 ? 'none' : 'block'
        }}
      >
        Submit Assessment
      </Button>
    </Box>
  );
}
