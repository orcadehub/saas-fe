// material-ui
import { useTheme } from '@mui/material/styles';

// project imports

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

export default function Logo() {
  const theme = useTheme();

  return (
    <img 
      src="https://coffee-geographical-ape-289.mypinata.cloud/ipfs/bafkreiessacdj36snko5sal2hv4wjz5533ou2hhx3mwcyq7gc2jlrl7m7e" 
      alt="Orcode" 
      width="100" 
      style={{ objectFit: 'contain' }}
    />
  );
}
