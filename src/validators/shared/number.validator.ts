/**
 * Valida si un número se encuentra dentro de un rango inclusivo.
 * @param {number} amount - Valor numérico a validar.
 * @param {number} min - Límite inferior del rango.
 * @param {number} max - Límite superior del rango.
 * @returns {boolean} True si el número está en el rango, False en caso contrario.
 */
export function amountOutOfRange(amount: number, min: number, max: number) {
  const ans = (amount < min || amount > max);
  return !ans;
}