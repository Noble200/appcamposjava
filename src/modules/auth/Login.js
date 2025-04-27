// src/modules/auth/Login.js
import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert
} from '@mui/material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // En un entorno real, implementarías una validación más segura
      // Por ahora, buscaremos un usuario que coincida en Firestore
      const usuariosRef = collection(db, 'usuarios');
      const q = query(
        usuariosRef,
        where('username', '==', credentials.username),
        where('password', '==', credentials.password)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        const userId = querySnapshot.docs[0].id;
        
        // Llamar a la función onLogin del App.js
        onLogin({ id: userId, ...userData });
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Error al iniciar sesión. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Para simplificar el inicio durante el desarrollo
  const handleDemoLogin = () => {
    onLogin({
      id: 'admin1',
      nombre: 'Administrador',
      tipo: 'administrador',
      permisos: ['todos']
    });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography component="h1" variant="h5" color="primary" sx={{ mb: 3 }}>
            Sistema de Gestión AgriCampo
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Usuario"
              name="username"
              autoComplete="username"
              autoFocus
              value={credentials.username}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
            
            {/* Botón para inicio rápido durante desarrollo */}
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 1 }}
              onClick={handleDemoLogin}
            >
              Modo Demo (Sin Firebase)
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;