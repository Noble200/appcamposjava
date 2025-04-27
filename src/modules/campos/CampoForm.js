// src/modules/campos/CampoForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress
} from '@mui/material';
import { getCampoById, createCampo, updateCampo } from './CamposService';

const tiposCultivo = [
  'Maíz',
  'Trigo',
  'Soja',
  'Girasol',
  'Algodón',
  'Caña de azúcar',
  'Frutales',
  'Hortalizas',
  'Otro'
];

const tiposSuelo = [
  'Arcilloso',
  'Arenoso',
  'Franco',
  'Limoso',
  'Calcáreo',
  'Humífero',
  'Otro'
];

const CampoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    superficie: '',
    tipoCultivo: '',
    tipoSuelo: '',
    fechaSiembra: '',
    fechaCosecha: '',
    densidadSiembra: '',
    fertilizantesAplicados: '',
    controlPlagas: '',
    listaEmpleados: '',
    almacenesDepositos: '',
    silosRodados: '',
    energia: '',
    observaciones: ''
  });

  // Cargar datos del campo si estamos en modo edición
  useEffect(() => {
    const loadCampo = async () => {
      if (id) {
        try {
          setLoading(true);
          const campo = await getCampoById(id);
          setFormData(campo);
        } catch (err) {
          console.error('Error al cargar campo:', err);
          setError('Error al cargar los datos del campo.');
        } finally {
          setLoading(false);
        }
      }
    };

    loadCampo();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (id) {
        // Modo edición
        await updateCampo(id, formData);
      } else {
        // Modo creación
        await createCampo(formData);
      }
      navigate('/campos');
    } catch (err) {
      console.error('Error al guardar campo:', err);
      setError('Error al guardar los datos del campo. Por favor, intenta de nuevo.');
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
        {id ? 'Editar Campo' : 'Nuevo Campo'}
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
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nombre del Campo"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Ubicación"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Superficie (hectáreas)"
                name="superficie"
                type="number"
                value={formData.superficie}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Cultivo</InputLabel>
                <Select
                  name="tipoCultivo"
                  value={formData.tipoCultivo}
                  label="Tipo de Cultivo"
                  onChange={handleChange}
                >
                  {tiposCultivo.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Suelo</InputLabel>
                <Select
                  name="tipoSuelo"
                  value={formData.tipoSuelo}
                  label="Tipo de Suelo"
                  onChange={handleChange}
                >
                  {tiposSuelo.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Siembra"
                name="fechaSiembra"
                type="date"
                value={formData.fechaSiembra}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Cosecha"
                name="fechaCosecha"
                type="date"
                value={formData.fechaCosecha}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fertilizantes Aplicados y Fechas"
                name="fertilizantesAplicados"
                value={formData.fertilizantesAplicados}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Control de Plagas (Producto, Dosis, Fecha)"
                name="controlPlagas"
                value={formData.controlPlagas}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lista de Empleados"
                name="listaEmpleados"
                value={formData.listaEmpleados}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Almacenes y Depósitos"
                name="almacenesDepositos"
                value={formData.almacenesDepositos}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Silos y Rodados"
                name="silosRodados"
                value={formData.silosRodados}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Energía"
                name="energia"
                value={formData.energia}
                onChange={handleChange}
              />
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
                  onClick={() => navigate('/campos')}
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

export default CampoForm;