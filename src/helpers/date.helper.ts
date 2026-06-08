/**
 * Realiza validaciones de fecha para el registro de información.
 * Verifica que la fecha sea válida y se encuentre dentro de los últimos 100 años.
 * @param {Date} startDateStr - Fecha a validar.
 * @returns {Object | undefined} Objeto con error si falla, o undefined si es válida.
 */
export function registerDateValidations(startDateStr: Date) {
  const startDate = new Date(startDateStr);
  if (isNaN(startDate.getTime())) {
    return {
      result: false,
      messageState: "El año de inicio es inválido."
    };
  }
  if (!isWithinLast100Years(startDate)) {
    return {
      result: false,
      messageState: "El año de inicio tiene que estar dentro del rango de hoy y hace 100 años"
    };
  }
}

/**
 * Realiza validaciones de fecha para la actualización de información.
 * @param {Date} [newStartDateStr] - Nueva fecha opcional a validar.
 * @returns {Object | undefined} Objeto con error si falla, o undefined si es válida.
 */
export function updateDateValidations(
  newStartDateStr?: Date | null) {
  if (newStartDateStr) {
    const validationResult = registerDateValidations(newStartDateStr);
    if (validationResult && !validationResult.result) {
      return {
        result: false,
        messageState: validationResult.messageState
      };
    }
  }
}

/**
 * Comprueba si una fecha está dentro del rango de los últimos 100 años hasta hoy.
 * @param {Date} targetDate - Fecha a comprobar.
 * @returns {boolean} True si está en rango, False en caso contrario.
 */
function isWithinLast100Years(targetDate: Date) {
  const hundredYearsAgo = new Date();
  hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);

  return targetDate > hundredYearsAgo && targetDate <= new Date();
}