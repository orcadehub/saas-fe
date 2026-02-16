import { useState, useEffect } from 'react';
import { Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, Chip, Avatar, IconButton, Grid } from '@mui/material';
import { Link as LinkIcon, EmojiEvents, Person, Visibility } from '@mui/icons-material';
import MainCard from 'ui-component/cards/MainCard';
import { useAuth } from 'contexts/AuthContext';
import { useDashboard } from 'contexts/DashboardContext';
import tenantConfig from 'config/tenantConfig';

export default function Leaderboard() {
  const { user } = useAuth();
  const { leaderboardData: cachedLeaderboard, fetchLeaderboardData } = useDashboard();
  const [openDialog, setOpenDialog] = useState(false);
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [hackerrankUsername, setHackerrankUsername] = useState('');
  const [codeforcesUsername, setCodeforcesUsername] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  const [config, setConfig] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statsDialog, setStatsDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  useEffect(() => {
    if (config && user?.token) {
      fetchStudentProfile();
      if (!cachedLeaderboard) {
        fetchLeaderboard();
      } else {
        setAllStudents(cachedLeaderboard);
        setLeaderboardData(cachedLeaderboard);
        setTotalPages(Math.ceil(cachedLeaderboard.length / 50));
        setLoading(false);
      }
    }
  }, [config, user, cachedLeaderboard]);

  useEffect(() => {
    const filtered = allStudents.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setLeaderboardData(filtered);
    setTotalPages(Math.ceil(filtered.length / 50));
    setPage(1);
  }, [searchQuery, allStudents]);

  const getApiUrl = () => {
    return import.meta.env.DEV ? 'http://localhost:4000/api' : (config?.apiEndpoint || 'https://backend.orcode.in/api');
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token}`,
    'x-api-key': config?.apiKey || '',
    'x-tenant-id': config?.tenantId || ''
  });

  const fetchStudentProfile = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/students/profile`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setStudentProfile(data);
        const profiles = data.codingProfiles || {};
        
        setLeetcodeUsername(profiles.leetcode?.username || '');
        setHackerrankUsername(profiles.hackerrank?.username || '');
        setCodeforcesUsername(profiles.codeforces?.username || '');
        
        const hasAnyProfile = profiles.leetcode?.connected || profiles.hackerrank?.connected || profiles.codeforces?.connected;
        if (!hasAnyProfile) {
          setOpenDialog(true);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleConnectAccounts = async () => {
    if (!leetcodeUsername && !hackerrankUsername && !codeforcesUsername) {
      setError('Please enter at least one username');
      return;
    }
    
    setConnecting(true);
    setError('');
    
    try {
      const response = await fetch(`${getApiUrl()}/students/connect-coding-profiles`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          leetcodeUsername,
          hackerrankUsername,
          codeforcesUsername
        })
      });
      
      if (response.ok) {
        setOpenDialog(false);
        fetchStudentProfile();
        fetchLeaderboard();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to connect accounts');
      }
    } catch (error) {
      setError('Error connecting accounts');
    } finally {
      setConnecting(false);
    }
  };

  const fetchLeaderboard = async () => {
    const data = await fetchLeaderboardData();
    if (data) {
      setAllStudents(data);
      setLeaderboardData(data);
      setTotalPages(Math.ceil(data.length / 50));
    }
    setLoading(false);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <EmojiEvents sx={{ color: '#FFD700', fontSize: 28 }} />;
      case 2: return <EmojiEvents sx={{ color: '#C0C0C0', fontSize: 28 }} />;
      case 3: return <EmojiEvents sx={{ color: '#CD7F32', fontSize: 28 }} />;
      default: return <Typography variant="h6" fontWeight={600}>{rank}</Typography>;
    }
  };

  return (
    <MainCard 
      title="Leaderboard"
      secondary={
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ width: 300 }}
          />
          <Button 
            variant="outlined" 
            startIcon={<LinkIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Connect Platforms
          </Button>
        </Box>
      }
    >
      <Typography variant="body1" sx={{ mb: 3 }}>
        Rankings based on total problems solved across all platforms
      </Typography>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
          Connect Your Coding Profiles
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Connect your coding platform accounts to track your progress on the leaderboard.
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField fullWidth label="LeetCode Username" value={leetcodeUsername} onChange={(e) => setLeetcodeUsername(e.target.value)} placeholder="Enter your LeetCode username" />
            <TextField fullWidth label="HackerRank Username" value={hackerrankUsername} onChange={(e) => setHackerrankUsername(e.target.value)} placeholder="Enter your HackerRank username" />
            <TextField fullWidth label="Codeforces Username" value={codeforcesUsername} onChange={(e) => setCodeforcesUsername(e.target.value)} placeholder="Enter your Codeforces username" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={connecting}>Skip for now</Button>
          <Button variant="contained" onClick={handleConnectAccounts} disabled={connecting} startIcon={<LinkIcon />}>
            {connecting ? 'Connecting...' : 'Connect Accounts'}
          </Button>
        </DialogActions>
      </Dialog>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.light' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>LeetCode</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>HackerRank</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Codeforces</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>{config?.appName || 'App'}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Total Solved</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboardData
                  .slice((page - 1) * 50, page * 50)
                  .map((student) => {
                  const isCurrentUser = student.email === user?.email;
                  const isTopThree = student.rank <= 3;
                  
                  return (
                    <TableRow 
                      key={student._id}
                      sx={{ 
                        bgcolor: isCurrentUser ? 'primary.lighter' : 'white',
                        borderLeft: isCurrentUser ? '4px solid' : 'none',
                        borderColor: 'primary.main'
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {isTopThree ? getRankIcon(student.rank) : (
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography variant="body1" fontWeight={700}>{student.rank}</Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: isTopThree ? '#FFD700' : '#e2e8f0' }}>
                            <Person sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={600}>{student.name}</Typography>
                            {isCurrentUser && <Chip label="You" size="small" color="primary" sx={{ height: 20 }} />}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{student.email}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={student.leetcode} size="small" color="default" title={student.leetcodeUsername || 'Not connected'} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={student.hackerrank} size="small" color="default" title={student.hackerrankUsername || 'Not connected'} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={student.codeforces} size="small" color="default" title={student.codeforcesUsername || 'Not connected'} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={student.appSolved || 0} size="small" color="default" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={student.totalSolved} 
                          color={isTopThree ? 'primary' : 'default'}
                          sx={{ fontWeight: 700, fontSize: '0.9rem' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => {
                            setSelectedStudent(student);
                            setStatsDialog(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
            />
          </Box>
        </>
      )}

      {/* Stats Detail Dialog */}
      <Dialog open={statsDialog} onClose={() => setStatsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
          {selectedStudent?.name} - Detailed Stats
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 3,
                mb: 3
              }}>
                {/* LeetCode */}
                <Paper sx={{ p: 3, bgcolor: '#FFA11620', border: '2px solid #FFA116' }}>
                  <Typography variant="h6" sx={{ color: '#FFA116', mb: 2, fontWeight: 700 }}>LeetCode</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Username: <strong>{selectedStudent.leetcodeUsername || 'Not connected'}</strong></Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Solved</Typography>
                    <Typography variant="h5" fontWeight={700}>{selectedStudent.leetcode}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Easy: {selectedStudent.leetcodeEasy || 0} | Medium: {selectedStudent.leetcodeMedium || 0} | Hard: {selectedStudent.leetcodeHard || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Ranking: {selectedStudent.leetcodeRanking || 'N/A'}</Typography>
                </Paper>

                {/* HackerRank */}
                <Paper sx={{ p: 3, bgcolor: '#00EA6420', border: '2px solid #00EA64' }}>
                  <Typography variant="h6" sx={{ color: '#00EA64', mb: 2, fontWeight: 700 }}>HackerRank</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Username: <strong>{selectedStudent.hackerrankUsername || 'Not connected'}</strong></Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Solved</Typography>
                    <Typography variant="h5" fontWeight={700}>{selectedStudent.hackerrank}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">Badges: {selectedStudent.hackerrankBadges || 0}</Typography>
                </Paper>

                {/* Codeforces */}
                <Paper sx={{ p: 3, bgcolor: '#1F8ACB20', border: '2px solid #1F8ACB' }}>
                  <Typography variant="h6" sx={{ color: '#1F8ACB', mb: 2, fontWeight: 700 }}>Codeforces</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Username: <strong>{selectedStudent.codeforcesUsername || 'Not connected'}</strong></Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Solved</Typography>
                    <Typography variant="h5" fontWeight={700}>{selectedStudent.codeforces}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Rating: {selectedStudent.codeforcesRating || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">Rank: {selectedStudent.codeforcesRank || 'unrated'}</Typography>
                </Paper>

                {/* App */}
                <Paper sx={{ p: 3, bgcolor: '#9c27b020', border: '2px solid #9c27b0' }}>
                  <Typography variant="h6" sx={{ color: '#9c27b0', mb: 2, fontWeight: 700 }}>{config?.appName || 'App'}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Solved</Typography>
                    <Typography variant="h5" fontWeight={700}>{selectedStudent.appSolved || 0}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">Problems solved in this platform</Typography>
                </Paper>
              </Box>

              {/* Summary */}
              <Paper sx={{ p: 3, bgcolor: 'primary.lighter' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>Overall Summary</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="primary" fontWeight={700}>{selectedStudent.totalSolved}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Problems</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="secondary" fontWeight={700}>#{selectedStudent.rank}</Typography>
                    <Typography variant="body2" color="text.secondary">Leaderboard Rank</Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Your Connected Accounts</Typography>
        {studentProfile?.codingProfiles?.leetcode?.connected && (
          <Typography variant="body2">LeetCode: {studentProfile.codingProfiles.leetcode.username} (Connected)</Typography>
        )}
        {studentProfile?.codingProfiles?.hackerrank?.connected && (
          <Typography variant="body2">HackerRank: {studentProfile.codingProfiles.hackerrank.username} (Connected)</Typography>
        )}
        {studentProfile?.codingProfiles?.codeforces?.connected && (
          <Typography variant="body2">Codeforces: {studentProfile.codingProfiles.codeforces.username} (Connected)</Typography>
        )}
      </Box>
    </MainCard>
  );
}
