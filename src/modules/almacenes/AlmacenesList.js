// src/modules/almacenes/AlmacenesList.js
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
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import { getAlmacenes, deleteAlmacen } from './AlmacenesService';

const AlmacenesList = () => {
  const navigate = useNavigate();
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAlmacenes = async () => {
    try {
      setLoading(true);
      const data = await getAlmacenes();
      setAlmacenes(data);
      setError('');
    } catch (err) {
      console.error('Error al cargar almacenes:', err);
      setError('Error al cargar la lista de almacenes. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlmacenes();
  }, []);

  const handleAddAlmacen = () => {
    navigate('/almacenes/nuevo');
  };

  const handleEditAlmacen = (id) => {
    navigate(`/almacenes/editar/${id}`);
  };

  const handleViewProducts = (id) => {
    navigate(`/productos?almacen=${id}`);
  };

  const handleDeleteAlmacen = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este almacén? Esto eliminará también todos los productos asociados.')) {
      try {
        await deleteAlmacen(id);
        // Recargar la lista después de eliminar
        loadAlmacenes();
      } catch (err) {
        console.error('Error al eliminar almacén:', err);
        setError('Error al eliminar el almacén. Por favor, intenta de nuevo.');
      }
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
          Gestión de Almacenes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddAlmacen}
        >
          Nuevo Almacén
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ 
        width: '100%', 
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        mb: 3,
       }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : almacenes.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              No hay almacenes registrados. Comienza creando uno nuevo.
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Capacidad</TableCell>
                  <TableCell>Responsable</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {almacenes.map((almacen) => (
                  <TableRow hover key={almacen.id}>
                    <TableCell>{almacen.nombre}</TableCell>
                    <TableCell>{almacen.ubicacion}</TableCell>
                    <TableCell>{almacen.tipo}</TableCell>
                    <TableCell>{almacen.capacidad}</TableCell>
                    <TableCell>{almacen.responsable}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver Productos">
                        <IconButton
                          color="info"
                          onClick={() => handleViewProducts(almacen.id)}
                        >
                          <InventoryIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditAlmacen(almacen.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteAlmacen(almacen.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
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

export default AlmacenesList;