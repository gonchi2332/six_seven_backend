/**
 * Extrae las claves de un objeto y las devuelve como un array de strings.
 * @param {any} object - Objeto del cual extraer las claves.
 * @returns {string[]} Array con los nombres de las propiedades del objeto.
 */
export function objectKeysToArray(object: any) {
  return Object.keys(object);
}