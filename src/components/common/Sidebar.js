// src/components/common/Sidebar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Toolbar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import SanitizerIcon from '@mui/icons-material/Sanitizer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';

const Sidebar = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { text: 'Panel Principal', icon: <DashboardIcon />, path: '/' },
    { text: 'Campos', icon: <AgricultureIcon />, path: '/campos' },
    { text: 'Almacenes', icon: <WarehouseIcon />, path: '/almacenes' },
    { text: 'Transferencias', icon: <CompareArrowsIcon />, path: '/transferencias' },
    { text: 'Productos', icon: <InventoryIcon />, path: '/productos' },
    { text: 'Fumigaciones', icon: <SanitizerIcon />, path: '/fumigaciones' },
    { text: 'Compras', icon: <ShoppingCartIcon />, path: '/compras' },
    { text: 'Reportes', icon: <AssessmentIcon />, path: '/reportes' },
    { text: 'Usuarios', icon: <PeopleIcon />, path: '/usuarios' },
  ];
  
  const drawerWidth = open ? 240 : 60;

  // Función para verificar si un elemento del menú está activo
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          transition: 'width 0.2s',
          overflowX: 'hidden'
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        {open && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Typography variant="h6" color="primary">
              AgriCampo
            </Typography>
          </Box>
        )}
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  backgroundColor: isActive(item.path) ? 'rgba(44, 94, 26, 0.1)' : 'transparent',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(44, 94, 26, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(44, 94, 26, 0.3)',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: isActive(item.path) ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    color: isActive(item.path) ? 'primary.main' : 'inherit',
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;