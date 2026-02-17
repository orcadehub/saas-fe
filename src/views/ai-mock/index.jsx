import { Typography } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { Box, Skeleton } from '@mui/material';
import { useState } from 'react';

export default function AIMock() {
  const [loading, setLoading] = useState(false);

  return (
    <MainCard title="AI Mock Interviews">
      {loading ? (
        <Box>
          <Skeleton variant="text" height={40} width="60%" sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={150} />
        </Box>
      ) : (
      <Typography variant="body1">
        Practice with AI-powered mock interviews to prepare for real interviews.
      </Typography>
      )}
    </MainCard>
  );
}
