// src/modules/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  AgricultureOutlined,
  WarehouseOutlined,
  SanitizerOutlined,
  AttachMoneyOutlined,
  WarningAmberOutlined
} from '@mui/icons-material';
import { getCampos } from '../campos/CamposService';
import { getAlmacenes, getProductos } from '../almacenes/AlmacenesService';
import { getFumigaciones } from '../fumigaciones/FumigacionesService';
import { getCompras } from '../compras/ComprasService';

// Componente para las tarjetas de resumen
const SummaryCard = ({ title, count, icon, color, onClick }) => (
  <Paper
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s',
      '&:hover': onClick ? { transform: 'translateY(-5px)' } : {},
    }}
    onClick={onClick}
    elevation={3}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="h6" component="h3" color="text.secondary">
        {title}
      </Typography>
      <Box sx={{ color }}>
        {icon}
      </Box>
    </Box>
    <Typography component="p" variant="h4">
      {count !== null ? count : <CircularProgress size={24} />}
    </Typography>
  </Paper>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    campos: null,
    almacenes: null,
    productos: null,
    fumigaciones: null,
    compras: null,
    alertas: []
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Cargar datos de los diferentes módulos
        const [camposData, almacenesData, productosData, fumigacionesData, comprasData] = await Promise.all([
          getCampos(),
          getAlmacenes(),
          getProductos(),
          getFumigaciones(),
          getCompras()
        ]);
        
        // Crear lista de alertas (productos con bajo stock, fumigaciones próximas, etc.)
        const alertas = [];
        
        // Alerta: Productos bajo stock mínimo
        const productosBajoStock = productosData.filter(p => p.cantidad <= p.stockMinimo);
        if (productosBajoStock.length > 0) {
          alertas.push({
            tipo: 'stock',
            mensaje: `${productosBajoStock.length} productos bajo stock mínimo`,
            detalles: productosBajoStock.map(p => `${p.nombre} (${p.cantidad} ${p.unidadMedida})`)
          });
        }
        
        // Alerta: Fumigaciones programadas para próximos 7 días
        const hoy = new Date();
        const proximaSemana = new Date();
        proximaSemana.setDate(hoy.getDate() + 7);
        
        const fumigacionesProximas = fumigacionesData.filter(f => {
          const fechaFumigacion = new Date(f.fecha);
          return fechaFumigacion >= hoy && fechaFumigacion <= proximaSemana && f.estado === 'Pendiente';
        });
        
        if (fumigacionesProximas.length > 0) {
          alertas.push({
            tipo: 'fumigacion',
            mensaje: `${fumigacionesProximas.length} fumigaciones programadas en los próximos 7 días`,
            detalles: fumigacionesProximas.map(f => `Campo: ${f.campoNombre}, Fecha: ${new Date(f.fecha).toLocaleDateString()}`)
          });
        }
        
        setStats({
          campos: camposData.length,
          almacenes: almacenesData.length,
          productos: productosData.length,
          fumigaciones: fumigacionesData.length,
          compras: comprasData.length,
          alertas
        });
        
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('Error al cargar el panel principal. Por favor, intenta recargar la página.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);
  
  if (loading && !stats.campos) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Panel Principal
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Grid container spacing={3}>
        {/* Tarjetas de resumen */}
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard 
            title="Campos" 
            count={stats.campos} 
            icon={<AgricultureOutlined fontSize="large" />} 
            color="primary.main"
            onClick={() => navigate('/campos')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard 
            title="Almacenes" 
            count={stats.almacenes} 
            icon={<WarehouseOutlined fontSize="large" />} 
            color="success.main"
            onClick={() => navigate('/almacenes')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SummaryCard 
            title="Productos" 
            count={stats.productos} 
            icon={<WarehouseOutlined fontSize="large" />} 
            color="info.main"
            onClick={() => navigate('/productos')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <SummaryCard 
            title="Fumigaciones" 
            count={stats.fumigaciones} 
            icon={<SanitizerOutlined fontSize="large" />} 
            color="warning.main"
            onClick={() => navigate('/fumigaciones')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <SummaryCard 
            title="Compras" 
            count={stats.compras} 
            icon={<AttachMoneyOutlined fontSize="large" />} 
            color="secondary.main"
            onClick={() => navigate('/compras')}
          />
        </Grid>
        
        {/* Alertas y notificaciones */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }} elevation={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningAmberOutlined color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Alertas y Notificaciones
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {stats.alertas.length === 0 ? (
              <Typography>No hay alertas pendientes.</Typography>
            ) : (
              <List>
                {stats.alertas.map((alerta, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={alerta.mensaje}
                        secondary={
                          <React.Fragment>
                            {alerta.detalles && alerta.detalles.length > 0 && (
                              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                                {alerta.detalles.slice(0, 3).map((detalle, i) => (
                                  <li key={i}>{detalle}</li>
                                ))}
                                {alerta.detalles.length > 3 && (
                                  <Typography variant="body2" color="text.secondary">
                                    Y {alerta.detalles.length - 3} más...
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < stats.alertas.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Acciones rápidas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              Acciones Rápidas
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={() => navigate('/campos/nuevo')}
                >
                  Nuevo Campo
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  fullWidth
                  onClick={() => navigate('/almacenes/nuevo')}
                >
                  Nuevo Almacén
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="contained" 
                  color="info" 
                  fullWidth
                  onClick={() => navigate('/productos/nuevo')}
                >
                  Nuevo Producto
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="contained" 
                  color="warning" 
                  fullWidth
                  onClick={() => navigate('/fumigaciones/nueva')}
                >
                  Nueva Fumigación
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Actividad reciente */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              Actividad Reciente
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemText 
                  primary="Sistema iniciado correctamente" 
                  secondary={`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Bienvenido al Sistema de Gestión de Campos" 
                  secondary="Utiliza el menú lateral para navegar por los diferentes módulos" 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;