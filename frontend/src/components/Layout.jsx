import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OilBarrelIcon from '@mui/icons-material/OilBarrel';

function Layout({ children }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar sx={{ py: 2 }}>
          <OilBarrelIcon 
            sx={{ 
              mr: 2, 
              cursor: 'pointer',
              fontSize: '2rem',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'rotate(20deg) scale(1.1)',
              }
            }} 
            onClick={() => navigate('/')} 
          />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              cursor: 'pointer',
              fontWeight: 700,
              marginTop: 1,
              fontSize: '1.3rem',
              transition: 'opacity 0.3s ease',
              '&:hover': {
                opacity: 0.8,
              }
            }}
            onClick={() => navigate('/')}
          >
            💧 Well Log Analyzer
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
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderTop: '1px solid #cbd5e1',
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            Well Log Analysis System © 2026 | Powered by M Rahul Sree.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default Layout;
