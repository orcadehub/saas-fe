import { Card, CardContent, Skeleton, Box } from '@mui/material';

export default function CardSkeleton({ count = 4 }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} sx={{ borderRadius: 4 }}>
          <CardContent>
            <Skeleton variant="rectangular" height={24} width="60%" sx={{ mb: 2 }} />
            <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} width="80%" sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={32} width="40%" />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
