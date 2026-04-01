import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Chip,
  CircularProgress,
  Divider,
  Container,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  WorkspacePremium,
  Download,
  Share,
  CheckCircle,
  ErrorOutline
} from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CertificateView = () => {
  const theme = useTheme();
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorNotFound, setErrorNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const certificateRef = useRef(null);

  useEffect(() => {
    fetchCertificateDetails();
  }, [id]);

  const fetchCertificateDetails = async () => {
    try {
      setLoading(true);
      setErrorNotFound(false);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/certificates/view/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setCertificate(data);
      } else if (response.status === 404) {
        setErrorNotFound(true);
      } else {
        throw new Error('Failed to fetch certificate');
      }
    } catch (error) {
      console.error('Error fetching certificate view:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    try {
      setDownloading(true);
      
      const element = certificateRef.current;
      
      // Force a fixed desktop width so the PDF looks identical on all screen sizes
      const originalStyles = {
        width: element.style.width,
        minWidth: element.style.minWidth,
        maxWidth: element.style.maxWidth,
        padding: element.style.padding,
      };
      element.style.width = '1100px';
      element.style.minWidth = '1100px';
      element.style.maxWidth = '1100px';
      element.style.padding = '64px';
      
      // Capture the certificate element as a high-res canvas
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true, // Allow cross-origin images (tenant logo)
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200, // Force desktop viewport for rendering
      });
      
      // Restore original styles immediately
      element.style.width = originalStyles.width;
      element.style.minWidth = originalStyles.minWidth;
      element.style.maxWidth = originalStyles.maxWidth;
      element.style.padding = originalStyles.padding;
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Create PDF sized to the certificate
      const pdfWidth = imgWidth * 0.264583; // px to mm at 96dpi
      const pdfHeight = imgHeight * 0.264583;
      
      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth / 2, pdfHeight / 2] // scale 2x capture back down
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth / 2, pdfHeight / 2);
      
      const filename = `Certificate_${certificate?.certificateId || 'download'}.pdf`;
      pdf.save(filename);
      
      setSnackbar({ open: true, message: 'Certificate downloaded successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setSnackbar({ open: true, message: 'Failed to download certificate', severity: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `Certificate - ${certificate?.title || 'Verified Credential'}`,
      text: `Check out this verified certificate: ${certificate?.title} issued to ${certificate?.student?.name || 'Student'}`,
      url: shareUrl
    };

    // Try native Web Share API first (mobile + supported browsers)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User cancelled or API failed, fall through to clipboard
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setSnackbar({ open: true, message: 'Certificate link copied to clipboard!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Could not copy link. Please copy the URL manually.', severity: 'warning' });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (errorNotFound || !certificate) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <ErrorOutline sx={{ fontSize: 80, color: theme.palette.error.main, mb: 2 }} />
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
          Certificate Not Found
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          The certificate ID provided ({id}) does not exist in our verifiable records. Please check the URL and try again.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Verification Badge */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <CheckCircle sx={{ color: 'success.main', fontSize: 28 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.dark' }}>
          Verified Authentic Credential
        </Typography>
      </Box>

      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 4 }}>
        <Button 
          variant="outlined" 
          startIcon={<Share />} 
          onClick={handleShare}
          sx={{ borderRadius: 8, fontWeight: 600 }}
        >
          Share Link
        </Button>
        <Button 
          variant="contained" 
          startIcon={downloading ? <CircularProgress size={18} color="inherit" /> : <Download />} 
          onClick={handleDownloadPDF}
          disabled={downloading}
          sx={{ borderRadius: 8, fontWeight: 600 }} 
          disableElevation
        >
          {downloading ? 'Generating...' : 'Download PDF'}
        </Button>
      </Box>

      {/* Primary Certificate Container */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Paper 
          ref={certificateRef}
          sx={{ 
            width: '100%',
            minHeight: { xs: 600, md: 700 },
            maxWidth: 1100,
            p: { xs: 4, md: 8 },
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '4px',
            bgcolor: '#ffffff',
            border: '20px solid #6a0dad',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 30px 60px rgba(0,0,0,0.8)' 
              : '0 30px 60px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          {/* Background watermark/decorations */}
          <Box sx={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: '#6a0dad08', zIndex: 0 }} />
          <Box sx={{ position: 'absolute', bottom: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: '#6a0dad05', zIndex: 0 }} />
          
          <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
            {/* Top Row: Tenant Logo */}
            <Box sx={{ mb: 4, height: 80, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {certificate.tenantId?.logoUrl ? (
                <img 
                  src={certificate.tenantId.logoUrl} 
                  alt={certificate.tenantId.name || 'Tenant Logo'} 
                  style={{ maxHeight: '100%', maxWidth: '250px', objectFit: 'contain' }} 
                  crossOrigin="anonymous"
                />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#6a0dad', letterSpacing: 2 }}>
                  {certificate.tenantId?.name || 'ORCADEHUB'}
                </Typography>
              )}
            </Box>

            <Typography variant="overline" sx={{ color: '#555', letterSpacing: 6, fontSize: '1.2rem', fontWeight: 600 }}>
              Certificate of {certificate.type === 'Course' ? 'Completion' : certificate.type || 'Achievement'}
            </Typography>
            
            <Typography sx={{ mt: 3, mb: 4, fontFamily: 'serif', fontSize: '1.6rem', fontStyle: 'italic', color: '#555' }}>
              This is proudly presented to
            </Typography>
            
            <Typography variant="h2" sx={{ fontFamily: 'serif', fontWeight: 700, color: '#6a0dad', borderBottom: '2px solid #ddd', pb: 2, display: 'inline-block', minWidth: '70%' }}>
              {certificate.student?.name || 'Student Name'}
            </Typography>
            
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#222', mb: 3, mt: 3 }}>
              {certificate.title}
            </Typography>
            
            {certificate.description ? (
               <Typography variant="body1" sx={{ color: '#666', mb: 5, maxWidth: '85%', mx: 'auto', fontSize: '1.2rem', lineHeight: 1.6 }}>
                 {certificate.description}
               </Typography>
            ) : (
               <Typography variant="body1" sx={{ color: '#666', mb: 5, maxWidth: '85%', mx: 'auto', fontSize: '1.2rem', lineHeight: 1.6 }}>
                 For successful completion and demonstrating excellence in the requirements of this program.
               </Typography>
            )}

            {certificate.skills?.length > 0 && (
              <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5 }}>
                {certificate.skills.map(s => (
                  <Chip key={s} label={s} size="medium" variant="outlined" sx={{ fontWeight: 600, color: '#444', borderColor: '#bbb' }} />
                ))}
              </Box>
            )}

            {/* Duration & Start Date Row */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, mb: 4 }}>
              {certificate.startDate && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#888', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    Start Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#333', fontSize: '1rem' }}>
                    {formatDate(certificate.startDate)}
                  </Typography>
                </Box>
              )}
              {certificate.duration && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#888', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    Duration
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#333', fontSize: '1rem' }}>
                    {certificate.duration}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', mt: 'auto', pt: 4 }}>
              {/* Left: Date Block */}
              <Box sx={{ textAlign: 'center', width: 250 }}>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#333', fontSize: '1.2rem' }}>
                  {formatDate(certificate.issueDate)}
                </Typography>
                <Divider sx={{ my: 1.5, borderColor: '#aaa' }} />
                <Typography variant="caption" sx={{ color: '#777', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                  Date of Issue
                </Typography>
              </Box>

              {/* Center: Seal Block */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(15px)' }}>
                <WorkspacePremium sx={{ fontSize: 90, color: '#6a0dad', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#888', mt: 2, fontWeight: 600, fontSize: '0.9rem' }}>
                  ID: {certificate.certificateId}
                </Typography>
              </Box>

              {/* Right: Signature Block */}
              <Box sx={{ textAlign: 'center', width: 250 }}>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#6a0dad', fontSize: '1.2rem' }}>
                  {certificate.signatureName || certificate.issuedBy?.name || 'Authorized'}
                </Typography>
                <Divider sx={{ my: 1.5, borderColor: '#aaa' }} />
                <Typography variant="subtitle2" sx={{ color: '#555', fontWeight: 700 }}>
                  {certificate.signatureDesignation || 'Authorized Signatory'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity} 
          sx={{ borderRadius: '12px', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CertificateView;
