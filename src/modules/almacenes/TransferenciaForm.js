// src/modules/almacenes/TransferenciaForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  FormHelperText,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { getAlmacenes, getProductos, getProductoById } from './AlmacenesService';
import { registrarTransferencia } from './TransferenciasService';

const TransferenciaForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [almacenes, setAlmacenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    productoId: '',
    almacenOrigenId: '',
    almacenDestinoId: '',
    cantidad: '',
    observaciones: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Extraer información de la URL (opcional)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const productoId = searchParams.get('producto');
    const almacenId = searchParams.get('almacen');
    
    if (productoId) {
      setFormData(prev => ({ ...prev, productoId }));
    }
    
    if (almacenId) {
      setFormData(prev => ({ ...prev, almacenOrigenId: almacenId }));
    }
  }, [location.search]);

  // Cargar datos necesarios
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar almacenes y productos
        const [almacenesData, productosData] = await Promise.all([
          getAlmacenes(),
          getProductos()
        ]);
        
        setAlmacenes(almacenesData);
        setProductos(productosData);
        
        // Si ya hay un producto seleccionado en formData, cargarlo
        if (formData.productoId) {
          const producto = await getProductoById(formData.productoId);
          setProductoSeleccionado(producto);
          
          // Preseleccionar el almacén origen
          if (!formData.almacenOrigenId) {
            setFormData(prev => ({
              ...prev,
              almacenOrigenId: producto.almacenId
            }));
          }
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos necesarios. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [formData.productoId]);

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    if (!formData.productoId) errors.productoId = 'Selecciona un producto';
    if (!formData.almacenOrigenId) errors.almacenOrigenId = 'Selecciona el almacén de origen';
    if (!formData.almacenDestinoId) errors.almacenDestinoId = 'Selecciona el almacén de destino';
    if (formData.almacenOrigenId === formData.almacenDestinoId) {
      errors.almacenDestinoId = 'El almacén de destino debe ser diferente al de origen';
    }
    if (!formData.cantidad || formData.cantidad <= 0) {
      errors.cantidad = 'Ingresa una cantidad válida';
    }
    
    // Verificar stock disponible
    if (productoSeleccionado && formData.cantidad > productoSeleccionado.cantidad) {
      errors.cantidad = `La cantidad excede el stock disponible (${productoSeleccionado.cantidad} ${productoSeleccionado.unidadMedida})`;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si se cambia el producto, cargar sus datos
    if (name === 'productoId' && value) {
      const productoSeleccionado = productos.find(p => p.id === value);
      if (productoSeleccionado) {
        setProductoSeleccionado(productoSeleccionado);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          almacenOrigenId: productoSeleccionado.almacenId
        }));
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error cuando el usuario corrige un campo
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError('');

    try {
      // Obtener información del usuario actual
      const usuario = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Registrar la transferencia
      await registrarTransferencia({
        ...formData,
        usuario: usuario.nombre || 'Usuario sin identificar'
      });
      
      // Redirigir a la lista de productos
      navigate('/productos');
    } catch (err) {
      console.error('Error al realizar transferencia:', err);
      setError(`Error al transferir el producto: ${err.message}`);
      setSaving(false);
    }
  };

  // Filtrar productos por almacén origen
  const filtrarProductosPorAlmacen = () => {
    if (!formData.almacenOrigenId) return productos;
    return productos.filter(p => p.almacenId === formData.almacenOrigenId);
  };

  // Filtrar almacenes destino (excluir el almacén origen)
  const filtrarAlmacenesDestino = () => {
    return almacenes.filter(a => a.id !== formData.almacenOrigenId);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '1200px', 
      mx: 'auto',
      px: { xs: 1, sm: 2, md: 3 }
    }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Transferencia de Productos
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ 
        p: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        mb: 3
      }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {formData.almacenOrigenId ? (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!!formErrors.productoId}>
                    <InputLabel>Producto</InputLabel>
                    <Select
                      name="productoId"
                      value={formData.productoId}
                      label="Producto"
                      onChange={handleChange}
                    >
                      {filtrarProductosPorAlmacen().map(producto => (
                        <MenuItem key={producto.id} value={producto.id}>
                          {producto.nombre} - {producto.categoria} ({producto.cantidad} {producto.unidadMedida})
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.productoId && (
                      <FormHelperText>{formErrors.productoId}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!!formErrors.almacenDestinoId}>
                    <InputLabel>Almacén Destino</InputLabel>
                    <Select
                      name="almacenDestinoId"
                      value={formData.almacenDestinoId}
                      label="Almacén Destino"
                      onChange={handleChange}
                    >
                      {filtrarAlmacenesDestino().map(almacen => (
                        <MenuItem key={almacen.id} value={almacen.id}>
                          {almacen.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.almacenDestinoId && (
                      <FormHelperText>{formErrors.almacenDestinoId}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!formErrors.almacenOrigenId}>
                  <InputLabel>Almacén Origen</InputLabel>
                  <Select
                    name="almacenOrigenId"
                    value={formData.almacenOrigenId}
                    label="Almacén Origen"
                    onChange={handleChange}
                  >
                    {almacenes.map(almacen => (
                      <MenuItem key={almacen.id} value={almacen.id}>
                        {almacen.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.almacenOrigenId && (
                    <FormHelperText>{formErrors.almacenOrigenId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            {productoSeleccionado && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Información del Producto
                    </Typography>
                    <Typography variant="body2">
                      <strong>Nombre:</strong> {productoSeleccionado.nombre}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Categoría:</strong> {productoSeleccionado.categoria}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Stock Disponible:</strong> {productoSeleccionado.cantidad} {productoSeleccionado.unidadMedida}
                    </Typography>
                    {productoSeleccionado.lote && (
                      <Typography variant="body2">
                        <strong>Lote:</strong> {productoSeleccionado.lote}
                      </Typography>
                    )}
                  </Box>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label={`Cantidad a Transferir (${productoSeleccionado.unidadMedida})`}
                    name="cantidad"
                    type="number"
                    value={formData.cantidad}
                    onChange={handleChange}
                    inputProps={{ 
                      min: 0.01, 
                      max: productoSeleccionado.cantidad,
                      step: 0.01 
                    }}
                    error={!!formErrors.cantidad}
                    helperText={formErrors.cantidad}
                  />
                </Grid>
              </>
            )}

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
                  onClick={() => navigate('/productos')}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving || !productoSeleccionado}
                >
                  {saving ? 'Procesando...' : 'Transferir Producto'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default TransferenciaForm;