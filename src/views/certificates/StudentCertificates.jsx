import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
  Divider,
  Container,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  WorkspacePremium, 
  Close, 
  CalendarToday,
  Timer,
  Download,
  Share,
  VerifiedUser,
  CardMembership
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import apiService from 'services/apiService';

const StudentCertificates = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('studentToken');
      const data = await apiService.getMyCertificates(token);
      setCertificates(data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (cert) => {
    navigate(`/certificates/${cert.certificateId}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: '16px', 
            background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <WorkspacePremium sx={{ fontSize: 40, color: theme.palette.primary.main }} />
        </Box>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 0.5 }}>
            My Certificates
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            All your achievements, verifiable credentials, and awards in one place.
          </Typography>
        </Box>
      </Box>

      {/* Main Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : certificates.length === 0 ? (
        <Card 
          sx={{ 
            borderRadius: '24px', 
            py: 8, 
            textAlign: 'center', 
            background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
            border: `1px dashed ${theme.palette.divider}`,
            boxShadow: 'none'
          }}
        >
          <CardMembership sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            No Certificates Yet
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 500, mx: 'auto' }}>
            Complete courses, workshops, and assessments to earn verified certificates. They will appear here once issued by your instructor!
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {certificates.map((cert) => (
            <Grid item xs={12} sm={6} md={4} key={cert._id}>
              <Card 
                sx={{ 
                  borderRadius: '20px',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.background.paper,
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0 20px 40px rgba(0,0,0,0.4)'
                      : '0 20px 40px rgba(100,100,111,0.1)',
                    borderColor: theme.palette.primary.main
                  }
                }}
              >
                {/* Visual Top Banner */}
                <Box 
                  sx={{ 
                    height: 120, 
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {cert.tenantId?.logoUrl ? (
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.9)', p: 1, borderRadius: 2, display: 'flex' }}>
                      <img src={cert.tenantId.logoUrl} alt={cert.tenantId?.name || "Tenant"} style={{ maxHeight: 60, maxWidth: 180, objectFit: 'contain' }} />
                    </Box>
                  ) : (
                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, letterSpacing: 1 }}>
                      {cert.tenantId?.name || 'ORCADEHUB'}
                    </Typography>
                  )}
                  <Box sx={{ position: 'absolute', bottom: -20, right: 20 }}>
                    <Box 
                      sx={{ 
                        width: 50, height: 50, 
                        borderRadius: '50%', 
                        bgcolor: theme.palette.background.paper, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                      }}
                    >
                      <WorkspacePremium color="primary" />
                    </Box>
                  </Box>
                </Box>

                <CardContent sx={{ p: 3, pt: 4 }}>
                  <Chip 
                    label={cert.type || 'Course'} 
                    size="small" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 700, 
                      bgcolor: `${theme.palette.primary.main}20`, 
                      color: theme.palette.primary.main 
                    }} 
                  />
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, lineHeight: 1.3 }}>
                    {cert.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <VerifiedUser sx={{ fontSize: 16 }} /> Issued by {cert.issuedBy?.name || 'Instructor'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDate(cert.issueDate)}
                      </Typography>
                    </Box>
                    {cert.duration && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Timer sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {cert.duration}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontFamily: 'monospace' }}>
                      ID: {cert.certificateId}
                    </Typography>
                    <Button 
                      variant="text" 
                      color="primary" 
                      onClick={() => handlePreview(cert)}
                      sx={{ fontWeight: 700, borderRadius: '8px' }}
                    >
                      View Preview
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

    </Container>
  );
};

export default StudentCertificates;
