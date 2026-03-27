// material-ui
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// project imports
import LogoSection from '../LogoSection';
import ProfileSection from './ProfileSection';
import apiService from 'services/apiService';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// assets
import { IconChevronLeft, IconChevronRight, IconUsers } from '@tabler/icons-react';
import { Stars } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

const MotionBox = motion.create(Box);

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

export default function Header() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const [activeCount, setActiveCount] = useState(0);
  
  // Real-time notifications queue
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);
  const notificationTimerRef = useRef(null);

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

    // Setup Socket connection for global achievements
    const socketUrl = import.meta.env.DEV ? 'http://localhost:4000' : 'https://backend.orcode.in';
    socketRef.current = io(socketUrl, {
      transports: ['websocket'],
      upgrade: false
    });
    
    socketRef.current.on('practice_completion', (data) => {
      setNotifications(prev => [...prev, data]);
    });

    return () => {
      clearInterval(intervalId);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (notifications.length > 0 && !notificationTimerRef.current) {
        notificationTimerRef.current = setTimeout(() => {
            setNotifications(prev => prev.slice(1));
            notificationTimerRef.current = null;
        }, 5000);
    }
  }, [notifications]);

  return (
    <>
      {/* logo & toggler button */}
      <Box sx={{ width: downMD ? 'auto' : 260, display: 'flex' }}>
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>
      </Box>

      {/* Real-time Achievement Marquee (Global) */}
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, overflow: 'hidden', height: 40 }}>
         <AnimatePresence mode="wait">
            {notifications.length > 0 && (
               <MotionBox 
                 key={notifications[0].username + notifications[0].problemTitle + notifications[0].timestamp}
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: -20, opacity: 0 }}
                 transition={{ duration: 0.5, ease: "easeOut" }}
                 sx={{ 
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    bgcolor: 'rgba(52, 211, 153, 0.12)',
                    px: 3, py: 0.5, borderRadius: '25px', 
                    border: '1px solid rgba(52, 211, 153, 0.25)',
                    boxShadow: '0 4px 15px rgba(52, 211, 153, 0.1)'
                 }}
               >
                 <Avatar sx={{ width: 22, height: 22, bgcolor: '#34d399', fontSize: 10, fontWeight: 800 }}>{notifications[0].username?.[0]}</Avatar>
                 <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    <Box component="span" sx={{ color: '#10b981' }}>{notifications[0].username}</Box> mastered 
                    <Box component="span" sx={{ color: '#6366f1', ml: 0.5 }}>{notifications[0].problemTitle}</Box>
                 </Typography>
                 <Stack direction="row" spacing={0.5} alignItems="center">
                    <Stars sx={{ fontSize: 16, color: '#fbbf24' }} />
                    <Typography sx={{ color: '#f59e0b', fontWeight: 900, fontSize: '0.85rem' }}>+{notifications[0].coins}</Typography>
                 </Stack>
               </MotionBox>
            )}
         </AnimatePresence>
      </Box>

      {/* active count & profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {activeCount > 0 && (
          <Box sx={{ 
            display: { xs: 'none', sm: 'flex' }, 
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
              {activeCount} {activeCount === 1 ? 'Student' : 'Students'}
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
        <ProfileSection />
      </Box>
    </>
  );
}
