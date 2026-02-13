import { Box, Typography } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

export default function StudyMaterials() {
  return (
    <MainCard title="Study Materials">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Study Materials Coming Soon</Typography>
      </Box>
    </MainCard>
  );
}
