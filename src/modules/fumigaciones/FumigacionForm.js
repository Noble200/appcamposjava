// src/modules/fumigaciones/FumigacionForm.js
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
  FormHelperText,
  Alert,
  CircularProgress
} from '@mui/material';
import { getFumigacionById, createFumigacion, updateFumigacion } from './FumigacionesService';
import { getCampos } from '../campos/CamposService';
import { getProductos } from '../almacenes/AlmacenesService';

const estados = ['Pendiente', 'Completada', 'Cancelada'];

const FumigacionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [campos, setCampos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [formData, setFormData] = useState({
    campoId: '',
    fumigador: '',
    fecha: '',
    producto: '',
    cantidad: '',
    unidad: '',
    hectareas: '',
    estado: 'Pendiente',
    observaciones: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Cargar datos necesarios
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar listados de campos y productos
        const [camposData, productosData] = await Promise.all([
          getCampos(),
          getProductos()
        ]);
        
        setCampos(camposData);
        
        // Filtrar solo productos de tipo insecticida, herbicida, etc.
        const productosFumigacion = productosData.filter(p => 
          ['Insecticida', 'Herbicida', 'Fungicida', 'Fertilizante'].includes(p.categoria)
        );
        setProductos(productosFumigacion);
        
        // Si estamos en modo edición, cargar datos de la fumigación
        if (id) {
          const fumigacion = await getFumigacionById(id);
          
          // Formatear fecha para el campo de fecha
          let fechaFormateada = '';
          if (fumigacion.fecha) {
            const fecha = fumigacion.fecha instanceof Date 
              ? fumigacion.fecha 
              : new Date(fumigacion.fecha);
            
            fechaFormateada = fecha.toISOString().split('T')[0];
          }
          
          setFormData({
            ...fumigacion,
            fecha: fechaFormateada
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
    
    if (!formData.campoId) errors.campoId = 'Selecciona un campo';
    if (!formData.fumigador) errors.fumigador = 'Ingresa el nombre del fumigador';
    if (!formData.fecha) errors.fecha = 'Selecciona una fecha';
    if (!formData.producto) errors.producto = 'Selecciona un producto';
    if (!formData.cantidad || formData.cantidad <= 0) {
      errors.cantidad = 'Ingresa una cantidad válida';
    }
    if (!formData.unidad) errors.unidad = 'Ingresa la unidad de medida';
    if (!formData.hectareas || formData.hectareas <= 0) {
      errors.hectareas = 'Ingresa el área a fumigar en hectáreas';
    }
    
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
        await updateFumigacion(id, formData);
      } else {
        // Modo creación
        await createFumigacion(formData);
      }
      navigate('/fumigaciones');
    } catch (err) {
      console.error('Error al guardar fumigación:', err);
      setError('Error al guardar los datos de la fumigación. Por favor, intenta de nuevo.');
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
        {id ? 'Editar Fumigación' : 'Nueva Fumigación'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.campoId}>
                <InputLabel>Campo *</InputLabel>
                <Select
                  name="campoId"
                  value={formData.campoId}
                  label="Campo *"
                  onChange={handleChange}
                  required
                >
                  {campos.map(campo => (
                    <MenuItem key={campo.id} value={campo.id}>
                      {campo.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.campoId && (
                  <FormHelperText>{formErrors.campoId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Fumigador"
                name="fumigador"
                value={formData.fumigador}
                onChange={handleChange}
                error={!!formErrors.fumigador}
                helperText={formErrors.fumigador}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Fecha"
                name="fecha"
                type="date"
                value={formData.fecha}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.fecha}
                helperText={formErrors.fecha}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.producto}>
                <InputLabel>Producto *</InputLabel>
                <Select
                  name="producto"
                  value={formData.producto}
                  label="Producto *"
                  onChange={handleChange}
                  required
                >
                  {productos.length === 0 ? (
                    <MenuItem value="" disabled>
                      No hay productos disponibles
                    </MenuItem>
                  ) : (
                    productos.map(producto => (
                      <MenuItem key={producto.id} value={producto.nombre}>
                        {producto.nombre} ({producto.categoria})
                      </MenuItem>
                    ))
                  )}
                </Select>
                {formErrors.producto && (
                  <FormHelperText>{formErrors.producto}</FormHelperText>
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
                name="unidad"
                value={formData.unidad}
                onChange={handleChange}
                placeholder="kg, l, ml, etc."
                error={!!formErrors.unidad}
                helperText={formErrors.unidad}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Hectáreas a Fumigar"
                name="hectareas"
                type="number"
                value={formData.hectareas}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
                error={!!formErrors.hectareas}
                helperText={formErrors.hectareas}
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
                onClick={() => navigate('/fumigaciones')}
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

export default FumigacionForm;