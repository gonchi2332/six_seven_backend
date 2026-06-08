import * as TypeValidations from "./shared/type.validator";
import * as ImageValidations from "./shared/image.validator";
import * as ArrayValidations from "./shared/array.validator";
import * as StringValidations from "./shared/string.validator";
import * as RegexValidations from "./shared/regex.validator";

/**
 * Valida la lista de enlaces de un proyecto.
 * Verifica que cada enlace tenga etiqueta y cumpla con el formato de URL/dominio.
 * @param {any} links - Array de objetos de enlace (label, url).
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
function validateLinks(links: any) {
  for (const item of links) {
    if (!item.label || typeof item.label !== "string" || item.label.trim() === "") {
      return { result: false, messageState: "Todos los enlaces deben tener una etiqueta." };
    }
    if (!item.url || !RegexValidations.validateDomainFormat(item.url)) {
      return {
        result: false,
        messageState: `El enlace '${item.url || "vacío"}' no cumple con el formato válido (dominio.extension).`
      };
    }
  }
  return { result: true, messageState: "Validación exitosa" };
}

/**
 * Realiza validaciones comunes para la creación y modificación de proyectos.
 * Verifica descripción, área, rol, estado y enlaces.
 * @param {any} parameters - Objeto con los datos del proyecto.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
function commonProjectValidations(parameters: any) {
  let message = "";
  const firstValidation = StringValidations.validateTrimedString(parameters.description);
  message = (!firstValidation) ? "La descripción es requerida" : message;

  const secondValidation = StringValidations.validateStringMaxLength(parameters.description, 200);
  message = (!secondValidation) ? "La descripción supera el límite de 200 caracteres." : message;

  const thirdValidation = StringValidations.validateTrimedString(parameters.topic);
  message = (!thirdValidation) ? "El área es requerida" : message;

  const fourthValidation = StringValidations.validateTrimedString(parameters.role);
  message = (!fourthValidation) ? "El rol es requerido" : message;

  const fifthValidation = StringValidations.validateStringMaxLength(parameters.role, 50);
  message = (!fifthValidation) ? "El rol supera el límite de 50 caracteres." : message;

  const content = ["En proceso", "Finalizado", "Cancelado"];
  const sixthValidation = ArrayValidations.validateArrayContent(parameters.status, content);
  message = (!sixthValidation) ? "Estado del proyecto inválido." : message;

  const seventhValidation = ArrayValidations.validateArray(parameters.links);
  message = (!seventhValidation) ? "Al menos un enlace es requerido" : message;

  const eighthValidation = validateLinks(parameters.links);
  message = (!eighthValidation.result) ? eighthValidation.messageState : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation && fourthValidation &&
    fifthValidation && sixthValidation && seventhValidation && eighthValidation.result;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para registrar un nuevo proyecto personal.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con los datos del proyecto.
 * @param {any} imageParameter - Archivo de imagen del proyecto.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function registerProjectValidation(tokenParameter: any, parameters: any, imageParameter: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario invalido." : message;

  const secondValidation = ImageValidations.imageExists(imageParameter);
  message = (!secondValidation) ? "La imagen del proyecto es requerida" : message;

  const thirdValidation = commonProjectValidations(parameters);
  message = (!thirdValidation.result) ? thirdValidation.messageState : message;

  const fourthValidation = StringValidations.validateTrimedString(parameters.name);
  message = (!fourthValidation) ? "El nombre del proyecto es requerido" : message;

  const fifthValidation = StringValidations.validateStringMaxLength(parameters.name, 50);
  message = (!fifthValidation) ? "El nombre del proyecto supera el límite de 50 caracteres." : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation && fourthValidation &&
    fifthValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para modificar un proyecto existente.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con los datos actualizados.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function modifyProjectValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario invalido." : message;

  const secondValidation = TypeValidations.validateId(parameters);
  message = (!secondValidation) ? "ID de proyecto inválido." : message;

  const thirdValidation = commonProjectValidations(parameters);
  message = (!thirdValidation.result) ? thirdValidation.messageState : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para eliminar un proyecto.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con el ID del proyecto.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function deleteProjectValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario invalido." : message;

  const secondValidation = TypeValidations.validateId(parameters);
  message = (!secondValidation) ? "ID de proyecto inválido." : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para obtener proyectos públicos de un usuario.
 * @param {any} parameters - Objeto con el nombre de usuario.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function getPublicProjectsValidation(parameters: any) {
  const arrayParameter = [parameters.username];
  const finalValidation = TypeValidations.validateArrayParameterType(arrayParameter, "string");
  const message = (!finalValidation) ? "Nombre de usuario inválido" : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para obtener proyectos privados.
 * @param {any} parameters - Payload del token decodificado.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function getPrivateProjectsValidation(parameters: any) {
  const finalValidation = TypeValidations.validateTokenPayload(parameters);
  const message = (!finalValidation) ? "Nombre de usuario inválido" : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para modificar la visibilidad de proyectos de forma masiva.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Mapa de visibilidades.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function modifyProjectsVisibilityValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario invalido." : message;

  const secondValidation = ArrayValidations.validateObjectArray(parameters);
  message = (!secondValidation) ? "Formato de visibilidad inválido. Se esperaba un objeto." : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}