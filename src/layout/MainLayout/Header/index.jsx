// material-ui
import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// project imports
import LogoSection from '../LogoSection';
import ProfileSection from './ProfileSection';
import apiService from 'services/apiService';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// assets
import { IconChevronLeft, IconChevronRight, IconUsers } from '@tabler/icons-react';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

export default function Header() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token) return;

    const fetchCount = async () => {
      try {
        await apiService.sendStudentHeartbeat(token);
        const res = await apiService.getActiveStudentCount(token);
        if (res && res.activeCount !== undefined) {
          setActiveCount(res.activeCount);
        }
      } catch (err) {
        console.error('Failed to update/fetch active count', err);
      }
    };

    fetchCount();
    const intervalId = setInterval(fetchCount, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {/* logo & toggler button */}
      <Box sx={{ width: downMD ? 'auto' : 260, display: 'flex' }}>
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>
      </Box>

      {/* header search / active count */}
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 2 }}>
        {activeCount > 0 && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            bgcolor: 'rgba(16, 185, 129, 0.1)', 
            color: '#10b981',
            px: 2, 
            py: 0.75, 
            borderRadius: '20px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <IconUsers size={18} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {activeCount} Active {activeCount === 1 ? 'Student' : 'Students'}
            </Typography>
            <Box sx={{
              width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', ml: 0.5,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
                '70%': { boxShadow: '0 0 0 4px rgba(16, 185, 129, 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' }
              }
            }} />
          </Box>
        )}
      </Box>

      {/* profile */}
      <ProfileSection />
    </>
  );
}
