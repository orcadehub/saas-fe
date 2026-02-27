import { useEffect, useState } from 'react';
import { Grid, Typography, Card, CardContent, Box } from '@mui/material';
import { IconUsers, IconClipboardList, IconChartBar } from '@tabler/icons-react';

const InstructorDashboard = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('userData');
    if (data) {
      setUserData(JSON.parse(data));
    }
  }, []);

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 3 }}>
        Welcome back, {userData?.name || 'Instructor'}!
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconUsers size={32} />
                <Typography variant="h4" sx={{ ml: 2 }}>Students</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Typography variant="body2" color="textSecondary">Total Students</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconClipboardList size={32} />
                <Typography variant="h4" sx={{ ml: 2 }}>Assessments</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Typography variant="body2" color="textSecondary">Active Assessments</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconChartBar size={32} />
                <Typography variant="h4" sx={{ ml: 2 }}>Reports</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Typography variant="body2" color="textSecondary">Pending Reviews</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InstructorDashboard;
