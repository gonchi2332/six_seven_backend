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
 * @param {boolean} isModify - Bandera para indicar si es una actualización parcial (campos opcionales).
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
function commonProjectValidations(parameters: any, isModify: boolean = false) {
  if (!isModify || parameters.description !== undefined) {
    if (!StringValidations.validateTrimedString(parameters.description)) {
      return { result: false, messageState: "La descripción es requerida" };
    }
    if (!StringValidations.validateStringMaxLength(parameters.description, 200)) {
      return { result: false, messageState: "La descripción supera el límite de 200 caracteres." };
    }
  }

  if (!isModify || parameters.topic !== undefined) {
    if (!StringValidations.validateTrimedString(parameters.topic)) {
      return { result: false, messageState: "El área es requerida" };
    }
  }

  if (!isModify || parameters.role !== undefined) {
    if (!StringValidations.validateTrimedString(parameters.role)) {
      return { result: false, messageState: "El rol es requerido" };
    }
    if (!StringValidations.validateStringMaxLength(parameters.role, 50)) {
      return { result: false, messageState: "El rol supera el límite de 50 caracteres." };
    }
  }

  if (!isModify || parameters.status !== undefined) {
    const content = ["En proceso", "Finalizado", "Cancelado"];
    if (!ArrayValidations.validateArrayContent(parameters.status, content)) {
      return { result: false, messageState: "Estado del proyecto inválido." };
    }
  }

  if (!isModify || parameters.links !== undefined) {
    let parsedLinks;
    try {
      parsedLinks = typeof parameters.links === "string" ? JSON.parse(parameters.links) : parameters.links;
    } catch (e) {
      return { result: false, messageState: "El formato de los enlaces es inválido." };
    }

    if (!ArrayValidations.validateArray(parsedLinks)) {
      return { result: false, messageState: "Al menos un enlace es requerido" };
    }
    
    const linksValidation = validateLinks(parsedLinks);
    if (!linksValidation.result) {
      return linksValidation;
    }
  }

  return { result: true, messageState: "Validación exitosa" };
}

/**
 * Valida la solicitud para registrar un nuevo proyecto personal.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con los datos del proyecto.
 * @param {any} imageParameter - Archivo de imagen del proyecto.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function registerProjectValidation(tokenParameter: any, parameters: any, imageParameter: any) {
  if (!TypeValidations.validateTokenPayload(tokenParameter)) {
    return { result: false, messageState: "Nombre de usuario invalido." };
  }

  if (!ImageValidations.imageExists(imageParameter)) {
    return { result: false, messageState: "La imagen del proyecto es requerida" };
  }

  if (!StringValidations.validateTrimedString(parameters.name)) {
    return { result: false, messageState: "El nombre del proyecto es requerido" };
  }
  
  if (!StringValidations.validateStringMaxLength(parameters.name, 50)) {
    return { result: false, messageState: "El nombre del proyecto supera el límite de 50 caracteres." };
  }

  return commonProjectValidations(parameters, false);
}

/**
 * Valida la solicitud para modificar un proyecto existente.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con los datos actualizados.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function modifyProjectValidation(tokenParameter: any, parameters: any) {
  if (!TypeValidations.validateTokenPayload(tokenParameter)) {
    return { result: false, messageState: "Nombre de usuario invalido." };
  }

  if (!TypeValidations.validateId(parameters)) {
    return { result: false, messageState: "ID de proyecto inválido." };
  }

  return commonProjectValidations(parameters, true);
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
