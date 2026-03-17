import { Typography, Box, Button, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Checkbox, FormControlLabel, Chip, Skeleton, Stack } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { AccessTime, Code, Quiz, CalendarToday, Wifi, Warning, AssignmentInd, Gavel, CheckCircle, Info, Computer, Laptop, RadioButtonUnchecked } from '@mui/icons-material';
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
  const [serverTime, setServerTime] = useState(null);
  const [showInProgressModal, setShowInProgressModal] = useState(false);
  const [logoutTimer, setLogoutTimer] = useState(5);

  const assessment = getAssessmentById(id);
  const attempt = getAssessmentAttempt(id);
  const isInProgress = attempt?.attemptStatus === 'IN_PROGRESS';
  const canResume = attempt?.attemptStatus === 'RESUME_ALLOWED';
  const canRetake = attempt?.attemptStatus === 'RETAKE_ALLOWED';

  // Use basic info from context (without questions)
  const questionCounts = {
    programming: assessment?.questionCounts?.programming || 0,
    frontend: assessment?.questionCounts?.frontend || 0,
    quiz: assessment?.questionCounts?.quiz || 0,
    mongodb: assessment?.questionCounts?.mongodb || 0
  };
  const codingQuestionCount = assessment?.codingQuestionCount || (questionCounts.programming + questionCounts.frontend + questionCounts.mongodb);
  const quizQuestionCount = assessment?.quizQuestionCount || questionCounts.quiz;

  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const config = tenantConfig.get();
        const apiUrl = import.meta.env.DEV ? 'http://localhost:4000/api' : (config?.apiEndpoint || 'https://backend.orcode.in/api');
        const response = await fetch(`${apiUrl}/server-time`, { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setServerTime(data.serverTime);
        } else {
          setServerTime(new Date().toISOString());
        }
      } catch (error) {
        console.error('Error fetching server time:', error);
        setServerTime(new Date().toISOString());
      }
    };
    fetchServerTime();
    const interval = setInterval(fetchServerTime, 30000);
    return () => clearInterval(interval);
  }, []);

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
    if (!assessment?.startTime || !serverTime) return;

    const updateTimer = () => {
      const now = new Date(serverTime).getTime() + (Date.now() - new Date(serverTime).getTime());
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
  }, [assessment?.startTime, assessment?.earlyStartBuffer, serverTime]);

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
        <CardContent sx={{ p: 5 }}>
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, color: '#1e293b', fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
            {assessment.title}
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 6, lineHeight: 1.8, color: '#475569', fontSize: '1.1rem', fontWeight: 500 }}>
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
                  <AccessTime sx={{ fontSize: 40, color: '#6366f1' }} />
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', fontFamily: 'JetBrains Mono, monospace' }}>
                      {assessment.duration}m
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                  <Code sx={{ fontSize: 40, color: '#10b981' }} />
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', fontFamily: 'JetBrains Mono, monospace' }}>
                      {codingQuestionCount}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Coding
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
                  <Quiz sx={{ fontSize: 40, color: '#3b82f6' }} />
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', fontFamily: 'JetBrains Mono, monospace' }}>
                      {questionCounts.quiz}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Quiz
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
                  <CalendarToday sx={{ fontSize: 40, color: '#f59e0b' }} />
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', fontFamily: 'JetBrains Mono, monospace' }}>
                      100
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                    px: 8,
                    py: 2.5,
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: 'white',
                    boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
                    textTransform: 'none',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                      boxShadow: '0 20px 30px -10px rgba(99, 102, 241, 0.5)',
                      transform: 'translateY(-4px) scale(1.02)'
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
                    px: 8,
                    py: 2.5,
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: 'white',
                    boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
                    textTransform: 'none',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                      boxShadow: '0 20px 30px -10px rgba(99, 102, 241, 0.5)',
                      transform: 'translateY(-4px) scale(1.02)'
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

      {/* Network Check Modal (Clean Light Premium) */}
      <Dialog 
        open={showNetworkCheck} 
        onClose={() => setShowNetworkCheck(false)} 
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '24px',
            bgcolor: 'white',
            boxShadow: '0 25px 70px -10px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            border: '1px solid #f1f5f9'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 4,
          background: 'linear-gradient(to right, #f8fafc, #ffffff)',
          borderBottom: '1px solid #f1f5f9',
          color: '#1e293b'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: '14px', 
              bgcolor: 'rgba(99, 102, 241, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wifi sx={{ fontSize: 28, color: '#6366f1' }} />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, letterSpacing: '-0.02em' }}>
                System Verification
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                Initial checking of security and network protocols.
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, bgcolor: '#ffffff' }}>
          {ipLoading ? (
            <Box sx={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              minHeight: 400, gap: 4, p: 6 
            }}>
              <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress 
                  size={100} 
                  thickness={2} 
                  sx={{ color: '#e2e8f0', position: 'absolute' }} 
                  variant="determinate" 
                  value={100} 
                />
                <CircularProgress 
                  size={100} 
                  thickness={2} 
                  sx={{ color: '#6366f1', animationDuration: '1s' }} 
                />
                <Wifi sx={{ position: 'absolute', fontSize: 32, color: '#6366f1' }} />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
                  Securing Connection...
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Analyzing your terminal data and validating access tokens.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>

                {/* Left Card – Diagnostic Data */}
                <Box sx={{ flex: '0 0 calc(50% - 12px)', display: 'flex' }}>
                  <Card sx={{ 
                    p: 4, borderRadius: '20px', width: '100%',
                    border: '1px solid #f1f5f9', boxShadow: 'none', bgcolor: '#f8fafc',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 240
                  }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em', mb: 3, display: 'block' }}>
                      Diagnostic Data
                    </Typography>

                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, justifyContent: 'center' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em', mb: 0.75, display: 'block' }}>
                          Terminal IP Address
                        </Typography>
                        <Typography sx={{ color: '#0f172a', fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', fontSize: '1.6rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                          {accessCheckResult?.userIP || '127.0.0.1'}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em', mb: 0.75, display: 'block' }}>
                          Operational Range
                        </Typography>
                        {accessCheckResult?.allowedIPs?.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {accessCheckResult.allowedIPs.map((ip, index) => (
                              <Chip
                                key={index} label={ip} size="small"
                                sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', color: '#334155', fontWeight: 700, fontFamily: 'monospace', borderRadius: '8px' }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Box sx={{ p: 1.25, px: 2, borderRadius: '10px', bgcolor: 'white', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 700 }}>Global Access Node</Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Card>
                </Box>

                {/* Right Card – Access Result */}
                <Box sx={{ flex: '0 0 calc(50% - 12px)', display: 'flex' }}>
                  <Card sx={{
                    p: 4, borderRadius: '20px', width: '100%',
                    border: '1px solid',
                    borderColor: accessCheckResult?.hasAccess ? '#dcfce7' : '#fee2e2',
                    boxShadow: 'none',
                    bgcolor: accessCheckResult?.hasAccess ? '#f0fdf4' : '#fef2f2',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', textAlign: 'center', gap: 2.5, minHeight: 240
                  }}>
                    <Box sx={{
                      width: 80, height: 80, borderRadius: '24px',
                      bgcolor: accessCheckResult?.hasAccess ? '#22c55e' : '#ef4444',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      boxShadow: accessCheckResult?.hasAccess
                        ? '0 12px 30px -4px rgba(34,197,94,0.4)'
                        : '0 12px 30px -4px rgba(239,68,68,0.4)'
                    }}>
                      {accessCheckResult?.hasAccess
                        ? <CheckCircle sx={{ fontSize: 42, color: 'white' }} />
                        : <Warning sx={{ fontSize: 42, color: 'white' }} />
                      }
                    </Box>

                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: accessCheckResult?.hasAccess ? '#14532d' : '#7f1d1d', letterSpacing: '-0.02em' }}>
                        {accessCheckResult?.hasAccess ? 'Access Granted' : 'Access Denied'}
                      </Typography>
                      <Typography variant="body1" sx={{ color: accessCheckResult?.hasAccess ? '#166534' : '#991b1b', fontWeight: 500, lineHeight: 1.6, maxWidth: 280, mx: 'auto' }}>
                        {accessCheckResult?.message || (accessCheckResult?.hasAccess ? 'Your network is recognized and secure. Ready for transmission.' : 'Please switch to an authorized network to proceed.')}
                      </Typography>
                    </Box>
                  </Card>
                </Box>

              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 4, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9', justifyContent: 'space-between'
        }}>
          <Button 
            onClick={() => setShowNetworkCheck(false)}
            sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleContinueToInstructions}
            disabled={ipLoading || !accessCheckResult?.hasAccess}
            sx={{
              px: 6, py: 1.5, borderRadius: '12px', fontWeight: 900, textTransform: 'none',
              bgcolor: '#1e293b', color: 'white',
              boxShadow: '0 10px 15px -3px rgba(30, 41, 59, 0.2)',
              '&:hover': { bgcolor: '#0f172a' }
            }}
          >
            Review Guidelines
          </Button>
        </DialogActions>
      </Dialog>

      {/* Instructions Modal (Clean Light Premium) */}
      <Dialog 
        open={showInstructions} 
        onClose={() => setShowInstructions(false)} 
        maxWidth="lg" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '32px',
            bgcolor: 'white',
            boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            maxHeight: '92vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 5,
          bgcolor: 'white',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ 
              p: 2, borderRadius: '20px', 
              bgcolor: 'rgba(99, 102, 241, 0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Gavel sx={{ fontSize: 32, color: '#6366f1' }} />
            </Box>
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 900, color: '#0f172a', mb: 0.5, letterSpacing: '-0.02em' }}>
                Assessment Guidelines
              </Typography>
              <Typography variant="h5" sx={{ color: '#64748b', fontWeight: 500 }}>
                Please review the operational protocols carefully.
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 5, bgcolor: '#ffffff', overflowY: 'auto' }}>
          <Stack spacing={4}>

            {/* Key Protocols – 2x2 grid */}
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#6366f1' }} /> Key Protocols
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                {[
                  { icon: <AccessTime sx={{ fontSize: 26 }} />, title: 'Time Sync', text: 'Countdown is absolute. Sessions terminate automatically at T-00:05.' },
                  { icon: <Info sx={{ fontSize: 26 }} />, title: 'Navigation Map', text: 'Use the palette to track progress. Colored markers indicate question status.' },
                  { icon: <Code sx={{ fontSize: 26 }} />, title: 'Data Commitment', text: "Always finalize code with 'Submit' to run final test case diagnostics." },
                  { icon: <Laptop sx={{ fontSize: 26 }} />, title: 'Security Measures', text: 'Proctoring is active. Tab switching or external tools will be flagged.' }
                ].map((item, idx) => (
                  <Box key={idx} sx={{
                    p: 3, borderRadius: '20px', border: '1px solid #f1f5f9', bgcolor: '#f8fafc',
                    display: 'flex', alignItems: 'center', gap: 3
                  }}>
                    <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'rgba(99,102,241,0.08)', color: '#6366f1', display: 'flex', flexShrink: 0 }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>{item.title}</Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, lineHeight: 1.6 }}>{item.text}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Mandatory Rules – 3 columns */}
            <Box sx={{ p: 4, borderRadius: '24px', bgcolor: '#fff7ed', border: '1px solid #fed7aa' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Warning sx={{ color: '#f97316', fontSize: 28 }} />
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#9a3412', letterSpacing: '-0.02em' }}>Mandatory Assessment Rules</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 3 }}>
                {[
                  { num: '1', title: 'Browser Integrity', rules: ['Zero Tolerance: No tab switching or window minimizing.', 'Auto-Lockout: Any detected navigation away terminates the session.', 'No Retakes: Flagged attempts are submitted immediately.'] },
                  { num: '2', title: 'Technical Stability', rules: ['Freezes: If stuck for >30s, reload the page manually.', 'Connectivity: Ensure stable internet before launch.'] },
                  { num: '3', title: 'Final Warnings', rules: ['Close all other apps (Chat, Spotify, etc.).', 'Clicking Start confirms acceptance of all consequences.'] }
                ].map((section) => (
                  <Box key={section.num}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#c2410c', mb: 1.5 }}>{section.num}. {section.title}</Typography>
                    <Stack spacing={1}>
                      {section.rules.map((rule, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#f97316', mt: 1, flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ color: '#9a3412', fontWeight: 600, lineHeight: 1.7 }}>{rule}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Status Legend + Integrity Protocol – side by side */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Box sx={{ p: 3.5, borderRadius: '24px', bgcolor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mb: 3 }}>Status Legend</Typography>
                <Stack spacing={2}>
                  {[
                    { color: '#10b981', label: 'Verified / Submitted' },
                    { color: '#6366f1', label: 'Active Viewport' },
                    { color: '#f59e0b', label: 'Cached (Unsubmitted)' },
                    { color: 'transparent', border: '2px solid #6366f1', label: 'Initialization Pending' }
                  ].map((s, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 32, height: 32, borderRadius: '10px', flexShrink: 0,
                        bgcolor: s.color, border: s.border || 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: s.color === 'transparent' ? '#6366f1' : 'white', fontWeight: 900, fontSize: '0.875rem'
                      }}>{i + 1}</Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.95rem' }}>{s.label}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Box sx={{ p: 3.5, borderRadius: '24px', bgcolor: '#fef2f2', border: '1px solid #fee2e2', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Warning sx={{ color: '#ef4444', fontSize: 26 }} />
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#991b1b' }}>Mission Critical Alert</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 600, lineHeight: 1.7, fontSize: '0.95rem' }}>
                  Active proctoring is enabled. Any attempt to switch tabs or utilize external assistance will result in immediate session termination.
                </Typography>
              </Box>
            </Box>

          </Stack>
        </DialogContent>

        <Box sx={{ 
          p: 4, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
           <FormControlLabel
            control={
              <Checkbox
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                icon={<RadioButtonUnchecked sx={{ color: '#cbd5e1' }} />}
                checkedIcon={<CheckCircle sx={{ color: '#6366f1' }} />}
              />
            }
            label={
              <Typography sx={{ fontWeight: 800, color: '#334155', ml: 1 }}>I acknowledge all protocols</Typography>
            }
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={() => setShowInstructions(false)} sx={{ color: '#64748b', fontWeight: 800 }}>Abort</Button>
            <Button 
              variant="contained" 
              onClick={handleStartTest}
              disabled={!termsAccepted || isStarting}
              sx={{
                px: 6, py: 1.8, borderRadius: '14px', fontWeight: 900, fontSize: '1.1rem',
                textTransform: 'none',
                bgcolor: '#6366f1', color: 'white',
                boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
                '&:hover': { bgcolor: '#4f46e5', transform: 'translateY(-2px)' },
                transition: 'all 0.2s ease'
              }}
            >
              {isStarting ? 'Calibrating...' : 'Launch Assessment'}
            </Button>
          </Box>
        </Box>
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
