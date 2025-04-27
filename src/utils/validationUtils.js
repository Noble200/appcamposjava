// src/utils/validationUtils.js
/**
 * Valida que un valor no sea vacío
 * @param {any} valor - Valor a validar
 * @returns {boolean} Si es válido o no
 */
export const esRequerido = (valor) => {
    if (valor === null || valor === undefined) return false;
    return valor.toString().trim() !== '';
  };
  
  /**
   * Valida que un valor sea un número válido
   * @param {any} valor - Valor a validar
   * @returns {boolean} Si es válido o no
   */
  export const esNumero = (valor) => {
    if (valor === null || valor === undefined || valor === '') return false;
    return !isNaN(Number(valor));
  };
  
  /**
   * Valida que un valor sea un número positivo
   * @param {any} valor - Valor a validar
   * @returns {boolean} Si es válido o no
   */
  export const esNumeroPositivo = (valor) => {
    if (!esNumero(valor)) return false;
    return Number(valor) >= 0;
  };
  
  /**
   * Valida que un email tenga formato correcto
   * @param {string} email - Email a validar
   * @returns {boolean} Si es válido o no
   */
  export const esEmailValido = (email) => {
    if (!email) return false;
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };
  
  /**
   * Valida longitud mínima de un string
   * @param {string} valor - Valor a validar
   * @param {number} longitud - Longitud mínima
   * @returns {boolean} Si es válido o no
   */
  export const longitudMinima = (valor, longitud) => {
    if (!valor) return false;
    return valor.toString().length >= longitud;
  };
  
  /**
   * Valida longitud máxima de un string
   * @param {string} valor - Valor a validar
   * @param {number} longitud - Longitud máxima
   * @returns {boolean} Si es válido o no
   */
  export const longitudMaxima = (valor, longitud) => {
    if (!valor) return true;
    return valor.toString().length <= longitud;
  };
  
  /**
   * Valida una fecha
   * @param {string} fecha - Fecha a validar en formato YYYY-MM-DD
   * @returns {boolean} Si es válido o no
   */
  export const esFechaValida = (fecha) => {
    if (!fecha) return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(fecha)) return false;
    
    const nuevaFecha = new Date(fecha);
    return !isNaN(nuevaFecha.getTime());
  };