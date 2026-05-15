import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Stack, Grid, Container, Tabs, Tab, Card,
  CardContent, LinearProgress, Avatar, Chip, Divider, List, ListItem,
  ListItemText, ListItemAvatar, Paper, CircularProgress, Alert, useTheme, useMediaQuery,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  IconButton, ListItemIcon, ListItemButton
} from '@mui/material';
import {
  IconArrowLeft, IconBook, IconCalendarCheck, IconFileCheck, IconTrophy,
  IconVideo, IconFileText, IconClipboardList, IconPoint, IconClock,
  IconSmartHome, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand,
  IconCircleCheck, IconCircleX, IconAlertCircle, IconAward, IconRocket, IconTerminal2,
  IconBrandDiscord, IconUserCircle, IconUsers
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import tenantConfig from 'config/tenantConfig';
import { useAuth } from 'contexts/AuthContext';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';

const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {children}
      </Box>
    )}
  </div>
);

export default function CourseDashboard() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    surname: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    rollNumber: '',
    collegeName: ''
  });

  // Pagination for enrolled students
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    // Mock for test user
    if (user?.email === 'test@test.com') {
      const mockCourse = {
        title: courseId.toUpperCase().replace('-', ' ') + ' Mastery',
        color: '#6366f1',
        enrollmentData: {
          batch: 'MERN-ANNIVERSARY',
          progress: 45,
          surname: 'TEST',
          firstName: 'USER',
          phone: '9999999999',
          rollNumber: 'ORC-2024-001',
          collegeName: 'Orcade University'
        },
        roadmap: [
          { week: 'Week 1', title: 'Introduction to Web', topics: ['HTML Basics', 'CSS Layouts'], project: 'Portfolio', assignment: 'Flexbox Quiz' },
          { week: 'Week 2', title: 'JavaScript Fundamentals', topics: ['Variables', 'Functions', 'DOM'], project: 'Calculator', assignment: 'ES6 Tasks' },
          { week: 'Week 3', title: 'React Core', topics: ['Components', 'Hooks'], project: 'Task App', assignment: 'Hooks Exercise' },
          { week: 'Week 4', title: 'Backend with Node', topics: ['Express', 'Middleware'], project: 'REST API', assignment: 'Auth Flow' }
        ],
        enrollments: [
          { surname: 'TEST', firstName: 'USER', rollNumber: 'ORC-2024-001', collegeName: 'Orcade University', enrolledAt: new Date().toISOString() },
          { surname: 'DOE', firstName: 'JOHN', rollNumber: 'ORC-2024-002', collegeName: 'Tech Institute', enrolledAt: new Date().toISOString() }
        ]
      };
      setCourse(mockCourse);
      setProfileData({
        surname: 'TEST',
        firstName: 'USER',
        lastName: '',
        phoneNumber: '9999999999',
        rollNumber: 'ORC-2024-001',
        collegeName: 'Orcade University'
      });
      setLoading(false);
      return;
    }

    try {
      const config = await tenantConfig.load();
      const token = localStorage.getItem('studentToken');
      
      const response = await fetch(`${API_BASE_URL}/student/courses/${courseId}`, {
        headers: {
          'x-api-key': config.apiKey,
          'x-tenant-id': config.tenantId,
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch course details');
      const data = await response.json();
      setCourse(data);
      
      // Update profile data from enrollment
      if (data.enrollmentData) {
        setProfileData({
          surname: data.enrollmentData.surname || '',
          firstName: data.enrollmentData.firstName || '',
          lastName: data.enrollmentData.lastName || '',
          phoneNumber: data.enrollmentData.phone || '',
          rollNumber: data.enrollmentData.rollNumber || '',
          collegeName: data.enrollmentData.collegeName || ''
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Could not load course dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setUpdating(true);
    try {
      const config = await tenantConfig.load();
      const token = localStorage.getItem('studentToken');
      
      const response = await fetch(`${API_BASE_URL}/student/courses/${courseId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'x-tenant-id': config.tenantId,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) throw new Error('Update failed');
      toast.success('Profile updated successfully');
      fetchCourseDetail();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <CircularProgress sx={{ color: '#6366f1' }} />
    </Box>
  );

  if (!course) return (
    <Container sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h4">Course not found</Typography>
      <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>Back to Dashboard</Button>
    </Container>
  );

  const menuItems = [
    { label: 'Curriculum', icon: <IconBook size={20} />, index: 0 },
    { label: 'Attendance', icon: <IconCalendarCheck size={20} />, index: 1 },
    { label: 'Assessments', icon: <IconFileCheck size={20} />, index: 2 },
    { label: 'Performance', icon: <IconTrophy size={20} />, index: 3 },
    { label: 'My Profile', icon: <IconUserCircle size={20} />, index: 4 },
    { label: 'Students', icon: <IconUsers size={20} />, index: 5 },
    { label: 'Certificates', icon: <IconAward size={20} />, index: 6 }
  ];

  const renderCertificates = () => {
    if (user?.email === 'test@test.com') {
      return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 4, color: '#0f172a', textAlign: 'center' }}>Your Achievements</Typography>
          <Card sx={{ 
            borderRadius: '32px', 
            overflow: 'hidden', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px rgba(0,0,0,0.06)'
          }}>
            <Grid container>
              <Grid item xs={12} md={5}>
                <Box sx={{ 
                  height: '100%', 
                  minHeight: 250,
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  p: 4
                }}>
                  <IconAward size={80} stroke={1.5} />
                  <Typography variant="h4" sx={{ mt: 2, fontWeight: 900, textAlign: 'center' }}>Verified Achievement</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={7}>
                <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                  <Chip label="AVAILABLE TO DOWNLOAD" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 900, fontSize: '0.65rem', mb: 2 }} />
                  <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: '#1e293b' }}>
                    Course Completion Certificate
                  </Typography>
                  <Typography sx={{ color: '#64748b', fontWeight: 500, mb: 4, lineHeight: 1.6 }}>
                    This certificate recognizes your hard work and mastery of {course.title}. Share it with your network to showcase your skills.
                  </Typography>
                  
                  <Stack spacing={3}>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 0.5 }}>CERTIFICATE ID</Typography>
                      <Typography sx={{ fontWeight: 900, color: '#1e293b' }}>ORC-2024-MERN-8921</Typography>
                    </Box>
                    <Button 
                      fullWidth
                      variant="contained" 
                      sx={{ 
                        bgcolor: '#0f172a', 
                        borderRadius: '16px', 
                        fontWeight: 900,
                        py: 2,
                        fontSize: '1rem',
                        boxShadow: '0 10px 20px rgba(15, 23, 42, 0.2)',
                        '&:hover': { bgcolor: '#1e293b' }
                      }}
                    >
                      Download PDF (₹99)
                    </Button>
                  </Stack>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Box>
      );
    }

    return (
      <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#fff', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
        <Box sx={{ width: 100, height: 100, bgcolor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
          <IconAward size={54} color="#cbd5e1" stroke={1.5} />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b' }}>No Certificates Yet</Typography>
        <Typography sx={{ color: '#64748b', fontWeight: 500, mt: 1, maxWidth: 400, mx: 'auto' }}>
          Your certificates will appear here once you successfully complete the course assessments and attendance requirements.
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 10 }}>
      {/* ── Top Hero Navigation ── */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.8)' }}>
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ height: 80 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton onClick={() => navigate('/dashboard')} sx={{ bgcolor: '#f1f5f9', borderRadius: '12px', p: 1 }}>
                <IconArrowLeft size={20} color="#64748b" />
              </IconButton>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>{course.title}</Typography>
                <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Dashboard • {course.enrollmentData?.batch || 'MERN-JUNE-2024'}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button 
                variant="contained" 
                startIcon={<IconVideo size={20} />} 
                sx={{ 
                  bgcolor: course.color || '#6366f1', 
                  py: 1.25, 
                  px: 3, 
                  borderRadius: '14px', 
                  fontWeight: 900, 
                  textTransform: 'none',
                  boxShadow: `0 8px 16px ${(course.color || '#6366f1')}40`,
                  '&:hover': { bgcolor: course.color || '#6366f1', filter: 'brightness(0.9)' } 
                }}
              >
                Join Live
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* ── Left Sidebar / Navigation ── */}
          <Grid item xs={12} lg={3}>
            <Stack spacing={3}>
              {/* Profile Overview Card */}
              <Card sx={{ borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: course.color || '#6366f1', fontWeight: 900, fontSize: '1.5rem' }}>
                      {user?.name?.[0] || 'S'}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b' }}>{user?.name || 'Student'}</Typography>
                      <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>{course.enrollmentData?.rollNumber || 'ID: --'}</Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '16px', mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#64748b' }}>PROGRESS</Typography>
                      <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: course.color }}>{course.enrollmentData?.progress || 0}%</Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={course.enrollmentData?.progress || 0} 
                      sx={{ height: 8, borderRadius: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: course.color || '#6366f1' } }} 
                    />
                  </Box>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<IconBrandDiscord size={20} />}
                    href="https://discord.gg/c89wxMs4G"
                    target="_blank"
                    sx={{ borderRadius: '14px', py: 1.5, fontWeight: 800, color: '#5865F2', borderColor: 'rgba(88, 101, 242, 0.2)', '&:hover': { bgcolor: 'rgba(88, 101, 242, 0.05)', borderColor: '#5865F2' } }}
                  >
                    Community Support
                  </Button>
                </CardContent>
              </Card>

              {/* Vertical Menu */}
              <Paper sx={{ borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: 'none', overflow: 'hidden' }}>
                <List sx={{ py: 1 }}>
                  {menuItems.map((item) => (
                    <ListItem key={item.index} disablePadding>
                      <ListItemButton 
                        selected={tabValue === item.index}
                        onClick={() => setTabValue(item.index)}
                        sx={{
                          py: 2,
                          px: 3,
                          '&.Mui-selected': {
                            bgcolor: `${course.color}10`,
                            color: course.color,
                            '&:hover': { bgcolor: `${course.color}15` },
                            '& .MuiListItemIcon-root': { color: course.color }
                          },
                          '&:hover': { bgcolor: '#f8fafc' }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40, color: tabValue === item.index ? course.color : '#94a3b8' }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.label} 
                          primaryTypographyProps={{ fontWeight: tabValue === item.index ? 900 : 700, fontSize: '0.95rem' }} 
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Stack>
          </Grid>

          {/* ── Main Dashboard Area ── */}
          <Grid item xs={12} lg={9}>
            <AnimatePresence mode="wait">
              <motion.div
                key={tabValue}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* ── Dashboard Stats ── */}
                {tabValue === 0 && (
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    {[
                      { label: 'Attendance', val: '0%', icon: <IconCalendarCheck size={24} />, color: '#10b981' },
                      { label: 'Assessments', val: '0/0', icon: <IconClipboardList size={24} />, color: '#f59e0b' },
                      { label: 'Performance', val: '--', icon: <IconTrophy size={24} />, color: '#6366f1' }
                    ].map((stat, i) => (
                      <Grid item xs={12} sm={4} key={i}>
                        <Card sx={{ borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                          <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {stat.icon}
                              </Box>
                              <Box>
                                <Typography sx={{ color: '#64748b', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }}>{stat.label}</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a' }}>{stat.val}</Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* ── TAB PANELS ── */}
                
                {/* 0. Curriculum */}
                <TabPanel value={tabValue} index={0}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h2" sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>Learning Path</Typography>
                    <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Follow your weekly journey and access resources.</Typography>
                  </Box>
                  <Stack spacing={3}>
                    {course.roadmap?.map((week, idx) => (
                      <Card key={idx} sx={{ 
                        borderRadius: '28px', 
                        border: '1px solid #e2e8f0', 
                        boxShadow: 'none', 
                        transition: 'all 0.3s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', borderColor: course.color }
                      }}>
                        <CardContent sx={{ p: 4 }}>
                          <Grid container spacing={4} alignItems="center">
                            <Grid item xs={12} sm={auto}>
                              <Box sx={{ 
                                width: 64, height: 64, borderRadius: '20px', bgcolor: '#f8fafc', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                color: course.color, fontWeight: 900, border: '2px solid #f1f5f9', fontSize: '1.5rem'
                              }}>
                                {week.week}
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm>
                              <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', mb: 1.5 }}>{week.title}</Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {week.topics?.map((topic, i) => (
                                  <Chip 
                                    key={i} 
                                    label={topic} 
                                    size="small" 
                                    icon={<IconCircleCheck size={14} color={course.color} />} 
                                    sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', fontWeight: 700, px: 0.5 }} 
                                  />
                                ))}
                              </Box>
                              <Stack direction="row" spacing={2}>
                                {week.project && (
                                  <Chip icon={<IconBook size={14} />} label={`Project: ${week.project}`} size="small" sx={{ bgcolor: '#fffbeb', color: '#92400e', fontWeight: 800 }} />
                                )}
                                {week.assignment && (
                                  <Chip icon={<IconTerminal2 size={14} />} label={`Assignment: ${week.assignment}`} size="small" sx={{ bgcolor: '#f0fdf4', color: '#166534', fontWeight: 800 }} />
                                )}
                              </Stack>
                            </Grid>
                            <Grid item xs={12} sm="auto">
                              <Button variant="outlined" sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 800, py: 1.5, px: 3, color: '#64748b', borderColor: '#e2e8f0' }}>
                                View Resources
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </TabPanel>

                {/* 1. Attendance */}
                <TabPanel value={tabValue} index={1}>
                  <Card sx={{ borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 5 }}>
                      <Typography variant="h3" sx={{ fontWeight: 900, mb: 4 }}>Attendance Log</Typography>
                      <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
                        <IconCalendarCheck size={48} color="#94a3b8" style={{ marginBottom: 16 }} />
                        <Typography sx={{ color: '#64748b', fontWeight: 800, fontSize: '1.2rem' }}>No Attendance Recorded</Typography>
                        <Typography sx={{ color: '#94a3b8', fontWeight: 600, mt: 1 }}>Attendance tracking begins after the first live session.</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </TabPanel>

                {/* 2. Assessments */}
                <TabPanel value={tabValue} index={2}>
                  <Card sx={{ borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 5 }}>
                      <Typography variant="h3" sx={{ fontWeight: 900, mb: 4 }}>Assessment Center</Typography>
                      <Box sx={{ p: 8, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
                        <IconClipboardList size={54} color="#94a3b8" style={{ marginBottom: 16 }} />
                        <Typography sx={{ color: '#64748b', fontWeight: 800, fontSize: '1.2rem' }}>Assessments Pending</Typography>
                        <Typography sx={{ color: '#94a3b8', fontWeight: 600, mt: 1 }}>Keep learning! Your first assessment will be posted in Week 2.</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </TabPanel>

                {/* 3. Performance */}
                <TabPanel value={tabValue} index={3}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Card sx={{ borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: 'none', mb: 4 }}>
                        <CardContent sx={{ p: 5 }}>
                          <Typography variant="h3" sx={{ fontWeight: 900, mb: 4 }}>Skill Mastery Breakdown</Typography>
                          <Grid container spacing={3}>
                            {[
                              { skill: 'React Essentials', level: 0 },
                              { skill: 'Node & Express', level: 0 },
                              { skill: 'Database (MongoDB)', level: 0 },
                              { skill: 'Cloud Deployment', level: 0 },
                              { skill: 'REST API Design', level: 0 },
                              { skill: 'Auth & Security', level: 0 }
                            ].map((s, i) => (
                              <Grid item xs={12} sm={6} key={i}>
                                <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', color: '#1e293b' }}>{s.skill}</Typography>
                                    <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', color: '#cbd5e1' }}>0%</Typography>
                                  </Stack>
                                  <LinearProgress variant="determinate" value={0} sx={{ height: 8, borderRadius: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: course.color } }} />
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* 4. My Profile */}
                <TabPanel value={tabValue} index={4}>
                  <Card sx={{ borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 5 }}>
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>Academic Profile</Typography>
                        <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Update your enrollment details for certificate verification.</Typography>
                      </Box>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                          <TextField fullWidth label="Surname" value={profileData.surname} onChange={(e) => setProfileData({...profileData, surname: e.target.value.toUpperCase()})} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField fullWidth label="First Name" value={profileData.firstName} onChange={(e) => setProfileData({...profileData, firstName: e.target.value.toUpperCase()})} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField fullWidth label="Last Name" value={profileData.lastName} onChange={(e) => setProfileData({...profileData, lastName: e.target.value.toUpperCase()})} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Phone Number" value={profileData.phoneNumber} onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="College Roll No / ID" value={profileData.rollNumber} onChange={(e) => setProfileData({...profileData, rollNumber: e.target.value})} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="University / College Name" value={profileData.collegeName} onChange={(e) => setProfileData({...profileData, collegeName: e.target.value})} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }} />
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                          variant="contained" 
                          onClick={handleProfileUpdate}
                          disabled={updating}
                          sx={{ 
                            bgcolor: '#0f172a', 
                            py: 2, 
                            px: 8, 
                            borderRadius: '16px', 
                            fontWeight: 900,
                            fontSize: '1rem',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#1e293b' }
                          }}
                        >
                          {updating ? 'Saving Changes...' : 'Save Profile Details'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </TabPanel>

                {/* 5. Students List */}
                <TabPanel value={tabValue} index={5}>
                  <Card sx={{ borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                        <Typography variant="h3" sx={{ fontWeight: 900 }}>Classmates</Typography>
                        <Chip label={`${course.enrollments?.length || 0} Learners`} sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 900, borderRadius: '10px' }} />
                      </Stack>
                      <TableContainer component={Paper} sx={{ borderRadius: '20px', boxShadow: 'none', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <Table>
                          <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 900, py: 2.5 }}>FULL NAME</TableCell>
                              <TableCell sx={{ fontWeight: 900 }}>ROLL NUMBER</TableCell>
                              <TableCell sx={{ fontWeight: 900 }}>COLLEGE</TableCell>
                              <TableCell sx={{ fontWeight: 900 }}>STATUS</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {[...(course.enrollments || [])]
                              .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
                              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                              .map((enrollment, idx) => (
                              <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                                <TableCell>
                                  <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ width: 36, height: 36, bgcolor: course.color, fontWeight: 900, fontSize: '0.85rem' }}>
                                      {(enrollment.firstName || enrollment.student?.name)?.[0]}
                                    </Avatar>
                                    <Typography sx={{ fontWeight: 800, color: '#1e293b' }}>
                                      {`${enrollment.surname || ''} ${enrollment.firstName || ''} ${enrollment.lastName || ''}`.trim() || enrollment.student?.name}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>{enrollment.rollNumber || '--'}</TableCell>
                                <TableCell sx={{ color: '#475569', fontWeight: 600 }}>{enrollment.collegeName || '--'}</TableCell>
                                <TableCell>
                                  <Chip label="ACTIVE" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 900, fontSize: '0.65rem' }} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={course.enrollments?.length || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                      />
                    </CardContent>
                  </Card>
                </TabPanel>

                {/* 6. Certificates */}
                <TabPanel value={tabValue} index={6}>
                  {renderCertificates()}
                </TabPanel>

              </motion.div>
            </AnimatePresence>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
