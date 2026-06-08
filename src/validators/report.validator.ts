import * as TypeValidations from "./shared/type.validator";

/**
 * Valida la solicitud para obtener reportes analíticos.
 * Verifica el token de usuario y la presencia del parámetro `period`.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con los parámetros del reporte (period).
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function getReportsValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario inválido" : message;

  const secondValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  message = (!secondValidation) ? "El parametro periodo es requerido" : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}