import { Link as RouterLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

// material-ui
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

// project imports
import { DASHBOARD_PATH } from 'config';
import Logo from 'ui-component/Logo';
import tenantConfig from 'config/tenantConfig';

// ==============================|| MAIN LOGO ||============================== //

export default function LogoSection() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    tenantConfig.load().then(setConfig).catch(console.error);
  }, []);

  return (
    <Link component={RouterLink} to={DASHBOARD_PATH} aria-label="theme-logo">
      {config?.logoUrl ? (
        <Box 
          component="img"
          src={config.logoUrl}
          alt="Logo"
          sx={{ 
            height: 40, 
            maxWidth: 150, 
            objectFit: 'contain'
          }}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      ) : (
        <Logo />
      )}
    </Link>
  );
}
