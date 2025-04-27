// src/utils/exportUtils.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Exporta datos a un archivo PDF
 * @param {string} titulo - Título del documento
 * @param {Array} columnas - Nombres de las columnas
 * @param {Array} datos - Datos a exportar
 * @param {Object} opciones - Opciones adicionales
 */
export const exportarPDF = (titulo, columnas, datos, opciones = {}) => {
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
    headStyles: { fillColor: [44, 94, 26] }, // Color verde del tema
    ...opciones
  });
  
  // Guardar el PDF
  doc.save(`${titulo.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Exporta datos a un archivo Excel
 * @param {string} titulo - Título de la hoja
 * @param {Array} datos - Datos a exportar
 * @param {string} nombreArchivo - Nombre del archivo
 */
export const exportarExcel = (titulo, datos, nombreArchivo = null) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(datos);
  
  // Excel limita el nombre de la hoja a 31 caracteres
  XLSX.utils.book_append_sheet(wb, ws, titulo.slice(0, 31));
  
  // Nombre de archivo personalizado o generado
  const nombre = nombreArchivo || 
    `${titulo.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  XLSX.writeFile(wb, nombre);
};

/**
 * Exporta datos a un archivo CSV
 * @param {Array} datos - Datos a exportar
 * @param {string} nombreArchivo - Nombre del archivo
 */
export const exportarCSV = (datos, nombreArchivo) => {
  const ws = XLSX.utils.json_to_sheet(datos);
  const csv = XLSX.utils.sheet_to_csv(ws);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute("download", nombreArchivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};