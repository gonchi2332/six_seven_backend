/**
 * Valida si un objeto tiene claves (no está vacío).
 * @param {any} parameters - Objeto a validar.
 * @returns {boolean} True si el objeto tiene al menos una clave, False en caso contrario.
 */
export function validateObjectKeys(parameters: any) {
  const ans = (!parameters || Object.keys(parameters).length === 0);
  return !ans;
}