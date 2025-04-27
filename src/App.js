import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Componentes comunes
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';

// Páginas de módulos
import Dashboard from './modules/dashboard/Dashboard';
import CamposList from './modules/campos/CamposList';
import CampoForm from './modules/campos/CampoForm';
import AlmacenesList from './modules/almacenes/AlmacenesList';
import AlmacenForm from './modules/almacenes/AlmacenForm';
import TransferenciasList from './modules/almacenes/TransferenciasList'
import ProductosList from './modules/almacenes/ProductosList';
import ProductoForm from './modules/almacenes/ProductoForm';
import FumigacionesList from './modules/fumigaciones/FumigacionesList';
import FumigacionForm from './modules/fumigaciones/FumigacionForm';
import ComprasList from './modules/compras/ComprasList';
import CompraForm from './modules/compras/CompraForm';
import ReportesList from './modules/reportes/ReportesList';
import UsuariosList from './modules/usuarios/UsuariosList';
import UsuarioForm from './modules/usuarios/UsuarioForm';
import Login from './modules/auth/Login';

// Inicializador de base de datos
import DBInitializer from './components/DBInitializer';

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#2c5e1a', // Verde agrícola
    },
    secondary: {
      main: '#e7f3e4', // Verde claro
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('user') !== null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {isLoggedIn ? (
          <Box sx={{ display: 'flex' }}>
            <Sidebar open={sidebarOpen} />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                width: { sm: `calc(100% - ${sidebarOpen ? 240 : 60}px)` },
                ml: { sm: `${sidebarOpen ? 240 : 60}px` },
                transition: 'margin 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                maxWidth: '1200px',
                mx: 'auto',
              }}
            >
              <Header toggleSidebar={toggleSidebar} onLogout={handleLogout} />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                
                {/* Rutas de Campos */}
                <Route path="/campos" element={<CamposList />} />
                <Route path="/campos/nuevo" element={<CampoForm />} />
                <Route path="/campos/editar/:id" element={<CampoForm />} />
                
                {/* Rutas de Almacenes */}
                <Route path="/almacenes" element={<AlmacenesList />} />
                <Route path="/almacenes/nuevo" element={<AlmacenForm />} />
                <Route path="/almacenes/editar/:id" element={<AlmacenForm />} />
                <Route path="/productos" element={<ProductosList />} />
                <Route path="/productos/nuevo" element={<ProductoForm />} />
                <Route path="/productos/editar/:id" element={<ProductoForm />} />

                {/* Rutas de Transferencias */}
                <Route path="/transferencias" element={<TransferenciasList />} />
                
                {/* Rutas de Fumigaciones */}
                <Route path="/fumigaciones" element={<FumigacionesList />} />
                <Route path="/fumigaciones/nueva" element={<FumigacionForm />} />
                <Route path="/fumigaciones/editar/:id" element={<FumigacionForm />} />
                
                {/* Rutas de Compras */}
                <Route path="/compras" element={<ComprasList />} />
                <Route path="/compras/nueva" element={<CompraForm />} />
                <Route path="/compras/editar/:id" element={<CompraForm />} />
                
                {/* Rutas de Reportes */}
                <Route path="/reportes" element={<ReportesList />} />
                
                {/* Rutas de Usuarios */}
                <Route path="/usuarios" element={<UsuariosList />} />
                <Route path="/usuarios/nuevo" element={<UsuarioForm />} />
                <Route path="/usuarios/editar/:id" element={<UsuarioForm />} />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Box>
          </Box>
        ) : (
          <Routes>
            <Route path="/init-db" element={<DBInitializer />} />
            <Route path="*" element={<Login onLogin={handleLogin} />} />
          </Routes>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;