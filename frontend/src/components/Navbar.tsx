import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import SportsMotorsportsIcon from '@mui/icons-material/SportsMotorsports';

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#E10600', mb: 3 }}>
      <Toolbar>
        <SportsMotorsportsIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          F1 Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {new Date().getFullYear()} Season
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
