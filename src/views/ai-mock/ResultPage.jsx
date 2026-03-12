import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const score = location.state?.score || 0;

  return (
    <MainCard title="Interview Completed">
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h3" sx={{ mb: 2 }}>
          Congratulations!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You have successfully completed the mock interview
        </Typography>

        <Card sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>Your Score</Typography>
            <Typography variant="h2" color="primary">{score}%</Typography>
          </CardContent>
        </Card>

        <Button variant="contained" onClick={() => navigate('/ai-mock')}>
          Back to AI Mock
        </Button>
      </Box>
    </MainCard>
  );
}
