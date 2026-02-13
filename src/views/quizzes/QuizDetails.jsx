import { Typography, Box, Button, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Checkbox, FormControlLabel } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { AccessTime, Code, Quiz, CalendarToday, Wifi, Warning } from '@mui/icons-material';
import { useState } from 'react';
import useConfig from 'hooks/useConfig';

export default function QuizDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: { borderRadius } } = useConfig();
  const [showNetworkCheck, setShowNetworkCheck] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [ipLoading, setIpLoading] = useState(false);
  const [userIP, setUserIP] = useState('');
  const [ipVerified, setIpVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const quiz = {
    _id: id,
    title: 'Python Fundamentals',
    description: 'Test your knowledge of Python programming fundamentals including data types, control structures, functions, and object-oriented programming concepts. This quiz covers variables, loops, functions, classes, and more.',
    duration: 60,
    questions: 5,
    quizQuestions: 10,
    startTime: new Date().toISOString(),
    totalMarks: 100,
    status: 'active'
  };

  const handleStartQuiz = async () => {
    setShowNetworkCheck(true);
    setIpLoading(true);
    setIpVerified(false);
    
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setUserIP(data.ip);
      setIpVerified(true);
    } catch (error) {
      console.error('Error fetching IP:', error);
      setUserIP('Unable to detect');
      setIpVerified(false);
    } finally {
      setIpLoading(false);
    }
  };

  const handleContinueToInstructions = () => {
    setShowNetworkCheck(false);
    setShowInstructions(true);
  };

  const handleStartTest = () => {
    setShowInstructions(false);
    console.log('Starting quiz...');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ 
        borderRadius: `${borderRadius}px`,
        boxShadow: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            {quiz.title}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
            {quiz.description}
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                backgroundColor: 'grey.50',
                borderRadius: `${borderRadius}px`,
                p: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccessTime sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {quiz.duration} Minutes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Duration
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                backgroundColor: 'grey.50',
                borderRadius: `${borderRadius}px`,
                p: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Code sx={{ fontSize: 40, color: 'success.main' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {quiz.questions} Coding
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Coding Questions
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                backgroundColor: 'grey.50',
                borderRadius: `${borderRadius}px`,
                p: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Quiz sx={{ fontSize: 40, color: 'info.main' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {quiz.quizQuestions} Quiz
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quiz Questions
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                backgroundColor: 'grey.50',
                borderRadius: `${borderRadius}px`,
                p: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CalendarToday sx={{ fontSize: 40, color: 'secondary.main' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {quiz.totalMarks} Marks
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Marks
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ 
            backgroundColor: 'grey.50',
            borderRadius: `${borderRadius}px`,
            p: 3,
            mb: 4
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Start Date & Time
            </Typography>
            <Box sx={{ display: 'flex', gap: 6 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Date
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {new Date(quiz.startTime).toLocaleDateString('en-GB')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Time
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {new Date(quiz.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </Typography>
              </Box>
            </Box>
          </Card>

          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={handleStartQuiz}
              sx={{
                px: 6,
                py: 2,
                fontWeight: 700,
                fontSize: '1.1rem',
                borderRadius: `${borderRadius}px`,
                backgroundColor: 'secondary.light',
                color: 'secondary.main',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: 'secondary.light',
                  boxShadow: 'none'
                }
              }}
            >
              Start Quiz
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Network Check Modal */}
      <Dialog 
        open={showNetworkCheck} 
        onClose={() => setShowNetworkCheck(false)} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: `${borderRadius}px`,
            boxShadow: 4
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          py: 3,
          backgroundColor: 'primary.lighter',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Wifi sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Network Verification
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Verifying your network connection and access permissions
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {ipLoading ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: 300,
              gap: 3,
              p: 4
            }}>
              <Box sx={{ position: 'relative' }}>
                <Wifi sx={{ 
                  fontSize: 80, 
                  color: 'primary.main',
                  animation: 'pulse 2s infinite'
                }} />
                <CircularProgress 
                  size={100} 
                  sx={{ 
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    color: 'primary.light'
                  }} 
                />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Checking Network Access...
              </Typography>
              <Typography sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 400 }}>
                Please wait while we verify your network connection.
              </Typography>
              <style>
                {`
                  @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                  }
                `}
              </style>
            </Box>
          ) : (
            <Box sx={{ p: 4, display: 'flex', gap: 3 }}>
              <Box sx={{ 
                flex: 1,
                p: 4, 
                backgroundColor: 'grey.50',
                borderRadius: `${borderRadius}px`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                gap: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Network Information
                </Typography>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Your IP Address
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, fontFamily: 'monospace' }}>
                    {userIP}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                flex: 1,
                p: 4, 
                backgroundColor: ipVerified ? 'success.lighter' : 'error.lighter',
                borderRadius: `${borderRadius}px`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                gap: 2
              }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%',
                  backgroundColor: ipVerified ? 'success.main' : 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="h3" sx={{ color: 'white' }}>
                    {ipVerified ? '✓' : '✗'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ 
                    color: ipVerified ? 'success.main' : 'error.main',
                    fontWeight: 700,
                    mb: 1
                  }}>
                    {ipVerified ? 'Access Granted' : 'Access Denied'}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: ipVerified ? 'success.dark' : 'error.dark'
                  }}>
                    {ipVerified ? 
                      'Your network connection is verified.' :
                      'Unable to verify network connection.'
                    }
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          backgroundColor: 'grey.50',
          borderTop: '1px solid',
          borderColor: 'divider',
          justifyContent: 'space-between'
        }}>
          <Button 
            onClick={() => setShowNetworkCheck(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleContinueToInstructions}
            disabled={ipLoading || !ipVerified}
            sx={{
              backgroundColor: ipVerified ? 'secondary.light' : 'grey.300',
              color: ipVerified ? 'secondary.main' : 'text.disabled',
              fontWeight: 600,
              px: 4,
              '&:hover': {
                backgroundColor: ipVerified ? 'secondary.light' : 'grey.300'
              }
            }}
          >
            {ipVerified ? 'Continue' : 'Waiting for Verification'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Instructions Modal */}
      <Dialog 
        open={showInstructions} 
        onClose={() => setShowInstructions(false)} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: `${borderRadius}px`,
            boxShadow: 4
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          py: 3,
          backgroundColor: 'primary.lighter',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Quiz Instructions & Guidelines
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Please read all instructions carefully before starting
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Instructions
            </Typography>
            <Box component="ol" sx={{ pl: 2 }}>
              <li>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  The countdown timer displays remaining time. Quiz ends automatically when time expires.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Navigate between questions using the Question Palette to track your progress.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Click "Submit Code" for programming questions to ensure proper submission.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Review all questions before submitting - submission is final and cannot be undone.
                </Typography>
              </li>
            </Box>
          </Box>

          <Box sx={{ 
            p: 3, 
            backgroundColor: 'error.lighter',
            borderRadius: `${borderRadius}px`,
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Warning sx={{ color: 'error.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                Declaration & Agreement
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'error.dark', lineHeight: 1.7 }}>
              I acknowledge that I have read and understood all quiz instructions. I confirm that all 
              computer hardware is functioning properly and I am not in possession of any prohibited devices 
              including mobile phones, smartwatches, or unauthorized materials. I understand that any 
              violation may result in immediate disqualification.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  sx={{ 
                    '&.Mui-checked': {
                      color: 'secondary.main'
                    }
                  }}
                />
              }
              label={
                <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  I have read and agree to all instructions and terms
                </Typography>
              }
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          backgroundColor: 'grey.50',
          borderTop: '1px solid',
          borderColor: 'divider',
          justifyContent: 'space-between'
        }}>
          <Button 
            onClick={() => setShowInstructions(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleStartTest}
            disabled={!termsAccepted}
            sx={{
              backgroundColor: termsAccepted ? 'secondary.light' : 'grey.300',
              color: termsAccepted ? 'secondary.main' : 'text.disabled',
              fontWeight: 600,
              px: 4,
              '&:hover': {
                backgroundColor: termsAccepted ? 'secondary.light' : 'grey.300'
              }
            }}
          >
            Start Quiz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
