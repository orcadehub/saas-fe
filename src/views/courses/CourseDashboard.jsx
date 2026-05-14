import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Stack, Grid, Container, Tabs, Tab, Card,
  CardContent, LinearProgress, Avatar, Chip, Divider, List, ListItem,
  ListItemText, ListItemAvatar, Paper, CircularProgress, Alert, useTheme, useMediaQuery
} from '@mui/material';
import {
  IconArrowLeft, IconBook, IconCalendarCheck, IconFileCheck, IconTrophy,
  IconVideo, IconFileText, IconClipboardList, IconPoint, IconClock,
  IconSmartHome, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand,
  IconCircleCheck, IconCircleX, IconAlertCircle, IconAward, IconRocket, IconTerminal2,
  IconBrandDiscord
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import tenantConfig from 'config/tenantConfig';
import { useAuth } from 'contexts/AuthContext';

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
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      const config = await tenantConfig.get();
      const response = await fetch(`${API_BASE_URL}/student/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || localStorage.getItem('studentToken')}`,
          'x-api-key': config.apiKey,
          'x-tenant-id': config.tenantId
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCourse(data);
        if (!data.isEnrolled) {
          navigate(`/courses/${courseId}`);
        }
      } else {
        setError(data.message || 'Failed to load course details');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc' }}>
      <CircularProgress />
    </Box>
  );

  if (error || !course) return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <Alert severity="error">{error || 'Course not found'}</Alert>
      <Button startIcon={<IconArrowLeft />} onClick={() => navigate('/courses')} sx={{ mt: 2 }}>Back to Courses</Button>
    </Container>
  );


  const menuItems = [
    { label: 'Curriculum', icon: <IconBook size={22} />, index: 0 },
    { label: 'Attendance', icon: <IconCalendarCheck size={22} />, index: 1 },
    { label: 'Assessments', icon: <IconFileCheck size={22} />, index: 2 },
    { label: 'My Performance', icon: <IconTrophy size={22} />, index: 3 }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* ── Main Content Area ── */}
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
          </Stack>
        </Paper>

        {/* Discord Mandatory Banner */}
        <Paper sx={{ 
          p: 2, 
          borderRadius: '20px', 
          bgcolor: '#5865F2', 
          color: '#fff', 
          mb: 3, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: 2,
          boxShadow: '0 8px 24px rgba(88, 101, 242, 0.25)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex' }}>
              <IconBrandDiscord size={28} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.3px' }}>
                Must Join: Batch Discord Community
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9 }}>
                Mandatory for class links, assignments, and mentor support.
              </Typography>
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
                {...item} 
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
              <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
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
                </Grid>
                <Grid item xs={12} lg={4}>
                  <Typography variant="h3" sx={{ fontWeight: 900, mb: 3 }}>Upcoming Events</Typography>
                  <Stack spacing={3}>
                    <Paper sx={{ p: 3, borderRadius: '24px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
                      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#fef2f2', color: '#ef4444' }}><IconAlertCircle size={24} /></Box>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>Final Project Deadline</Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8' }}>3 days remaining</Typography>
                        </Box>
                      </Stack>
                      <Button fullWidth variant="contained" sx={{ bgcolor: '#0f172a', py: 1.5, borderRadius: '12px', fontWeight: 800 }}>Submit Work</Button>
                    </Paper>
                    
                    <Paper sx={{ p: 3, borderRadius: '24px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
                      <Typography sx={{ fontWeight: 800, mb: 2 }}>Live Mentor Session</Typography>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <IconClock size={18} color="#64748b" />
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Sat, 04:00 PM IST</Typography>
                        </Stack>
                        <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>Topic: Advance Context API and State Management patterns.</Typography>
                      </Stack>
                    </Paper>
                  </Stack>
                </Grid>
              </Grid>
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
          </motion.div>
        </AnimatePresence>
      </Container>
    </Box>
  );
}
