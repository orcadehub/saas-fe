import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Container,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  InputAdornment,
  Snackbar,
  Alert,
  Stack,
  Chip,
  Paper
} from '@mui/material';
import {
  Edit,
  Link as LinkIcon,
  Lock,
  Visibility,
  VisibilityOff,
  AutoAwesomeRounded,
  AccountCircle,
  TrendingUp,
  Timeline,
  Assessment,
  Quiz as QuizIcon,
  Extension,
  CheckCircle
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from 'contexts/AuthContext';
import { useDashboard } from 'contexts/DashboardContext';
import DashboardSkeleton from 'ui-component/skeletons/DashboardSkeleton';
import apiService from 'services/apiService';
import tenantConfig from 'config/tenantConfig';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

// ── Soft Light Background ──
const LightBackground = () => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#fbfcfe' }} />
    <Box
      sx={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)'
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(100px)'
      }}
    />
  </Box>
);

// Custom styles for light premium components
const whiteGlassSx = {
  p: 4,
  borderRadius: '24px',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.06)'
};

const lightDialogSx = {
  '& .MuiPaper-root': {
    bgcolor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(32px)',
    borderRadius: '24px',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    boxShadow: '0 25px 70px rgba(15, 23, 42, 0.15)',
    backgroundImage: 'none'
  },
  '& .MuiDialogTitle-root': {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#1e293b',
    pb: 1
  }
};

const lightInputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#1e293b',
    borderRadius: '12px',
    background: '#f8fafc',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused fieldset': { borderColor: '#6366f1' }
  },
  '& .MuiInputLabel-root': { color: '#64748b' }
};

export default function Dashboard() {
  const { user } = useAuth();
  const { dashboardData, loading, fetchDashboardData } = useDashboard();
  const [stats, setStats] = useState({ appSolved: 0, rank: 0, assessments: 0, quizzes: 0, practice: 0, accuracy: 0, overall: 0 });
  const [activityData, setActivityData] = useState({});
  const [codingProfiles, setCodingProfiles] = useState({});
  const [createdAt, setCreatedAt] = useState(null);
  const fileInputRef = useRef(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [usernames, setUsernames] = useState({ leetcode: '', hackerrank: '', codeforces: '', codechef: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');

  useEffect(() => {
    if (user?.email) {
      fetchDashboardData().then((data) => {
        if (data?.stats) {
          setStats({
            appSolved: data.stats.appSolved || 0,
            rank: data.stats.rank || 0,
            assessments: data.stats.assessments || 0,
            quizzes: data.stats.quizzes || 0,
            practice: data.stats.practice || 0,
            accuracy: data.stats.accuracy || 0,
            overall: data.stats.overall || 0
          });
          setActivityData(data.activityData || {});
          setCodingProfiles(data.codingProfiles || {});
          setCreatedAt(data.createdAt);
        }
      });
    }
  }, [user, fetchDashboardData]);

  const getApiUrl = () => (import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api');

  const handleConnectPlatforms = async () => {
    if (!usernames.leetcode && !usernames.hackerrank && !usernames.codeforces && !usernames.codechef) {
      setToastMessage('Please enter at least one username');
      setToastSeverity('error');
      setShowToast(true);
      return;
    }
    setConnecting(true);
    try {
      const token = user?.token || localStorage.getItem('studentToken');
      const response = await fetch(`${getApiUrl()}/students/connect-coding-profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-api-key': (await tenantConfig.get())?.apiKey || '',
          'x-tenant-id': (await tenantConfig.get())?.tenantId || ''
        },
        body: JSON.stringify({
          leetcodeUsername: usernames.leetcode,
          hackerrankUsername: usernames.hackerrank,
          codeforcesUsername: usernames.codeforces,
          codechefUsername: usernames.codechef
        })
      });
      if (response.ok) {
        await fetchDashboardData(true);
        setShowConnectModal(false);
        setToastMessage('Platforms connected accurately!');
        setToastSeverity('success');
        setShowToast(true);
        setUsernames({ leetcode: '', hackerrank: '', codeforces: '', codechef: '' });
      } else {
        const data = await response.json();
        setToastMessage(data.message || 'Connection failed');
        setToastSeverity('error');
        setShowToast(true);
      }
    } catch (error) {
      setToastMessage('Error connecting platforms');
      setToastSeverity('error');
      setShowToast(true);
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    if (showConnectModal) {
      setUsernames({
        leetcode: codingProfiles?.leetcode?.username || '',
        hackerrank: codingProfiles?.hackerrank?.username || '',
        codeforces: codingProfiles?.codeforces?.username || '',
        codechef: codingProfiles?.codechef?.username || ''
      });
    }
  }, [showConnectModal, codingProfiles]);

  if (loading)
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <DashboardSkeleton />
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#fbfcfe',
        color: '#1e293b',
        position: 'relative',
        overflowX: 'hidden',
        pb: 10
      }}
    >
      <LightBackground />

      <Container maxWidth={false} sx={{ position: 'relative', zIndex: 10, px: { xs: 2, sm: 3, md: 6 }, pt: { xs: 2, sm: 3, md: 5 } }}>
        {/* Profile Header */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ mb: { xs: 4, md: 6 } }}
        >
          <Box
            sx={{
              ...whiteGlassSx,
              p: { xs: 3, sm: 5 },
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: { xs: 3, sm: 5 },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user?.profile?.profilePic || user?.profilePic}
                sx={{
                  width: { xs: 100, sm: 130 },
                  height: { xs: 100, sm: 130 },
                  bgcolor: '#6366f1',
                  fontSize: { xs: '2.5rem', sm: '3rem' },
                  fontWeight: 900,
                  color: '#fff',
                  border: '4px solid #fff',
                  boxShadow: '0 15px 35px rgba(99, 102, 241, 0.25)'
                }}
              >
                {!user?.profile?.profilePic && !user?.profilePic && (user?.name?.charAt(0).toUpperCase() || 'S')}
              </Avatar>
              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  position: 'absolute',
                  bottom: 6,
                  right: 6,
                  bgcolor: '#fff',
                  color: '#6366f1',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '2px solid #6366f1',
                  '&:hover': { bgcolor: '#f8fafc', transform: 'scale(1.1)' },
                  transition: 'all 0.2s'
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  mb: 0.75,
                  color: '#1e293b',
                  letterSpacing: '-1.5px',
                  fontSize: { xs: '2rem', sm: '2.75rem' }
                }}
              >
                {user?.name || 'Student'}
              </Typography>
              <Typography variant="h4" sx={{ color: '#64748b', mb: 3, fontWeight: 600 }}>
                {user?.email || 'student@example.com'}
              </Typography>
              <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', sm: 'flex-start' }} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<TrendingUp sx={{ fontSize: '16px !important' }} />}
                  label={`Rank #${stats.rank}`}
                  sx={{
                    py: 2.2,
                    px: 1,
                    bgcolor: 'rgba(99, 102, 241, 0.08)',
                    color: '#6366f1',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    borderRadius: '12px'
                  }}
                />
                <Chip
                  icon={<CheckCircle sx={{ fontSize: '16px !important' }} />}
                  label={`${stats.appSolved} Solved`}
                  sx={{
                    py: 2.2,
                    px: 1,
                    bgcolor: 'rgba(34, 197, 94, 0.08)',
                    color: '#22c55e',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    borderRadius: '12px'
                  }}
                />
              </Stack>
            </Box>
            <Button
              variant="contained"
              disableElevation
              fullWidth={{ xs: true, sm: false }}
              startIcon={<Lock />}
              onClick={() => setShowPasswordModal(true)}
              sx={{
                bgcolor: '#f1f5f9',
                color: '#475569',
                borderRadius: '16px',
                textTransform: 'none',
                fontWeight: 800,
                py: 1.5,
                px: 4,
                '&:hover': { bgcolor: '#e2e8f0' }
              }}
            >
              Secure Access
            </Button>
          </Box>
        </MotionBox>

        {/* Stats Grid */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(auto-fill, minmax(260px, 1fr))'
              },
              gap: { xs: 2.5, sm: 4 }
            }}
          >
            {[
              { value: stats.assessments, label: 'Assessments', color: '#6366f1', icon: <Assessment /> },
              { value: stats.quizzes, label: 'Quizzes', color: '#06b6d4', icon: <QuizIcon /> },
              { value: stats.practice, label: 'Practice', color: '#ec4899', icon: <Extension /> },
              { value: `${stats.accuracy}%`, label: 'Accuracy', color: '#22c55e', icon: <CheckCircle /> },
              { value: `${stats.overall}%`, label: 'Overall', color: '#f59e0b', icon: <TrendingUp /> }
            ].map((stat, idx) => (
              <MotionCard
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                sx={{
                  borderRadius: '28px',
                  bgcolor: '#fff',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 4px 25px rgba(15, 23, 42, 0.03)',
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 15px 35px rgba(15, 23, 42, 0.08)' }
                }}
              >
                <CardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: '14px',
                      bgcolor: `${stat.color}10`,
                      color: stat.color,
                      mx: 'auto',
                      mb: 2.5
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      color: '#1e293b',
                      mb: 1,
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, letterSpacing: '1px', fontSize: '0.7rem' }}>
                    {stat.label.toUpperCase()}
                  </Typography>
                </CardContent>
              </MotionCard>
            ))}
          </Box>
        </Box>

        {/* Activity & Platforms */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 500px' },
            gap: 4,
            width: '100%'
          }}
        >
          {/* Activity Pulse */}
          <Box
            sx={{
              ...whiteGlassSx,
              p: { xs: 3, sm: 5 },
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              overflow: 'hidden'
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: '#1e293b', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              Activity Pulse
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 5, fontWeight: 500 }}>
              Live monitoring of your learning trajectory
            </Typography>

            <Box
              sx={{
                width: '100%',
                overflowX: 'auto',
                pb: 2,
                '&::-webkit-scrollbar': { height: 8 },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 10 },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 5,
                  minWidth: 'max-content',
                  pr: 2
                }}
              >
                {Array.from({ length: 6 }).map((_, monthOffset) => {
                  const monthDate = new Date();
                  monthDate.setDate(1); // Set to 1st to prevent Date overflow bug
                  monthDate.setMonth(monthDate.getMonth() - (5 - monthOffset));
                  const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
                  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
                  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();

                  return (
                    <Box key={monthOffset}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 900, mb: 2, display: 'block', color: '#94a3b8', letterSpacing: '1px' }}
                      >
                        {monthName.toUpperCase()}
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 18px)', gap: 0.8 }}>
                        {Array.from({ length: firstDay }).map((_, i) => (
                          <Box key={`e-${i}`} sx={{ width: 18, height: 18 }} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, day) => {
                          const year = monthDate.getFullYear();
                          const month = String(monthDate.getMonth() + 1).padStart(2, '0');
                          const date = String(day + 1).padStart(2, '0');
                          const dateStr = `${year}-${month}-${date}`;
                          const count = activityData[dateStr] || 0;
                          const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 9 ? 3 : 4;
                          const colors = ['#f1f5f9', '#c7d2fe', '#818cf8', '#6366f1', '#4338ca'];
                          return (
                            <Tooltip key={day} title={`${dateStr}: ${count} actions`} arrow placement="top">
                              <Box
                                sx={{
                                  width: 18,
                                  height: 18,
                                  bgcolor: colors[level],
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s',
                                  '&:hover': { transform: 'scale(1.2)', zIndex: 10 }
                                }}
                              />
                            </Tooltip>
                          );
                        })}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* Connect Section */}
          <Box
            sx={{
              ...whiteGlassSx,
              p: { xs: 3, sm: 4.5 },
              display: 'flex',
              flexDirection: 'column',
              width: '100%'
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', fontSize: '1.5rem' }}>
                  Social Hub
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Sync achievements
                </Typography>
              </Box>
              <IconButton
                onClick={() => navigate('/user/coding-profiles')}
                sx={{
                  bgcolor: 'rgba(99, 102, 241, 0.08)',
                  color: '#6366f1',
                  borderRadius: '14px',
                  width: 44,
                  height: 44,
                  '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)', transform: 'rotate(15deg)' },
                  transition: 'all 0.3s'
                }}
              >
                <LinkIcon />
              </IconButton>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(auto-fill, minmax(200px, 1fr))',
                  lg: 'repeat(2, 1fr)'
                },
                gap: 3
              }}
            >
              {[
                {
                  name: 'LeetCode',
                  user: codingProfiles?.leetcode?.username,
                  status: codingProfiles?.leetcode?.connected,
                  color: '#f59e0b',
                  bg: '#fffbeb'
                },
                {
                  name: 'CodeChef',
                  user: codingProfiles?.codechef?.username,
                  status: codingProfiles?.codechef?.connected,
                  color: '#5b4638',
                  bg: '#fbf8f6'
                },
                {
                  name: 'Codeforces',
                  user: codingProfiles?.codeforces?.username,
                  status: codingProfiles?.codeforces?.connected,
                  color: '#3b82f6',
                  bg: '#eff6ff'
                },
                {
                  name: 'HackerRank',
                  user: codingProfiles?.hackerrank?.username,
                  status: codingProfiles?.hackerrank?.connected,
                  color: '#10b981',
                  bg: '#f0fdf4'
                }
              ].map((p) => (
                <Box
                  key={p.name}
                  sx={{
                    p: 2.5,
                    borderRadius: '20px',
                    bgcolor: p.status ? p.bg : '#f8fafc',
                    border: `1px solid ${p.status ? `${p.color}20` : '#f1f5f9'}`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.02)', borderColor: p.color, boxShadow: `0 8px 20px ${p.color}10` }
                  }}
                  onClick={() => navigate('/user/coding-profiles')}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: '1.05rem', color: p.status ? p.color : '#1e293b' }}>
                      {p.name}
                    </Typography>
                    {p.status && <CheckCircle sx={{ fontSize: 18, color: p.color }} />}
                  </Stack>
                  <Typography variant="body2" sx={{ color: p.status ? '#64748b' : '#94a3b8', fontWeight: 700, fontSize: '0.85rem' }}>
                    {p.status ? `@${p.user}` : 'Disconnected'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Modals */}
      <Dialog open={showPasswordModal} onClose={() => setShowPasswordModal(false)} maxWidth="sm" fullWidth sx={lightDialogSx}>
        <DialogTitle>Update Password</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <TextField
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              sx={lightInputSx}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
            />
            <TextField
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              sx={lightInputSx}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
            />
            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              sx={lightInputSx}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowPasswordModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            disableElevation
            onClick={async () => {
              if (passwordData.newPassword !== passwordData.confirmPassword) {
                setToastMessage('Passwords mismatch');
                setToastSeverity('error');
                setShowToast(true);
                return;
              }
              setChangingPassword(true);
              try {
                await apiService.changePassword(user?.token || localStorage.getItem('studentToken'), {
                  currentPassword: passwordData.currentPassword,
                  newPassword: passwordData.newPassword
                });
                setToastMessage('Credentials updated!');
                setShowPasswordModal(false);
              } catch (e) {
                setToastMessage('Update failed');
              } finally {
                setChangingPassword(false);
              }
            }}
            sx={{ borderRadius: '10px', bgcolor: '#6366f1' }}
          >
            Update Access
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showConnectModal} onClose={() => setShowConnectModal(false)} maxWidth="sm" fullWidth sx={lightDialogSx}>
        <DialogTitle>Connect Coding Profiles</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <TextField
              label="LeetCode Handle"
              sx={lightInputSx}
              value={usernames.leetcode}
              onChange={(e) => setUsernames((p) => ({ ...p, leetcode: e.target.value }))}
              fullWidth
            />
            <TextField
              label="CodeChef Username"
              sx={lightInputSx}
              value={usernames.codechef}
              onChange={(e) => setUsernames((p) => ({ ...p, codechef: e.target.value }))}
              fullWidth
            />
            <TextField
              label="HackerRank ID"
              sx={lightInputSx}
              value={usernames.hackerrank}
              onChange={(e) => setUsernames((p) => ({ ...p, hackerrank: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Codeforces User"
              sx={lightInputSx}
              value={usernames.codeforces}
              onChange={(e) => setUsernames((p) => ({ ...p, codeforces: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowConnectModal(false)}>Discard</Button>
          <Button variant="contained" disableElevation onClick={handleConnectPlatforms} sx={{ borderRadius: '10px', bgcolor: '#6366f1' }}>
            Initiate Sync
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={showToast} autoHideDuration={4000} onClose={() => setShowToast(false)}>
        <Alert severity={toastSeverity} sx={{ borderRadius: '12px' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
