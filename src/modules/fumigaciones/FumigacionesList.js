// src/modules/fumigaciones/FumigacionesList.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  TablePagination,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { getFumigaciones, deleteFumigacion, cambiarEstadoFumigacion } from './FumigacionesService';
import { getCampos } from '../campos/CamposService';

const FumigacionesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [fumigaciones, setFumigaciones] = useState([]);
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtro, setFiltro] = useState({
    campo: '',
    estado: ''
  });

  // Extraer campoId de los parámetros de consulta
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const campoId = searchParams.get('campo');
    if (campoId) {
      setFiltro(prev => ({ ...prev, campo: campoId }));
    }
  }, [location.search]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar fumigaciones y campos
      const [fumigacionesData, camposData] = await Promise.all([
        getFumigaciones(),
        getCampos()
      ]);
      
      // Enriquecer datos de fumigaciones con nombres de campos
      const fumigacionesEnriquecidas = fumigacionesData.map(fumigacion => {
        const campo = camposData.find(c => c.id === fumigacion.campoId);
        return {
          ...fumigacion,
          campoNombre: campo ? campo.nombre : 'Campo no encontrado'
        };
      });
      
      setFumigaciones(fumigacionesEnriquecidas);
      setCampos(camposData);
      setError('');
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddFumigacion = () => {
    navigate('/fumigaciones/nueva');
  };

  const handleEditFumigacion = (id) => {
    navigate(`/fumigaciones/editar/${id}`);
  };

  const handleDeleteFumigacion = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta fumigación?')) {
      try {
        await deleteFumigacion(id);
        loadData(); // Recargar la lista
      } catch (err) {
        console.error('Error al eliminar fumigación:', err);
        setError('Error al eliminar la fumigación. Por favor, intenta de nuevo.');
      }
    }
  };

  const handleCompletarFumigacion = async (id) => {
    if (window.confirm('¿Confirmar esta fumigación como completada?')) {
      try {
        await cambiarEstadoFumigacion(id, 'Completada');
        loadData(); // Recargar la lista
      } catch (err) {
        console.error('Error al actualizar estado:', err);
        setError('Error al actualizar el estado. Por favor, intenta de nuevo.');
      }
    }
  };

  const handleCancelarFumigacion = async (id) => {
    if (window.confirm('¿Cancelar esta fumigación?')) {
      try {
        await cambiarEstadoFumigacion(id, 'Cancelada');
        loadData(); // Recargar la lista
      } catch (err) {
        console.error('Error al actualizar estado:', err);
        setError('Error al actualizar el estado. Por favor, intenta de nuevo.');
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltro({
      ...filtro,
      [name]: value
    });
    setPage(0); // Reiniciar a la primera página al filtrar
  };

  // Aplicar filtros
  const fumigacionesFiltradas = fumigaciones.filter(fumigacion => {
    return (
      (filtro.campo === '' || fumigacion.campoId === filtro.campo) &&
      (filtro.estado === '' || fumigacion.estado === filtro.estado)
    );
  });

  // Paginación
  const fumigacionesPaginadas = fumigacionesFiltradas
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Obtener color según estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'Completada':
        return 'success';
      case 'Cancelada':
        return 'error';
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
          Gestión de Fumigaciones
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddFumigacion}
        >
          Nueva Fumigación
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filtros */}
      <Paper sx={{ 
        width: '100%', 
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        mb: 3
       }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Campo</InputLabel>
            <Select
              name="campo"
              value={filtro.campo}
              label="Campo"
              onChange={handleFiltroChange}
            >
              <MenuItem value="">Todos</MenuItem>
              {campos.map(campo => (
                <MenuItem key={campo.id} value={campo.id}>
                  {campo.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              name="estado"
              value={filtro.estado}
              label="Estado"
              onChange={handleFiltroChange}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="Completada">Completada</MenuItem>
              <MenuItem value="Cancelada">Cancelada</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : fumigacionesFiltradas.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              No hay fumigaciones que coincidan con los filtros.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Campo</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell>Fumigador</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fumigacionesPaginadas.map((fumigacion) => (
                    <TableRow hover key={fumigacion.id}>
                      <TableCell>{fumigacion.campoNombre}</TableCell>
                      <TableCell>
                        {fumigacion.fecha instanceof Date 
                          ? fumigacion.fecha.toLocaleDateString() 
                          : new Date(fumigacion.fecha).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{fumigacion.producto}</TableCell>
                      <TableCell>{`${fumigacion.cantidad} ${fumigacion.unidad}`}</TableCell>
                      <TableCell>{fumigacion.fumigador}</TableCell>
                      <TableCell>
                        <Chip 
                          label={fumigacion.estado} 
                          color={getEstadoColor(fumigacion.estado)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="center">
                        {fumigacion.estado === 'Pendiente' && (
                          <>
                            <Tooltip title="Marcar como completada">
                              <IconButton
                                color="success"
                                onClick={() => handleCompletarFumigacion(fumigacion.id)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancelar fumigación">
                              <IconButton
                                color="error"
                                onClick={() => handleCancelarFumigacion(fumigacion.id)}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Editar">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditFumigacion(fumigacion.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteFumigacion(fumigacion.id)}
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
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={fumigacionesFiltradas.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default FumigacionesList;