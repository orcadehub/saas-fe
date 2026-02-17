import { Box, Card, CardContent, Skeleton, Grid } from '@mui/material';

export default function DashboardSkeleton() {
  return (
    <Box>
      {/* Profile Header */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Skeleton variant="circular" width={80} height={80} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" height={32} width="40%" sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} width="60%" />
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2 }}>
        {Array.from({ length: 5 }).map((_, idx) => (
          <Card key={idx} sx={{ borderRadius: 4 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
              <Skeleton variant="text" height={40} width="60%" sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} width="80%" />
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Activity and Platforms */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
        <Box>
          <Skeleton variant="text" height={32} width="30%" sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
        </Box>
        <Box>
          <Skeleton variant="text" height={32} width="40%" sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
