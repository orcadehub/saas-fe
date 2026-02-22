import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PublicHeader from 'components/PublicHeader';
import tenantConfig from 'config/tenantConfig';

// project imports
import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';

import Logo from 'ui-component/Logo';
import AuthFooter from 'ui-component/cards/AuthFooter';
import AuthLogin from '../auth-forms/AuthLogin';

// ================================|| AUTH3 - LOGIN ||================================ //

export default function Login() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [config, setConfig] = useState(null);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  return (
    <Box sx={{ height: '100vh', bgcolor: '#f8fafc', overflow: 'hidden' }}>
      <PublicHeader />
      <AuthWrapper1 sx={{ minHeight: 'calc(100vh - 76px)', height: 'calc(100vh - 76px)' }}>
        <Stack
          sx={{
            minHeight: 'calc(100vh - 76px)',
            height: 'calc(100vh - 76px)',
            justifyContent: 'center',
            alignItems: 'center',
            px: { xs: 1, sm: 2 },
            py: { xs: 1.5, sm: 2 },
            overflow: 'hidden',
            pb: { xs: 6, sm: 7 }
          }}
        >
          <Box sx={{ width: 1, maxWidth: 540 }}>
            <AuthCardWrapper
              sx={{
                maxHeight: { xs: 'calc(100vh - 108px)', sm: 'calc(100vh - 120px)' },
                overflow: 'auto',
                '& .MuiCardContent-root': {
                  p: { xs: 2.25, sm: 3.25 }
                }
              }}
            >
              <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Box sx={{ mb: 1.5 }}>
                  {config?.logoUrl ? (
                    <Box
                      component="img"
                      src={config.logoUrl}
                      alt="Logo"
                      sx={{
                        height: { xs: 52, sm: 62 },
                        maxWidth: { xs: 180, sm: 220 },
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Link to="#" aria-label="logo">
                      <Logo />
                    </Link>
                  )}
                </Box>

                <Stack sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
                  <Typography variant={downMD ? 'h3' : 'h2'} sx={{ color: 'secondary.main', textAlign: 'center' }}>
                    Hi, Welcome Back
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '15px', textAlign: 'center' }}>
                    Enter your credentials to continue
                  </Typography>
                </Stack>

                <Box sx={{ width: 1 }}>
                  <AuthLogin />
                </Box>
              </Stack>
            </AuthCardWrapper>
          </Box>
        </Stack>

        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: { xs: 8, sm: 12 },
            px: 2
          }}
        >
          <AuthFooter />
        </Box>
      </AuthWrapper1>
    </Box>
  );
}
