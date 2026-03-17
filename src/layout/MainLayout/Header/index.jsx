// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

// project imports
import LogoSection from '../LogoSection';
import ProfileSection from './ProfileSection';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// assets
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

export default function Header() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  return (
    <>
      {/* logo & toggler button */}
      <Box sx={{ width: downMD ? 'auto' : 260, display: 'flex' }}>
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>
        <Avatar
          variant="rounded"
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            bgcolor: 'rgba(99, 102, 241, 0.08)',
            color: '#6366f1',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            '&:hover': {
              bgcolor: '#6366f1',
              color: '#fff',
              transform: 'scale(1.05)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }
          }}
          onClick={() => handlerDrawerOpen(!drawerOpen)}
        >
          {drawerOpen ? <IconChevronLeft stroke={2} size="22px" /> : <IconChevronRight stroke={2} size="22px" />}
        </Avatar>
      </Box>

      {/* header search */}
      <Box sx={{ flexGrow: 1 }} />

      {/* profile */}
      <ProfileSection />
    </>
  );
}
