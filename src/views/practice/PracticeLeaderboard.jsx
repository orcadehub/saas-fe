import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Avatar, Stack, 
  IconButton, Chip, LinearProgress, CircularProgress,
  Breadcrumbs, Link, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  EmojiEvents, ArrowBack, EmojiEventsTwoTone, 
  Stars, WorkspacePremium, TrendingUp, Celebration
} from '@mui/icons-material';
import { useDashboard } from 'contexts/DashboardContext';
import { useAuth } from 'contexts/AuthContext';
import StarryBackground from 'components/StarryBackground';
import { motion } from 'framer-motion';
import { IconCode } from '@tabler/icons-react';

const MotionBox = motion.create(Box);
const MotionRow = motion.create(TableRow);

const LightBackground = () => (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#0c0e1a' }} />
      <Box sx={{
        position: 'absolute', top: '5%', left: '10%',
        width: '40vw', height: '40vw',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(80px)',
      }} />
    </Box>
  );

export default function PracticeLeaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leaderboardData, fetchLeaderboardData, loading } = useDashboard();
  const [sortedData, setSortedData] = useState([]);

  useEffect(() => {
    fetchLeaderboardData(true);
  }, []);

  useEffect(() => {
    if (leaderboardData) {
      // Sort by Orca Solved Count (appSolved)
      const sorted = [...leaderboardData].sort((a, b) => (b.appSolved || 0) - (a.appSolved || 0));
      // Re-rank based on appSolved and limit to top 50
      const ranked = sorted.slice(0, 50).map((student, index) => ({
        ...student,
        orcaRank: index + 1
      }));
      setSortedData(ranked);
    }
  }, [leaderboardData]);

  const getRankStyle = (rank) => {
    if (rank === 1) return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', shadow: '0 0 20px rgba(251, 191, 36, 0.2)' };
    if (rank === 2) return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', shadow: '0 0 20px rgba(148, 163, 184, 0.2)' };
    if (rank === 3) return { color: '#d97706', bg: 'rgba(217, 119, 6, 0.1)', shadow: '0 0 20px rgba(217, 119, 6, 0.2)' };
    return { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.05)', shadow: 'none' };
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0c0e1a', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <LightBackground />
      <StarryBackground />

      <Box sx={{ position: 'relative', zIndex: 10, p: { xs: 2.5, sm: 3, md: 5 } }}>
        
        {/* Header Section */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={6}>
            <Box>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <IconButton onClick={() => navigate('/practice/programming')} sx={{ color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.05)' }}>
                        <ArrowBack />
                    </IconButton>
                    <Breadcrumbs separator={<Typography sx={{ color: 'rgba(255,255,255,0.3)' }}>/</Typography>}>
                        <Link component="button" onClick={() => navigate('/practice/programming')} sx={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 600 }}>Orca Practice</Link>
                        <Typography sx={{ color: '#fff', fontWeight: 800 }}>Hall of Fame</Typography>
                    </Breadcrumbs>
                </Stack>
                <Typography variant="h1" sx={{ fontWeight: 950, letterSpacing: '-0.04em', fontSize: { xs: '2rem', md: '3.5rem' }, display: 'flex', alignItems: 'center', gap: 2, color: '#fff' }}>
                    <IconCode size={50} style={{ color: '#6366f1' }} />
                    ORCA <Box component="span" sx={{ color: '#6366f1' }}>Leaderboard</Box>
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', mt: 1 }}>
                    Tracking the top problem-solvers in the Orca ecosystem.
                </Typography>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
                <Celebration sx={{ fontSize: 60, color: '#fbbf24', opacity: 0.8 }} />
            </Box>
        </Stack>

        {/* Podium / Top 3 Preview (Hidden on XS) */}
        {!loading && sortedData.length >= 3 && (
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, justifyContent: 'center', gap: 4, mb: 8, alignItems: 'flex-end' }}>
                {[1, 0, 2].map((idx) => {
                    const student = sortedData[idx];
                    if (!student) return null;
                    const isWinner = idx === 0;
                    return (
                        <MotionBox 
                            key={student._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            sx={{ 
                                width: isWinner ? 320 : 280, 
                                p: 4, borderRadius: '32px', 
                                bgcolor: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(10px)',
                                textAlign: 'center',
                                position: 'relative',
                                height: isWinner ? 400 : 350,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            {isWinner && (
                                <Box sx={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)' }}>
                                    <EmojiEvents sx={{ fontSize: 80, color: '#fbbf24' }} />
                                </Box>
                            )}
                            <Avatar sx={{ width: isWinner ? 100 : 80, height: isWinner ? 100 : 80, mb: 3, border: `4px solid ${getRankStyle(idx+1).color}`, bgcolor: 'rgba(99, 102, 241, 0.2)', fontSize: '2rem' }}>
                                {student.name.charAt(0)}
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>{student.name}</Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3 }}>{student.email}</Typography>
                            
                            <Box sx={{ p: 2, borderRadius: '20px', bgcolor: 'rgba(99, 102, 241, 0.1)', width: '100%' }}>
                                <Typography sx={{ color: '#818cf8', fontWeight: 900, fontSize: '1.5rem' }}>{student.appSolved}</Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }}>Problems Solved</Typography>
                            </Box>
                        </MotionBox>
                    );
                })}
            </Box>
        )}

        {/* Global List */}
        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress sx={{ color: '#6366f1' }} />
            </Box>
        ) : (
            <TableContainer component={Paper} sx={{ 
                bgcolor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(20px)', borderRadius: '32px', 
                border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                overflow: 'hidden'
            }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, border: 'none', py: 3, pl: 4 }}>RANK</TableCell>
                            <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, border: 'none', py: 3 }}>STUDENT</TableCell>
                            <TableCell align="center" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, border: 'none', py: 3 }}>PROBLEMS SOLVED</TableCell>
                            <TableCell align="center" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, border: 'none', py: 3 }}>CURRICULUM MASTERY</TableCell>
                            <TableCell align="center" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, border: 'none', py: 3, pr: 4 }}>STATUS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedData.map((student, i) => {
                            const rank = student.orcaRank;
                            const style = getRankStyle(rank);
                            const isMe = student.email === user?.email;
                            
                            return (
                                <MotionRow 
                                    key={student._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    sx={{ 
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                                        bgcolor: isMe ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                                    }}
                                >
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 2.5, pl: 4 }}>
                                        <Box sx={{ 
                                            width: 40, height: 40, borderRadius: '12px', bgcolor: style.bg, color: style.color, 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900,
                                            boxShadow: style.shadow
                                        }}>
                                            {rank <= 3 ? <EmojiEventsTwoTone sx={{ fontSize: 22 }} /> : rank}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 2.5 }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ width: 42, height: 42, bgcolor: isMe ? '#6366f1' : 'rgba(255,255,255,0.1)', fontSize: '0.9rem', fontWeight: 900 }}>
                                                {student.name.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{student.name}</Typography>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{student.email}</Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="center" sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 2.5 }}>
                                        <Typography sx={{ fontWeight: 950, color: '#6366f1', fontSize: '1.25rem' }}>{student.appSolved}</Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 2.5, minWidth: 200 }}>
                                        <Box sx={{ maxWidth: 180, mx: 'auto' }}>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={Math.min(100, (student.appSolved / 200) * 100)} 
                                                sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1', borderRadius: 3 } }} 
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center" sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 2.5, pr: 4 }}>
                                        <Chip 
                                            label={rank <= 10 ? "ELITE" : "ACTIVE"} 
                                            size="small" 
                                            sx={{ 
                                                fontWeight: 900, 
                                                bgcolor: rank <= 10 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                                color: rank <= 10 ? '#fbbf24' : '#6366f1',
                                                borderRadius: '8px'
                                            }} 
                                        />
                                    </TableCell>
                                </MotionRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        )}
      </Box>
    </Box>
  );
}
