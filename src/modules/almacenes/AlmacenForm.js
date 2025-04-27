// src/modules/almacenes/AlmacenForm.js
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
import { getAlmacenById, createAlmacen, updateAlmacen } from './AlmacenesService';
import { getCampos } from '../campos/CamposService';

const tiposAlmacen = [
  'Granero',
  'Depósito',
  'Silo',
  'Galpón',
  'Bodega',
  'Otro'
];

const AlmacenForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [campos, setCampos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    campoId: '',
    responsable: '',
    tipo: '',
    capacidad: '',
    condicionesAlmacenamiento: '',
    notas: ''
  });

  // Cargar datos del almacén y lista de campos si estamos en modo edición
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar lista de campos
        const camposData = await getCampos();
        setCampos(camposData);
        
        // Si estamos en modo edición, cargar datos del almacén
        if (id) {
          const almacen = await getAlmacenById(id);
          setFormData(almacen);
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, intenta de nuevo.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (id) {
        // Modo edición
        await updateAlmacen(id, formData);
      } else {
        // Modo creación
        await createAlmacen(formData);
      }
      navigate('/almacenes');
    } catch (err) {
      console.error('Error al guardar almacén:', err);
      setError('Error al guardar los datos del almacén. Por favor, intenta de nuevo.');
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
        {id ? 'Editar Almacén' : 'Nuevo Almacén'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nombre del Almacén"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Campo</InputLabel>
                <Select
                  name="campoId"
                  value={formData.campoId}
                  label="Campo"
                  onChange={handleChange}
                >
                  <MenuItem value="particular">Particular (No asociado a campo)</MenuItem>
                  {campos.map((campo) => (
                    <MenuItem key={campo.id} value={campo.id}>
                      {campo.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                label="Responsable"
                name="responsable"
                value={formData.responsable}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Almacén</InputLabel>
                <Select
                  name="tipo"
                  value={formData.tipo}
                  label="Tipo de Almacén"
                  onChange={handleChange}
                >
                  {tiposAlmacen.map((tipo) => (
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
                label="Capacidad o Tamaño"
                name="capacidad"
                value={formData.capacidad}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Condiciones de Almacenamiento"
                name="condicionesAlmacenamiento"
                value={formData.condicionesAlmacenamiento}
                onChange={handleChange}
                multiline
                rows={2}
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
                  onClick={() => navigate('/almacenes')}
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

export default AlmacenForm;