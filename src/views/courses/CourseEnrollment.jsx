import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Chip, Stack, Grid, Accordion, AccordionSummary,
  AccordionDetails, Checkbox, FormControlLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, CircularProgress, Divider, Container,
  TextField
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  IconChevronDown, IconClock, IconCalendarEvent, IconUsers, IconCircleCheck,
  IconCode, IconLiveView, IconBook, IconRocket, IconCertificate, IconGift,
  IconArrowLeft, IconBrandReact, IconBrandNodejs, IconBrandMongodb, IconBrandJavascript,
  IconBrandHtml5, IconBrandCss3, IconBrandGit, IconTerminal2, IconPoint,
  IconUserCheck, IconUserMinus
} from '@tabler/icons-react';
import tenantConfig from 'config/tenantConfig';
import { useAuth } from 'contexts/AuthContext';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';

const techIconMap = {
  'React.js': IconBrandReact,
  'Node.js': IconBrandNodejs,
  'MongoDB': IconBrandMongodb,
  'JavaScript': IconBrandJavascript,
  'HTML5': IconBrandHtml5,
  'CSS3': IconBrandCss3,
  'Git': IconBrandGit,
  'GitHub': IconBrandGit,
  'VS Code': IconTerminal2,
  'Express.js': IconCode,
  'Bootstrap': IconCode,
  'Context API': IconCode,
  'Vercel': IconRocket,
  'Render': IconRocket,
  'Cloudflare': IconRocket,
  'CICD': IconRocket,
  'REST APIs': IconCode,
  'Deployment': IconRocket
};

const EXTRA_SKILLS = [
  'Bootstrap', 'Context API', 'Vercel or Render', 'Cloudflare', 
  'Git and GitHub', 'CI/CD Pipelines', 'REST APIs', 'Cloud Deployment'
];

export default function CourseEnrollment() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [formData, setFormData] = useState({
    surname: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    collegeName: '',
    rollNumber: ''
  });
  const [expandedWeek, setExpandedWeek] = useState(1);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // Surname, First Name, Last Name should be automatically capitalized
    const capitalizedFields = ['surname', 'firstName', 'lastName'];
    setFormData(prev => ({
      ...prev,
      [name]: capitalizedFields.includes(name) ? value.toUpperCase() : value
    }));
  };

  useEffect(() => {
    tenantConfig.load().then(c => {
      setConfig(c);
      fetchCourse(c);
    }).catch(console.error);
  }, [courseId]);

  const fetchCourse = async (cfg) => {
    try {
      const headers = {
        'x-api-key': cfg.apiKey || '',
        'x-tenant-id': cfg.tenantId || ''
      };
      if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;

      const res = await fetch(`${API_BASE_URL}/student/courses/${courseId}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCourse(data);
      if (data.batches?.length) setSelectedBatch(data.batches[0].name);
    } catch (err) {
      setError(err.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    if (!user?.token) {
      navigate('/login');
      return;
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms and Conditions');
      return;
    }
    if (!selectedBatch) {
      setError('Please select a batch');
      return;
    }
    setShowEnrollDialog(true);
  };

  const confirmEnrollment = async () => {
    const { surname, firstName, phoneNumber, collegeName, rollNumber } = formData;
    if (!surname || !firstName || !phoneNumber || !collegeName || !rollNumber) {
      toast.error('Please fill in all mandatory student details');
      return;
    }

    setEnrolling(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/student/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
          'x-api-key': config.apiKey || '',
          'x-tenant-id': config.tenantId || ''
        },
        body: JSON.stringify({ 
          batchName: selectedBatch, 
          agreedToTerms: true,
          ...formData 
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowEnrollDialog(false);
        if (data.alreadyEnrolled) {
          toast.success('You are already enrolled! Redirecting to dashboard...');
        } else {
          toast.success('Successfully enrolled! Welcome to the course.');
        }
        
        setTimeout(() => {
          navigate(`/courses/${courseId}/dashboard`);
        }, 1500);
      } else {
        toast.error(data.message || 'Enrollment failed');
        setError(data.message || 'Enrollment failed');
      }
    } catch (err) {
      toast.error('Connection error. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (!course) {
    return (
      <Container sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Course not found</Typography>
        <Button onClick={() => navigate('/courses')} sx={{ mt: 2 }}>Back to Courses</Button>
      </Container>
    );
  }

  const activeBatches = course.batches?.filter(b => b.isActive) || [];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Top Navigation Bar */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e2e8f0', py: 1.5, position: 'sticky', top: 0, zIndex: 10 }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button
              startIcon={<IconArrowLeft size={18} />}
              onClick={() => navigate('/courses')}
              sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: 'transparent', color: '#0f172a' } }}
            >
              Back to Courses
            </Button>
            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', display: { xs: 'none', sm: 'block' } }}>
              {course.title}
            </Typography>
            {course.isFree && <Chip label="Free Anniversary Course" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 800, border: '1px solid #bbf7d0' }} />}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '16px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 4, borderRadius: '16px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)' }}>{success}</Alert>}

        {course.isEnrolled && (
          <Alert 
            severity="success" 
            icon={<IconUserCheck size={24} />}
            sx={{ 
              mb: 4, 
              borderRadius: '24px', 
              bgcolor: '#f0fdf4', 
              color: '#166534',
              border: '1px solid #bbf7d0',
              boxShadow: '0 4px 20px rgba(22, 163, 74, 0.08)',
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: '1rem' }}>You're already part of this batch!</Typography>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9 }}>Access your curriculum, assignments, and live classes now.</Typography>
              </Box>
              <Button 
                variant="contained" 
                size="large" 
                onClick={() => navigate(`/courses/${courseId}/dashboard`)}
                sx={{ 
                  bgcolor: '#16a34a', 
                  color: '#fff', 
                  borderRadius: '12px', 
                  fontWeight: 800, 
                  px: 3,
                  textTransform: 'none', 
                  '&:hover': { bgcolor: '#15803d', transform: 'translateY(-2px)' },
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                  whiteSpace: 'nowrap'
                }}
              >
                Go to Dashboard
              </Button>
            </Stack>
          </Alert>
        )}

        <Grid container spacing={6}>
          {/* Main Content Area */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={6}>
              {/* Enrollment Stats Bar */}
              <Box sx={{ 
                mb: 4, 
                p: 2, 
                bgcolor: '#f8fafc', 
                borderRadius: '20px', 
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ p: 1, bgcolor: '#dcfce7', color: '#16a34a', borderRadius: '10px', display: 'flex' }}>
                    <IconUserCheck size={20} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>
                      {course.totalEnrollments || 0} Students
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>
                      Enrolled
                    </Typography>
                  </Box>
                </Stack>

                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ p: 1, bgcolor: '#fee2e2', color: '#ef4444', borderRadius: '10px', display: 'flex' }}>
                    <IconUserMinus size={20} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>
                      {Math.max(0, 2000 - (course.totalEnrollments || 0))} Spots
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>
                      Seats Left
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Hero Section */}
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="overline" sx={{ color: course.color, fontWeight: 900, letterSpacing: '2px' }}>
                    {course.category}
                  </Typography>
                  <IconPoint size={12} color="#94a3b8" />
                  <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800, letterSpacing: '1px' }}>
                    {course.level}
                  </Typography>
                </Stack>
                
                <Typography sx={{ fontWeight: 900, fontSize: { xs: '2.5rem', md: '3.75rem' }, color: '#0f172a', lineHeight: 1, mb: 3, letterSpacing: '-2px' }}>
                  {course.title}
                </Typography>
                
                <Typography sx={{ color: '#475569', fontWeight: 500, lineHeight: 1.8, fontSize: '1.2rem', mb: 5, maxWidth: '95%' }}>
                  {course.longDescription || course.description}
                </Typography>

                <Grid container spacing={3}>
                  {[
                    { icon: <IconClock size={24} />, label: `${course.duration?.weeks || 8} Weeks`, sub: 'Intensive Program' },
                    { icon: <IconCalendarEvent size={24} />, label: `${course.duration?.daysPerWeek || 5} Days / Week`, sub: 'Mon - Fri Classes' },
                    { icon: <IconLiveView size={24} />, label: 'Live Sessions', sub: 'Interactive Classes' },
                    { icon: <IconUsers size={24} />, label: `${course.totalEnrollments || 0} Students`, sub: 'Global Community' }
                  ].map((item, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: '14px', 
                          bgcolor: `${course.color}10`, 
                          color: course.color, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          {item.icon}
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{item.label}</Typography>
                          <Typography sx={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>{item.sub}</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Divider sx={{ my: 6 }} />
              
              {/* Technologies Section */}
              <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <IconCode size={28} color={course.color} />
                  Skills & Technologies Covered
                </Typography>
                <Grid container spacing={2}>
                  {[...(course.technologies || []), ...EXTRA_SKILLS].map((tech, i) => {
                    const Icon = techIconMap[tech] || IconCode;
                    return (
                      <Grid item key={i}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          px: 3,
                          py: 2,
                          bgcolor: '#fff',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.2s',
                          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', borderColor: course.color }
                        }}>
                          <Icon size={22} color={course.color} stroke={2} />
                          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{tech}</Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>

              {/* Roadmap Section */}
              {course.roadmap?.length > 0 && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a' }}>
                      Learning Roadmap
                    </Typography>
                    <Chip
                      icon={<IconRocket size={16} />}
                      label={`${course.duration?.weeks || 8} Weeks curriculum`}
                      sx={{ fontWeight: 800, bgcolor: '#f1f5f9', color: '#475569' }}
                    />
                  </Stack>

                  {course.roadmap.map((week) => (
                    <Accordion
                      key={week.week}
                      expanded={expandedWeek === week.week}
                      onChange={(_, isExpanded) => setExpandedWeek(isExpanded ? week.week : false)}
                      sx={{
                        mb: 2,
                        borderRadius: '20px !important',
                        border: '1px solid #e2e8f0',
                        boxShadow: expandedWeek === week.week ? '0 15px 30px rgba(0,0,0,0.04)' : 'none',
                        transition: 'all 0.3s',
                        '&::before': { display: 'none' },
                        overflow: 'hidden',
                        '&:hover': { borderColor: course.color }
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<IconChevronDown size={20} />}
                        sx={{
                          px: 3,
                          py: 1.5,
                          bgcolor: expandedWeek === week.week ? `${course.color}05` : 'transparent'
                        }}
                      >
                        <Stack direction="row" spacing={3} alignItems="center" sx={{ width: '100%' }}>
                          <Typography sx={{ fontWeight: 900, color: course.color, fontSize: '1.25rem', minWidth: 45 }}>
                            W{String(week.week).padStart(2, '0')}
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{week.title}</Typography>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            {week.assignment && (
                              <Chip 
                                label="Assignment" 
                                size="small" 
                                icon={<IconTerminal2 size={12} />}
                                sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: '0.65rem', border: '1px solid #bbf7d0' }} 
                              />
                            )}
                          </Stack>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 4, pb: 4, pt: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', mb: 2 }}>
                          Curriculum Breakdown
                        </Typography>
                        <Grid container spacing={2}>
                          {week.topics?.map((topic, i) => (
                            <Grid item xs={12} key={i}>
                              <Stack direction="row" spacing={2} alignItems="flex-start">
                                <Box sx={{ p: 0.5, borderRadius: '6px', bgcolor: '#f0fdf4', display: 'flex' }}>
                                  <IconCircleCheck size={16} color="#16a34a" />
                                </Box>
                                <Typography sx={{ fontSize: '0.95rem', color: '#334155', fontWeight: 500, lineHeight: 1.5 }}>{topic}</Typography>
                              </Stack>
                            </Grid>
                          ))}
                        </Grid>

                        {week.project && (
                          <Box sx={{ mt: 3, p: 2.5, bgcolor: '#fffbeb', borderRadius: '16px', border: '1px solid #fde68a' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Box sx={{ p: 1, borderRadius: '12px', bgcolor: '#fef3c7', color: '#92400e' }}>
                                <IconBook size={20} />
                              </Box>
                              <Box>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Weekend Project</Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#451a03' }}>{week.project}</Typography>
                              </Box>
                            </Stack>
                          </Box>
                        )}

                        {week.assignment && (
                          <Box sx={{ mt: 2, p: 2.5, bgcolor: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Box sx={{ p: 1, borderRadius: '12px', bgcolor: '#dcfce7', color: '#166534' }}>
                                <IconTerminal2 size={20} />
                              </Box>
                              <Box>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Weekly Assignment</Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#064e3b' }}>{week.assignment}</Typography>
                              </Box>
                            </Stack>
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}

              {/* Outcomes Section */}
              {course.learningOutcomes?.length > 0 && (
                <Box sx={{ p: { xs: 4, md: 6 }, bgcolor: '#0f172a', borderRadius: '32px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                  <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.5rem', md: '2rem' }, mb: 4, letterSpacing: '-1px' }}>
                    What you will achieve
                  </Typography>
                  <Grid container spacing={4}>
                    {course.learningOutcomes.map((item, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Box sx={{ p: 0.5, bgcolor: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%', display: 'flex' }}>
                            <IconCircleCheck size={20} color="#10b981" />
                          </Box>
                          <Typography sx={{ fontSize: '1rem', color: '#cbd5e1', fontWeight: 500, lineHeight: 1.5 }}>{item}</Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Horizontal Enrollment Section */}
              <Box
                id="enroll-now"
                component={motion.div}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                sx={{
                  p: { xs: 4, md: 6 },
                  bgcolor: '#fff',
                  borderRadius: '32px',
                  border: '2px solid',
                  borderColor: course.isFree ? '#10b981' : '#e2e8f0',
                  boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {course.isFree && (
                  <Box sx={{ position: 'absolute', top: 0, right: 0, px: 3, py: 1, bgcolor: '#10b981', color: '#fff', borderBottomLeftRadius: '16px', fontWeight: 900, fontSize: '0.8rem', letterSpacing: '1px' }}>
                    ANNIVERSARY GIFT
                  </Box>
                )}

                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={7}>
                    <Typography sx={{ fontWeight: 900, fontSize: '2.25rem', color: '#0f172a', mb: 1, letterSpacing: '-1px' }}>
                      Ready to start your journey?
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontWeight: 500, fontSize: '1.1rem', mb: 4 }}>
                      Join {course.totalEnrollments || 0} students already learning {course.title}.
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {[
                        { icon: <IconCalendarEvent size={20} />, label: 'Starts', val: 'June 1st, 2026' },
                        { icon: <IconClock size={20} />, label: 'Timing', val: activeBatches[0]?.timing || '7 PM - 8 PM IST' },
                        { icon: <IconUsers size={20} />, label: 'Batch Size', val: `${activeBatches[0]?.maxSeats || 2000} Students` },
                        { icon: <IconUserCheck size={20} />, label: 'Enrolled', val: `${activeBatches[0]?.enrolledCount || 0} Students` },
                        { icon: <IconUserMinus size={20} />, label: 'Seats Left', val: `${(activeBatches[0]?.maxSeats || 2000) - (activeBatches[0]?.enrolledCount || 0)} Spots` },
                        { icon: <IconCertificate size={20} />, label: 'Certificate', val: 'LMS Verified' }
                      ].map((item, idx) => (
                        <Grid item xs={12} sm={4} key={idx}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ color: course.color, display: 'flex' }}>{item.icon}</Box>
                            <Box>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>{item.val}</Typography>
                              <Typography sx={{ fontWeight: 600, fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>{item.label}</Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      ))}
                    </Grid>

                  </Grid>

                  <Grid item xs={12} md={5}>
                    <Box sx={{ p: 4, bgcolor: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                      <Stack spacing={3}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', mb: 0.5 }}>Investment</Typography>
                            <Typography sx={{ fontWeight: 900, fontSize: '2.5rem', color: course.isFree ? '#16a34a' : '#0f172a', lineHeight: 1 }}>
                              {course.isFree ? 'FREE' : `₹${course.price?.toLocaleString()}`}
                            </Typography>
                          </Box>
                          {course.originalPrice > 0 && (
                            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#94a3b8', textDecoration: 'line-through', pb: 0.5 }}>
                              ₹{course.originalPrice?.toLocaleString()}
                            </Typography>
                          )}
                        </Box>

                        <Divider />

                        {course.isEnrolled ? (
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => navigate(`/courses/${courseId}/dashboard`)}
                            sx={{ bgcolor: '#0f172a', py: 2, borderRadius: '16px', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#1e293b' } }}
                          >
                            Go to My Course Dashboard
                          </Button>
                        ) : (
                          <>
                            <FormControlLabel
                              control={<Checkbox checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} sx={{ color: '#cbd5e1', '&.Mui-checked': { color: course.color } }} />}
                              label={
                                <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                                  I agree to the{' '}
                                  <Box component="span" onClick={(e) => { e.preventDefault(); setShowTermsDialog(true); }} sx={{ color: course.color, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                                    professional terms
                                  </Box>
                                </Typography>
                              }
                            />
                            <Button
                              fullWidth
                              variant="contained"
                              size="large"
                              disabled={enrolling || !agreedToTerms}
                              onClick={handleEnroll}
                              sx={{
                                bgcolor: course.color,
                                py: 2.25,
                                borderRadius: '16px',
                                fontWeight: 900,
                                fontSize: '1.1rem',
                                textTransform: 'none',
                                boxShadow: `0 12px 24px ${course.color}40`,
                                '&:hover': { bgcolor: course.color, boxShadow: `0 15px 30px ${course.color}60`, transform: 'translateY(-2px)' },
                                '&:disabled': { opacity: 0.5, bgcolor: '#94a3b8' },
                                transition: 'all 0.2s'
                              }}
                            >
                              {enrolling ? 'Processing...' : user?.token ? (course.isFree ? 'Enroll for Free' : 'Secure my Spot') : 'Login to Enroll'}
                            </Button>
                            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', fontWeight: 500 }}>
                              Optional ₹99 certificate fee applies at the end.
                            </Typography>
                          </>
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Terms Dialog */}
      <Dialog open={showTermsDialog} onClose={() => setShowTermsDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '32px', p: 1 } }}>
        <DialogTitle>
          <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: '#0f172a' }}>Professional Terms</Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Please read carefully before enrolling</Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography sx={{ whiteSpace: 'pre-line', fontSize: '0.95rem', color: '#334155', lineHeight: 1.8, fontWeight: 500 }}>
            {course.termsAndConditions}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button fullWidth onClick={() => { setAgreedToTerms(true); setShowTermsDialog(false); }} variant="contained" sx={{ bgcolor: '#0f172a', py: 2, borderRadius: '16px', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#1e293b' } }}>
            I understand and agree
          </Button>
        </DialogActions>
      </Dialog>
      {/* Enrollment Form Dialog */}
      <Dialog 
        open={showEnrollDialog} 
        onClose={() => setShowEnrollDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', pb: 0 }}>Enrollment Details</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#64748b', mb: 3, fontSize: '0.9rem' }}>
            Please provide your details to complete the enrollment process. 
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Surname" name="surname" value={formData.surname} onChange={handleFormChange} variant="outlined" size="small" placeholder="SURNAME" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleFormChange} variant="outlined" size="small" placeholder="FIRST NAME" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Last Name (Optional)" name="lastName" value={formData.lastName} onChange={handleFormChange} variant="outlined" size="small" placeholder="LAST NAME" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleFormChange} variant="outlined" size="small" placeholder="10 Digit Number" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleFormChange} variant="outlined" size="small" placeholder="College ID / Roll No" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="College Name" name="collegeName" value={formData.collegeName} onChange={handleFormChange} variant="outlined" size="small" placeholder="University / College Full Name" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setShowEnrollDialog(false)} sx={{ color: '#64748b', fontWeight: 700 }}>Cancel</Button>
          <Button 
            onClick={confirmEnrollment} 
            variant="contained" 
            disabled={enrolling}
            sx={{ bgcolor: course.color, borderRadius: '12px', px: 4, fontWeight: 800, '&:hover': { bgcolor: course.color, filter: 'brightness(0.9)' } }}
          >
            {enrolling ? <CircularProgress size={24} color="inherit" /> : 'Confirm & Enroll'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
