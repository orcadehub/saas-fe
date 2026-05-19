import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Stack, Divider } from '@mui/material';
import { Shield, Article, RequestQuote } from '@mui/icons-material';

export default function PolicyDialog({ type, open, onClose }) {
  if (!type) return null;

  const contentMap = {
    terms: {
      title: 'Terms & Conditions',
      icon: <Article sx={{ color: '#7c3aed', fontSize: 32 }} />,
      body: (
        <Stack spacing={2.5}>
          <Typography variant="body1" sx={{ color: '#334155', fontWeight: 500, lineHeight: 1.7 }}>
            Welcome to <strong>Orcadehub</strong>. By accessing or using our platform, you agree to comply with and be bound by the following comprehensive terms and conditions of use.
          </Typography>

          <Box 
            sx={{ 
              p: 2.5, 
              borderRadius: '16px', 
              bgcolor: 'rgba(124, 58, 237, 0.05)', 
              border: '1px solid rgba(124, 58, 237, 0.15)',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#6d28d9', mb: 0.5 }}>
              📢 Policy Amendment & Modification Rule:
            </Typography>
            <Typography variant="body2" sx={{ color: '#5b21b6', fontWeight: 600, lineHeight: 1.6 }}>
              Orcadehub reserves the absolute right to modify, amend, delete, or change these rules, terms, policies, and guidelines at any time, in its sole discretion. Any such modifications shall be immediately effective upon posting and apply retroactively and prospectively to all registered, active, and passive users without prior individual notice.
            </Typography>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>1. Account Registration & Credentials Security</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
            Users must provide valid, accurate, current, and complete details during registration. Multi-account creation by a single user or credentials-sharing among peers is strictly prohibited. You are solely responsible for maintaining the confidentiality of your credentials and account sessions.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>2. Acceptable Use of IDE & Coding Sandboxes</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
            The browser-based IDEs and conceptual playgrounds are strictly allocated for coding practice, conceptual learning, and assessment tasks. Any attempt to run malicious exploits, reverse engineer code execution runtimes, execute high-concurrency DDoS scripts, or bypass proctoring security constraints will result in immediate termination of the user profile and potential legal actions.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>3. Proctored Assessments & Academic Integrity</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
            During proctored assessments, strict protocols are enforced: tab switches, fullscreen escapes, external screens, and session anomalies are recorded. Users agree to execute tests without external human assistance, AI tools, or other tab resources. Any breach recorded by proctor algorithms will nullify scores immediately.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>4. Intellectual Property Rights</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
            All problems, text, test cases, gamified logics, visual layout animations, and algorithms published under the Orcadehub platform are proprietary assets. Copying, scraping, or republishing this content elsewhere is strictly prohibited.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>5. Limitation of Liability</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
            The platform is provided "as is" and "as available". We do not warrant that service will be uninterrupted or error-free. Orcadehub is not liable for data loss, server downtime, or any indirect damages.
          </Typography>
        </Stack>
      )
    },
    privacy: {
      title: 'Privacy Policy',
      icon: <Shield sx={{ color: '#059669', fontSize: 32 }} />,
      body: (
        <Stack spacing={2.5}>
          <Typography variant="body1" sx={{ color: '#334155', fontWeight: 500, lineHeight: 1.7 }}>
            Your privacy is highly important to us. This Privacy Policy describes how <strong>Orcadehub</strong> collects, uses, processes, and safeguards student and institution data.
          </Typography>

          <Box 
            sx={{ 
              p: 2.5, 
              borderRadius: '16px', 
              bgcolor: 'rgba(5, 150, 105, 0.05)', 
              border: '1px solid rgba(5, 150, 105, 0.15)',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#065f46', mb: 0.5 }}>
              📢 Policy Updates Notification:
            </Typography>
            <Typography variant="body2" sx={{ color: '#065f46', fontWeight: 600, lineHeight: 1.6 }}>
              We reserve the right to revise this Privacy Policy at any moment. All changes are immediately effective upon publishing. Continued use of the platform represents automatic consent to updated guidelines.
            </Typography>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>1. Scope of Data We Collect</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
            We collect profile identifiers (name, institutional email, avatar, connected student tier plans) and learning metric records. Additionally, during exams, the platform collects device parameters, click logs, and focus status to prevent proctoring violations.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>2. Data Utilization Policy</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
            All collected insights are utilized to render the custom student profile, show gamified achievements, construct competitive leaderboards, synchronize third-party handle aggregates (LeetCode, HackerRank, etc.), and provide comprehensive training dashboards for administrators.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>3. Connected Third-Party Syncs</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
            If you optionally configure external competitive handles, you permit our system to issue automated queries to aggregate solved statistics. No password information is requested or collected for external platforms.
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>4. Security Compliance</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
            Data is stored inside fully-managed, high-grade database clusters protected by industry-standard encryption protocols. Access boundaries are strictly managed through authorization schemas to prevent external exposure.
          </Typography>
        </Stack>
      )
    },
    refund: {
      title: 'Refund Policy',
      icon: <RequestQuote sx={{ color: '#dc2626', fontSize: 32 }} />,
      body: (
        <Stack spacing={3}>
          <Typography variant="body1" sx={{ color: '#334155', fontWeight: 500, lineHeight: 1.7 }}>
            Thank you for choosing <strong>Orcadehub</strong>. Please read our billing and refund guidelines carefully.
          </Typography>
          
          <Box 
            sx={{ 
              p: 3, 
              borderRadius: '16px', 
              bgcolor: 'rgba(220, 38, 38, 0.05)', 
              border: '1px solid rgba(220, 38, 38, 0.15)',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#dc2626', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              ⚠️ Zero Refund Policy
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#dc2626', mb: 1 }}>
              Strictly No Refunds Allowed For Any Payment.
            </Typography>
            <Typography variant="body2" sx={{ color: '#991b1b', fontWeight: 600, lineHeight: 1.6 }}>
              All purchases, individual student subscription packages, institutional fees, white-labeled LMS licensing payments, and custom platform set-up investments made to Orcadehub are completely final, non-cancellable, non-transferable, and non-refundable. Please make use of our free demos, public feature walks, and support trials before initiating any payment transaction.
            </Typography>
          </Box>

          <Box 
            sx={{ 
              p: 2.5, 
              borderRadius: '16px', 
              bgcolor: 'rgba(0,0,0,0.02)', 
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
              📢 Policy Updates Rule:
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
              Refund rules and payment criteria are subject to change without individual warning. Modifications apply immediately to all transactions subsequent to publishing.
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
            For transactional inquiries or technical failures during billing, please contact our support team immediately.
          </Typography>
        </Stack>
      )
    }
  };

  const selected = contentMap[type];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      sx={{
        '& .MuiPaper-root': {
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(30px)',
          borderRadius: '24px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 25px 70px rgba(15, 23, 42, 0.15)',
          p: 2
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2 }}>
        {selected.icon}
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a' }}>
          {selected.title}
        </Typography>
      </DialogTitle>
      
      <Divider sx={{ mb: 1, mx: 2 }} />

      <DialogContent sx={{ py: 2 }}>
        {selected.body}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button 
          variant="contained" 
          onClick={onClose}
          sx={{
            borderRadius: '100px',
            bgcolor: '#7c3aed',
            color: '#fff',
            fontWeight: 800,
            px: 4.5,
            py: 1.25,
            boxShadow: '0 6px 20px rgba(124, 58, 237, 0.2)',
            '&:hover': { bgcolor: '#6d28d9', boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)' }
          }}
        >
          Understand & Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
}
