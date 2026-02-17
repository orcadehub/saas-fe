import { Typography, Box, Button, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Checkbox, FormControlLabel, Chip, Skeleton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { AccessTime, Code, Quiz, CalendarToday, Wifi, Warning } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import useConfig from 'hooks/useConfig';
import { useAssessments } from 'contexts/AssessmentsContext';
import { useAuth } from 'contexts/AuthContext';
import tenantConfig from 'config/tenantConfig';

export default function AssessmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: { borderRadius } } = useConfig();
  const { getAssessmentById, getAssessmentAttempt } = useAssessments();
  const { user } = useAuth();
  const [showNetworkCheck, setShowNetworkCheck] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [ipLoading, setIpLoading] = useState(false);
  const [userIP, setUserIP] = useState('');
  const [accessCheckResult, setAccessCheckResult] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [systemInfo, setSystemInfo] = useState({});
  const [timeUntilStart, setTimeUntilStart] = useState(null);
  const [timeUntilLateEnd, setTimeUntilLateEnd] = useState(null);
  const [showInProgressModal, setShowInProgressModal] = useState(false);
  const [logoutTimer, setLogoutTimer] = useState(5);

  const assessment = getAssessmentById(id);
  const attempt = getAssessmentAttempt(id);
  const isInProgress = attempt?.attemptStatus === 'IN_PROGRESS';
  const canResume = attempt?.attemptStatus === 'RESUME_ALLOWED';
  const canRetake = attempt?.attemptStatus === 'RETAKE_ALLOWED';

  useEffect(() => {
    const getSystemInfo = () => {
      const info = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookieEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine
      };
      setSystemInfo(info);
    };
    getSystemInfo();
  }, []);

  useEffect(() => {
    if (isInProgress && !canResume && !canRetake) {
      setShowInProgressModal(true);
      
      const blockNavigation = (e) => {
        e.preventDefault();
        e.returnValue = '';
      };

      window.addEventListener('beforeunload', blockNavigation);
      window.history.pushState(null, '', window.location.href);
      
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
      };
      
      window.addEventListener('popstate', handlePopState);

      const timer = setInterval(() => {
        setLogoutTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            localStorage.removeItem('studentToken');
            localStorage.removeItem('studentData');
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        window.removeEventListener('beforeunload', blockNavigation);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isInProgress, canResume, canRetake]);

  useEffect(() => {
    if (!assessment?.startTime) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const start = new Date(assessment.startTime).getTime();
      const lateStartMinutes = assessment.earlyStartBuffer || 0;
      const lateStartEnd = start + (lateStartMinutes * 60 * 1000);
      const diff = start - now;

      if (diff > 0) {
        setTimeUntilStart(diff);
        setTimeUntilLateEnd(null);
      } else if (now < lateStartEnd) {
        setTimeUntilStart(0);
        setTimeUntilLateEnd(lateStartEnd - now);
      } else {
        setTimeUntilStart(-1);
        setTimeUntilLateEnd(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [assessment?.startTime, assessment?.earlyStartBuffer]);

  const formatTimeUntilStart = (ms) => {
    if (ms <= 0) return null;
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleStartAssessment = async () => {
    setShowNetworkCheck(true);
    setIpLoading(true);
    setAccessCheckResult(null);
    
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const currentIP = ipData.ip;
      setUserIP(currentIP);
      
      const config = tenantConfig.get();
      const apiUrl = import.meta.env.DEV ? 'http://localhost:4000/api' : (config?.apiEndpoint || 'https://backend.orcode.in/api');
      
      const accessResponse = await fetch(`${apiUrl}/check-assessment-access`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assessmentId: id, userIP: currentIP })
      });
      
      const accessData = await accessResponse.json();
      setAccessCheckResult(accessData);
      
    } catch (error) {
      console.error('Error checking access:', error);
      setAccessCheckResult({
        hasAccess: false,
        userIP: 'Unable to detect',
        allowedIPs: [],
        message: 'Error checking network access'
      });
    } finally {
      setIpLoading(false);
    }
  };

  const handleContinueToInstructions = () => {
    if (!accessCheckResult?.hasAccess) {
      alert(accessCheckResult?.message || 'Access denied');
      return;
    }
    setShowNetworkCheck(false);
    setShowInstructions(true);
  };

  const handleStartTest = async () => {
    setIsStarting(true);
    
    try {
      const config = tenantConfig.get();
      const apiUrl = import.meta.env.DEV ? 'http://localhost:4000/api' : (config?.apiEndpoint || 'https://backend.orcode.in/api');
      
      const response = await fetch(`${apiUrl}/auth/student/assessment/${id}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
          'x-api-key': config?.apiKey || '',
          'x-tenant-id': config?.tenantId || ''
        },
        body: JSON.stringify({ systemInfo, startIP: userIP })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start assessment');
      }
      
      setShowInstructions(false);
      navigate(`/assessments/${id}/take`);
    } catch (error) {
      console.error('Error starting assessment:', error);
      alert('Failed to start assessment. Please try again.');
      setIsStarting(false);
    }
  };

  if (!assessment) {
    return (
      <Box sx={{ p: 3 }}>
        <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Skeleton variant="text" height={48} width="60%" sx={{ mb: 2 }} />
            <Skeleton variant="text" height={24} width="80%" sx={{ mb: 4 }} />
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
            <Skeleton variant="rectangular" height={150} sx={{ mb: 4, borderRadius: 2 }} />
            <Box display="flex" justifyContent="center">
              <Skeleton variant="rectangular" width={200} height={56} sx={{ borderRadius: 2 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
            {assessment.title}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
            {assessment.description}
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
                      {assessment.duration} Minutes
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
                      {assessment.questions?.length || 0} Coding
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
                      {assessment.quizQuestions?.length || 0} Quiz
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
                      {((assessment.questions?.length || 0) * 10) + ((assessment.quizQuestions?.length || 0) * 2)} Marks
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
                  {new Date(assessment.startTime).toLocaleDateString('en-GB')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Time
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {new Date(assessment.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </Typography>
              </Box>
              {assessment.earlyStartBuffer > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Late Start Allowed
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                    {new Date(new Date(assessment.startTime).getTime() + assessment.earlyStartBuffer * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>

          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            {isInProgress && !canResume && !canRetake ? (
              <Card sx={{
                px: 6,
                py: 3,
                backgroundColor: 'secondary.lighter',
                borderRadius: `${borderRadius}px`,
                border: '2px solid',
                borderColor: 'secondary.main'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main', mb: 1 }}>
                    Assessment In Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You have already started this assessment
                  </Typography>
                </Box>
              </Card>
            ) : (canResume || canRetake) ? (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleStartAssessment}
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
                  {canResume ? 'Resume Assessment' : canRetake ? 'Retake Assessment' : 'Continue Assessment'}
                </Button>
              </>
            ) : timeUntilStart === -1 ? (
              <Card sx={{
                px: 6,
                py: 3,
                backgroundColor: 'error.lighter',
                borderRadius: `${borderRadius}px`,
                border: '2px solid',
                borderColor: 'error.main'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main', mb: 1 }}>
                    Too Late to Start
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The late start window has expired
                  </Typography>
                </Box>
              </Card>
            ) : timeUntilStart > 0 ? (
              <Card sx={{
                px: 6,
                py: 3,
                backgroundColor: 'secondary.lighter',
                borderRadius: `${borderRadius}px`,
                border: '2px solid',
                borderColor: 'secondary.main'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Assessment starts in
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                    {formatTimeUntilStart(timeUntilStart)}
                  </Typography>
                </Box>
              </Card>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleStartAssessment}
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
                  Start Assessment
                </Button>
                {timeUntilLateEnd && (
                  <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                    Start the assessment before {formatTimeUntilStart(timeUntilLateEnd)}
                  </Typography>
                )}
              </>
            )}
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
                borderRadius: `${borderRadius}px`
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Network Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Your IP Address:
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, fontFamily: 'monospace' }}>
                    {accessCheckResult?.userIP || 'Detecting...'}
                  </Typography>
                </Box>
                {accessCheckResult?.allowedIPs?.length > 0 && (
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      Allowed IP Addresses:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {accessCheckResult.allowedIPs.map((ip, index) => (
                        <Chip 
                          key={index}
                          label={ip} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontFamily: 'monospace' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                {(!accessCheckResult?.allowedIPs || accessCheckResult.allowedIPs.length === 0) && (
                  <Box>
                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                      No IP restrictions configured - All IPs allowed
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ 
                flex: 1,
                p: 4, 
                backgroundColor: accessCheckResult?.hasAccess ? 'success.lighter' : 'error.lighter',
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
                  backgroundColor: accessCheckResult?.hasAccess ? 'success.main' : 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="h3" sx={{ color: 'white' }}>
                    {accessCheckResult?.hasAccess ? '✓' : '✗'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ 
                    color: accessCheckResult?.hasAccess ? 'success.main' : 'error.main',
                    fontWeight: 700,
                    mb: 1
                  }}>
                    {accessCheckResult?.hasAccess ? 'Access Granted' : 'Access Denied'}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: accessCheckResult?.hasAccess ? 'success.dark' : 'error.dark'
                  }}>
                    {accessCheckResult?.message || 
                     (accessCheckResult?.hasAccess ? 
                      'Your network connection is verified and you have permission to take this assessment.' :
                      'Your current network does not have permission to access this assessment.'
                     )
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
            disabled={ipLoading || !accessCheckResult?.hasAccess}
            sx={{
              backgroundColor: accessCheckResult?.hasAccess ? 'secondary.light' : 'grey.300',
              color: accessCheckResult?.hasAccess ? 'secondary.main' : 'text.disabled',
              fontWeight: 600,
              px: 4,
              '&:hover': {
                backgroundColor: accessCheckResult?.hasAccess ? 'secondary.light' : 'grey.300'
              }
            }}
          >
            {accessCheckResult?.hasAccess ? 'Continue' : 'Access Denied'}
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
            Assessment Instructions & Guidelines
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Please read all instructions carefully before starting
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1.25rem' }}>
              Instructions
            </Typography>
            <Box component="ol" sx={{ pl: 2 }}>
              <li>
                <Typography variant="body1" sx={{ mb: 1, fontSize: '1.1rem' }}>
                  The countdown timer displays remaining time. Assessment ends automatically when time expires.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={{ mb: 1, fontSize: '1.1rem' }}>
                  Navigate between questions using the Question Palette to track your progress.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={{ mb: 1, fontSize: '1.1rem' }}>
                  Click "Submit Code" for programming questions to ensure proper submission.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" sx={{ mb: 1, fontSize: '1.1rem' }}>
                  Review all questions before submitting - submission is final and cannot be undone.
                </Typography>
              </li>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1.25rem' }}>
              Question Status Colors
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 48, height: 48, bgcolor: '#4caf50', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>1</Box>
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  <strong>Green:</strong> Submitted/Completed questions
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 48, height: 48, bgcolor: 'secondary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>2</Box>
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  <strong>Purple:</strong> Currently viewing question
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 48, height: 48, bgcolor: '#ff9800', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>3</Box>
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  <strong>Orange:</strong> Visited but not submitted
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 48, height: 48, border: '2px solid', borderColor: 'secondary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'secondary.main', fontWeight: 600 }}>4</Box>
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                  <strong>Outlined:</strong> Not visited yet
                </Typography>
              </Box>
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
            <Typography variant="body2" sx={{ color: 'error.dark', lineHeight: 1.7, fontSize: '1.05rem' }}>
              I acknowledge that I have read and understood all assessment instructions. I confirm that all 
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
                <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
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
            disabled={!termsAccepted || isStarting}
            startIcon={isStarting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : null}
            sx={{
              backgroundColor: (termsAccepted && !isStarting) ? 'secondary.light' : 'grey.300',
              color: (termsAccepted && !isStarting) ? 'secondary.main' : 'text.disabled',
              fontWeight: 600,
              px: 4,
              '&:hover': {
                backgroundColor: (termsAccepted && !isStarting) ? 'secondary.light' : 'grey.300'
              }
            }}
          >
            {isStarting ? 'Starting...' : 'Start Assessment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* In Progress Logout Modal */}
      <Dialog 
        open={showInProgressModal}
        disableEscapeKeyDown
        maxWidth="sm" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: `${borderRadius}px`,
            boxShadow: 4
          }
        }}
      >
        <DialogContent sx={{ p: 6, textAlign: 'center' }}>
          <Box sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `conic-gradient(#f44336 ${((5 - logoutTimer) / 5) * 360}deg, #e0e0e0 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 4
          }}>
            <Box sx={{ 
              width: 100,
              height: 100,
              borderRadius: '50%',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="h2" sx={{ 
                fontWeight: 900, 
                color: 'error.main',
                fontFamily: 'monospace'
              }}>
                {logoutTimer}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'error.main' }}>
            Assessment In Progress
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            Your assessment is already in progress.
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            For security reasons, you will be logged out in {logoutTimer} seconds.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
