// src/components/DBInitializer.js
import React, { useState } from 'react';
import { Button, Alert, Box, Typography, Paper, CircularProgress } from '@mui/material';
import initializeDatabase from '../utils/initializeDatabase';

const DBInitializer = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleInitialize = async () => {
    if (window.confirm('¿Estás seguro de querer inicializar la base de datos? Esta acción creará datos de ejemplo en Firebase.')) {
      setLoading(true);
      try {
        await initializeDatabase();
        setResult({
          success: true,
          message: 'Base de datos inicializada correctamente. Ahora puedes iniciar sesión con usuario: admin, contraseña: admin123'
        });
      } catch (error) {
        console.error('Error:', error);
        setResult({
          success: false,
          message: `Error al inicializar la base de datos: ${error.message}`
        });
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Inicializar Base de Datos de AgriCampo
        </Typography>
        
        <Typography variant="body1" paragraph>
          Este componente te permite crear un usuario administrador y datos de ejemplo para probar la aplicación.
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Credenciales del administrador:
          <br />
          Usuario: admin
          <br />
          Contraseña: admin123
        </Typography>
        
        {result && (
          <Alert severity={result.success ? 'success' : 'error'} sx={{ mb: 3 }}>
            {result.message}
          </Alert>
        )}
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleInitialize}
          disabled={loading}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : 'Inicializar Base de Datos'}
        </Button>
      </Paper>
    </Box>
  );
};

export default DBInitializer;