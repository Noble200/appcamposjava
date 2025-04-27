// src/utils/dateUtils.js
/**
 * Formatea una fecha como string en formato DD/MM/YYYY
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    
    const fechaObj = fecha instanceof Date 
      ? fecha 
      : new Date(fecha);
      
    return fechaObj.toLocaleDateString();
  };
  
  /**
   * Convierte una fecha a formato ISO para inputs de tipo date
   * @param {Date|string} fecha - Fecha a convertir
   * @returns {string} Fecha en formato YYYY-MM-DD
   */
  export const fechaAIso = (fecha) => {
    if (!fecha) return '';
    
    const fechaObj = fecha instanceof Date 
      ? fecha 
      : new Date(fecha);
      
    return fechaObj.toISOString().split('T')[0];
  };
  
  /**
   * Verifica si una fecha está en el pasado
   * @param {Date|string} fecha - Fecha a verificar
   * @returns {boolean} True si la fecha está en el pasado
   */
  export const esFechaPasada = (fecha) => {
    if (!fecha) return false;
    
    const fechaObj = fecha instanceof Date 
      ? fecha 
      : new Date(fecha);
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    return fechaObj < hoy;
  };
  
  /**
   * Calcula la diferencia en días entre dos fechas
   * @param {Date|string} fecha1 - Primera fecha
   * @param {Date|string} fecha2 - Segunda fecha
   * @returns {number} Diferencia en días
   */
  export const diferenciaEnDias = (fecha1, fecha2) => {
    if (!fecha1 || !fecha2) return 0;
    
    const fechaObj1 = fecha1 instanceof Date 
      ? fecha1 
      : new Date(fecha1);
    
    const fechaObj2 = fecha2 instanceof Date 
      ? fecha2 
      : new Date(fecha2);
    
    const diferencia = fechaObj2.getTime() - fechaObj1.getTime();
    return Math.round(diferencia / (1000 * 60 * 60 * 24));
  };