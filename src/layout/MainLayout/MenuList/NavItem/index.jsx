import PropTypes from 'prop-types';
import { Activity, useEffect, useRef, useState } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project imports
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import useConfig from 'hooks/useConfig';

// assets
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

export default function NavItem({ item, level, isParents = false, setSelectedID }) {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));
  const ref = useRef(null);

  const { pathname } = useLocation();
  const {
    state: { borderRadius }
  } = useConfig();

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  
  let isSelected = !!matchPath({ path: item?.link ? item.link : item.url, end: false }, pathname);

  if (isSelected && item.excludeFromActive) {
    if (item.excludeFromActive.some((excludePath) => pathname.startsWith(excludePath))) {
      isSelected = false;
    }
  }

  const [hoverStatus, setHover] = useState(false);

  const compareSize = () => {
    const compare = ref.current && ref.current.scrollWidth > ref.current.clientWidth;
    setHover(compare);
  };

  useEffect(() => {
    compareSize();
    window.addEventListener('resize', compareSize);
    window.removeEventListener('resize', compareSize);
  }, []);

  const Icon = item?.icon;
  const itemIcon = item?.icon ? (
    <Icon stroke={1.5} size={drawerOpen ? '20px' : '24px'} style={{ ...(isParents && { fontSize: 20, stroke: '1.5' }) }} />
  ) : (
    <FiberManualRecordIcon sx={{ width: isSelected ? 8 : 6, height: isSelected ? 8 : 6 }} fontSize={level > 0 ? 'inherit' : 'medium'} />
  );

  let itemTarget = '_self';
  if (item.target) {
    itemTarget = '_blank';
  }

  const itemHandler = () => {
    if (downMD) handlerDrawerOpen(false);

    if (isParents && setSelectedID) {
      setSelectedID();
    }
  };

  return (
    <>
      <ListItemButton
        component={Link}
        to={item.url}
        target={itemTarget}
        disabled={item.disabled}
        disableRipple={!drawerOpen}
        sx={{
          zIndex: 1201,
          borderRadius: '12px',
          mb: 0.5,
          mx: 1,
          width: 'calc(100% - 16px)',
          py: 1,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(drawerOpen && level !== 1 && { ml: `${level * 18}px` }),
          ...(!drawerOpen && { pl: 1.25 }),
          '&:hover': {
            bgcolor: 'rgba(99, 102, 241, 0.04)'
          },
          '&.Mui-selected': {
            bgcolor: 'rgba(99, 102, 241, 0.08)',
            color: '#6366f1',
            '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.12)' }
          }
        }}
        selected={isSelected}
        onClick={() => itemHandler()}
      >
        <Tooltip title={!drawerOpen && level === 1 ? item.title : ''} placement="right">
          <ListItemIcon
            sx={{
              minWidth: level === 1 ? 36 : 18,
              color: isSelected ? '#6366f1' : '#64748b',
              transition: 'color 0.3s',
              ...(!drawerOpen &&
                level === 1 && {
                  borderRadius: '12px',
                  width: 44,
                  height: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.08)' },
                  ...(isSelected && {
                    bgcolor: 'rgba(99, 102, 241, 0.08)',
                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.12)' }
                  })
                })
            }}
          >
            {itemIcon}
          </ListItemIcon>
        </Tooltip>

        {(drawerOpen || (!drawerOpen && level !== 1)) && (
          <Tooltip title={item.title} disableHoverListener={!hoverStatus}>
            <ListItemText
              primary={
                <Typography
                  ref={ref}
                  noWrap
                  variant={isSelected ? 'subtitle1' : 'body2'}
                  sx={{
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.875rem',
                    color: 'inherit',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {item.title}
                </Typography>
              }
              secondary={
                item.caption && (
                  <Typography
                    variant="caption"
                    gutterBottom
                    sx={{
                      display: 'block',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'none',
                      lineHeight: 1.5,
                      mt: 0.5
                    }}
                  >
                    {item.caption}
                  </Typography>
                )
              }
            />
          </Tooltip>
        )}

        <Activity mode={drawerOpen && item.chip ? 'visible' : 'hidden'}>
          <Chip
            color={item.chip?.color}
            variant={item.chip?.variant}
            size={item.chip?.size}
            label={item.chip?.label}
            avatar={
              <Activity mode={item.chip?.avatar ? 'visible' : 'hidden'}>
                <Avatar>{item.chip?.avatar}</Avatar>
              </Activity>
            }
          />
        </Activity>
      </ListItemButton>
    </>
  );
}

NavItem.propTypes = { item: PropTypes.any, level: PropTypes.number, isParents: PropTypes.bool, setSelectedID: PropTypes.func };
