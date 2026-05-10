import { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Grid, Card, CardContent, TextField, Button, 
  Avatar, Stack, Chip, Divider, Switch, IconButton, Tab, Tabs, 
  InputAdornment, Alert, Snackbar, useMediaQuery, useTheme 
} from '@mui/material';
import { 
  PersonOutline, 
  LockOpenOutlined, 
  NotificationsNoneOutlined, 
  LanguageOutlined, 
  ArrowBackIosNew, 
  SaveOutlined, 
  CameraAltOutlined,
  VerifiedUserOutlined,
  EmailOutlined,
  PhoneOutlined,
  LocationOnOutlined,
  SyncOutlined,
  PublicOutlined,
  CodeOutlined,
  TerminalOutlined,
  SecurityOutlined,
  PaletteOutlined
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import apiService from 'services/apiService';

const MotionBox = motion.create(Box);

// Design Tokens
const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  textMain: '#1e293b',
  textSub: '#64748b',
  border: 'rgba(226, 232, 240, 0.8)',
  bg: '#fbfcfe'
};

const glassSx = {
  bgcolor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: { xs: '16px', md: '24px' },
  border: `1px solid ${COLORS.border}`,
  boxShadow: '0 10px 40px rgba(15, 23, 42, 0.03)',
  overflow: 'hidden'
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    bgcolor: '#f8fafc',
    transition: 'all 0.2s',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused': {
      bgcolor: '#fff',
      '& fieldset': { borderColor: COLORS.primary, borderWidth: '2px' }
    }
  },
  '& .MuiInputLabel-root': { fontWeight: 500, color: COLORS.textSub },
  '& .MuiInputBase-input': { fontWeight: 600, color: COLORS.textMain, py: { xs: 1.5, md: 2 } }
};

export default function AccountSettings() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: '', sev: 'success' });

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    address: user?.profile?.address || '',
  });

  const [socialProfiles, setSocialProfiles] = useState({
    leetcode: user?.codingProfiles?.leetcode?.username || '',
    hackerrank: user?.codingProfiles?.hackerrank?.username || '',
    codeforces: user?.codingProfiles?.codeforces?.username || '',
    codechef: user?.codingProfiles?.codechef?.username || '',
  });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('studentToken');
      const updatedUser = await apiService.updateStudentProfile(token, {
        name: profile.name,
        phone: profile.phone,
        address: profile.address
      });
      
      // Update AuthContext and LocalStorage
      login({ ...updatedUser.student, token });
      
      setToast({ open: true, msg: 'Profile updated successfully!', sev: 'success' });
    } catch (e) {
      console.error('Update error:', e);
      setToast({ open: true, msg: e.response?.data?.message || 'Failed to update profile', sev: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectProfiles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('studentToken');
      const response = await apiService.connectCodingProfiles(token, {
        leetcodeUsername: socialProfiles.leetcode,
        hackerrankUsername: socialProfiles.hackerrank,
        codeforcesUsername: socialProfiles.codeforces,
        codechefUsername: socialProfiles.codechef
      });
      
      // Update AuthContext and LocalStorage
      login({ ...response.student, token });
      
      setToast({ open: true, msg: 'Social profiles synced successfully!', sev: 'success' });
    } catch (e) {
      console.error('Connect error:', e);
      setToast({ open: true, msg: e.response?.data?.message || 'Failed to sync profiles', sev: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { label: 'Profile Settings', icon: <PersonOutline />, desc: 'Personal details & Avatar' },
    { label: 'Social Profiles', icon: <PublicOutlined />, desc: 'LeetCode, CodeChef, etc.' },
    { label: 'Login Security', icon: <SecurityOutlined />, desc: 'Passwords & 2FA' },
    { label: 'Notification Hub', icon: <NotificationsNoneOutlined />, desc: 'Alerts & Preferences' },
    { label: 'Platform Theme', icon: <PaletteOutlined />, desc: 'Display & Appearance' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.bg, pt: { xs: 2, md: 4 }, pb: { xs: 4, md: 10 } }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 5 } }}>
        <Stack direction="row" alignItems="center" spacing={2.5} sx={{ mb: { xs: 3, md: 4 } }}>
          <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: '#fff', width: 40, height: 40, border: '1px solid rgba(0,0,0,0.05)', '&:hover': { bgcolor: '#f1f5f9', transform: 'translateX(-4px)' }, transition: 'all 0.2s' }}>
            <ArrowBackIosNew sx={{ fontSize: 14 }} />
          </IconButton>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 900, color: COLORS.textMain, letterSpacing: '-1px', fontSize: { xs: '1.5rem', md: '2.2rem' } }}>
              Portal Settings
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.textSub, fontWeight: 500 }}>Manage your institutional experience</Typography>
          </Box>
        </Stack>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Enhanced Sidebar */}
          <Grid item xs={12} lg={3}>
            <Card sx={{ 
              bgcolor: '#fff', 
              borderRadius: '24px', 
              border: '1px solid rgba(226, 232, 240, 0.8)', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              position: { lg: 'sticky' }, 
              top: { lg: 100 }, 
              overflow: 'hidden' 
            }}>
              <Tabs
                orientation={isMobile ? "horizontal" : "vertical"}
                value={activeTab}
                onChange={(e, v) => setActiveTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  px: 1,
                  py: 2,
                  '& .MuiTabs-indicator': { display: 'none' },
                  '& .MuiTab-root': {
                    minHeight: { xs: 50, md: 56 },
                    borderRadius: '12px',
                    mb: 0.5,
                    mr: { xs: 1, md: 0 },
                    px: 2,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    color: '#64748b',
                    gap: 1.5,
                    '& .MuiSvgIcon-root': { fontSize: 20, color: 'inherit' },
                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.04)', color: '#1e293b' },
                    '&.Mui-selected': { 
                      bgcolor: 'rgba(99, 102, 241, 0.08)', 
                      color: '#6366f1',
                      '& .MuiSvgIcon-root': { color: '#6366f1' }
                    },
                  }
                }}
              >
                {tabs.map((tab, i) => (
                  <Tab 
                    key={i} 
                    icon={tab.icon} 
                    iconPosition="start" 
                    label={
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography sx={{ fontWeight: activeTab === i ? 800 : 600, fontSize: '0.875rem', color: 'inherit' }}>{tab.label}</Typography>
                        {!isMobile && <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, fontWeight: 500, fontSize: '0.65rem' }}>{tab.desc}</Typography>}
                      </Box>
                    }
                  />
                ))}
              </Tabs>
              
              {!isMobile && (
                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(0,0,0,0.04)', px: 1 }}>
                  <Card sx={{ border: 'none', background: `linear-gradient(135deg, ${COLORS.primary}10, ${COLORS.secondary}15)`, p: 2, borderRadius: '16px' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <VerifiedUserOutlined sx={{ color: COLORS.primary, fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: COLORS.primary, display: 'block', fontSize: '0.6rem' }}>TRUSTED ACCOUNT</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.textMain, fontSize: '0.75rem' }}>Verified Institution</Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Box>
              )}
            </Card>
          </Grid>

          {/* Main Content Area */}
          <Grid item xs={12} lg={9}>
            <AnimatePresence mode="wait">
              <MotionBox
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card sx={{ 
                  borderRadius: '24px', 
                  border: '1px solid rgba(226, 232, 240, 0.8)', 
                  boxShadow: '0 10px 40px rgba(15, 23, 42, 0.03)',
                  bgcolor: '#fff',
                  overflow: 'hidden'
                }}>
                  <CardContent sx={{ p: { xs: 3, md: 6 } }}>
                    {activeTab === 0 && (
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: COLORS.textMain }}>Personal Information</Typography>
                        <Typography variant="body1" sx={{ color: COLORS.textSub, mb: 5 }}>Update your identity and contact details</Typography>
                        
                        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={4} sx={{ mb: 6, p: 3, borderRadius: '24px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar src={user?.profile?.profilePic || user?.profilePic} sx={{ width: 110, height: 110, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '4px solid #fff' }}>
                              {user?.name?.charAt(0)}
                            </Avatar>
                            <IconButton size="small" sx={{ position: 'absolute', bottom: 5, right: 5, bgcolor: COLORS.primary, color: '#fff', border: '3px solid #fff', '&:hover': { bgcolor: COLORS.secondary } }}>
                              <CameraAltOutlined sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{profile.name}</Typography>
                            <Typography variant="body2" sx={{ color: COLORS.textSub, fontWeight: 500 }}>
                              ID: {user?.email?.split('@')[0] || 'USER'}
                            </Typography>
                            <Chip label="Active Member" size="small" sx={{ mt: 1.5, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', fontWeight: 800, px: 1 }} />
                          </Box>
                        </Stack>

                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(auto-fill, minmax(300px, 1fr))'
                          },
                          gap: 3 
                        }}>
                          <TextField fullWidth label="Full Name" value={profile.name} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} sx={inputSx}
                            InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutline sx={{ color: COLORS.textSub, fontSize: 20 }} /></InputAdornment> }}
                          />
                          <TextField fullWidth label="Email Address" disabled value={profile.email} sx={inputSx}
                            InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: COLORS.textSub, fontSize: 20 }} /></InputAdornment> }}
                          />
                          <TextField fullWidth label="Mobile Number" value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} sx={inputSx}
                            InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlined sx={{ color: COLORS.textSub, fontSize: 20 }} /></InputAdornment> }}
                          />
                          <TextField fullWidth label="Residential Address" value={profile.address} onChange={(e) => setProfile(p => ({ ...p, address: e.target.value }))} sx={inputSx}
                            InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnOutlined sx={{ color: COLORS.textSub, fontSize: 20 }} /></InputAdornment> }}
                          />
                        </Box>
                      </Box>
                    )}

                    {activeTab === 1 && (
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: COLORS.textMain }}>Social Coding Profiles</Typography>
                        <Typography variant="body1" sx={{ color: COLORS.textSub, mb: 5 }}>Connect your competitive programming accounts</Typography>
                        
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(auto-fill, minmax(300px, 1fr))'
                          },
                          gap: 3 
                        }}>
                          <Box>
                            <TextField fullWidth label="LeetCode Username" value={socialProfiles.leetcode} onChange={(e) => setSocialProfiles(p => ({ ...p, leetcode: e.target.value }))} sx={inputSx}
                              placeholder="e.g. janesmith_99"
                              InputProps={{ startAdornment: <InputAdornment position="start"><TerminalOutlined sx={{ color: '#ffa116' }} /></InputAdornment> }}
                            />
                            {user?.codingProfiles?.leetcode?.connected && (
                              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <SyncOutlined sx={{ fontSize: 12 }} /> Last synced: {new Date(user.codingProfiles.leetcode.lastSynced).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>

                          <Box>
                            <TextField fullWidth label="HackerRank Username" value={socialProfiles.hackerrank} onChange={(e) => setSocialProfiles(p => ({ ...p, hackerrank: e.target.value }))} sx={inputSx}
                              placeholder="e.g. jane_ranker"
                              InputProps={{ startAdornment: <InputAdornment position="start"><CodeOutlined sx={{ color: '#2ec866' }} /></InputAdornment> }}
                            />
                            {user?.codingProfiles?.hackerrank?.connected && (
                              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <SyncOutlined sx={{ fontSize: 12 }} /> Last synced: {new Date(user.codingProfiles.hackerrank.lastSynced).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>

                          <Box>
                            <TextField fullWidth label="Codeforces Username" value={socialProfiles.codeforces} onChange={(e) => setSocialProfiles(p => ({ ...p, codeforces: e.target.value }))} sx={inputSx}
                              placeholder="e.g. cf_jane"
                              InputProps={{ startAdornment: <InputAdornment position="start"><TerminalOutlined sx={{ color: '#1f8ee7' }} /></InputAdornment> }}
                            />
                            {user?.codingProfiles?.codeforces?.connected && (
                              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <SyncOutlined sx={{ fontSize: 12 }} /> Last synced: {new Date(user.codingProfiles.codeforces.lastSynced).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>

                          <Box>
                            <TextField fullWidth label="CodeChef Username" value={socialProfiles.codechef} onChange={(e) => setSocialProfiles(p => ({ ...p, codechef: e.target.value }))} sx={inputSx}
                              placeholder="e.g. chef_jane"
                              InputProps={{ startAdornment: <InputAdornment position="start"><CodeOutlined sx={{ color: '#5b4638' }} /></InputAdornment> }}
                            />
                            {user?.codingProfiles?.codechef?.connected && (
                              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <SyncOutlined sx={{ fontSize: 12 }} /> Last synced: {new Date(user.codingProfiles.codechef.lastSynced).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ mt: 5, p: 3, borderRadius: '20px', bgcolor: 'rgba(99, 102, 241, 0.03)', border: '1px dashed rgba(99, 102, 241, 0.2)' }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <SyncOutlined sx={{ color: COLORS.primary, animation: loading ? 'spin 2s linear infinite' : 'none' }} />
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Automatic Data Synchronization</Typography>
                              <Typography variant="caption" sx={{ color: COLORS.textSub, fontWeight: 600 }}>Connecting these profiles will automatically pull your solved problems, ranking, and activity into your dashboard heatmap.</Typography>
                            </Box>
                          </Stack>
                        </Box>
                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                      </Box>
                    )}

                    {activeTab === 2 && (
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: COLORS.textMain }}>Login Security</Typography>
                        <Typography variant="body1" sx={{ color: COLORS.textSub, mb: 5 }}>Protect your account with a strong password</Typography>
                        
                        <Stack spacing={4}>
                          <TextField fullWidth type="password" label="Current Secret Password" sx={inputSx} />
                          <Divider sx={{ opacity: 0.5 }}>
                            <Chip label="NEW CREDENTIALS" size="small" sx={{ fontSize: '0.65rem', fontWeight: 900, bgcolor: '#f1f5f9' }} />
                          </Divider>
                          <Grid container spacing={3.5}>
                            <Grid item xs={12} sm={6}>
                              <TextField fullWidth type="password" label="Create New Password" sx={inputSx} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField fullWidth type="password" label="Verify New Password" sx={inputSx} />
                            </Grid>
                          </Grid>
                        </Stack>
                      </Box>
                    )}

                    {activeTab === 3 && (
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: COLORS.textMain }}>Notification Hub</Typography>
                        <Typography variant="body1" sx={{ color: COLORS.textSub, mb: 5 }}>Control how you receive updates</Typography>
                        <Stack spacing={2.5}>
                          {['Academic Reminders', 'System Announcements', 'Performance Analytics', 'Security Alerts'].map(label => (
                            <Stack key={label} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 3, borderRadius: '20px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9', transition: 'all 0.2s', '&:hover': { bgcolor: '#fff', borderColor: COLORS.primary } }}>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: COLORS.textMain }}>{label}</Typography>
                                <Typography variant="body2" sx={{ color: COLORS.textSub }}>Receive real-time push notifications</Typography>
                              </Box>
                              <Switch defaultChecked sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.primary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.primary } }} />
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {activeTab === 4 && (
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: COLORS.textMain }}>Platform Theme</Typography>
                        <Typography variant="body1" sx={{ color: COLORS.textSub, mb: 5 }}>Personalize your visual experience</Typography>
                        <Grid container spacing={3}>
                          {['Modern Light', 'Deep Indigo', 'Pure Dark', 'High Contrast'].map((themeName, idx) => (
                            <Grid item xs={12} sm={6} key={themeName}>
                              <Box sx={{ p: 3, borderRadius: '20px', bgcolor: idx === 0 ? 'rgba(99, 102, 241, 0.05)' : '#f8fafc', border: `2px solid ${idx === 0 ? COLORS.primary : '#f1f5f9'}`, cursor: 'pointer', '&:hover': { borderColor: COLORS.primary } }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>{themeName}</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Box sx={{ width: 24, height: 24, borderRadius: '6px', bgcolor: COLORS.primary }} />
                                  <Box sx={{ width: 24, height: 24, borderRadius: '6px', bgcolor: COLORS.secondary }} />
                                  <Box sx={{ width: 24, height: 24, borderRadius: '6px', bgcolor: COLORS.bg }} />
                                </Box>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {/* Footer Actions */}
                    <Box sx={{ mt: 8, pt: 4, borderTop: `1px solid rgba(0,0,0,0.05)`, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'flex-end', gap: 2.5 }}>
                      <Button 
                        variant="text" 
                        onClick={() => {
                          if (activeTab === 0) {
                            setProfile({
                              name: user?.name || '',
                              email: user?.email || '',
                              phone: user?.profile?.phone || '',
                              address: user?.profile?.address || '',
                            });
                          } else if (activeTab === 1) {
                            setSocialProfiles({
                              leetcode: user?.codingProfiles?.leetcode?.username || '',
                              hackerrank: user?.codingProfiles?.hackerrank?.username || '',
                              codeforces: user?.codingProfiles?.codeforces?.username || '',
                              codechef: user?.codingProfiles?.codechef?.username || '',
                            });
                          }
                        }}
                        sx={{ borderRadius: '16px', py: 1.5, px: 4, color: COLORS.textSub, fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                        Discard All
                      </Button>
                      <Button variant="contained" disableElevation 
                        onClick={() => activeTab === 1 ? handleConnectProfiles() : handleSaveProfile()} 
                        disabled={loading || activeTab > 1}
                        sx={{ 
                          borderRadius: '16px', px: 6, py: 1.8, bgcolor: COLORS.primary, 
                          boxShadow: '0 8px 25px rgba(99, 102, 241, 0.2)',
                          '&:hover': { bgcolor: COLORS.secondary, transform: 'translateY(-2px)' }, 
                          textTransform: 'none', fontWeight: 800, fontSize: '1.05rem',
                          transition: 'all 0.3s'
                        }}
                      >
                        {loading ? 'Processing...' : activeTab === 1 ? 'Connect & Sync' : 'Sync Changes'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </MotionBox>
            </AnimatePresence>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.sev} variant="filled" sx={{ borderRadius: '16px', fontWeight: 700 }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
