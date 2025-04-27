// src/modules/reportes/ReportesList.js
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  generarReporteCampos,
  generarReporteAlmacenes,
  generarReporteFumigaciones,
  generarReporteCompras,
  exportarPDF,
  exportarExcel
} from './ReportesService';
import { getCampos } from '../campos/CamposService';
import { getAlmacenes } from '../almacenes/AlmacenesService';

const ReportesList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [campos, setCampos] = useState([]);
  const [almacenes, setAlmacenes] = useState([]);
  
  // Filtros para reportes
  const [filtrosFumigaciones, setFiltrosFumigaciones] = useState({
    campoId: '',
    fechaInicio: '',
    fechaFin: '',
    estado: ''
  });
  
  const [filtrosCompras, setFiltrosCompras] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: '',
    almacenDestino: ''
  });

  // Cargar datos para filtros
  useEffect(() => {
    const loadData = async () => {
      try {
        const [camposData, almacenesData] = await Promise.all([
          getCampos(),
          getAlmacenes()
        ]);
        
        setCampos(camposData);
        setAlmacenes(almacenesData);
      } catch (err) {
        console.error('Error al cargar datos para filtros:', err);
        setError('Error al cargar datos para filtros. Por favor, intenta recargar la página.');
      }
    };
    
    loadData();
  }, []);

  const handleFiltrosFumigacionesChange = (e) => {
    const { name, value } = e.target;
    setFiltrosFumigaciones({
      ...filtrosFumigaciones,
      [name]: value
    });
  };

  const handleFiltrosComprasChange = (e) => {
    const { name, value } = e.target;
    setFiltrosCompras({
      ...filtrosCompras,
      [name]: value
    });
  };

  // Función para generar reporte de campos
  const handleReporteCampos = async (formato) => {
    try {
      setLoading(true);
      setError('');
      
      const datos = await generarReporteCampos();
      
      if (datos.length === 0) {
        setError('No hay datos disponibles para generar el reporte.');
        return;
      }
      
      // Preparar datos para exportación
      const columnas = ['Nombre', 'Ubicación', 'Superficie (ha)', 'Tipo de Cultivo', 'Tipo de Suelo'];
      const datosProcesados = datos.map(campo => [
        campo.nombre || '',
        campo.ubicacion || '',
        campo.superficie || '',
        campo.tipoCultivo || '',
        campo.tipoSuelo || ''
      ]);
      
      // Datos para Excel
      const datosExcel = datos.map(campo => ({
        'Nombre': campo.nombre || '',
        'Ubicación': campo.ubicacion || '',
        'Superficie (ha)': campo.superficie || '',
        'Tipo de Cultivo': campo.tipoCultivo || '',
        'Tipo de Suelo': campo.tipoSuelo || '',
        'Fecha de Siembra': campo.fechaSiembra || '',
        'Fecha de Cosecha': campo.fechaCosecha || ''
      }));
      
      if (formato === 'pdf') {
        exportarPDF('Reporte de Campos', columnas, datosProcesados);
      } else {
        exportarExcel('Reporte de Campos', datosExcel);
      }
    } catch (err) {
      console.error('Error al generar reporte de campos:', err);
      setError('Error al generar el reporte. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para generar reporte de almacenes
  const handleReporteAlmacenes = async (formato) => {
    try {
      setLoading(true);
      setError('');
      
      const { almacenes, productosPorAlmacen } = await generarReporteAlmacenes();
      
      if (almacenes.length === 0) {
        setError('No hay datos disponibles para generar el reporte.');
        return;
      }
      
      if (formato === 'pdf') {
        // Crear un reporte por cada almacén
        almacenes.forEach(almacen => {
          const productos = productosPorAlmacen[almacen.id] || [];
          
          // Información del almacén
          const doc = new jsPDF();
          doc.setFontSize(18);
          doc.text(`Reporte de Almacén: ${almacen.nombre}`, 14, 22);
          
          doc.setFontSize(11);
          doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 32);
          
          // Datos del almacén
          doc.setFontSize(14);
          doc.text('Información del Almacén', 14, 42);
          
          doc.setFontSize(11);
          doc.text(`Ubicación: ${almacen.ubicacion || ''}`, 14, 52);
          doc.text(`Tipo: ${almacen.tipo || ''}`, 14, 58);
          doc.text(`Capacidad: ${almacen.capacidad || ''}`, 14, 64);
          doc.text(`Responsable: ${almacen.responsable || ''}`, 14, 70);
          
          // Lista de productos
          doc.setFontSize(14);
          doc.text('Productos en Inventario', 14, 84);
          
          if (productos.length === 0) {
            doc.setFontSize(11);
            doc.text('No hay productos registrados en este almacén.', 14, 94);
          } else {
            // Tabla de productos
            const columnasProductos = ['Nombre', 'Categoría', 'Cantidad', 'Unidad', 'Stock Mínimo'];
            const datosProductos = productos.map(producto => [
              producto.nombre || '',
              producto.categoria || '',
              producto.cantidad || '',
              producto.unidadMedida || '',
              producto.stockMinimo || ''
            ]);
            
            doc.autoTable({
              head: [columnasProductos],
              body: datosProductos,
              startY: 94,
              styles: { overflow: 'linebreak' },
              columnStyles: { text: { cellWidth: 'wrap' } },
              headStyles: { fillColor: [44, 94, 26] }
            });
          }
          
          // Guardar el PDF
          doc.save(`reporte_almacen_${almacen.nombre.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
        });
      } else {
        // Exportar a Excel
        const wb = XLSX.utils.book_new();
        
        // Hoja para almacenes
        const wsAlmacenes = XLSX.utils.json_to_sheet(almacenes.map(almacen => ({
          'Nombre': almacen.nombre || '',
          'Ubicación': almacen.ubicacion || '',
          'Tipo': almacen.tipo || '',
          'Capacidad': almacen.capacidad || '',
          'Responsable': almacen.responsable || ''
        })));
        
        XLSX.utils.book_append_sheet(wb, wsAlmacenes, 'Almacenes');
        
        // Hoja para cada almacén con sus productos
        almacenes.forEach(almacen => {
          const productos = productosPorAlmacen[almacen.id] || [];
          
          if (productos.length > 0) {
            const nombreHoja = `Productos_${almacen.nombre}`.slice(0, 31);
            const wsProductos = XLSX.utils.json_to_sheet(productos.map(producto => ({
              'Nombre': producto.nombre || '',
              'Categoría': producto.categoria || '',
              'Cantidad': producto.cantidad || '',
              'Unidad': producto.unidadMedida || '',
              'Stock Mínimo': producto.stockMinimo || '',
              'Fecha Vencimiento': producto.fechaVencimiento || '',
              'Lote': producto.lote || ''
            })));
            
            XLSX.utils.book_append_sheet(wb, wsProductos, nombreHoja);
          }
        });
        
        XLSX.writeFile(wb, `reporte_almacenes_${new Date().toISOString().split('T')[0]}.xlsx`);
      }
    } catch (err) {
      console.error('Error al generar reporte de almacenes:', err);
      setError('Error al generar el reporte. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para generar reporte de fumigaciones
  const handleReporteFumigaciones = async (formato) => {
    try {
      setLoading(true);
      setError('');
      
      const datos = await generarReporteFumigaciones(filtrosFumigaciones);
      
      if (datos.length === 0) {
        setError('No hay datos disponibles para generar el reporte.');
        return;
      }
      
      // Preparar datos para exportación
      const columnas = ['Campo', 'Fecha', 'Fumigador', 'Producto', 'Cantidad', 'Unidad', 'Hectáreas', 'Estado'];
      const datosProcesados = datos.map(fumigacion => [
        fumigacion.campoNombre || '',
        fumigacion.fecha instanceof Date 
          ? fumigacion.fecha.toLocaleDateString() 
          : new Date(fumigacion.fecha).toLocaleDateString(),
        fumigacion.fumigador || '',
        fumigacion.producto || '',
        fumigacion.cantidad || '',
        fumigacion.unidad || '',
        fumigacion.hectareas || '',
        fumigacion.estado || ''
      ]);
      
      // Datos para Excel
      const datosExcel = datos.map(fumigacion => ({
        'Campo': fumigacion.campoNombre || '',
        'Fecha': fumigacion.fecha instanceof Date 
          ? fumigacion.fecha.toLocaleDateString() 
          : new Date(fumigacion.fecha).toLocaleDateString(),
        'Fumigador': fumigacion.fumigador || '',
        'Producto': fumigacion.producto || '',
        'Cantidad': fumigacion.cantidad || '',
        'Unidad': fumigacion.unidad || '',
        'Hectáreas': fumigacion.hectareas || '',
        'Estado': fumigacion.estado || '',
        'Observaciones': fumigacion.observaciones || ''
      }));
      
      if (formato === 'pdf') {
        exportarPDF('Reporte de Fumigaciones', columnas, datosProcesados);
      } else {
        exportarExcel('Reporte de Fumigaciones', datosExcel);
      }
    } catch (err) {
      console.error('Error al generar reporte de fumigaciones:', err);
      setError('Error al generar el reporte. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para generar reporte de compras
  const handleReporteCompras = async (formato) => {
    try {
      setLoading(true);
      setError('');
      
      const datos = await generarReporteCompras(filtrosCompras);
      
      if (datos.length === 0) {
        setError('No hay datos disponibles para generar el reporte.');
        return;
      }
      
      // Preparar datos para exportación
      const columnas = ['Código', 'Proveedor', 'Fecha Emisión', 'Fecha Recepción', 'Almacén', 'Total', 'Estado'];
      const datosProcesados = datos.map(compra => [
        compra.codigo || '',
        compra.proveedor || '',
        compra.fechaEmision instanceof Date 
          ? compra.fechaEmision.toLocaleDateString() 
          : new Date(compra.fechaEmision).toLocaleDateString(),
        compra.fechaRecepcion 
          ? (compra.fechaRecepcion instanceof Date 
            ? compra.fechaRecepcion.toLocaleDateString() 
            : new Date(compra.fechaRecepcion).toLocaleDateString())
          : 'N/A',
        compra.almacenNombre || '',
        `$${parseFloat(compra.total || 0).toFixed(2)}`,
        compra.estado || ''
      ]);
      
      // Datos para Excel
      const datosExcel = datos.map(compra => ({
        'Código': compra.codigo || '',
        'Proveedor': compra.proveedor || '',
        'Contacto Proveedor': compra.contactoProveedor || '',
        'Fecha Emisión': compra.fechaEmision instanceof Date 
          ? compra.fechaEmision.toLocaleDateString() 
          : new Date(compra.fechaEmision).toLocaleDateString(),
        'Fecha Recepción': compra.fechaRecepcion 
          ? (compra.fechaRecepcion instanceof Date 
            ? compra.fechaRecepcion.toLocaleDateString() 
            : new Date(compra.fechaRecepcion).toLocaleDateString())
          : 'N/A',
        'Almacén': compra.almacenNombre || '',
        'Total': `$${parseFloat(compra.total || 0).toFixed(2)}`,
        'Estado': compra.estado || '',
        'Condiciones Pago': compra.condicionesPago || '',
        'Observaciones': compra.observaciones || ''
      }));
      
      if (formato === 'pdf') {
        exportarPDF('Reporte de Compras', columnas, datosProcesados);
      } else {
        exportarExcel('Reporte de Compras', datosExcel);
      }
    } catch (err) {
      console.error('Error al generar reporte de compras:', err);
      setError('Error al generar el reporte. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '1200px', 
      mx: 'auto',
      px: { xs: 1, sm: 2, md: 3 }
    }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Generación de Reportes
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      <Grid container spacing={3}>
        {/* Reporte de Campos */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography gutterBottom variant="h6" component="div" color="primary">
                <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Reporte de Campos
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Genera un reporte con la información de todos los campos registrados en el sistema.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button 
                size="small" 
                startIcon={<PictureAsPdfIcon />} 
                onClick={() => handleReporteCampos('pdf')}
                disabled={loading}
              >
                Exportar PDF
              </Button>
              <Button 
                size="small" 
                startIcon={<TableViewIcon />} 
                onClick={() => handleReporteCampos('excel')}
                disabled={loading}
              >
                Exportar Excel
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Reporte de Almacenes */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography gutterBottom variant="h6" component="div" color="primary">
                <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Reporte de Almacenes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Genera un reporte con la información de todos los almacenes y sus productos en inventario.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
              <Button 
                size="small" 
                startIcon={<PictureAsPdfIcon />} 
                onClick={() => handleReporteAlmacenes('pdf')}
                disabled={loading}
              >
                Exportar PDF
              </Button>
              <Button 
                size="small" 
                startIcon={<TableViewIcon />} 
                onClick={() => handleReporteAlmacenes('excel')}
                disabled={loading}
              >
                Exportar Excel
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Reporte de Fumigaciones */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography gutterBottom variant="h6" component="div" color="primary">
                <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Reporte de Fumigaciones
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Genera un reporte de fumigaciones filtrando por campo, fechas y estado.
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Campo</InputLabel>
                    <Select
                      name="campoId"
                      value={filtrosFumigaciones.campoId}
                      label="Campo"
                      onChange={handleFiltrosFumigacionesChange}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {campos.map(campo => (
                        <MenuItem key={campo.id} value={campo.id}>
                          {campo.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Fecha Inicio"
                    name="fechaInicio"
                    type="date"
                    value={filtrosFumigaciones.fechaInicio}
                    onChange={handleFiltrosFumigacionesChange}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Fecha Fin"
                    name="fechaFin"
                    type="date"
                    value={filtrosFumigaciones.fechaFin}
                    onChange={handleFiltrosFumigacionesChange}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      name="estado"
                      value={filtrosFumigaciones.estado}
                      label="Estado"
                      onChange={handleFiltrosFumigacionesChange}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="Pendiente">Pendiente</MenuItem>
                      <MenuItem value="Completada">Completada</MenuItem>
                      <MenuItem value="Cancelada">Cancelada</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
              <Button 
                size="small" 
                startIcon={<PictureAsPdfIcon />} 
                onClick={() => handleReporteFumigaciones('pdf')}
                disabled={loading}
              >
                Exportar PDF
              </Button>
              <Button 
                size="small" 
                startIcon={<TableViewIcon />} 
                onClick={() => handleReporteFumigaciones('excel')}
                disabled={loading}
              >
                Exportar Excel
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Reporte de Compras */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography gutterBottom variant="h6" component="div" color="primary">
                <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Reporte de Compras
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Genera un reporte de compras filtrando por fechas, estado y almacén de destino.
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Fecha Inicio"
                    name="fechaInicio"
                    type="date"
                    value={filtrosCompras.fechaInicio}
                    onChange={handleFiltrosComprasChange}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Fecha Fin"
                    name="fechaFin"
                    type="date"
                    value={filtrosCompras.fechaFin}
                    onChange={handleFiltrosComprasChange}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      name="estado"
                      value={filtrosCompras.estado}
                      label="Estado"
                      onChange={handleFiltrosComprasChange}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="Pendiente">Pendiente</MenuItem>
                      <MenuItem value="Completado">Completado</MenuItem>
                      <MenuItem value="Cancelado">Cancelado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Almacén</InputLabel>
                    <Select
                      name="almacenDestino"
                      value={filtrosCompras.almacenDestino}
                      label="Almacén"
                      onChange={handleFiltrosComprasChange}
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
              </Grid>
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
              <Button 
                size="small" 
                startIcon={<PictureAsPdfIcon />} 
                onClick={() => handleReporteCompras('pdf')}
                disabled={loading}
              >
                Exportar PDF
              </Button>
              <Button 
                size="small" 
                startIcon={<TableViewIcon />} 
                onClick={() => handleReporteCompras('excel')}
                disabled={loading}
              >
                Exportar Excel
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportesList;