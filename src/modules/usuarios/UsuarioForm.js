// src/modules/usuarios/UsuarioForm.js
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
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormHelperText,
  Alert,
  CircularProgress
} from '@mui/material';
import { getUsuarioById, createUsuario, updateUsuario } from './UsuariosService';

const tiposUsuario = [
  'administrador',
  'fumigador',
  'controlador',
  'invitado'
];

const permisosDisponibles = [
  'crear_campos',
  'editar_campos',
  'eliminar_campos',
  'crear_almacenes',
  'editar_almacenes',
  'eliminar_almacenes',
  'crear_fumigaciones',
  'editar_fumigaciones',
  'eliminar_fumigaciones',
  'crear_compras',
  'editar_compras',
  'eliminar_compras',
  'generar_reportes',
  'usuarios'
];

const UsuarioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    username: '',
    password: '',
    confirmPassword: '',
    tipo: '',
    permisos: []
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Verificar si el usuario actual es administrador para permitir acceso
  const usuarioActual = JSON.parse(localStorage.getItem('user') || '{}');
  const esAdmin = usuarioActual.tipo === 'administrador';

  // Redirigir si no es administrador
  useEffect(() => {
    if (!esAdmin) {
      navigate('/usuarios');
    }
  }, [esAdmin, navigate]);

  // Cargar datos del usuario si estamos en modo edición
  useEffect(() => {
    const loadUsuario = async () => {
      if (id) {
        try {
          setLoading(true);
          const usuario = await getUsuarioById(id);
          setFormData({
            ...usuario,
            password: '',
            confirmPassword: ''
          });
        } catch (err) {
          console.error('Error al cargar usuario:', err);
          setError('Error al cargar los datos del usuario.');
        } finally {
          setLoading(false);
        }
      }
    };

    if (esAdmin) {
      loadUsuario();
    }
  }, [id, esAdmin]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre) errors.nombre = 'El nombre es obligatorio';
    if (!formData.username) errors.username = 'El nombre de usuario es obligatorio';
    
    if (!id) {
      // En modo creación, la contraseña es obligatoria
      if (!formData.password) errors.password = 'La contraseña es obligatoria';
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      // En modo edición, si se proporciona contraseña, debe coincidir
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (!formData.tipo) errors.tipo = 'Selecciona un tipo de usuario';
    
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

  const handlePermisosChange = (event) => {
    const {
      target: { value },
    } = event;
    
    setFormData({
      ...formData,
      permisos: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError('');

    try {
      // Preparar datos para guardar (omitir confirmPassword)
      const { confirmPassword, ...datosParaGuardar } = formData;
      
      // Si no se proporciona contraseña en modo edición, eliminarla de los datos
      if (id && !datosParaGuardar.password) {
        delete datosParaGuardar.password;
      }
      
      if (id) {
        // Modo edición
        await updateUsuario(id, datosParaGuardar);
      } else {
        // Modo creación
        await createUsuario(datosParaGuardar);
      }
      navigate('/usuarios');
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      setError(`Error al guardar los datos del usuario: ${err.message}`);
      setSaving(false);
    }
  };

  if (!esAdmin) {
    return (
      <Alert severity="error">
        No tienes permisos para acceder a esta página.
      </Alert>
    );
  }

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
        {id ? 'Editar Usuario' : 'Nuevo Usuario'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!formErrors.nombre}
                helperText={formErrors.nombre}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nombre de Usuario"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!formErrors.username}
                helperText={formErrors.username}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={id ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required={!id}
                error={!!formErrors.password}
                helperText={formErrors.password}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirmar Contraseña"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!id || !!formData.password}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.tipo} required>
                <InputLabel>Tipo de Usuario</InputLabel>
                <Select
                  name="tipo"
                  value={formData.tipo}
                  label="Tipo de Usuario"
                  onChange={handleChange}
                >
                  {tiposUsuario.map(tipo => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.tipo && (
                  <FormHelperText>{formErrors.tipo}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Permisos</InputLabel>
                <Select
                  multiple
                  name="permisos"
                  value={formData.permisos || []}
                  onChange={handlePermisosChange}
                  input={<OutlinedInput label="Permisos" />}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {permisosDisponibles.map((permiso) => (
                    <MenuItem key={permiso} value={permiso}>
                      <Checkbox checked={(formData.permisos || []).indexOf(permiso) > -1} />
                      <ListItemText primary={permiso.replace('_', ' ')} />
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Los administradores tienen todos los permisos por defecto
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/usuarios')}
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

export default UsuarioForm;