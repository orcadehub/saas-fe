import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Stack,
  Chip,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  PublicOutlined,
  ArrowBackIosNew,
  SyncOutlined,
  EmojiEventsOutlined,
  CodeOutlined,
  TrendingUpOutlined,
  StarOutline,
  AssignmentTurnedInOutlined,
  SettingsOutlined,
  VerifiedOutlined
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import apiService from 'services/apiService';

const MotionBox = motion.create(Box);

const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  textMain: '#1e293b',
  textSub: '#64748b',
  border: 'rgba(226, 232, 240, 0.8)',
  bg: '#fbfcfe',
  leetcode: '#ffa116',
  codechef: '#5b4638',
  codeforces: '#1f8ee7',
  hackerrank: '#2ec866'
};

const ProfileStat = ({ icon, label, value, color }) => (
  <Stack spacing={0.5} sx={{ textAlign: 'left' }}>
    <Stack direction="row" spacing={1} alignItems="center">
      {icon}
      <Typography
        variant="caption"
        sx={{ color: COLORS.textSub, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.6rem' }}
      >
        {label}
      </Typography>
    </Stack>
    <Typography variant="h4" sx={{ fontWeight: 900, color: color || COLORS.textMain, fontSize: '1.25rem' }}>
      {value || 0}
    </Typography>
  </Stack>
);

const PlatformCard = ({ platform, data, icon, color, onSync, loading }) => (
  <Card
    sx={{
      borderRadius: '28px',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 4px 25px rgba(0,0,0,0.03)',
      overflow: 'hidden',
      height: '100%',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: `0 20px 40px ${color}10`,
        borderColor: `${color}40`
      }
    }}
  >
    <CardContent sx={{ p: 0 }}>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          bgcolor: `${color}08`,
          borderBottom: `1px solid ${color}15`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: color, width: 48, height: 48, boxShadow: `0 8px 16px ${color}30`, border: '2px solid #fff' }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.textMain, fontSize: '1.1rem' }}>
              {platform}
            </Typography>
            <Typography variant="caption" sx={{ color: COLORS.textSub, fontWeight: 700, fontSize: '0.75rem' }}>
              {data?.username || 'Not Connected'}
            </Typography>
          </Box>
        </Stack>
        {data?.connected && (
          <IconButton
            size="small"
            onClick={onSync}
            disabled={loading}
            sx={{
              bgcolor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: `${color}10`, transform: 'rotate(180deg)' },
              transition: 'all 0.4s'
            }}
          >
            <SyncOutlined sx={{ fontSize: 18, color: color, animation: loading ? 'spin 2s linear infinite' : 'none' }} />
          </IconButton>
        )}
      </Box>

      {/* Body */}
      <Box sx={{ p: 3.5 }}>
        {!data?.connected ? (
          <Stack alignItems="center" spacing={2} sx={{ py: 3 }}>
            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: '#f8fafc' }}>
              <VerifiedOutlined sx={{ color: '#cbd5e1', fontSize: 40 }} />
            </Box>
            <Typography variant="body2" sx={{ color: COLORS.textSub, textAlign: 'center', fontWeight: 500, lineHeight: 1.6 }}>
              Connect your {platform} account to showcase your achievements.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              component="a"
              href="/user/account-settings"
              sx={{
                borderRadius: '14px',
                textTransform: 'none',
                borderColor: color,
                color: color,
                fontWeight: 800,
                px: 3,
                '&:hover': { bgcolor: `${color}05`, borderColor: color }
              }}
            >
              Link Account
            </Button>
          </Stack>
        ) : (
          <Grid container spacing={3}>
            {platform === 'LeetCode' && (
              <>
                <Grid item xs={6}>
                  <ProfileStat
                    icon={<AssignmentTurnedInOutlined sx={{ fontSize: 16, color: color }} />}
                    label="Solved"
                    value={data.totalSolved}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ProfileStat icon={<EmojiEventsOutlined sx={{ fontSize: 16, color: color }} />} label="Ranking" value={data.ranking} />
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1.5} sx={{ mt: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                      <Typography variant="caption" sx={{ fontWeight: 800, color: COLORS.textMain }}>
                        Problem Mastery
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textSub, fontWeight: 700 }}>
                        {data.totalSolved} items
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        display: 'flex',
                        height: 10,
                        borderRadius: 5,
                        overflow: 'hidden',
                        bgcolor: '#f1f5f9',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <Box sx={{ width: `${(data.easySolved / data.totalSolved) * 100 || 0}%`, bgcolor: '#22c55e' }} />
                      <Box sx={{ width: `${(data.mediumSolved / data.totalSolved) * 100 || 0}%`, bgcolor: '#eab308' }} />
                      <Box sx={{ width: `${(data.hardSolved / data.totalSolved) * 100 || 0}%`, bgcolor: '#ef4444' }} />
                    </Box>
                    <Stack direction="row" spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22c55e' }} />
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#22c55e' }}>{data.easySolved}E</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#eab308' }} />
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#eab308' }}>{data.mediumSolved}M</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ef4444' }} />
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#ef4444' }}>{data.hardSolved}H</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Grid>
              </>
            )}
            {platform === 'CodeChef' && (
              <>
                <Grid item xs={6}>
                  <ProfileStat icon={<StarOutline sx={{ fontSize: 16, color: color }} />} label="Stars" value={data.stars} />
                </Grid>
                <Grid item xs={6}>
                  <ProfileStat icon={<TrendingUpOutlined sx={{ fontSize: 16, color: color }} />} label="Rating" value={data.rating} />
                </Grid>
                <Grid item xs={12}>
                  <ProfileStat
                    icon={<EmojiEventsOutlined sx={{ fontSize: 16, color: color }} />}
                    label="Global Rank"
                    value={data.globalRank}
                  />
                </Grid>
              </>
            )}
            {platform === 'Codeforces' && (
              <>
                <Grid item xs={6}>
                  <ProfileStat icon={<TrendingUpOutlined sx={{ fontSize: 16, color: color }} />} label="Rating" value={data.rating} />
                </Grid>
                <Grid item xs={6}>
                  <ProfileStat icon={<EmojiEventsOutlined sx={{ fontSize: 16, color: color }} />} label="Rank" value={data.rank} />
                </Grid>
                <Grid item xs={12}>
                  <ProfileStat icon={<StarOutline sx={{ fontSize: 16, color: color }} />} label="Max Rating" value={data.maxRating} />
                </Grid>
              </>
            )}
            {platform === 'HackerRank' && (
              <>
                <Grid item xs={6}>
                  <ProfileStat
                    icon={<AssignmentTurnedInOutlined sx={{ fontSize: 16, color: color }} />}
                    label="Solved"
                    value={data.totalSolved}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ProfileStat icon={<EmojiEventsOutlined sx={{ fontSize: 16, color: color }} />} label="Badges" value={data.badges} />
                </Grid>
                <Grid item xs={12}>
                  <ProfileStat icon={<TrendingUpOutlined sx={{ fontSize: 16, color: color }} />} label="Overall Rank" value={data.rank} />
                </Grid>
              </>
            )}
          </Grid>
        )}
      </Box>

      {data?.connected && (
        <Box sx={{ px: 3, py: 1.5, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
          <Typography
            variant="caption"
            sx={{ color: COLORS.textSub, display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700, fontSize: '0.65rem' }}
          >
            <SyncOutlined sx={{ fontSize: 12 }} /> Data updated {new Date(data.lastSynced).toLocaleDateString()}
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

export default function CodingProfiles() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [syncingPlatform, setSyncingPlatform] = useState(null);

  const handleSync = async (platform) => {
    setLoading(true);
    setSyncingPlatform(platform);
    try {
      const token = localStorage.getItem('studentToken');
      const response = await apiService.connectCodingProfiles(token, {
        leetcodeUsername: user?.codingProfiles?.leetcode?.username,
        hackerrankUsername: user?.codingProfiles?.hackerrank?.username,
        codeforcesUsername: user?.codingProfiles?.codeforces?.username,
        codechefUsername: user?.codingProfiles?.codechef?.username
      });
      login({ ...response.student, token });
    } catch (e) {
      console.error('Sync error:', e);
    } finally {
      setLoading(false);
      setSyncingPlatform(null);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.bg, pt: { xs: 2, md: 5 }, pb: { xs: 4, md: 10 } }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 6 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: { xs: 4, md: 8 }, gap: 3 }}
        >
          <Stack direction="row" alignItems="center" spacing={3}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                bgcolor: '#fff',
                width: 44,
                height: 44,
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                '&:hover': { bgcolor: '#f1f5f9', transform: 'translateX(-4px)' },
                transition: 'all 0.2s'
              }}
            >
              <ArrowBackIosNew sx={{ fontSize: 16 }} />
            </IconButton>
            <Box>
              <Typography
                variant="h1"
                sx={{ fontWeight: 900, color: COLORS.textMain, letterSpacing: '-1.5px', fontSize: { xs: '1.75rem', md: '2.5rem' } }}
              >
                Coding Hub
              </Typography>
              <Typography variant="body1" sx={{ color: COLORS.textSub, fontWeight: 600, mt: 0.5 }}>
                Analyze your multi-platform coding performance
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            startIcon={<SettingsOutlined />}
            onClick={() => navigate('/user/account-settings')}
            sx={{
              borderRadius: '16px',
              textTransform: 'none',
              py: 1.5,
              px: 4,
              fontWeight: 800,
              bgcolor: COLORS.primary,
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.2)',
              '&:hover': { bgcolor: COLORS.secondary, transform: 'translateY(-2px)' },
              transition: 'all 0.3s'
            }}
          >
            Settings
          </Button>
        </Stack>

        {/* Fluid Dynamic Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fill, minmax(320px, 1fr))'
            },
            gap: 4,
            mb: 6,
            justifyContent: 'center'
          }}
        >
          <PlatformCard
            platform="LeetCode"
            data={user?.codingProfiles?.leetcode}
            icon={<CodeOutlined />}
            color={COLORS.leetcode}
            onSync={() => handleSync('leetcode')}
            loading={syncingPlatform === 'leetcode'}
          />
          <PlatformCard
            platform="CodeChef"
            data={user?.codingProfiles?.codechef}
            icon={<TrendingUpOutlined />}
            color={COLORS.codechef}
            onSync={() => handleSync('codechef')}
            loading={syncingPlatform === 'codechef'}
          />
          <PlatformCard
            platform="Codeforces"
            data={user?.codingProfiles?.codeforces}
            icon={<PublicOutlined />}
            color={COLORS.codeforces}
            onSync={() => handleSync('codeforces')}
            loading={syncingPlatform === 'codeforces'}
          />
          <PlatformCard
            platform="HackerRank"
            data={user?.codingProfiles?.hackerrank}
            icon={<CodeOutlined />}
            color={COLORS.hackerrank}
            onSync={() => handleSync('hackerrank')}
            loading={syncingPlatform === 'hackerrank'}
          />
        </Box>

        <Card
          sx={{
            borderRadius: '32px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
            p: { xs: 4, md: 6 },
            background: `linear-gradient(135deg, ${COLORS.primary}08 0%, ${COLORS.secondary}12 100%)`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `${COLORS.primary}05`,
              filter: 'blur(50px)'
            }}
          />
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar sx={{ width: 80, height: 80, bgcolor: COLORS.primary, boxShadow: `0 15px 35px ${COLORS.primary}30` }}>
                  <EmojiEventsOutlined sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h2" sx={{ fontWeight: 900, color: COLORS.textMain, mb: 0.5 }}>
                    Combined Mastery
                  </Typography>
                  <Typography variant="body1" sx={{ color: COLORS.textSub, fontWeight: 600 }}>
                    Aggregate stats across all connected coding environments.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack direction="row" spacing={5} justifyContent={{ xs: 'center', md: 'flex-end' }} sx={{ textAlign: 'center' }}>
                <Box>
                  <Typography variant="h1" sx={{ fontWeight: 900, color: COLORS.primary, fontSize: '3rem', letterSpacing: '-2px' }}>
                    {(user?.codingProfiles?.leetcode?.totalSolved || 0) +
                      (user?.codingProfiles?.codeforces?.totalSolved || 0) +
                      (user?.codingProfiles?.hackerrank?.totalSolved || 0)}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: COLORS.textSub, letterSpacing: '1px' }}>
                    TOTAL SOLVED
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ opacity: 0.15, borderWidth: 1 }} />
                <Box>
                  <Typography variant="h1" sx={{ fontWeight: 900, color: COLORS.secondary, fontSize: '3rem', letterSpacing: '-2px' }}>
                    {Object.values(user?.codingProfiles || {}).filter((p) => p.connected).length}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: COLORS.textSub, letterSpacing: '1px' }}>
                    PLATFORMS
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Card>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </Container>
    </Box>
  );
}
