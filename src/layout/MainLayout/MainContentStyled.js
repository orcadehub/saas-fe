// material-ui
import { styled } from '@mui/material/styles';

// project imports
import { drawerWidth } from 'store/constant';

// ==============================|| MAIN LAYOUT - STYLED ||============================== //

const MainContentStyled = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'borderRadius'
})(({ theme, open, borderRadius }) => ({
  backgroundColor: '#fbfcfe',
  minWidth: '1%',
  width: '100%',
  minHeight: 'calc(100vh - 80px)',
  flexGrow: 1,
  padding: '24px',
  marginTop: 80,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter + 200
  }),
  [theme.breakpoints.up('md')]: {
    marginLeft: open ? 0 : -(drawerWidth - 72),
    width: `calc(100% - ${drawerWidth}px)`,
    borderRadius: '24px',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    padding: '20px',
    marginTop: 80,
    width: '100%'
  }
}));

export default MainContentStyled;
