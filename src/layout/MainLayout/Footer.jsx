import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', py: 2, mt: 'auto', bgcolor: 'secondary.light', mb: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '1rem' }}>
        &copy; 2026{' '}
        <Link 
          href="https://orcadehub.com" 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ color: '#6a0dad', textDecoration: 'none', fontSize: '1rem', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
        >
          Orcadehub Innovations LLP
        </Link>
        . All rights reserved.
      </Typography>
    </Stack>
  );
}
