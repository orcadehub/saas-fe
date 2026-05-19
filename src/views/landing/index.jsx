import React, { useState, useEffect, useMemo } from 'react';
import { Box, Container, Stack, Typography, Button, IconButton, useTheme, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CodeRounded,
  SpeedRounded,
  SecurityRounded,
  AutoAwesomeRounded,
  ArrowForwardRounded,
  PlayArrowRounded,
  Assessment,
  Psychology,
  SmartToy,
  SportsEsports,
  Analytics,
  EmojiEvents,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import tenantConfig from 'config/tenantConfig';
import StarryBackground from 'components/StarryBackground';
import CelestialCursor from 'components/CelestialCursor';
import DarkNavbar from 'components/DarkNavbar';
import AnimatedGridBackground from 'components/AnimatedGridBackground';
import PolicyDialog from 'components/PolicyDialogs';

// ── Starry Background (Moved to components/StarryBackground.jsx) ──

// ── Interactive Cursor (Moved to components/CelestialCursor.jsx) ──

import { LetterByLetterText } from 'components/ThemeElements';

// ── Glass Card ──
const GlassCard = ({ children, sx, ...props }) => (
  <Box
    sx={{
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '24px',
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        transform: 'translateY(-6px)',
        boxShadow: '0 25px 50px rgba(139, 92, 246, 0.08), 0 0 0 1px rgba(139, 92, 246, 0.1)'
      },
      ...sx
    }}
    {...props}
  >
    {children}
  </Box>
);

// ── Floating Particles ──
const FloatingParticles = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.4 + 0.1
      })),
    []
  );

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.id % 3 === 0 ? 'rgba(139, 92, 246, 0.6)' : p.id % 3 === 1 ? 'rgba(6, 182, 212, 0.5)' : 'rgba(236, 72, 153, 0.4)'
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </Box>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const [policyType, setPolicyType] = useState(null);

  // Tenant Explorer Sandbox States (for Localhost)
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [activeSimulatedDomain, setActiveSimulatedDomain] = useState(localStorage.getItem('simulated_tenant_domain') || 'orcode.in');
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [tenantError, setTenantError] = useState('');

  useEffect(() => {
    if (isLocalhost) {
      setLoadingTenants(true);
      const API_BASE_URL = 'http://localhost:4000/api';
      fetch(`${API_BASE_URL}/tenants/public-list`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch tenants');
          return res.json();
        })
        .then((data) => {
          setTenants(data);
          // Set initial selected tenant
          if (data && data.length > 0) {
            const current = data.find(t => t.domain === activeSimulatedDomain) || data[0];
            setSelectedTenant(current);
          }
          setLoadingTenants(false);
        })
        .catch((err) => {
          console.error(err);
          setTenantError(err.message);
          setLoadingTenants(false);
        });
    }
  }, [isLocalhost, activeSimulatedDomain]);

  const handleSwitchTenant = (domain) => {
    localStorage.setItem('simulated_tenant_domain', domain);
    setActiveSimulatedDomain(domain);
    window.location.reload();
  };

  return (
    <Box
      sx={{
        color: '#1e293b',
        fontFamily: "'Inter', 'Outfit', sans-serif",
        position: 'relative'
      }}
    >
      <FloatingParticles />

      {/* ══════════ Hero Section ══════════ */}
      <Container maxWidth="xl" sx={{ pt: { xs: 14, md: 22 }, pb: { xs: 8, md: 14 }, position: 'relative', zIndex: 10 }}>
        <Stack alignItems="center" textAlign="center" spacing={5}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 0.8,
                borderRadius: '100px',
                border: '1px solid rgba(124, 58, 237, 0.1)',
                background: 'rgba(124, 58, 237, 0.05)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#7c3aed',
                  boxShadow: '0 0 8px rgba(124, 58, 237, 0.3)',
                  animation: 'pulse 2s infinite'
                }}
              />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#6d28d9', letterSpacing: '0.5px' }}>
                AI-POWERED LEARNING PLATFORM
              </Typography>
            </Box>
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
            `
              }}
            />
          </motion.div>

          {/* Hero Heading – Letter by Letter */}
          <Box>
            <LetterByLetterText
              text="Code at the speed"
              delay={0.3}
              sx={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: { xs: 0, md: -1 }
              }}
            />
            <LetterByLetterText
              text="of thought."
              delay={0.8}
              sx={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            />
          </Box>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Typography
              variant="h5"
              sx={{
                color: '#64748b',
                maxWidth: '650px',
                mx: 'auto',
                lineHeight: 1.7,
                fontWeight: 500,
                fontSize: { xs: '1.05rem', md: '1.25rem' }
              }}
            >
              Master coding with 500+ practice problems, AI-powered mock interviews, interactive labs, and real-time assessments.
            </Typography>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                endIcon={<ArrowForwardRounded />}
                className="interactive"
                sx={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  color: '#fff',
                  px: 5,
                  py: 2,
                  borderRadius: '100px',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0 10px 30px rgba(124, 58, 237, 0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6d28d9, #4338ca)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 15px 40px rgba(124, 58, 237, 0.35)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                startIcon={<PlayArrowRounded />}
                onClick={() => navigate('/services')}
                className="interactive"
                sx={{
                  borderColor: 'rgba(0,0,0,0.12)',
                  color: '#475569',
                  px: 5,
                  py: 2,
                  borderRadius: '100px',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  backdropFilter: 'blur(10px)',
                  background: 'rgba(255,255,255,0.8)',
                  '&:hover': {
                    borderColor: 'rgba(124, 58, 237, 0.4)',
                    background: 'rgba(124, 58, 237, 0.05)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                View Services
              </Button>
            </Stack>
          </motion.div>
        </Stack>

        {/* ── Mock IDE ── */}
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 2.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginTop: '80px' }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '1100px',
              mx: 'auto',
              height: { xs: '280px', md: '460px' },
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.06)',
              background: '#ffffff',
              boxShadow: '0 40px 80px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Window top bar */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                background: '#f8fafc'
              }}
            >
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
              <Typography sx={{ ml: 2, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, fontFamily: 'monospace' }}>
                main.js — orcadehub
              </Typography>
            </Box>
            {/* Code body */}
            <Box sx={{ p: 4, flex: 1, display: 'flex', gap: 4, overflow: 'hidden' }}>
              <Stack spacing={2} sx={{ width: '40px', color: '#cbd5e1', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </Stack>
              <Box
                sx={{
                  flex: 1,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  color: '#334155',
                  fontSize: { xs: '0.8rem', md: '0.95rem' },
                  lineHeight: 2.2
                }}
              >
                <span style={{ color: '#7c3aed' }}>import</span> {'{'} OrcadeHub {'}'} <span style={{ color: '#7c3aed' }}>from</span>{' '}
                <span style={{ color: '#059669' }}>'@orcadehub/platform'</span>;<br />
                <br />
                <span style={{ color: '#2563eb' }}>const</span> journey = <span style={{ color: '#7c3aed' }}>new</span>{' '}
                <span style={{ color: '#2563eb' }}>OrcadeHub</span>();
                <br />
                journey.<span style={{ color: '#d946ef' }}>startLearning</span>();
                <br />
                <br />
                <span style={{ color: '#94a3b8' }}>// Start your coding journey today...</span>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Container>

      {/* ══════════ LOCALHOST DEVELOPER SANDBOX: Tenant Explorer ══════════ */}
      {isLocalhost && (
        <Container maxWidth="xl" sx={{ py: 6, position: 'relative', zIndex: 10 }}>
          <Box
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: '32px',
              border: '1px solid rgba(124, 58, 237, 0.15)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(243, 244, 246, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 40px 100px rgba(124, 58, 237, 0.08)'
            }}
          >
            <Stack spacing={4}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
                <Box>
                  <Typography variant="h2" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-1.5px', mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <span style={{ fontSize: '2rem' }}>🛠️</span> Tenant Sandbox Explorer
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#64748b', fontWeight: 500 }}>
                    Select and inspect any white-label tenant database entry dynamically on your localhost.
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 3,
                    py: 1.25,
                    borderRadius: '100px',
                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', animation: 'pulse 1.5s infinite' }} />
                  <Typography sx={{ color: '#065f46', fontSize: '0.875rem', fontWeight: 800 }}>
                    Active Simulated Tenant: <span style={{ textDecoration: 'underline' }}>{activeSimulatedDomain}</span>
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />

              {tenantError && (
                <Typography variant="h6" color="error" sx={{ fontWeight: 600 }}>
                  ⚠️ {tenantError}. Ensure your backend server is active at http://localhost:4000
                </Typography>
              )}

              {loadingTenants ? (
                <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Loading local tenants database...</Typography>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '350px 1fr' }, gap: 5 }}>
                  
                  {/* Left Column: Tenants list */}
                  <Stack spacing={2} sx={{ maxHeight: '450px', overflowY: 'auto', pr: 1 }}>
                    <Typography variant="subtitle1" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Registered Tenants ({tenants.length})
                    </Typography>
                    {tenants.map((t) => {
                      const isSelected = selectedTenant?._id === t._id;
                      const isCurrentlySimulated = t.domain === activeSimulatedDomain;
                      return (
                        <Box
                          key={t._id}
                          onClick={() => setSelectedTenant(t)}
                          sx={{
                            p: 2.5,
                            borderRadius: '20px',
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(124, 58, 237, 0.08)' : '#ffffff',
                            border: isSelected 
                              ? '1px solid #7c3aed' 
                              : isCurrentlySimulated 
                                ? '1px dashed rgba(16, 185, 129, 0.5)'
                                : '1px solid rgba(0,0,0,0.06)',
                            boxShadow: isSelected ? '0 8px 24px rgba(124, 58, 237, 0.08)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.3s',
                            '&:hover': {
                              transform: 'translateX(4px)',
                              borderColor: isSelected ? '#7c3aed' : 'rgba(124, 58, 237, 0.3)'
                            }
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                bgcolor: t.themeColor || '#7c3aed',
                                boxShadow: `0 0 10px ${t.themeColor || '#7c3aed'}40`
                              }} 
                            />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {t.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                                {t.domain}
                              </Typography>
                            </Box>
                          </Stack>

                          {isCurrentlySimulated && (
                            <Box sx={{ px: 1.5, py: 0.5, borderRadius: '100px', bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', ml: 1 }}>
                              <Typography sx={{ color: '#047857', fontSize: '0.75rem', fontWeight: 800 }}>Simulated</Typography>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>

                  {/* Right Column: Selected Tenant details inspector */}
                  {selectedTenant ? (
                    <Box 
                      sx={{ 
                        p: 4, 
                        borderRadius: '24px', 
                        bgcolor: '#ffffff', 
                        border: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
                      }}
                    >
                      <Stack spacing={3.5}>
                        {/* Header Details */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                          <Box>
                            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a', mb: 0.5 }}>
                              {selectedTenant.name}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
                              Owned by: <strong>{selectedTenant.companyName || selectedTenant.name}</strong>
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={2}>
                            <Button
                              variant="contained"
                              onClick={() => handleSwitchTenant(selectedTenant.domain)}
                              sx={{
                                borderRadius: '100px',
                                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                                color: '#fff',
                                fontWeight: 800,
                                px: 4,
                                py: 1.25,
                                textTransform: 'none',
                                boxShadow: '0 8px 20px rgba(124, 58, 237, 0.2)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #6d28d9, #4338ca)',
                                  boxShadow: '0 12px 25px rgba(124, 58, 237, 0.3)'
                                }
                              }}
                            >
                              🚀 Switch Active Tenant
                            </Button>
                          </Stack>
                        </Box>

                        <Divider sx={{ borderColor: 'rgba(0,0,0,0.04)' }} />

                        {/* Config Properties Grid */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3.5 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Primary Domain
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b', mt: 0.5 }}>
                              {selectedTenant.domain}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Allowed Email Domains
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b', mt: 0.5 }}>
                              {selectedTenant.allowedDomains && selectedTenant.allowedDomains.length > 0 
                                ? selectedTenant.allowedDomains.join(', ') 
                                : 'Any domains allowed'}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Platform Theme Accent
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 0.5 }}>
                              <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: selectedTenant.themeColor || '#7c3aed', border: '1px solid rgba(0,0,0,0.1)' }} />
                              <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>
                                {selectedTenant.themeColor || '#7c3aed'}
                              </Typography>
                            </Stack>
                          </Box>

                          <Box>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Tenant Administrator Email
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b', mt: 0.5 }}>
                              {selectedTenant.adminEmail || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box>
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', mb: 1 }}>
                            Tenant Custom Settings & Enabled Features
                          </Typography>
                          <Box 
                            sx={{ 
                              p: 2.5, 
                              borderRadius: '16px', 
                              bgcolor: '#f8fafc', 
                              border: '1px solid rgba(0,0,0,0.03)',
                              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                              fontSize: '0.825rem',
                              color: '#475569',
                              whiteSpace: 'pre-wrap',
                              maxHeight: '220px',
                              overflowY: 'auto'
                            }}
                          >
                            {JSON.stringify(selectedTenant.settings || {}, null, 2)}
                          </Box>
                        </Box>

                        {/* Secret Keys Panel */}
                        <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                          <Typography variant="subtitle2" sx={{ color: '#ef4444', fontWeight: 800, mb: 1 }}>
                            ⚠️ Sandbox Security & Keys:
                          </Typography>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>
                                REST API Key
                              </Typography>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#1e293b', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {selectedTenant.apiKey || 'No custom API key assigned'}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedTenant.apiKey || '');
                                alert('API Key copied to clipboard successfully!');
                              }}
                              sx={{ color: '#7c3aed', fontWeight: 800, fontSize: '0.75rem', textTransform: 'none' }}
                            >
                              Copy Key
                            </Button>
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 5, borderRadius: '24px', bgcolor: '#f8fafc', border: '1px dashed rgba(0,0,0,0.06)' }}>
                      <Typography sx={{ color: '#94a3b8', fontWeight: 600 }}>Select a tenant to inspect config details</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Stack>
          </Box>
        </Container>
      )}

      {/* ══════════ Key Services Grid ══════════ */}
      <Container maxWidth="xl" sx={{ py: { xs: 10, md: 16 }, position: 'relative', zIndex: 10 }}>
        <Stack spacing={3} sx={{ mb: 10, textAlign: 'center', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '4rem' },
                letterSpacing: '-1.5px',
                mb: 2,
                background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Everything you need to excel.
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#64748b',
                fontWeight: 500,
                maxWidth: '700px',
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.2rem' }
              }}
            >
              Comprehensive platform with practice problems, assessments, AI interviews, and real-time analytics.
            </Typography>
          </motion.div>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 4,
            mb: 16
          }}
        >
          {[
            {
              icon: <CodeRounded sx={{ fontSize: 36 }} />,
              title: 'Practice Problems',
              description: '500+ curated coding problems across multiple difficulty levels and topics with detailed solutions.',
              color: '#2563eb',
              glow: 'rgba(37,99,235,0.08)'
            },
            {
              icon: <Assessment sx={{ fontSize: 36 }} />,
              title: 'Assessments & Quizzes',
              description: 'Timed assessments with instant results, detailed analytics, and performance tracking.',
              color: '#059669',
              glow: 'rgba(5,150,105,0.08)'
            },
            {
              icon: <Psychology sx={{ fontSize: 36 }} />,
              title: 'Online IDE',
              description: 'Powerful browser-based IDE supporting Python, Java, C++, and C with instant execution.',
              color: '#d97706',
              glow: 'rgba(217,119,6,0.08)'
            },
            {
              icon: <SmartToy sx={{ fontSize: 36 }} />,
              title: 'AI Mock Interviews',
              description: 'Practice with AI-powered interview sessions and get personalized feedback to improve.',
              color: '#7c3aed',
              glow: 'rgba(124,58,237,0.08)'
            },
            {
              icon: <SportsEsports sx={{ fontSize: 36 }} />,
              title: 'Interactive Labs',
              description: 'Hands-on coding labs and playgrounds for practical learning in an engaging environment.',
              color: '#db2777',
              glow: 'rgba(219,39,119,0.08)'
            },
            {
              icon: <EmojiEvents sx={{ fontSize: 36 }} />,
              title: 'Leaderboard & Analytics',
              description: 'Compete with peers, track rankings, and get detailed insights into your progress.',
              color: '#dc2626',
              glow: 'rgba(220,38,38,0.08)'
            }
          ].map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
            >
              <GlassCard
                sx={{
                  p: 5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                  '&:hover': {
                    background: '#ffffff',
                    border: `1px solid ${service.color}40`,
                    boxShadow: `0 20px 40px rgba(0,0,0,0.06), 0 0 0 1px ${service.color}10`,
                    transform: 'translateY(-6px)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '20px',
                    background: service.glow,
                    border: `1px solid ${service.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    color: service.color,
                    boxShadow: `0 8px 24px ${service.color}10`,
                    transition: 'all 0.3s'
                  }}
                >
                  {service.icon}
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    letterSpacing: '-0.5px',
                    color: '#0f172a',
                    fontSize: '1.4rem'
                  }}
                >
                  {service.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#64748b',
                    lineHeight: 1.8,
                    fontSize: '0.95rem',
                    fontWeight: 500
                  }}
                >
                  {service.description}
                </Typography>
              </GlassCard>
            </motion.div>
          ))}
        </Box>
      </Container>

      {/* ══════════ Footer ══════════ */}
      <Box
        sx={{
          borderTop: '1px solid rgba(0,0,0,0.05)',
          py: 6,
          position: 'relative',
          zIndex: 10,
          background: '#ffffff'
        }}
      >
        <Container maxWidth="xl">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={3}>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              © {new Date().getFullYear()}{' '}
              <Typography
                component="a"
                href="https://orcadehub.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#94a3b8',
                  textDecoration: 'none',
                  '&:hover': { color: '#7c3aed' },
                  transition: 'color 0.3s'
                }}
              >
                Orcadehub Innovations LLP
              </Typography>
              . All rights reserved.
            </Typography>
            <Stack direction="row" spacing={4} alignItems="center">
              <Typography
                variant="body2"
                className="interactive"
                component="button"
                onClick={() => setPolicyType('terms')}
                sx={{
                  background: 'none',
                  border: 'none',
                  p: 0,
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  fontFamily: 'inherit',
                  '&:hover': { color: '#7c3aed' },
                  transition: 'color 0.3s'
                }}
              >
                Terms & Conditions
              </Typography>
              <Typography
                variant="body2"
                className="interactive"
                component="button"
                onClick={() => setPolicyType('privacy')}
                sx={{
                  background: 'none',
                  border: 'none',
                  p: 0,
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  fontFamily: 'inherit',
                  '&:hover': { color: '#7c3aed' },
                  transition: 'color 0.3s'
                }}
              >
                Privacy Policy
              </Typography>
              <Typography
                variant="body2"
                className="interactive"
                component="button"
                onClick={() => setPolicyType('refund')}
                sx={{
                  background: 'none',
                  border: 'none',
                  p: 0,
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  fontFamily: 'inherit',
                  '&:hover': { color: '#7c3aed' },
                  transition: 'color 0.3s'
                }}
              >
                Refund Policy (No Refunds)
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <PolicyDialog type={policyType} open={policyType !== null} onClose={() => setPolicyType(null)} />
    </Box>
  );
}
