import { isRouteErrorResponse, useRouteError, useNavigate } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

// assets
import { IconHome, IconRefresh } from '@tabler/icons-react';

// ==============================|| ELEMENT ERROR - COMMON ||============================== //

export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const theme = useTheme();

  let errorTitle = 'Oops! Something went wrong';
  let errorMessage = 'We encountered an unexpected error. Please try again later.';
  let errorCode = '500';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      errorCode = '404';
      errorTitle = 'Page Not Found';
      errorMessage = "The page you're looking for doesn't exist or has been moved.";
    } else if (error.status === 401) {
      errorCode = '401';
      errorTitle = 'Unauthorized';
      errorMessage = "You aren't authorized to access this page.";
    } else if (error.status === 503) {
      errorCode = '503';
      errorTitle = 'Service Unavailable';
      errorMessage = 'Our service is temporarily unavailable. Please try again later.';
    } else if (error.status === 418) {
      errorCode = '418';
      errorTitle = 'Error Occurred';
      errorMessage = 'Please contact the administrator for assistance.';
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '80px', sm: '120px' },
              fontWeight: 700,
              color: 'primary.main',
              lineHeight: 1
            }}
          >
            {errorCode}
          </Typography>
          
          <Stack spacing={2}>
            <Typography variant="h2" sx={{ fontWeight: 600 }}>
              {errorTitle}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
              {errorMessage}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<IconHome />}
              onClick={() => navigate('/')}
            >
              Go Home
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<IconRefresh />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
