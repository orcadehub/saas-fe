import { useState, useEffect } from 'react';
import { Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, Avatar, IconButton, Stack, InputAdornment, CircularProgress, Select, MenuItem, FormControl } from '@mui/material';
import { Link as LinkIcon, EmojiEvents, Person, Visibility, Search, EmojiEventsTwoTone } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from 'contexts/AuthContext';
import { useDashboard } from 'contexts/DashboardContext';
import tenantConfig from 'config/tenantConfig';
import TableSkeleton from 'ui-component/skeletons/TableSkeleton';

const MotionBox = motion.create(Box);

// ── Soft Light Background ──
const LightBackground = () => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#fbfcfe' }} />
    <Box sx={{
      position: 'absolute', top: '5%', left: '10%',
      width: '40vw', height: '40vw',
      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.04) 0%, transparent 70%)',
      borderRadius: '50%', filter: 'blur(80px)',
    }} />
  </Box>
);

const lightDialogSx = {
  '& .MuiPaper-root': {
    bgcolor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(32px)',
    borderRadius: '24px',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    boxShadow: '0 25px 70px rgba(15, 23, 42, 0.1)',
    backgroundImage: 'none'
  },
  '& .MuiDialogTitle-root': { fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }
};

const lightInputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#1e293b',
    borderRadius: '12px',
    background: '#fff',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused fieldset': { borderColor: '#6366f1' },
  }
};

export default function Leaderboard() {
  const { user } = useAuth();
  const { leaderboardData: cachedLeaderboard, fetchLeaderboardData } = useDashboard();
  const [openDialog, setOpenDialog] = useState(false);
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [hackerrankUsername, setHackerrankUsername] = useState('');
  const [codeforcesUsername, setCodeforcesUsername] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statsDialog, setStatsDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState('allTime');

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  useEffect(() => {
    if (config && user?.token) {
      if (!cachedLeaderboard || timeframe !== 'allTime') { 
        fetchLeaderboard(); 
      } 
      else {
        setAllStudents(cachedLeaderboard);
        setLeaderboardData(cachedLeaderboard);
        setTotalPages(Math.ceil(cachedLeaderboard.length / 50));
        setLoading(false);
      }
    }
  }, [config, user, cachedLeaderboard, timeframe]);

  useEffect(() => {
    const filtered = allStudents.filter(student => student.name.toLowerCase().includes(searchQuery.toLowerCase()));
    setLeaderboardData(filtered);
    setTotalPages(Math.ceil(filtered.length / 50));
    setPage(1);
  }, [searchQuery, allStudents]);

  useEffect(() => {
    if (openDialog && allStudents.length > 0 && user?.email) {
      const currentUserEntry = allStudents.find(s => s.email === user.email);
      if (currentUserEntry) {
        setLeetcodeUsername(currentUserEntry.leetcodeUsername || '');
        setHackerrankUsername(currentUserEntry.hackerrankUsername || '');
        setCodeforcesUsername(currentUserEntry.codeforcesUsername || '');
      }
    }
  }, [openDialog, allStudents, user]);

  const getApiUrl = () => import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://backend.orcode.in/api';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token}`,
    'x-api-key': config?.apiKey || '',
    'x-tenant-id': config?.tenantId || ''
  });

  const fetchLeaderboard = async () => {
    setLoading(true);
    const data = await fetchLeaderboardData(true, timeframe);
    if (data) {
      setAllStudents(data);
      setLeaderboardData(data);
      setTotalPages(Math.ceil(data.length / 50));
    }
    setLoading(false);
  };

  const handleConnectAccounts = async () => {
    if (!leetcodeUsername && !hackerrankUsername && !codeforcesUsername) { setError('Please enter at least one username'); return; }
    setConnecting(true); setError('');
    try {
      const response = await fetch(`${getApiUrl()}/auth/student/connect-coding-profiles`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ leetcodeUsername, hackerrankUsername, codeforcesUsername })
      });
      if (response.ok) { setOpenDialog(false); fetchLeaderboard(); } 
      else { const data = await response.json(); setError(data.message || 'Failed'); }
    } catch (e) { setError('Error connecting'); } 
    finally { setConnecting(false); }
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return { color: '#fbbf24', bg: '#fef3c7', icon: true };
    if (rank === 2) return { color: '#94a3b8', bg: '#f1f5f9', icon: true };
    if (rank === 3) return { color: '#d97706', bg: '#ffedd5', icon: true };
    return { color: '#64748b', bg: '#f8fafc', icon: false };
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      p: { xs: 2.5, sm: 3, md: 4.5 }, 
      bgcolor: '#fbfcfe', 
      color: '#1e293b', 
      position: 'relative',
      overflowX: 'hidden'
    }}>
      <LightBackground />

      <Box sx={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          gap: 3, 
          mb: { xs: 4, md: 6 } 
        }}>
          <Box>
            <Typography variant="h1" sx={{ 
              fontWeight: 900, 
              color: '#1e293b', 
              mb: 1, 
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' } 
            }}>
              League Table
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Global rankings across all integrated coding platforms.
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <FormControl sx={{ minWidth: 150, ...lightInputSx }}>
              <Select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                displayEmpty
              >
                <MenuItem value="allTime">All Time</MenuItem>
                <MenuItem value="thisMonth">This Month</MenuItem>
                <MenuItem value="thisWeek">This Week</MenuItem>
              </Select>
            </FormControl>
            <TextField
              sx={{ ...lightInputSx, width: { xs: '100%', md: 280 } }}
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ color: '#94a3b8', mr: 1 }} /> }}
            />
            <Button 
              variant="contained" disableElevation
              startIcon={<LinkIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{ 
                px: 3, 
                borderRadius: '12px', 
                bgcolor: '#6366f1', 
                '&:hover': { bgcolor: '#4f46e5' },
                whiteSpace: 'nowrap'
              }}
            >
              Sync
            </Button>
          </Stack>
        </Box>

        {loading ? (
          <TableSkeleton rows={10} columns={9} />
        ) : (
          <TableContainer component={Paper} sx={{ 
            borderRadius: '24px', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)', 
            overflowX: 'auto', 
            bgcolor: '#fff',
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 10 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }
          }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', py: 2 }}>RANK</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', py: 2 }}>STUDENT</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', py: 2 }}>LEETCODE</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', py: 2 }}>HACKERRANK</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', py: 2 }}>CODEFORCES</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', py: 2 }}>ORCA</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', py: 2 }}>TOTAL SOLVED</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', py: 2 }}>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboardData.slice((page-1)*50, page*50).map((student) => {
                  const style = getRankStyle(student.rank);
                  const isMe = student.email === user?.email;
                  return (
                    <TableRow key={student._id} sx={{ bgcolor: isMe ? 'rgba(99, 102, 241, 0.03)' : 'inherit', '&:hover': { bgcolor: '#fbfcfe' } }}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ 
                          width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          bgcolor: style.bg, color: style.color, fontWeight: 800 
                        }}>
                          {style.icon ? <EmojiEvents sx={{ fontSize: 20 }} /> : student.rank}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ width: 34, height: 34, bgcolor: isMe ? '#6366f1' : '#e2e8f0', fontSize: '0.8rem' }}>{student.name.charAt(0)}</Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.875rem' }}>{student.name}</Typography>
                            {isMe && <Typography sx={{ fontSize: '0.65rem', color: '#6366f1', fontWeight: 900 }}>CURRENT USER</Typography>}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}><Typography sx={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.875rem' }}>{student.leetcode || 0}</Typography></TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}><Typography sx={{ fontWeight: 700, color: '#10b981', fontSize: '0.875rem' }}>{student.hackerrank || 0}</Typography></TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}><Typography sx={{ fontWeight: 700, color: '#3b82f6', fontSize: '0.875rem' }}>{student.codeforces || 0}</Typography></TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}><Typography sx={{ fontWeight: 700, color: '#6366f1', fontSize: '0.875rem' }}>{student.appSolved || 0}</Typography></TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Box sx={{ 
                          px: 2, py: 0.5, borderRadius: '8px', bgcolor: student.rank <= 3 ? '#6366f1' : '#f1f5f9', 
                          color: student.rank <= 3 ? '#fff' : '#475569', fontWeight: 800, display: 'inline-block', fontSize: '0.875rem' 
                        }}>
                          {student.totalSolved}
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <IconButton size="small" onClick={() => { setSelectedStudent(student); setStatsDialog(true); }}><Visibility fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={totalPages} page={page} onChange={(e,v)=>setPage(v)} color="primary" />
        </Box>
      </Box>

      {/* Sync Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !connecting && setOpenDialog(false)} 
        maxWidth="xs" 
        fullWidth 
        sx={lightDialogSx}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4, fontWeight: 900 }}>Profile Sync</DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', mb: 3, px: 2 }}>
            Link your external coding profiles to accurately reflect your ranking in the League Table.
          </Typography>
          
          <Stack spacing={2.5} sx={{ px: 1 }}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: '12px', fontSize: '0.8rem' }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            
            <TextField 
              label="LeetCode Handle" 
              sx={lightInputSx} 
              value={leetcodeUsername} 
              onChange={(e) => setLeetcodeUsername(e.target.value)} 
              fullWidth 
              placeholder="e.g. username"
              disabled={connecting}
            />
            <TextField 
              label="HackerRank ID" 
              sx={lightInputSx} 
              value={hackerrankUsername} 
              onChange={(e) => setHackerrankUsername(e.target.value)} 
              fullWidth 
              placeholder="e.g. username"
              disabled={connecting}
            />
            <TextField 
              label="Codeforces User" 
              sx={lightInputSx} 
              value={codeforcesUsername} 
              onChange={(e) => setCodeforcesUsername(e.target.value)} 
              fullWidth 
              placeholder="e.g. username"
              disabled={connecting}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2, justifyContent: 'center', flexDirection: 'column', gap: 1.5 }}>
          <Button 
            fullWidth
            variant="contained" 
            disableElevation 
            onClick={handleConnectAccounts}
            disabled={connecting}
            sx={{ 
              borderRadius: '12px', 
              bgcolor: '#6366f1', 
              py: 1.5,
              fontWeight: 800,
              fontSize: '0.95rem',
              '&:hover': { bgcolor: '#4f46e5' }
            }}
          >
            {connecting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Initiate Synchronization'}
          </Button>
          <Button 
            fullWidth
            onClick={() => setOpenDialog(false)}
            disabled={connecting}
            sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={statsDialog} onClose={() => setStatsDialog(false)} maxWidth="sm" fullWidth sx={lightDialogSx}>
        <DialogTitle sx={{ textAlign: 'center', pt: 3, fontWeight: 900 }}>Profile Insight</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          {selectedStudent && (
            <Stack spacing={3}>
              <Box sx={{ p: 2, bgcolor: 'rgba(99, 102, 241, 0.03)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#6366f1', fontSize: '1.25rem' }}>{selectedStudent.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>{selectedStudent.name}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>{selectedStudent.email}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                {[
                  { label: 'LEETCODE', value: selectedStudent.leetcode || 0, handle: selectedStudent.leetcodeUsername || 'Not Linked', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
                  { label: 'HACKERRANK', value: selectedStudent.hackerrank || 0, handle: selectedStudent.hackerrankUsername || 'Not Linked', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
                  { label: 'CODEFORCES', value: selectedStudent.codeforces || 0, handle: selectedStudent.codeforcesUsername || 'Not Linked', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
                  { label: 'ORCA SOLVED', value: selectedStudent.appSolved || 0, handle: selectedStudent.email?.split('@')[0], color: '#6366f1', bg: '#f5f3ff', border: '#ddd6fe' },
                  { label: 'TOTAL SCORE', value: selectedStudent.totalSolved || 0, color: '#ef4444', bg: '#fef2f2', border: '#fecaca', span: 2 }
                ].map((stat, i) => (
                  <Paper key={i} sx={{ 
                    p: 2, 
                    bgcolor: stat.bg, 
                    border: `1px solid ${stat.border}`, 
                    borderRadius: '16px',
                    gridColumn: stat.span ? `span ${stat.span}` : 'span 1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="caption" sx={{ color: stat.color, fontWeight: 800, display: 'block', mb: 0.5, letterSpacing: '0.05em' }}>{stat.label}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <Typography variant="h3" sx={{ color: stat.color, fontWeight: 900 }}>{stat.value}</Typography>
                      {stat.handle && (
                        <Typography variant="caption" sx={{ color: stat.color, opacity: 0.7, fontWeight: 700, fontSize: '0.7rem' }}>
                          @{stat.handle}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>

              <Paper sx={{ 
                p: 3, 
                textAlign: 'center', 
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                color: '#fff', 
                borderRadius: '20px',
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.2)'
              }}>
                <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600, mb: 0.5 }}>Global Leaderboard Rank</Typography>
                <Typography variant="h1" sx={{ fontWeight: 900, fontSize: '2.5rem' }}>#{selectedStudent.rank}</Typography>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button fullWidth onClick={()=>setStatsDialog(false)} sx={{ fontWeight: 700, color: '#64748b' }}>Dismiss</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
