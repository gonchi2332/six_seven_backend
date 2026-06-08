import * as TypeValidations from "./shared/type.validator";

/**
 * Valida la solicitud para obtener o crear un enlace público de perfil.
 * @param {any} parameters - Objeto con el nombre de usuario o token.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function getOrCreatePublicLinkValidation(parameters: any) {
  const arrayParameter = [parameters.username];
  const finalValidation = TypeValidations.validateTokenPayload(parameters) ||
    TypeValidations.validateArrayParameterType(arrayParameter, "string");
  const message = (!finalValidation) ? "Nombre de usuario invalido." : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para ver la visibilidad de las secciones del perfil.
 * @param {any} parameters - Objeto con el nombre de usuario o token.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function viewSectionsVisibilityValidation(parameters: any) {
  const arrayParameter = [parameters.username];
  const finalValidation = TypeValidations.validateArrayParameterType(arrayParameter, "string") ||
    TypeValidations.validateTokenPayload(parameters);
  const message = (!finalValidation) ? "Nombre de usuario faltante o inválido" : "";
  return { result: finalValidation, messageState: message };
}