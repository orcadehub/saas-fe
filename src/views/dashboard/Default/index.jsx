import { useEffect, useState, useRef } from 'react';
import { Box, Avatar, Typography, IconButton, Tooltip, Card, CardContent } from '@mui/material';
import { Edit } from '@mui/icons-material';
import MainCard from 'ui-component/cards/MainCard';
import { useAuth } from 'contexts/AuthContext';
import { useDashboard } from 'contexts/DashboardContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { dashboardData, loading, fetchDashboardData } = useDashboard();
  const [stats, setStats] = useState({ appSolved: 0, rank: 0, assessments: 0, quizzes: 0, practice: 0, accuracy: 0, overall: 0 });
  const [activityData, setActivityData] = useState({});
  const [codingProfiles, setCodingProfiles] = useState({});
  const [createdAt, setCreatedAt] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.email) {
      fetchDashboardData().then(data => {
        if (data?.stats) {
          setStats({
            appSolved: data.stats.appSolved || 0,
            rank: data.stats.rank || 0,
            assessments: data.stats.assessments || 0,
            quizzes: data.stats.quizzes || 0,
            practice: data.stats.practice || 0,
            accuracy: data.stats.accuracy || 0,
            overall: data.stats.overall || 0
          });
          setActivityData(data.activityData || {});
          setCodingProfiles(data.codingProfiles || {});
          setCreatedAt(data.createdAt);
        }
      });
    }
  }, [user, fetchDashboardData]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Upload file:', file);
    }
  };

  return (
    <MainCard>
      {/* Profile Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar 
              src={user?.profile?.profilePic || user?.profilePic} 
              sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem', fontWeight: 700, color: 'white' }}
            >
              {!user?.profile?.profilePic && !user?.profilePic && (user?.name?.charAt(0).toUpperCase() || 'S')}
            </Avatar>
            <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImageUpload} />
            <IconButton 
              size="small" 
              onClick={() => fileInputRef.current?.click()}
              sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'rgba(0, 0, 0, 0.7)', color: 'white', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.9)' } }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 0.5 }}>{user?.name || 'Student'}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email || 'student@example.com'}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2 }}>
          {[
            { value: stats.assessments, label: 'Assessments', color: 'primary.main' },
            { value: stats.quizzes, label: 'Quizzes', color: 'secondary.main' },
            { value: stats.practice, label: 'Practice', color: 'success.main' },
            { value: `${stats.accuracy}%`, label: 'Accuracy', color: 'info.main' },
            { value: `${stats.overall}%`, label: 'Overall', color: 'error.main' }
          ].map((stat, idx) => (
            <Card key={idx} sx={{ cursor: 'default', transition: 'all 0.3s', borderRadius: 4, '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 3 }}>
                <Typography variant="h2" sx={{ fontWeight: 700, color: stat.color, mb: 1 }}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Activity Calendar and Connected Platforms */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>Activity Calendar</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Account created: {createdAt ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
          </Typography>
          <Box sx={{ overflowX: 'auto', pb: 2 }}>
            <Box sx={{ display: 'flex', gap: 3, minWidth: 'fit-content' }}>
              {Array.from({ length: 6 }).map((_, monthOffset) => {
                const monthDate = new Date();
                monthDate.setMonth(monthDate.getMonth() - (5 - monthOffset));
                const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
                const year = monthDate.getFullYear();
                const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
                const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
                
                return (
                  <Box key={monthOffset}>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block', color: 'text.secondary' }}>
                      {monthName} {year}
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 14px)', gap: 0.5 }}>
                      {Array.from({ length: firstDay }).map((_, i) => (
                        <Box key={`empty-${i}`} sx={{ width: 14, height: 14 }} />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, day) => {
                        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day + 1);
                        const dateStr = date.toISOString().split('T')[0];
                        const count = activityData[dateStr] || 0;
                        const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 9 ? 3 : 4;
                        const colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
                        return (
                          <Tooltip key={day} title={`${dateStr}: ${count} activities`} arrow>
                            <Box sx={{ width: 14, height: 14, bgcolor: colors[level], borderRadius: 0.5, cursor: 'pointer', '&:hover': { outline: '2px solid rgba(0,0,0,0.3)' } }} />
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
              <Typography variant="caption" color="text.secondary">Less</Typography>
              {[0, 1, 2, 3, 4].map(level => (
                <Box key={level} sx={{ width: 14, height: 14, bgcolor: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'][level], borderRadius: 0.5 }} />
              ))}
              <Typography variant="caption" color="text.secondary">More</Typography>
            </Box>
          </Box>
        </Box>

        <Box>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>Connected Platforms</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { name: 'LeetCode', username: codingProfiles?.leetcode?.username, connected: codingProfiles?.leetcode?.connected, color: '#FFA116' },
              { name: 'HackerRank', username: codingProfiles?.hackerrank?.username, connected: codingProfiles?.hackerrank?.connected, color: '#00EA64' },
              { name: 'Codeforces', username: codingProfiles?.codeforces?.username, connected: codingProfiles?.codeforces?.connected, color: '#1F8ACB' }
            ].map(platform => (
              <Box 
                key={platform.name} 
                sx={{ 
                  p: 1.5, 
                  bgcolor: platform.connected ? `${platform.color}15` : 'background.default',
                  borderRadius: 2, 
                  border: '2px solid', 
                  borderColor: platform.connected ? platform.color : 'divider',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: platform.connected ? platform.color : 'text.secondary' }}>
                    {platform.name}
                  </Typography>
                  <Box sx={{ px: 1, py: 0.25, borderRadius: 0.5, bgcolor: platform.connected ? 'success.main' : 'grey.400', color: 'white' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.6rem' }}>
                      {platform.connected ? 'CONNECTED' : 'NOT CONNECTED'}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {platform.connected ? `@${platform.username}` : 'Connect your account'}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </MainCard>
  );
}
