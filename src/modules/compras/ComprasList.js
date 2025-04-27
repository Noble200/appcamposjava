// src/modules/compras/ComprasList.js
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
import ReceiptIcon from '@mui/icons-material/Receipt';
import { getCompras, deleteCompra } from './ComprasService';
import { getAlmacenes } from '../almacenes/AlmacenesService';

const ComprasList = () => {
  const navigate = useNavigate();
  const [compras, setCompras] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtro, setFiltro] = useState({
    estado: '',
    almacen: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar compras y almacenes
      const [comprasData, almacenesData] = await Promise.all([
        getCompras(),
        getAlmacenes()
      ]);
      
      // Enriquecer datos de compras con nombres de almacenes
      const comprasEnriquecidas = comprasData.map(compra => {
        const almacen = almacenesData.find(a => a.id === compra.almacenDestino);
        return {
          ...compra,
          almacenNombre: almacen ? almacen.nombre : 'Almacén no encontrado'
        };
      });
      
      setCompras(comprasEnriquecidas);
      setAlmacenes(almacenesData);
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

  const handleAddCompra = () => {
    navigate('/compras/nueva');
  };

  const handleEditCompra = (id) => {
    navigate(`/compras/editar/${id}`);
  };

  const handleDeleteCompra = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta compra?')) {
      try {
        await deleteCompra(id);
        loadData(); // Recargar la lista
      } catch (err) {
        console.error('Error al eliminar compra:', err);
        setError('Error al eliminar la compra. Por favor, intenta de nuevo.');
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
  const comprasFiltradas = compras.filter(compra => {
    return (
      (filtro.estado === '' || compra.estado === filtro.estado) &&
      (filtro.almacen === '' || compra.almacenDestino === filtro.almacen)
    );
  });

  // Paginación
  const comprasPaginadas = comprasFiltradas
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Obtener color según estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'Completado':
        return 'success';
      case 'Cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    
    const fechaObj = fecha instanceof Date 
      ? fecha 
      : new Date(fecha);
      
    return fechaObj.toLocaleDateString();
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
          Gestión de Compras
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddCompra}
        >
          Nueva Compra
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
            <InputLabel>Estado</InputLabel>
            <Select
              name="estado"
              value={filtro.estado}
              label="Estado"
              onChange={handleFiltroChange}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="Completado">Completado</MenuItem>
              <MenuItem value="Cancelado">Cancelado</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Almacén</InputLabel>
            <Select
              name="almacen"
              value={filtro.almacen}
              label="Almacén"
              onChange={handleFiltroChange}
            >
              <MenuItem value="">Todos</MenuItem>
              {almacenes.map(almacen => (
                <MenuItem key={almacen.id} value={almacen.id}>
                  {almacen.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : comprasFiltradas.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              No hay compras que coincidan con los filtros.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Proveedor</TableCell>
                    <TableCell>Fecha de Emisión</TableCell>
                    <TableCell>Fecha de Recepción</TableCell>
                    <TableCell>Almacén Destino</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comprasPaginadas.map((compra) => (
                    <TableRow hover key={compra.id}>
                      <TableCell>{compra.codigo}</TableCell>
                      <TableCell>{compra.proveedor}</TableCell>
                      <TableCell>{formatearFecha(compra.fechaEmision)}</TableCell>
                      <TableCell>{formatearFecha(compra.fechaRecepcion)}</TableCell>
                      <TableCell>{compra.almacenNombre}</TableCell>
                      <TableCell>${compra.total?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={compra.estado} 
                          color={getEstadoColor(compra.estado)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver detalles">
                          <IconButton
                            color="info"
                            onClick={() => handleEditCompra(compra.id)}
                          >
                            <ReceiptIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditCompra(compra.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteCompra(compra.id)}
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
              count={comprasFiltradas.length}
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

export default ComprasList;