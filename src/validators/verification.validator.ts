import * as TypeValidations from "./shared/type.validator";
import * as StringValidations from "./shared/string.validator";

/**
 * Valida la solicitud para obtener el correo de registro del usuario.
 * @param {any} parameters - Payload del token decodificado.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function getUserMailValidation(parameters: any) {
  const finalValidation = TypeValidations.validateTokenPayload(parameters);
  const message = (!finalValidation) ? "Nombre de usuario invalido." : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para enviar un correo de verificación.
 * @param {any} parameters - Payload del token decodificado.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function sendMailVerificationValidation(parameters: any) {
  const finalValidation = TypeValidations.validateTokenPayload(parameters);
  const message = (!finalValidation) ? "Nombre de usuario invalido." : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para comparar un código de verificación de correo.
 * Verifica el token, la presencia del código y que tenga exactamente 8 dígitos.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con el código a verificar (`currentCode`).
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function compareMailCodeValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario invalido." : message;

  const secondValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  message = (!secondValidation) ? "Codigo de verficiacion invalido, error de campos." : message;

  const thirdValidation = StringValidations.stringLenghtNotEqualsTo(parameters.currentCode, 8);
  message = (!thirdValidation) ? "El codigo de verificacion introducido no es de 8 digitos." : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation;
  return { result: finalValidation, messageState: message };
}