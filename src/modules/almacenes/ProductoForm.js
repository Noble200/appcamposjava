// src/modules/almacenes/ProductoForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import { getProductoById, createProducto, updateProducto } from './AlmacenesService';
import { getAlmacenes } from './AlmacenesService';

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

const ProductoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [almacenes, setAlmacenes] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    cantidad: '',
    unidadMedida: '',
    almacenId: '',
    stockMinimo: '',
    fechaVencimiento: '',
    lote: '',
    notas: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Extraer almacenId de la URL si viene como parámetro
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const almacenId = searchParams.get('almacen');
    if (almacenId) {
      setFormData(prev => ({ ...prev, almacenId }));
    }
  }, [location.search]);

  // Cargar datos necesarios
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar lista de almacenes
        const almacenesData = await getAlmacenes();
        setAlmacenes(almacenesData);
        
        // Si estamos en modo edición, cargar datos del producto
        if (id) {
          const producto = await getProductoById(id);
          
          // Formatear fecha para el campo de fecha
          let fechaFormateada = '';
          if (producto.fechaVencimiento) {
            const fecha = producto.fechaVencimiento instanceof Date 
              ? producto.fechaVencimiento 
              : new Date(producto.fechaVencimiento);
            
            fechaFormateada = fecha.toISOString().split('T')[0];
          }
          
          setFormData({
            ...producto,
            fechaVencimiento: fechaFormateada
          });
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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre) errors.nombre = 'El nombre es obligatorio';
    if (!formData.categoria) errors.categoria = 'Selecciona una categoría';
    if (!formData.cantidad || formData.cantidad < 0) {
      errors.cantidad = 'Ingresa una cantidad válida';
    }
    if (!formData.unidadMedida) errors.unidadMedida = 'Ingresa la unidad de medida';
    if (!formData.almacenId) errors.almacenId = 'Selecciona un almacén';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError('');

    try {
      if (id) {
        // Modo edición
        await updateProducto(id, formData);
      } else {
        // Modo creación
        await createProducto(formData);
      }
      navigate('/productos');
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setError('Error al guardar los datos del producto. Por favor, intenta de nuevo.');
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
    <Box sx={{ 
      width: '100%', 
      maxWidth: '1200px', 
      mx: 'auto',
      px: { xs: 1, sm: 2, md: 3 }
    }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        {id ? 'Editar Producto' : 'Nuevo Producto'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ 
        width: '100%', 
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        mb: 3,
       }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nombre del Producto"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!formErrors.nombre}
                helperText={formErrors.nombre}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!formErrors.categoria}>
                <InputLabel>Categoría</InputLabel>
                <Select
                  name="categoria"
                  value={formData.categoria}
                  label="Categoría"
                  onChange={handleChange}
                >
                  {categorias.map(categoria => (
                    <MenuItem key={categoria} value={categoria}>
                      {categoria}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.categoria && (
                  <FormHelperText>{formErrors.categoria}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Cantidad"
                name="cantidad"
                type="number"
                value={formData.cantidad}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
                error={!!formErrors.cantidad}
                helperText={formErrors.cantidad}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Unidad de Medida"
                name="unidadMedida"
                value={formData.unidadMedida}
                onChange={handleChange}
                placeholder="kg, l, unidad, etc."
                error={!!formErrors.unidadMedida}
                helperText={formErrors.unidadMedida}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!formErrors.almacenId}>
                <InputLabel>Almacén</InputLabel>
                <Select
                  name="almacenId"
                  value={formData.almacenId}
                  label="Almacén"
                  onChange={handleChange}
                >
                  {almacenes.map(almacen => (
                    <MenuItem key={almacen.id} value={almacen.id}>
                      {almacen.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.almacenId && (
                  <FormHelperText>{formErrors.almacenId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock Mínimo"
                name="stockMinimo"
                type="number"
                value={formData.stockMinimo}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Vencimiento"
                name="fechaVencimiento"
                type="date"
                value={formData.fechaVencimiento}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lote"
                name="lote"
                value={formData.lote}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas"
                name="notas"
                value={formData.notas}
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

export default ProductoForm;