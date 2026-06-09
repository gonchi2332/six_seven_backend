import * as TypeValidations from "./shared/type.validator";
import * as ObjectValidations from "./shared/object.validator";
import * as ImageValidations from "./shared/image.validator";
import * as ArrayValidations from "./shared/array.validator";
import * as DateValidations from "./shared/date.validator";
import * as StringValidations from "./shared/string.validator";
import * as RegexValidations from "./shared/regex.validator";

/**
 * Realiza validaciones comunes para la creación y modificación de certificados.
 * @param {any} parameters - Objeto con los datos del certificado.
 * @param {boolean} isModify - Bandera para indicar si es una actualización parcial.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
function commonCertificateValidations(parameters: any, isModify: boolean = false) {
  if (!isModify || parameters.title !== undefined) {
    if (!TypeValidations.validateArrayParameterType([parameters.title], "string")) {
      return { result: false, messageState: "El titulo del certificado es requerido" };
    }
    if (!StringValidations.validateStringMaxLength(parameters.title, 100)) {
      return { result: false, messageState: "El titulo del certificado supera el limite de caracteres" };
    }
    if (!RegexValidations.validateCertificateTitleFormat(parameters.title) || 
        !StringValidations.validateProfanityString(parameters.title) || 
        RegexValidations.isGarbageInput(parameters.title)) {
      return { result: false, messageState: "Titulo del certificado invalido" };
    }
  }

  if (!isModify || parameters.area !== undefined) {
    if (!TypeValidations.validateArrayParameterType([parameters.area], "string")) {
      return { result: false, messageState: "El area del certificado es requerida" };
    }
    if (!StringValidations.validateStringMaxLength(parameters.area, 100)) {
      return { result: false, messageState: "El area del certificado supera el limite de caracteres" };
    }
    if (!RegexValidations.validateCertificateAreaFormat(parameters.area) || 
        !StringValidations.validateProfanityString(parameters.area) || 
        RegexValidations.isGarbageInput(parameters.area)) {
      return { result: false, messageState: "Area invalida" };
    }
  }

  if (!isModify || parameters.description !== undefined) {
    if (!TypeValidations.validateArrayParameterType([parameters.description], "string")) {
      return { result: false, messageState: "La descripcion del certificado es requerida" };
    }
    if (!StringValidations.validateStringMaxLength(parameters.description, 200)) {
      return { result: false, messageState: "Descripción del certificado fuera del rango de caracteres permitido" };
    }
  }

  if (!isModify || parameters.issueDate !== undefined) {
    if (!TypeValidations.parameterExists(parameters.issueDate) && !DateValidations.validateDate(parameters.issueDate)) {
      return { result: false, messageState: "Fecha de certificacion invalida" };
    }
    if (!DateValidations.validateFutureDate(parameters.issueDate)) {
      return { result: false, messageState: "La fecha de certificacion no puede ser futura" };
    }
    if (!DateValidations.dateInRangeOver100Years(parameters.issueDate)) {
      return { result: false, messageState: "La fecha de certificacion tiene que estar dentro del rango de hoy y hace 100 años" };
    }
  }

  return { result: true, messageState: "Validación exitosa" };
}

/**
 * Valida la solicitud para agregar un nuevo certificado profesional.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con los datos del certificado.
 * @param {any} imageParameter - Archivo de imagen de portada.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function manageUserCertificateValidation(tokenParameter: any, parameters: any, imageParameter: any) {
  if (!TypeValidations.validateTokenPayload(tokenParameter)) {
    return { result: false, messageState: "Nombre de usuario faltante o invalido." };
  }
  if (!ObjectValidations.validateObjectKeys(parameters)) {
    return { result: false, messageState: "Información del certificado faltante o invalida." };
  }
  if (!ImageValidations.validateImage(imageParameter)) {
    return { result: false, messageState: "Imagen de portada invalida." };
  }
  return commonCertificateValidations(parameters, false);
}

/**
 * Valida la solicitud para modificar un certificado existente.
 * @param {any} parameters - Objeto con los datos actualizados.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function modifyUserCertificateValidation(parameters: any) {
  if (!TypeValidations.validateId(parameters)) {
    return { result: false, messageState: "Id de certificado invalido." };
  }
  return commonCertificateValidations(parameters, true);
}

/**
 * Valida la solicitud para ver certificados públicos.
 * @param {any} parameters - Objeto con el nombre de usuario.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function viewPublicCertificatesValidation(parameters: any) {
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  const message = (!finalValidation) ? "Nombre de usuario faltante o invalido" : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para ver certificados privados.
 * @param {any} parameters - Payload del token decodificado.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function viewPrivateCertificatesValidation(parameters: any) {
  const finalValidation = TypeValidations.validateTokenPayload(parameters);
  const message = (!finalValidation) ? "Nombre de usuario faltante o invalido" : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para eliminar un certificado.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con el ID del certificado.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function deleteUserCertificateValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido" : message;

  const secondValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  message = (!secondValidation) ? "Id de certificado invalido" : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para modificar la visibilidad de certificados de forma masiva.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Mapa de visibilidades.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function modifyCertificatesVisibility(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido" : message;

  const secondValidation = ArrayValidations.validateObjectArray(parameters);
  message = (!secondValidation) ? "Formato de visibilidad inválido. Se esperaba un objeto." : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}
