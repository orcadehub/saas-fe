import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import UpgradePlanCard from './UpgradePlanCard';
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import useConfig from 'hooks/useConfig';

// assets
import User1 from 'assets/images/users/user-round.svg';
import { IconLogout, IconSearch, IconSettings, IconUser } from '@tabler/icons-react';

// ==============================|| PROFILE MENU ||============================== //

export default function ProfileSection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    state: { borderRadius }
  } = useConfig();

  const [sdm, setSdm] = useState(true);
  const [value, setValue] = useState('');
  const [notification, setNotification] = useState(false);
  const [open, setOpen] = useState(false);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('studentData');
    if (data) {
      setStudentData(JSON.parse(data));
    }
  }, []);

  /**
   * anchorRef is used on different components and specifying one type leads to other components throwing an error
   * */
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleLogout = () => {
    setOpen(false);
    navigate('/');
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Chip
        slotProps={{ label: { sx: { lineHeight: 0 } } }}
        sx={{ 
          ml: 2, 
          height: '48px', 
          alignItems: 'center', 
          borderRadius: '27px', 
          bgcolor: '#6366f1 !important',
          color: '#fff !important',
          border: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: '#4f46e5 !important'
          }
        }}
        icon={
          <Avatar
            src={studentData?.profile?.profilePic || studentData?.profilePic}
            alt="user-images"
            sx={{ 
              typography: 'mediumAvatar', 
              margin: '8px 0 8px 8px !important', 
              cursor: 'pointer', 
              bgcolor: 'rgba(255, 255, 255, 0.2)', 
              color: '#fff !important'
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
          >
            {!studentData?.profile?.profilePic && !studentData?.profilePic && (studentData?.name?.charAt(0).toUpperCase() || 'U')}
          </Avatar>
        }
        label={<IconSettings stroke={2} size="22px" style={{ color: '#fff' }} />}
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        aria-label="user-account"
      />
      <Popper
        placement="bottom"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 14]
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper>
                {open && (
                  <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                    <Box sx={{ p: 2.5, pb: 0 }}>
                      <Stack>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>Good Morning,</Typography>
                          <Typography component="span" variant="h4" sx={{ fontWeight: 800, color: '#6366f1' }}>
                            {studentData?.name?.split(' ')[0] || 'User'}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, mt: 0.5 }}>{studentData?.email || ''}</Typography>
                      </Stack>
                      <Divider sx={{ mt: 2.5, opacity: 0.6 }} />
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        py: 0,
                        height: '100%',
                        maxHeight: 'calc(100vh - 250px)',
                        overflowX: 'hidden',
                        '&::-webkit-scrollbar': { width: 5 }
                      }}
                    >
                      <List
                        component="nav"
                        sx={{
                          width: '100%',
                          maxWidth: 350,
                          minWidth: 300,
                          borderRadius: `${borderRadius}px`,
                          '& .MuiListItemButton-root': { mt: 0.5 }
                        }}
                      >
                        <ListItemButton sx={{ borderRadius: '12px', mb: 0.5, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.04)' } }}>
                          <ListItemIcon sx={{ color: '#64748b', minWidth: 40 }}>
                            <IconSettings stroke={2} size="18px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>Account Settings</Typography>} />
                        </ListItemButton>
                        <ListItemButton sx={{ borderRadius: '12px', mb: 0.5, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.04)' } }}>
                          <ListItemIcon sx={{ color: '#64748b', minWidth: 40 }}>
                            <IconUser stroke={2} size="18px" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>Social Profile</Typography>
                                <Chip
                                  label="New"
                                  size="small"
                                  sx={{ 
                                    height: 20, 
                                    bgcolor: 'rgba(245, 158, 11, 0.12)', 
                                    color: '#f59e0b', 
                                    fontWeight: 800, 
                                    fontSize: '0.625rem' 
                                  }}
                                />
                              </Stack>
                            }
                          />
                        </ListItemButton>
                        <Divider sx={{ my: 1, opacity: 0.6 }} />
                        <ListItemButton 
                          sx={{ 
                            borderRadius: '12px',
                            color: '#ef4444',
                            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.05)' }
                          }} 
                          onClick={handleLogout}
                        >
                          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                            <IconLogout stroke={2} size="18px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography sx={{ fontWeight: 800, fontSize: '0.875rem' }}>Logout</Typography>} />
                        </ListItemButton>
                      </List>
                    </Box>
                  </MainCard>
                )}
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
