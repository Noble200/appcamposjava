// src/modules/almacenes/ProductosList.js
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
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getProductos, deleteProducto, getAlmacenes } from './AlmacenesService';

const ProductosList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [productos, setProductos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtro, setFiltro] = useState({
    almacen: '',
    categoria: '',
    busqueda: ''
  });

  // Extraer almacenId de los parámetros de consulta
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const almacenId = searchParams.get('almacen');
    if (almacenId) {
      setFiltro(prev => ({ ...prev, almacen: almacenId }));
    }
  }, [location.search]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar productos y almacenes
      const [productosData, almacenesData] = await Promise.all([
        getProductos(),
        getAlmacenes()
      ]);
      
      // Enriquecer datos de productos con nombres de almacenes
      const productosEnriquecidos = productosData.map(producto => {
        const almacen = almacenesData.find(a => a.id === producto.almacenId);
        return {
          ...producto,
          almacenNombre: almacen ? almacen.nombre : 'Almacén no encontrado'
        };
      });
      
      setProductos(productosEnriquecidos);
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

  const handleAddProducto = () => {
    // Si hay un almacén seleccionado, pasar como parámetro
    if (filtro.almacen) {
      navigate(`/productos/nuevo?almacen=${filtro.almacen}`);
    } else {
      navigate('/productos/nuevo');
    }
  };

  const handleEditProducto = (id) => {
    navigate(`/productos/editar/${id}`);
  };

  const handleDeleteProducto = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProducto(id);
        loadData(); // Recargar la lista
      } catch (err) {
        console.error('Error al eliminar producto:', err);
        setError('Error al eliminar el producto. Por favor, intenta de nuevo.');
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
  const productosFiltrados = productos.filter(producto => {
    const coincideAlmacen = filtro.almacen === '' || producto.almacenId === filtro.almacen;
    const coincideCategoria = filtro.categoria === '' || producto.categoria === filtro.categoria;
    const coincideBusqueda = filtro.busqueda === '' || 
      producto.nombre.toLowerCase().includes(filtro.busqueda.toLowerCase()) || 
      (producto.lote && producto.lote.toLowerCase().includes(filtro.busqueda.toLowerCase()));
    
    return coincideAlmacen && coincideCategoria && coincideBusqueda;
  });

  // Paginación
  const productosPaginados = productosFiltrados
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Determinar si un producto está por debajo del stock mínimo
  const isBajoStock = (producto) => {
    return producto.stockMinimo && producto.cantidad <= producto.stockMinimo;
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
          {filtro.almacen ? `Productos en ${almacenes.find(a => a.id === filtro.almacen)?.nombre || 'Almacén'}` : 'Gestión de Productos'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CompareArrowsIcon />}
            onClick={() => navigate('/transferencias/nueva')}
          >
            Transferir Producto
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddProducto}
          >
            Nuevo Producto
          </Button>
        </Box>
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
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              name="categoria"
              value={filtro.categoria}
              label="Categoría"
              onChange={handleFiltroChange}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="Semilla">Semilla</MenuItem>
              <MenuItem value="Herbicida">Herbicida</MenuItem>
              <MenuItem value="Insecticida">Insecticida</MenuItem>
              <MenuItem value="Fungicida">Fungicida</MenuItem>
              <MenuItem value="Fertilizante">Fertilizante</MenuItem>
              <MenuItem value="Maquinaria">Maquinaria</MenuItem>
              <MenuItem value="Herramienta">Herramienta</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            sx={{ minWidth: 200, flexGrow: 1 }}
            name="busqueda"
            value={filtro.busqueda}
            onChange={handleFiltroChange}
            placeholder="Buscar por nombre o lote..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : productosFiltrados.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              No hay productos que coincidan con los filtros.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell>Almacén</TableCell>
                    <TableCell align="right">Stock Mínimo</TableCell>
                    <TableCell>Fecha Venc.</TableCell>
                    <TableCell>Lote</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productosPaginados.map((producto) => (
                    <TableRow 
                      hover 
                      key={producto.id}
                      sx={isBajoStock(producto) ? { backgroundColor: 'rgba(255, 0, 0, 0.1)' } : {}}
                    >
                      <TableCell>{producto.nombre}</TableCell>
                      <TableCell>{producto.categoria}</TableCell>
                      <TableCell align="right">
                        {`${producto.cantidad} ${producto.unidadMedida}`}
                      </TableCell>
                      <TableCell>{producto.almacenNombre}</TableCell>
                      <TableCell align="right">
                        {producto.stockMinimo ? `${producto.stockMinimo} ${producto.unidadMedida}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {producto.fechaVencimiento ? new Date(producto.fechaVencimiento).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>{producto.lote || 'N/A'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Transferir">
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/transferencias/nueva?producto=${producto.id}&almacen=${producto.almacenId}`)}
                          >
                            <CompareArrowsIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditProducto(producto.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteProducto(producto.id)}
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
              count={productosFiltrados.length}
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

export default ProductosList;