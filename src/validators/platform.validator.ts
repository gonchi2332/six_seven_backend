import * as TypeValidations from "./shared/type.validator";
import * as StringValidations from "./shared/string.validator";

/**
 * Valida la solicitud para guardar el perfil de LinkedIn de un usuario.
 * Verifica el token, que el identificador no esté vacío y que no sea una URL completa.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con el `linkedinUsername`.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function saveLinkedinProfileValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido" : message;

  const secondValidation = StringValidations.validateTrimedString(parameters.linkedinUsername);
  message = (!secondValidation) ? "El identificador de LinkedIn es obligatorio." : message;

  const thirdValidation = StringValidations.validateContentString(parameters.linkedinUsername.trim(), "linkedin.com");
  message = (!thirdValidation) ? "Por favor ingresa solo tu nombre de usuario, no la URL completa." : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para guardar el perfil de GitHub de un usuario.
 * Verifica el token, que el identificador no esté vacío y que no sea una URL completa.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con el `githubUsername`.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function saveGithubProfileValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido" : message;

  const secondValidation = StringValidations.validateTrimedString(parameters.githubUsername);
  message = (!secondValidation) ? "El identificador de Github es obligatorio" : message;

  const thirdValidation = StringValidations.validateContentString(parameters.githubUsername.trim(), "github.com");
  message = (!thirdValidation) ? "Por favor ingresa solo tu nombre de usuario, no la URL completa." : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para obtener el perfil de LinkedIn de un usuario.
 * @param {any} parameters - Objeto con el nombre de usuario.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function getLinkedinProfileValidation(parameters: any) {
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  const message = (!finalValidation) ? "Nombre de usuario inválido." : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para obtener el perfil de GitHub de un usuario.
 * @param {any} parameters - Objeto con el nombre de usuario.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function getGithubProfileValidation(parameters: any) {
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  const message = (!finalValidation) ? "Nombre de usuario inválido" : "";
  return { result: finalValidation, messageState: message };
}
