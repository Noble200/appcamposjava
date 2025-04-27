// src/modules/compras/CompraForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getCompraById, createCompra, updateCompra } from './ComprasService';
import { getAlmacenes } from '../almacenes/AlmacenesService';

const estados = ['Pendiente', 'Completado', 'Cancelado'];
const categorias = [
  'Semilla',
  'Herbicida',
  'Insecticida',
  'Fungicida',
  'Fertilizante',
  'Maquinaria',
  'Herramienta',
  'Otro'
];

const CompraForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [almacenes, setAlmacenes] = useState([]);
  const [formData, setFormData] = useState({
    codigo: '',
    proveedor: '',
    contactoProveedor: '',
    fechaEmision: '',
    fechaRecepcion: '',
    condicionesPago: '',
    almacenDestino: '',
    estado: 'Pendiente',
    productosComprados: [],
    total: 0,
    observaciones: ''
  });
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    categoria: '',
    cantidad: '',
    unidadMedida: '',
    precioUnitario: '',
    subtotal: 0
  });

  // Cargar datos necesarios
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar listado de almacenes
        const almacenesData = await getAlmacenes();
        setAlmacenes(almacenesData);
        
        // Si estamos en modo edición, cargar datos de la compra
        if (id) {
          const compra = await getCompraById(id);
          
          // Formatear fechas para los campos de fecha
          let fechaEmisionFormateada = '';
          if (compra.fechaEmision) {
            const fecha = compra.fechaEmision instanceof Date 
              ? compra.fechaEmision 
              : new Date(compra.fechaEmision);
            
            fechaEmisionFormateada = fecha.toISOString().split('T')[0];
          }
          
          let fechaRecepcionFormateada = '';
          if (compra.fechaRecepcion) {
            const fecha = compra.fechaRecepcion instanceof Date 
              ? compra.fechaRecepcion 
              : new Date(compra.fechaRecepcion);
            
            fechaRecepcionFormateada = fecha.toISOString().split('T')[0];
          }
          
          setFormData({
            ...compra,
            fechaEmision: fechaEmisionFormateada,
            fechaRecepcion: fechaRecepcionFormateada,
            productosComprados: compra.productosComprados || []
          });
        } else {
          // En modo creación, generar un código de compra único
          const codigoGenerado = 'OC-' + Date.now().toString().slice(-6);
          setFormData(prev => ({
            ...prev,
            codigo: codigoGenerado
          }));
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos necesarios. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNuevoProductoChange = (e) => {
    const { name, value } = e.target;
    let nuevoValor = value;
    
    // Actualizar subtotal si cambia cantidad o precio
    if (name === 'cantidad' || name === 'precioUnitario') {
      const cantidad = name === 'cantidad' ? parseFloat(value) || 0 : parseFloat(nuevoProducto.cantidad) || 0;
      const precio = name === 'precioUnitario' ? parseFloat(value) || 0 : parseFloat(nuevoProducto.precioUnitario) || 0;
      
      setNuevoProducto({
        ...nuevoProducto,
        [name]: nuevoValor,
        subtotal: cantidad * precio
      });
    } else {
      setNuevoProducto({
        ...nuevoProducto,
        [name]: nuevoValor
      });
    }
  };

  const agregarProducto = () => {
    // Validar datos del producto
    if (!nuevoProducto.nombre || !nuevoProducto.categoria || !nuevoProducto.cantidad || !nuevoProducto.unidadMedida || !nuevoProducto.precioUnitario) {
      setError('Completa todos los campos del producto');
      return;
    }
    
    const productosActualizados = [
      ...formData.productosComprados,
      { ...nuevoProducto, id: Date.now().toString() }
    ];
    
    // Actualizar total
    const nuevoTotal = productosActualizados.reduce((sum, prod) => sum + (prod.subtotal || 0), 0);
    
    setFormData({
      ...formData,
      productosComprados: productosActualizados,
      total: nuevoTotal
    });
    
    // Resetear el formulario de nuevo producto
    setNuevoProducto({
      nombre: '',
      categoria: '',
      cantidad: '',
      unidadMedida: '',
      precioUnitario: '',
      subtotal: 0
    });
    
    setError('');
  };

  const eliminarProducto = (productoId) => {
    const productosActualizados = formData.productosComprados.filter(
      p => p.id !== productoId
    );
    
    // Actualizar total
    const nuevoTotal = productosActualizados.reduce((sum, prod) => sum + (prod.subtotal || 0), 0);
    
    setFormData({
      ...formData,
      productosComprados: productosActualizados,
      total: nuevoTotal
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    if (!formData.codigo || !formData.proveedor || !formData.fechaEmision || !formData.almacenDestino) {
      setError('Completa todos los campos obligatorios');
      return;
    }
    
    if (formData.productosComprados.length === 0) {
      setError('Agrega al menos un producto a la compra');
      return;
    }
    
    setSaving(true);
    setError('');

    try {
      if (id) {
        // Obtener datos anteriores para comparar cambios de estado
        const compraAnterior = await getCompraById(id);
        // Modo edición
        await updateCompra(id, formData, compraAnterior);
      } else {
        // Modo creación
        await createCompra(formData);
      }
      navigate('/compras');
    } catch (err) {
      console.error('Error al guardar compra:', err);
      setError('Error al guardar los datos de la compra. Por favor, intenta de nuevo.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        {id ? 'Editar Compra' : 'Nueva Compra'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Código de Compra"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                disabled={id !== undefined} // Código no editable en modo edición
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Proveedor"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contacto del Proveedor"
                name="contactoProveedor"
                value={formData.contactoProveedor}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Almacén Destino</InputLabel>
                <Select
                  name="almacenDestino"
                  value={formData.almacenDestino}
                  label="Almacén Destino"
                  onChange={handleChange}
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
              <TextField
                required
                fullWidth
                label="Fecha de Emisión"
                name="fechaEmision"
                type="date"
                value={formData.fechaEmision}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Recepción"
                name="fechaRecepcion"
                type="date"
                value={formData.fechaRecepcion}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Condiciones de Pago"
                name="condicionesPago"
                value={formData.condicionesPago}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="estado"
                  value={formData.estado}
                  label="Estado"
                  onChange={handleChange}
                >
                  {estados.map(estado => (
                    <MenuItem key={estado} value={estado}>
                      {estado}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Productos
              </Typography>
              
              {/* Lista de productos agregados */}
              {formData.productosComprados.length > 0 && (
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Categoría</TableCell>
                        <TableCell align="right">Cantidad</TableCell>
                        <TableCell>Unidad</TableCell>
                        <TableCell align="right">Precio Unitario</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.productosComprados.map((producto) => (
                        <TableRow key={producto.id}>
                          <TableCell>{producto.nombre}</TableCell>
                          <TableCell>{producto.categoria}</TableCell>
                          <TableCell align="right">{producto.cantidad}</TableCell>
                          <TableCell>{producto.unidadMedida}</TableCell>
                          <TableCell align="right">${parseFloat(producto.precioUnitario).toFixed(2)}</TableCell>
                          <TableCell align="right">${parseFloat(producto.subtotal).toFixed(2)}</TableCell>
                          <TableCell align="center">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => eliminarProducto(producto.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={5} align="right">
                          <Typography variant="subtitle1" fontWeight="bold">
                            Total:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle1" fontWeight="bold">
                            ${parseFloat(formData.total).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              {/* Formulario para agregar nuevo producto */}
              <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
                <Typography variant="subtitle1" gutterBottom>
                  Agregar Producto
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Nombre del Producto"
                      name="nombre"
                      value={nuevoProducto.nombre}
                      onChange={handleNuevoProductoChange}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Categoría</InputLabel>
                      <Select
                        name="categoria"
                        value={nuevoProducto.categoria}
                        label="Categoría"
                        onChange={handleNuevoProductoChange}
                      >
                        {categorias.map(categoria => (
                          <MenuItem key={categoria} value={categoria}>
                            {categoria}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} sm={3} md={1}>
                    <TextField
                      fullWidth
                      label="Cantidad"
                      name="cantidad"
                      type="number"
                      value={nuevoProducto.cantidad}
                      onChange={handleNuevoProductoChange}
                      size="small"
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3} md={1}>
                    <TextField
                      fullWidth
                      label="Unidad"
                      name="unidadMedida"
                      value={nuevoProducto.unidadMedida}
                      onChange={handleNuevoProductoChange}
                      size="small"
                      placeholder="kg, l, etc."
                    />
                  </Grid>
                  <Grid item xs={6} sm={3} md={2}>
                    <TextField
                      fullWidth
                      label="Precio Unitario"
                      name="precioUnitario"
                      type="number"
                      value={nuevoProducto.precioUnitario}
                      onChange={handleNuevoProductoChange}
                      size="small"
                      inputProps={{ min: 0, step: 0.01 }}
                      InputProps={{
                        startAdornment: <span>$</span>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3} md={1}>
                    <TextField
                      fullWidth
                      label="Subtotal"
                      value={`$${parseFloat(nuevoProducto.subtotal).toFixed(2)}`}
                      size="small"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={agregarProducto}
                      startIcon={<AddIcon />}
                      size="small"
                    >
                      Agregar
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/compras')}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : id ? 'Actualizar' : 'Guardar'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default CompraForm;