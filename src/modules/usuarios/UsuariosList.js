// src/modules/usuarios/UsuariosList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Paper,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getUsuarios, deleteUsuario } from './UsuariosService';

const UsuariosList = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Verificar si el usuario actual es administrador para permitir acciones
  const usuarioActual = JSON.parse(localStorage.getItem('user') || '{}');
  const esAdmin = usuarioActual.tipo === 'administrador';

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getUsuarios();
      setUsuarios(data);
      setError('');
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar la lista de usuarios. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const handleAddUsuario = () => {
    navigate('/usuarios/nuevo');
  };

  const handleEditUsuario = (id) => {
    navigate(`/usuarios/editar/${id}`);
  };

  const handleDeleteUsuario = async (id) => {
    // No permitir eliminar al usuario actual
    if (id === usuarioActual.id) {
      setError('No puedes eliminar tu propio usuario.');
      return;
    }
    
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await deleteUsuario(id);
        loadUsuarios(); // Recargar la lista
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
        setError('Error al eliminar el usuario. Por favor, intenta de nuevo.');
      }
    }
  };

  // Obtener color según tipo de usuario
  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'administrador':
        return 'primary';
      case 'fumigador':
        return 'warning';
      case 'controlador':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '1200px', 
      mx: 'auto',
      px: { xs: 1, sm: 2, md: 3 }
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Gestión de Usuarios
        </Typography>
        {esAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddUsuario}
          >
            Nuevo Usuario
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {!esAdmin && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Solo los administradores pueden crear, editar o eliminar usuarios.
        </Alert>
      )}

      <Paper sx={{ 
        width: '100%', 
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        mb: 3
       }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : usuarios.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              No hay usuarios registrados.
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Permisos</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow hover key={usuario.id}>
                    <TableCell>{usuario.nombre}</TableCell>
                    <TableCell>{usuario.username}</TableCell>
                    <TableCell>
                      <Chip 
                        label={usuario.tipo} 
                        color={getTipoColor(usuario.tipo)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {usuario.permisos && usuario.permisos.map((permiso, index) => (
                        <Chip 
                          key={index}
                          label={permiso} 
                          size="small" 
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell align="center">
                      {esAdmin && (
                        <>
                          <Tooltip title="Editar">
                            <IconButton
                              color="primary"
                              onClick={() => handleEditUsuario(usuario.id)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteUsuario(usuario.id)}
                              disabled={usuario.id === usuarioActual.id}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default UsuariosList;