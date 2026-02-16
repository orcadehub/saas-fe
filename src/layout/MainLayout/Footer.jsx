import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', py: 2, mt: 'auto', bgcolor: 'secondary.light', mb: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        &copy; 2026 Orcadehub Innovations LLP. All rights reserved.
      </Typography>
    </Stack>
  );
}
