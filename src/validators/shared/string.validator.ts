import { profanity } from "../../config/leoprofanity.config";
import { uniqueWords, uniqueTrickyWords } from "../../utils/constants/array.constants";

/**
 * Valida si una cadena tiene una longitud mínima.
 * @param {string} parameter - Cadena a validar.
 * @param {number} limit - Longitud mínima permitida.
 * @returns {boolean} True si cumple la longitud mínima, False en caso contrario.
 */
export function validateStringMinLength(parameter: string, limit: number) {
  const ans = (parameter.length < limit);
  return !ans;
}

/**
 * Valida si un parámetro es una cadena de texto no vacía tras eliminar espacios.
 * @param {any} parameter - Valor a validar.
 * @returns {boolean} True si es una cadena válida con contenido, False en caso contrario.
 */
export function validateTrimedString(parameter: any) {
  const ans = (!parameter || typeof parameter !== "string" || parameter.trim().length === 0);
  return !ans;
}

/**
 * Valida si una cadena de texto está vacía.
 * @param {string} parameter - Cadena a validar.
 * @returns {boolean} True si NO está vacía, False si está vacía.
 */
export function isEmptyString(parameter: string) {
  const ans = (parameter.length === 0);
  return !ans;
}

/**
 * Valida si una cadena supera una longitud máxima.
 * @param {string} parameter - Cadena a validar.
 * @param {number} limit - Longitud máxima permitida.
 * @returns {boolean} True si NO supera el límite, False si lo supera.
 */
export function validateStringMaxLength(parameter: string, limit: number) {
  const ans = (parameter.length > limit);
  return !ans;
}

/**
 * Valida si la longitud de una cadena es diferente a un valor esperado.
 * @param {string} parameter - Cadena a validar.
 * @param {number} compareAmount - Longitud esperada.
 * @returns {boolean} True si la longitud es igual, False si es diferente.
 */
export function stringLenghtNotEqualsTo(parameter: string, compareAmount: number) {
  const ans = (parameter.length != compareAmount);
  return !ans;
}

/**
 * Valida las longitudes de múltiples cadenas de texto simultáneamente.
 * @param {string[]} parameters - Array de cadenas a validar.
 * @param {number[]} min - Array de longitudes mínimas correspondientes.
 * @param {number[]} max - Array de longitudes máximas correspondientes.
 * @returns {boolean} True si todas las cadenas cumplen sus rangos, False si alguna falla.
 */
export function validateMultipleStringLenght(parameters: string[], min: number[], max: number[]) {
  let ans = false;
  const parametersLenght = parameters.length;
  for (let i = 0; i < parametersLenght; i++) {
    ans = ans || (parameters[i].length < min[i] || parameters[i].length > max[i]);
    if (ans) {
      break;
    }
  }
  return !ans;
}

/**
 * Valida si una cadena contiene lenguaje ofensivo o palabras prohibidas.
 * Utiliza la librería `leoprofanity` y diccionarios personalizados.
 * @param {string} parameter - Cadena a analizar.
 * @returns {boolean} True si NO contiene lenguaje ofensivo, False si lo contiene.
 */
export function validateProfanityString(parameter: string) {
  const ans = (profanity.check(parameter) || containsBadWord(parameter, uniqueWords, uniqueTrickyWords));
  return !ans;
}

/**
 * Valida si una cadena contiene un fragmento de texto específico.
 * @param {string} parameter - Cadena base.
 * @param {string} content - Texto a buscar.
 * @returns {boolean} True si NO contiene el fragmento, False si lo contiene.
 */
export function validateContentString(parameter: string, content: string) {
  const ans = (parameter.includes(content));
  return !ans;
}

/**
 * Función interna para detectar palabras ofensivas en un texto, ignorando variaciones comunes.
 * @param {string} text - Texto a analizar.
 * @param {string[]} badWords - Lista de palabras ofensivas.
 * @param {string[]} trickyWords - Lista de palabras engañosas a ignorar.
 * @returns {boolean} True si se detectó una palabra ofensiva, False en caso contrario.
 */
export function containsBadWord(text: string, badWords: string[], trickyWords: string[]) {
  const words = text
    .toLowerCase()
    .replace(/[_\-.\s]+/g, " ")
    .trim()
    .split(" ");

  const filteredBadWords = words.filter(word => !trickyWords.includes(word));
  const filteredBadWordText = filteredBadWords.join("");

  return badWords.some(word => filteredBadWordText.includes(word));
}
