/**
 * Valida si un valor es una fecha válida.
 * @param {Date} date - Valor a validar.
 * @returns {boolean} True si es una fecha válida, False en caso contrario.
 */
export function validateDate(date: Date) {
  const formatedDate = new Date(date);
  const ans = (date && (isNaN(formatedDate.getTime())));
  return !ans;
}

/**
 * Valida si una fecha es futura (posterior a hoy).
 * @param {Date} date - Fecha a validar.
 * @returns {boolean} True si la fecha NO es futura, False si es futura.
 */
export function validateFutureDate(date: Date) {
  const formatedDate = new Date(date);
  const ans = (date && ((formatedDate > new Date())));
  return !ans;
}

/**
 * Valida si una fecha se encuentra dentro del rango de los últimos 100 años.
 * @param {Date} date - Fecha a validar.
 * @returns {boolean} True si la fecha está en el rango, False en caso contrario.
 */
export function dateInRangeOver100Years(date: Date) {
  const formatedDate = new Date(date);
  const ans = (date && (formatedDate < new Date(new Date().setFullYear(new Date().getFullYear() - 100))));
  return !ans;
}