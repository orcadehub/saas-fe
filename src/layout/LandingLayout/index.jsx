import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import AnimatedGridBackground from 'components/AnimatedGridBackground';
import StarryBackground from 'components/StarryBackground';
import CelestialCursor from 'components/CelestialCursor';
import DarkNavbar from 'components/DarkNavbar';
import tenantConfig from 'config/tenantConfig';

import { DashboardProvider } from 'contexts/DashboardContext';
import { AssessmentsProvider } from 'contexts/AssessmentsContext';

const LandingLayout = () => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  return (
    <DashboardProvider>
      <AssessmentsProvider>
        <Box sx={{ minHeight: '100vh', position: 'relative', bgcolor: '#f8fafc' }}>
          <AnimatedGridBackground />
          <StarryBackground />
          <CelestialCursor />
          <DarkNavbar config={config} />
          <Box component="main" sx={{ position: 'relative', zIndex: 1 }}>
            <Outlet />
          </Box>
        </Box>
      </AssessmentsProvider>
    </DashboardProvider>
  );
};

export default LandingLayout;
