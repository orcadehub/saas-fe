import PropTypes from 'prop-types';
import { Activity, useState } from 'react';

// material-ui
import { useColorScheme, useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import FontFamily from './FontFamily';
import BorderRadius from './BorderRadius';

import { DEFAULT_THEME_MODE } from 'config';
import MainCard from 'ui-component/cards/MainCard';
import AnimateButton from 'ui-component/extended/AnimateButton';
import SimpleBar from 'ui-component/third-party/SimpleBar';
import useConfig from 'hooks/useConfig';

// assets
import { IconSettings, IconPlus } from '@tabler/icons-react';

function CustomTabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      <Activity mode={value === index ? 'visible' : 'hidden'}>
        <Box>{children}</Box>
      </Activity>
    </div>
  );
}

export default function Customization() {
  return null;
}

CustomTabPanel.propTypes = { children: PropTypes.node, value: PropTypes.number, index: PropTypes.number, other: PropTypes.any };
