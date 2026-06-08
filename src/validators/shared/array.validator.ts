/**
 * Valida si el parámetro es un objeto válido y no un array.
 * @param {any} parameters - Valor a validar.
 * @returns {boolean} True si es un objeto (no array), False en caso contrario.
 */
export function validateObjectArray(parameters: any) {
  const ans = (!parameters || typeof parameters !== "object" || Array.isArray(parameters));
  return !ans;
}

/**
 * Valida si el parámetro es un array y no está vacío.
 * @param {any} parameters - Valor a validar.
 * @returns {boolean} True si es un array con elementos, False en caso contrario.
 */
export function validateEmptyArray(parameters: any) {
  const ans = (!parameters || parameters.length === 0);
  return !ans;
}

/**
 * Valida si un valor está incluido dentro de un array de contenidos permitidos.
 * @param {any} parameter - Valor a buscar.
 * @param {any[]} content - Array de valores permitidos.
 * @returns {boolean} True si el valor está incluido, False en caso contrario.
 */
export function validateArrayContent(parameter: any, content: any[]) {
  const ans = (!parameter || !content.includes(parameter));
  return !ans;
}

/**
 * Valida si el parámetro es un array válido y no está vacío.
 * @param {any} parameters - Valor a validar.
 * @returns {boolean} True si es un array con elementos, False en caso contrario.
 */
export function validateArray(parameters: any) {
  const ans = (!parameters || !Array.isArray(parameters) || parameters.length === 0);
  return !ans;
}