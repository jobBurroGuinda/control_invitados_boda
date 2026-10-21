/**
 * @fileoverview Utilidades de sanitización de texto para prevenir XSS e inyecciones.
 * @author Job Adolfo Salinas Hernández
 */

/**
 * Elimina caracteres peligrosos de una cadena para prevenir XSS e inyecciones.
 * Conserva letras, números, espacios, puntuación común, acentos y saltos de línea.
 * Aplica trim() al resultado.
 *
 * @param {string} str - Cadena a sanitizar.
 * @returns {string} Cadena sanitizada.
 */
export function sanitize(str) {
  return str
    .replace(/[<>]/g, '')              // etiquetas HTML
    .replace(/`/g, '')                 // backticks
    .replace(/javascript\s*:/gi, '')   // javascript: URIs
    .replace(/on\w+\s*=/gi, '')        // event handlers (onclick=, onerror=, etc.)
    .trim();
}

/**
 * Versión de `sanitize` sin trim(), pensada para usarse en tiempo real
 * mientras el usuario escribe en un campo de texto.
 *
 * @param {string} str - Cadena a sanitizar.
 * @returns {string} Cadena sanitizada sin recorte de espacios.
 */
export function sanitizeLive(str) {
  return str
    .replace(/[<>]/g, '')
    .replace(/`/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}
