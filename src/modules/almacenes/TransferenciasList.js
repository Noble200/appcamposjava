// src/modules/almacenes/TransferenciasList.js
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
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import PrintIcon from '@mui/icons-material/Print';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { 
  getAlmacenes, 
  getProductos, 
  getTransferencias, 
  transferirProducto 
} from './AlmacenesService';
import { exportarPDF, exportarExcel } from '../../utils/exportUtils';

const TransferenciasList = () => {
  const navigate = useNavigate();
  const [transferencias, setTransferencias] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Estado para filtros
  const [filtros, setFiltros] = useState({
    almacenOrigenId: '',
    almacenDestinoId: '',
    fechaInicio: '',
    fechaFin: ''
  });
  
  // Estado para diálogo de nueva transferencia
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    almacenOrigenId: '',
    almacenDestinoId: '',
    productoId: '',
    cantidad: '',
    observaciones: ''
  });
  const [productosOrigen, setProductosOrigen] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [realizandoTransferencia, setRealizandoTransferencia] = useState(false);
  
  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar transferencias, almacenes y productos
      const [transferenciasData, almacenesData, productosData] = await Promise.all([
        getTransferencias(filtros),
        getAlmacenes(),
        getProductos()
      ]);
      
      // Enriquecer datos de transferencias con nombres
      const transferenciasEnriquecidas = transferenciasData.map(transferencia => {
        return {
          ...transferencia,
          // Los nombres ya vienen en el objeto de transferencia
        };
      });
      
      setTransferencias(transferenciasEnriquecidas);
      setAlmacenes(almacenesData);
      setProductos(productosData);
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
  
  // Aplicar filtros
  const handleAplicarFiltros = async () => {
    try {
      setLoading(true);
      const transferenciasData = await getTransferencias(filtros);
      
      setTransferencias(transferenciasData);
      setPage(0); // Reiniciar paginación
    } catch (err) {
      console.error('Error al aplicar filtros:', err);
      setError('Error al filtrar transferencias.');
    } finally {
      setLoading(false);
    }
  };
  
  // Limpiar filtros
  const handleLimpiarFiltros = () => {
    setFiltros({
      almacenOrigenId: '',
      almacenDestinoId: '',
      fechaInicio: '',
      fechaFin: ''
    });
    loadData();
  };
  
  // Cambio en filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Abrir modal de transferencia
  const handleNuevaTransferencia = () => {
    setTransferForm({
      almacenOrigenId: '',
      almacenDestinoId: '',
      productoId: '',
      cantidad: '',
      observaciones: ''
    });
    setProductosOrigen([]);
    setProductoSeleccionado(null);
    setDialogOpen(true);
  };
  
  // Cambio en el formulario de transferencia
  const handleTransferFormChange = (e) => {
    const { name, value } = e.target;
    setTransferForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si cambia el almacén origen, filtrar productos disponibles
    if (name === 'almacenOrigenId') {
      const productosDelAlmacen = productos.filter(p => 
        p.almacenId === value && p.cantidad > 0
      );
      setProductosOrigen(productosDelAlmacen);
      setTransferForm(prev => ({
        ...prev,
        productoId: '',
        cantidad: ''
      }));
      setProductoSeleccionado(null);
    }
    
    // Si cambia el producto, mostrar detalles
    if (name === 'productoId') {
      const producto = productos.find(p => p.id === value);
      setProductoSeleccionado(producto);
      setTransferForm(prev => ({
        ...prev,
        cantidad: ''
      }));
    }
  };
  
  // Realizar transferencia
  const handleRealizarTransferencia = async () => {
    // Validaciones
    if (!transferForm.almacenOrigenId) {
      setError('Selecciona un almacén de origen');
      return;
    }
    
    if (!transferForm.almacenDestinoId) {
      setError('Selecciona un almacén de destino');
      return;
    }
    
    if (transferForm.almacenOrigenId === transferForm.almacenDestinoId) {
      setError('Los almacenes de origen y destino no pueden ser iguales');
      return;
    }
    
    if (!transferForm.productoId) {
      setError('Selecciona un producto');
      return;
    }
    
    if (!transferForm.cantidad || parseFloat(transferForm.cantidad) <= 0) {
      setError('Ingresa una cantidad válida');
      return;
    }
    
    if (productoSeleccionado && parseFloat(transferForm.cantidad) > productoSeleccionado.cantidad) {
      setError(`Cantidad insuficiente. Disponible: ${productoSeleccionado.cantidad} ${productoSeleccionado.unidadMedida}`);
      return;
    }
    
    try {
      setRealizandoTransferencia(true);
      setError('');
      
      // Obtener información adicional para la transferencia
      const almacenOrigen = almacenes.find(a => a.id === transferForm.almacenOrigenId);
      const almacenDestino = almacenes.find(a => a.id === transferForm.almacenDestinoId);
      
      // Datos para la transferencia
      const datosTransferencia = {
        productoId: transferForm.productoId,
        productoNombre: productoSeleccionado.nombre,
        productoCategoria: productoSeleccionado.categoria,
        almacenOrigenId: transferForm.almacenOrigenId,
        almacenOrigenNombre: almacenOrigen.nombre,
        almacenDestinoId: transferForm.almacenDestinoId,
        almacenDestinoNombre: almacenDestino.nombre,
        cantidad: parseFloat(transferForm.cantidad),
        unidadMedida: productoSeleccionado.unidadMedida,
        observaciones: transferForm.observaciones,
        fecha: new Date(),
        usuario: JSON.parse(localStorage.getItem('user') || '{}').nombre || 'Usuario'
      };
      
      // Realizar la transferencia
      await transferirProducto(datosTransferencia);
      
      // Cerrar modal y recargar datos
      setDialogOpen(false);
      await loadData();
      
    } catch (err) {
      console.error('Error al realizar transferencia:', err);
      setError(`Error al realizar la transferencia: ${err.message}`);
    } finally {
      setRealizandoTransferencia(false);
    }
  };
  
  const handleExportarPDF = () => {
    // Preparar datos para el PDF
    const columnas = [
      'Fecha', 
      'Almacén Origen', 
      'Almacén Destino', 
      'Producto', 
      'Cantidad', 
      'Usuario',
      'Observaciones'
    ];
    
    const datos = transferencias.map(t => [
      t.fecha.toLocaleDateString(),
      t.almacenOrigenNombre,
      t.almacenDestinoNombre,
      `${t.productoNombre} (${t.productoCategoria})`,
      `${t.cantidad} ${t.unidadMedida}`,
      t.usuario,
      t.observaciones || ''
    ]);
    
    // Exportar
    exportarPDF('Reporte de Transferencias', columnas, datos);
  };
  
  const handleExportarExcel = () => {
    // Preparar datos para Excel
    const datos = transferencias.map(t => ({
      'Fecha': t.fecha.toLocaleDateString(),
      'Almacén Origen': t.almacenOrigenNombre,
      'Almacén Destino': t.almacenDestinoNombre,
      'Producto': t.productoNombre,
      'Categoría': t.productoCategoria,
      'Cantidad': t.cantidad,
      'Unidad': t.unidadMedida,
      'Usuario': t.usuario,
      'Observaciones': t.observaciones || ''
    }));
    
    // Exportar
    exportarExcel('Reporte de Transferencias', datos);
  };
  
  // Paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Paginación de transferencias
  const transferenciasVisibles = transferencias.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '1200px', 
      mx: 'auto',
      px: { xs: 1, sm: 2, md: 3 }
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Transferencias entre Almacenes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleNuevaTransferencia}
        >
          Nueva Transferencia
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {/* Filtros */}
      <Paper sx={{ 
        p: 2, 
        mb: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px'
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Almacén Origen</InputLabel>
              <Select
                name="almacenOrigenId"
                value={filtros.almacenOrigenId}
                label="Almacén Origen"
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
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Almacén Destino</InputLabel>
              <Select
                name="almacenDestinoId"
                value={filtros.almacenDestinoId}
                label="Almacén Destino"
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
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Fecha Inicio"
              type="date"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleFiltroChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Fecha Fin"
              type="date"
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleFiltroChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={6} md={1}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={handleAplicarFiltros}
            >
              Filtrar
            </Button>
          </Grid>
          
          <Grid item xs={6} md={1}>
            <Button
              fullWidth
              color="secondary"
              variant="outlined"
              onClick={handleLimpiarFiltros}
            >
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Botones de exportación */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handleExportarPDF}
          disabled={loading || transferencias.length === 0}
        >
          Exportar PDF
        </Button>
        <Button
          variant="outlined"
          startIcon={<SaveAltIcon />}
          onClick={handleExportarExcel}
          disabled={loading || transferencias.length === 0}
        >
          Exportar Excel
        </Button>
      </Box>

      {/* Tabla de transferencias */}
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
        ) : transferencias.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              No hay transferencias que coincidan con los filtros.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Almacén Origen</TableCell>
                    <TableCell>Almacén Destino</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Observaciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transferenciasVisibles.map((transferencia) => (
                    <TableRow hover key={transferencia.id}>
                      <TableCell>
                        {transferencia.fecha.toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transferencia.almacenOrigenNombre}</TableCell>
                      <TableCell>{transferencia.almacenDestinoNombre}</TableCell>
                      <TableCell>
                        {transferencia.productoNombre} 
                        <Typography variant="caption" display="block" color="textSecondary">
                          {transferencia.productoCategoria}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {transferencia.cantidad} {transferencia.unidadMedida}
                      </TableCell>
                      <TableCell>{transferencia.usuario}</TableCell>
                      <TableCell>{transferencia.observaciones || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={transferencias.length}
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
      
      {/* Diálogo para nueva transferencia */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Transferir Producto entre Almacenes</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Almacén Origen</InputLabel>
                <Select
                  name="almacenOrigenId"
                  value={transferForm.almacenOrigenId}
                  label="Almacén Origen *"
                  onChange={handleTransferFormChange}
                >
                  {almacenes.map(almacen => (
                    <MenuItem key={almacen.id} value={almacen.id}>
                      {almacen.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Almacén Destino</InputLabel>
                <Select
                  name="almacenDestinoId"
                  value={transferForm.almacenDestinoId}
                  label="Almacén Destino *"
                  onChange={handleTransferFormChange}
                  disabled={!transferForm.almacenOrigenId}
                >
                  {almacenes
                    .filter(a => a.id !== transferForm.almacenOrigenId)
                    .map(almacen => (
                      <MenuItem key={almacen.id} value={almacen.id}>
                        {almacen.nombre}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={!transferForm.almacenOrigenId}>
                <InputLabel>Producto</InputLabel>
                <Select
                  name="productoId"
                  value={transferForm.productoId}
                  label="Producto *"
                  onChange={handleTransferFormChange}
                >
                  {productosOrigen.length === 0 ? (
                    <MenuItem value="" disabled>
                      {transferForm.almacenOrigenId 
                        ? 'No hay productos disponibles en este almacén' 
                        : 'Seleccione primero un almacén de origen'
                      }
                    </MenuItem>
                  ) : (
                    productosOrigen.map(producto => (
                      <MenuItem key={producto.id} value={producto.id}>
                        {producto.nombre} - {producto.categoria} 
                        ({producto.cantidad} {producto.unidadMedida} disponibles)
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            {productoSeleccionado && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2">
                    Detalles del producto seleccionado:
                  </Typography>
                  <Typography variant="body2">
                    {productoSeleccionado.nombre} - {productoSeleccionado.categoria}
                  </Typography>
                  <Typography variant="body2">
                    Stock disponible: {productoSeleccionado.cantidad} {productoSeleccionado.unidadMedida}
                  </Typography>
                  {productoSeleccionado.fechaVencimiento && (
                    <Typography variant="body2">
                      Fecha de vencimiento: {new Date(productoSeleccionado.fechaVencimiento).toLocaleDateString()}
                    </Typography>
                  )}
                  {productoSeleccionado.lote && (
                    <Typography variant="body2">
                      Lote: {productoSeleccionado.lote}
                    </Typography>
                  )}
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Cantidad a transferir"
                    name="cantidad"
                    type="number"
                    value={transferForm.cantidad}
                    onChange={handleTransferFormChange}
                    inputProps={{ 
                      min: 0.01, 
                      max: productoSeleccionado.cantidad,
                      step: 0.01 
                    }}
                    helperText={`Máximo: ${productoSeleccionado.cantidad} ${productoSeleccionado.unidadMedida}`}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    disabled
                    label="Unidad de medida"
                    value={productoSeleccionado.unidadMedida}
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                name="observaciones"
                value={transferForm.observaciones}
                onChange={handleTransferFormChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={realizandoTransferencia}>
            Cancelar
          </Button>
          <Button 
            onClick={handleRealizarTransferencia} 
            variant="contained" 
            color="primary"
            disabled={
              realizandoTransferencia ||
              !transferForm.almacenOrigenId ||
              !transferForm.almacenDestinoId ||
              !transferForm.productoId ||
              !transferForm.cantidad
            }
          >
            {realizandoTransferencia ? 'Procesando...' : 'Realizar Transferencia'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransferenciasList;