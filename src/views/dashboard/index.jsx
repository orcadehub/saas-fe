import { Typography, Grid, Card, CardContent } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

export default function Dashboard() {
  return (
    <MainCard title="Dashboard">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="body1">
            Welcome to your Dashboard! This is where you'll see your learning progress and statistics.
          </Typography>
        </Grid>
      </Grid>
    </MainCard>
  );
}
