// src/components/common/Header.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

const Header = ({ toggleSidebar, onLogout }) => {
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="abrir menú"
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sistema de Gestión de Campos AgriCampo
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {userData.nombre || 'Usuario'} | {userData.tipo || 'Admin'}
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<LogoutIcon />}
            onClick={onLogout}
          >
            Salir
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;