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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tenantConfig.load()
      .then((res) => {
        setConfig(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <Link component={RouterLink} to={DASHBOARD_PATH} aria-label="theme-logo">
      {loading ? (
        <Logo width="50" />
      ) : config?.logoUrl ? (
        <Box 
          component="img"
          src={config.logoUrl}
          alt="Logo"
          sx={{ 
            height: 44, 
            maxWidth: 150, 
            objectFit: 'contain',
            borderRadius: '12px'
          }}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      ) : (
        <Logo width="100" />
      )}
    </Link>
  );
}
