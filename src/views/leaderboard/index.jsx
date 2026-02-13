import { Typography } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

export default function Leaderboard() {
  return (
    <MainCard title="Leaderboard">
      <Typography variant="body1">
        View rankings and scores here. Compete with other students!
      </Typography>
    </MainCard>
  );
}
