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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header Strip */}
        <Paper sx={{ 
          p: 3, 
          borderRadius: '24px', 
          bgcolor: '#fff', 
          mb: 3, 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mb: 0.5 }}>{course.title}</Typography>
            <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
              Batch: {course.enrollmentData?.batch || 'MERN-ANNIVERSARY'} • Started June 1st
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button 
              fullWidth
              variant="contained" 
              startIcon={<IconVideo size={20} />} 
              sx={{ bgcolor: course.color, py: 1.25, px: 3, borderRadius: '12px', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: course.color, filter: 'brightness(0.9)' } }}
            >
              Join Live Class
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/dashboard')}
              startIcon={<IconArrowLeft size={20} />} 
              sx={{ py: 1.25, px: 3, borderRadius: '12px', fontWeight: 800, textTransform: 'none', color: '#64748b', borderColor: '#e2e8f0' }}
            >
              Back
            </Button>
          </Stack>
        </Paper>

        {/* Discord Announcement */}
        <Paper sx={{ 
          p: 3, 
          borderRadius: '24px', 
          background: 'linear-gradient(135deg, #5865F2 0%, #4752C4 100%)', 
          color: '#fff', 
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 3
        }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <IconBrandDiscord size={32} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>Join Our Community</Typography>
              <Typography sx={{ opacity: 0.9, fontWeight: 500 }}>Get instant help from mentors and network with fellow students on Discord.</Typography>
            </Box>
          </Stack>
          <Button 
            variant="contained" 
            href="https://discord.gg/c89wxMs4G" 
            target="_blank"
            sx={{ 
              bgcolor: '#fff', 
              color: '#5865F2', 
              fontWeight: 800, 
              borderRadius: '12px', 
              px: 4, 
              py: 1,
              textTransform: 'none',
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
          >
            Join Discord Now
          </Button>
        </Paper>

        <Box sx={{ mb: 4, borderBottom: '1px solid #e2e8f0', bgcolor: '#fff', borderRadius: '16px', px: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={(_, val) => setTabValue(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': { bgcolor: course.color, height: 3, borderRadius: '3px 3px 0 0' },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: '#64748b',
                minHeight: 64,
                '&.Mui-selected': { color: course.color }
              }
            }}
          >
            {menuItems.map((item) => (
              <Tab 
                key={item.index} 
                icon={item.icon} 
                iconPosition="start" 
                label={item.label} 
              />
            ))}
          </Tabs>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Overall Attendance', val: '0%', icon: <IconCalendarCheck size={24} />, color: '#10b981' },
            { label: 'Course Progress', val: `${course.enrollmentData?.progress || 0}%`, icon: <IconRocket size={24} />, color: course.color },
            { label: 'Assignments', val: '0/0', icon: <IconClipboardList size={24} />, color: '#f59e0b' },
            { label: 'Current Rank', val: '--', icon: <IconTrophy size={24} />, color: '#6366f1' }
          ].map((stat, i) => (
            <Grid item xs={12} sm={6} lg={3} key={i}>
              <Card sx={{ borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>{stat.label}</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a' }}>{stat.val}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tabValue}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tab 0: Curriculum */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 3 }}>Learning Path</Typography>
              <Stack spacing={3}>
                {course.roadmap?.map((week, idx) => (
                  <Card key={idx} sx={{ borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: 'none', bgcolor: '#fff' }}>
                    <CardContent sx={{ p: 4 }}>
                      <Stack direction="row" spacing={3} alignItems="flex-start">
                        <Box sx={{ 
                          width: 54, height: 54, borderRadius: '18px', bgcolor: '#f8fafc', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          color: course.color, fontWeight: 900, border: '1px solid #e2e8f0', fontSize: '1.2rem'
                        }}>
                          {week.week}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', mb: 1.5 }}>{week.title}</Typography>
                          <Grid container spacing={1} sx={{ mb: 3 }}>
                            {week.topics?.map((topic, i) => (
                              <Grid item xs={12} sm={6} key={i}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                  <IconCircleCheck size={18} color={course.color} />
                                  <Typography sx={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>{topic}</Typography>
                                </Stack>
                              </Grid>
                            ))}
                          </Grid>
                          <Stack direction="row" spacing={2}>
                            {week.project && (
                              <Chip icon={<IconBook size={14} />} label={`Project: ${week.project}`} size="small" sx={{ bgcolor: '#fffbeb', color: '#92400e', fontWeight: 800, px: 1 }} />
                            )}
                            {week.assignment && (
                              <Chip icon={<IconTerminal2 size={14} />} label={`Assignment: ${week.assignment}`} size="small" sx={{ bgcolor: '#f0fdf4', color: '#166534', fontWeight: 800, px: 1 }} />
                            )}
                          </Stack>
                        </Box>
                        <Button variant="outlined" sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 800, py: 1, px: 2 }}>
                          Resources
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            {/* Tab 1: Attendance */}
            <TabPanel value={tabValue} index={1}>
              <Card sx={{ borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <CardContent sx={{ p: 6 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.75rem', mb: 4 }}>Attendance Log</Typography>
                  <Grid container spacing={6}>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                        <Typography sx={{ color: '#64748b', fontWeight: 700, mb: 1 }}>Current Status</Typography>
                        <Typography sx={{ fontSize: '3.5rem', fontWeight: 900, color: '#94a3b8' }}>0%</Typography>
                        <Typography sx={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>Sessions haven't started yet</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Typography sx={{ fontWeight: 800, mb: 3 }}>Session History</Typography>
                      <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '16px' }}>
                        <Typography sx={{ color: '#94a3b8', fontWeight: 600 }}>No session history available yet.</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Tab 2: Assessments */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 4 }}>Assessment Center</Typography>
              <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <IconClipboardList size={48} color="#94a3b8" style={{ marginBottom: 16 }} />
                <Typography sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '1.1rem' }}>No assessments assigned yet.</Typography>
                <Typography sx={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Check back once the classes begin!</Typography>
              </Box>
            </TabPanel>

            {/* Tab 3: Performance */}
            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={4}>
                <Grid item xs={12} lg={7}>
                  <Card sx={{ borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: 'none', mb: 4 }}>
                    <CardContent sx={{ p: 5 }}>
                      <Typography variant="h3" sx={{ fontWeight: 900, mb: 4 }}>Skills Mastery</Typography>
                      <Grid container spacing={3}>
                        {[
                          { skill: 'Bootstrap', level: 0 },
                          { skill: 'Context-API', level: 0 },
                          { skill: 'Vercel / Render', level: 0 },
                          { skill: 'Cloudflare', level: 0 },
                          { skill: 'Git and GitHub', level: 0 },
                          { skill: 'CI/CD Pipelines', level: 0 },
                          { skill: 'REST APIs', level: 0 },
                          { skill: 'Cloud Deployment', level: 0 }
                        ].map((s, i) => (
                          <Grid item xs={12} sm={6} key={i}>
                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{s.skill}</Typography>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#cbd5e1' }}>0%</Typography>
                              </Stack>
                              <LinearProgress variant="determinate" value={0} sx={{ height: 6, borderRadius: 3, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: course.color } }} />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} lg={5}>
                  <Card sx={{ borderRadius: '32px', height: '100%', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                    <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
                      <IconAward size={64} color="#f59e0b" style={{ marginBottom: 24 }} />
                      <Typography sx={{ fontWeight: 900, fontSize: '1.75rem', mb: 2 }}>Unlock Your Potential</Typography>
                      <Typography sx={{ fontSize: '1.05rem', color: '#94a3b8', mb: 4, lineHeight: 1.6, fontWeight: 500 }}>
                        Your journey starts soon! Attend classes and complete assignments to see your skills grow here.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 4: My Profile */}
            <TabPanel value={tabValue} index={4}>
              <Card sx={{ borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <CardContent sx={{ p: 5 }}>
                  <Typography variant="h3" sx={{ fontWeight: 900, mb: 4 }}>My Enrollment Profile</Typography>
                  <Typography sx={{ color: '#64748b', mb: 4, fontWeight: 500 }}>
                    You can update your academic and contact details here. Email address cannot be changed.
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="Surname" value={profileData.surname} onChange={(e) => setProfileData({...profileData, surname: e.target.value.toUpperCase()})} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="First Name" value={profileData.firstName} onChange={(e) => setProfileData({...profileData, firstName: e.target.value.toUpperCase()})} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="Last Name" value={profileData.lastName} onChange={(e) => setProfileData({...profileData, lastName: e.target.value.toUpperCase()})} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Phone Number" value={profileData.phoneNumber} onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Roll Number" value={profileData.rollNumber} onChange={(e) => setProfileData({...profileData, rollNumber: e.target.value})} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="College Name" value={profileData.collegeName} onChange={(e) => setProfileData({...profileData, collegeName: e.target.value})} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Email Address" value={user?.email || ''} disabled variant="outlined" helperText="Email cannot be updated" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" onClick={handleProfileUpdate} disabled={updating} sx={{ bgcolor: course.color, py: 1.5, px: 6, borderRadius: '12px', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: course.color, filter: 'brightness(0.9)' } }}>
                      {updating ? 'Saving Changes...' : 'Update Profile'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Tab 5: Students List */}
            <TabPanel value={tabValue} index={5}>
              <Card sx={{ borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <CardContent sx={{ p: 5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Typography variant="h3" sx={{ fontWeight: 900 }}>Enrolled Students List</Typography>
                    <Chip label={`${course.enrollments?.length || 0} Total Students`} sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontWeight: 900, borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }} />
                  </Stack>
                  <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: 'none', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>S.No</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Full Name</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Roll Number</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>College Name</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[...(course.enrollments || [])]
                          .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((enrollment, idx) => (
                          <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                            <TableCell sx={{ fontWeight: 600 }}>{page * rowsPerPage + idx + 1}</TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar sx={{ width: 32, height: 32, bgcolor: course.color, fontSize: '0.8rem', fontWeight: 800 }}>
                                  {(enrollment.firstName || enrollment.student?.name)?.[0]}
                                </Avatar>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                  {`${enrollment.surname || ''} ${enrollment.firstName || ''} ${enrollment.lastName || ''}`.trim() || enrollment.student?.name}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748b' }}>{enrollment.rollNumber || '--'}</TableCell>
                            <TableCell sx={{ fontSize: '0.85rem' }}>{enrollment.collegeName || '--'}</TableCell>
                            <TableCell>
                              <Chip label="active" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }} />
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

            {/* Tab 6: Certificates */}
            <TabPanel value={tabValue} index={6}>
              {renderCertificates()}
            </TabPanel>

          </motion.div>
        </AnimatePresence>
      </Container>
    </Box>
  );
}
