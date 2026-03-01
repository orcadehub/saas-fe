import { Link as RouterLink } from 'react-router-dom';
import { Box, Link, Stack, Typography, IconButton } from '@mui/material';
import { LinkedIn, Twitter, GitHub } from '@mui/icons-material';

export default function Footer() {
  return (
    <Box sx={{ bgcolor: '#f5f5f5', py: 2, mt: 'auto', borderTop: '1px solid #e0e0e0' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          &copy; {new Date().getFullYear()}{' '}
          <Link 
            href="https://orcadehub.com" 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ color: '#6a0dad', textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
          >
            Orcadehub Innovations LLP
          </Link>
          . All rights reserved.
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#0077b5' } }}>
            <LinkedIn fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#1da1f2' } }}>
            <Twitter fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#333' } }}>
            <GitHub fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
