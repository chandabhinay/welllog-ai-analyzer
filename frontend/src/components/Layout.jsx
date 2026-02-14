import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OilBarrelIcon from '@mui/icons-material/OilBarrel';

function Layout({ children }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <OilBarrelIcon sx={{ mr: 2, cursor: 'pointer' }} onClick={() => navigate('/')} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Well Log Analysis System
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 2, 
          mt: 'auto', 
          backgroundColor: (theme) => theme.palette.grey[200] 
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            Well Log Analysis System © 2026
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default Layout;
