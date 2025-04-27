// src/modules/campos/CamposList.js
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
import { getCampos, deleteCampo } from './CamposService';

const CamposList = () => {
  const navigate = useNavigate();
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCampos = async () => {
    try {
      setLoading(true);
      const data = await getCampos();
      setCampos(data);
      setError('');
    } catch (err) {
      console.error('Error al cargar campos:', err);
      setError('Error al cargar la lista de campos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampos();
  }, []);

  const handleAddCampo = () => {
    navigate('/campos/nuevo');
  };

  const handleEditCampo = (id) => {
    navigate(`/campos/editar/${id}`);
  };

  const handleDeleteCampo = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este campo?')) {
      try {
        await deleteCampo(id);
        // Recargar la lista después de eliminar
        loadCampos();
      } catch (err) {
        console.error('Error al eliminar campo:', err);
        setError('Error al eliminar el campo. Por favor, intenta de nuevo.');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Gestión de Campos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddCampo}
        >
          Nuevo Campo
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : campos.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              No hay campos registrados. Comienza creando uno nuevo.
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell>Superficie (ha)</TableCell>
                  <TableCell>Tipo de Cultivo</TableCell>
                  <TableCell>Fecha de Siembra</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campos.map((campo) => (
                  <TableRow hover key={campo.id}>
                    <TableCell>{campo.nombre}</TableCell>
                    <TableCell>{campo.ubicacion}</TableCell>
                    <TableCell>{campo.superficie}</TableCell>
                    <TableCell>{campo.tipoCultivo}</TableCell>
                    <TableCell>{campo.fechaSiembra}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditCampo(campo.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteCampo(campo.id)}
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

export default CamposList;