// src/modules/reportes/ReportesService.js
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Función para generar reporte de campos
export const generarReporteCampos = async () => {
  try {
    const camposCollection = collection(db, 'campos');
    const camposSnapshot = await getDocs(camposCollection);
    
    return camposSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al generar reporte de campos:', error);
    throw error;
  }
};

// Función para generar reporte de almacenes y productos
export const generarReporteAlmacenes = async () => {
  try {
    // Obtener almacenes
    const almacenesCollection = collection(db, 'almacenes');
    const almacenesSnapshot = await getDocs(almacenesCollection);
    const almacenes = almacenesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Obtener productos
    const productosCollection = collection(db, 'productos');
    const productosSnapshot = await getDocs(productosCollection);
    const productos = productosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Agrupar productos por almacén
    const productosPorAlmacen = {};
    productos.forEach(producto => {
      if (!productosPorAlmacen[producto.almacenId]) {
        productosPorAlmacen[producto.almacenId] = [];
      }
      productosPorAlmacen[producto.almacenId].push(producto);
    });
    
    return { almacenes, productosPorAlmacen };
  } catch (error) {
    console.error('Error al generar reporte de almacenes:', error);
    throw error;
  }
};

// Función para generar reporte de fumigaciones
export const generarReporteFumigaciones = async (filtros = {}) => {
  try {
    const fumigacionesCollection = collection(db, 'fumigaciones');
    
    // Construir la consulta con filtros
    let q = fumigacionesCollection;
    const condiciones = [];
    
    if (filtros.campoId) {
      condiciones.push(where('campoId', '==', filtros.campoId));
    }
    
    if (filtros.fechaInicio && filtros.fechaFin) {
      condiciones.push(where('fecha', '>=', new Date(filtros.fechaInicio)));
      condiciones.push(where('fecha', '<=', new Date(filtros.fechaFin)));
    }
    
    if (filtros.estado) {
      condiciones.push(where('estado', '==', filtros.estado));
    }
    
    if (condiciones.length > 0) {
      q = query(fumigacionesCollection, ...condiciones, orderBy('fecha', 'desc'));
    } else {
      q = query(fumigacionesCollection, orderBy('fecha', 'desc'));
    }
    
    const fumigacionesSnapshot = await getDocs(q);
    const fumigaciones = fumigacionesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate ? doc.data().fecha.toDate() : new Date(doc.data().fecha)
    }));
    
    // Obtener campos para enriquecer los datos
    const camposCollection = collection(db, 'campos');
    const camposSnapshot = await getDocs(camposCollection);
    const campos = camposSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Enriquecer datos de fumigaciones con nombres de campos
    const fumigacionesEnriquecidas = fumigaciones.map(fumigacion => {
      const campo = campos.find(c => c.id === fumigacion.campoId);
      return {
        ...fumigacion,
        campoNombre: campo ? campo.nombre : 'Campo no encontrado'
      };
    });
    
    return fumigacionesEnriquecidas;
  } catch (error) {
    console.error('Error al generar reporte de fumigaciones:', error);
    throw error;
  }
};

// Función para generar reporte de compras
export const generarReporteCompras = async (filtros = {}) => {
  try {
    const comprasCollection = collection(db, 'compras');
    
    // Construir la consulta con filtros
    let q = comprasCollection;
    const condiciones = [];
    
    if (filtros.fechaInicio && filtros.fechaFin) {
      condiciones.push(where('fechaEmision', '>=', new Date(filtros.fechaInicio)));
      condiciones.push(where('fechaEmision', '<=', new Date(filtros.fechaFin)));
    }
    
    if (filtros.estado) {
      condiciones.push(where('estado', '==', filtros.estado));
    }
    
    if (filtros.almacenDestino) {
      condiciones.push(where('almacenDestino', '==', filtros.almacenDestino));
    }
    
    if (condiciones.length > 0) {
      q = query(comprasCollection, ...condiciones, orderBy('fechaEmision', 'desc'));
    } else {
      q = query(comprasCollection, orderBy('fechaEmision', 'desc'));
    }
    
    const comprasSnapshot = await getDocs(q);
    const compras = comprasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaEmision: doc.data().fechaEmision?.toDate ? doc.data().fechaEmision.toDate() : new Date(doc.data().fechaEmision),
      fechaRecepcion: doc.data().fechaRecepcion?.toDate ? doc.data().fechaRecepcion.toDate() : doc.data().fechaRecepcion ? new Date(doc.data().fechaRecepcion) : null
    }));
    
    // Obtener almacenes para enriquecer los datos
    const almacenesCollection = collection(db, 'almacenes');
    const almacenesSnapshot = await getDocs(almacenesCollection);
    const almacenes = almacenesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Enriquecer datos de compras con nombres de almacenes
    const comprasEnriquecidas = compras.map(compra => {
      const almacen = almacenes.find(a => a.id === compra.almacenDestino);
      return {
        ...compra,
        almacenNombre: almacen ? almacen.nombre : 'Almacén no encontrado'
      };
    });
    
    return comprasEnriquecidas;
  } catch (error) {
    console.error('Error al generar reporte de compras:', error);
    throw error;
  }
};

// Función para exportar a PDF
export const exportarPDF = (titulo, columnas, datos) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.text(titulo, 14, 22);
  
  // Fecha
  doc.setFontSize(11);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 32);
  
  // Tabla
  doc.autoTable({
    head: [columnas],
    body: datos,
    startY: 40,
    styles: { overflow: 'linebreak' },
    columnStyles: { text: { cellWidth: 'wrap' } },
    headStyles: { fillColor: [44, 94, 26] } // Color verde del tema
  });
  
  // Guardar el PDF
  doc.save(`${titulo.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Función para exportar a Excel
export const exportarExcel = (titulo, datos) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(datos);
  
  XLSX.utils.book_append_sheet(wb, ws, titulo.slice(0, 31)); // Excel limita el nombre de la hoja a 31 caracteres
  XLSX.writeFile(wb, `${titulo.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`);
};