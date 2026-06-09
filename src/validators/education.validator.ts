import * as TypeValidations from "./shared/type.validator";
import * as ObjectValidations from "./shared/object.validator";
import * as ArrayValidations from "./shared/array.validator";
import * as DateValidations from "./shared/date.validator";
import * as RegexValidations from "./shared/regex.validator";
import * as StringValidations from "./shared/string.validator";
import * as EducationTypes from "../types/education.types";

/**
 * Realiza validaciones comunes para la creación y modificación de educación.
 * @param {any} parameters - Objeto con los datos de educación.
 * @param {boolean} isModify - Bandera para indicar si es una actualización parcial.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function commonEducationValidations(parameters: any, isModify: boolean = false) {
  if (!isModify || parameters.title !== undefined) {
    if (!TypeValidations.validateArrayParameterType([parameters.title], "string")) {
      return { result: false, messageState: "El nombre del titulo es requerido" };
    }
    // FIX: Lógica booleana corregida
    if (!RegexValidations.validateEducationTitleFormat(parameters.title) || 
        !StringValidations.validateProfanityString(parameters.title) || 
        RegexValidations.isGarbageInput(parameters.title)) {
      return { result: false, messageState: "Nombre del titulo invalido." };
    }
    if (!StringValidations.validateStringMaxLength(parameters.title, 50)) {
      return { result: false, messageState: "El titulo supera el limite de caracteres" };
    }
  }

  if (!isModify || parameters.academyDegreeId !== undefined) {
    if (!TypeValidations.validateArrayParameterType([parameters.academyDegreeId], "number")) {
      return { result: false, messageState: "El Id del grado academico es requerido o invalido" };
    }
  }

  if (!isModify || parameters.institution !== undefined) {
    if (!TypeValidations.validateArrayParameterType([parameters.institution], "string")) {
      return { result: false, messageState: "El nombre de la institucion es requerido" };
    }
    // FIX: isGarbageInput dispara el error si es true
    if (!RegexValidations.validateEducationInstitutionFormat(parameters.institution) || 
        RegexValidations.isGarbageInput(parameters.institution)) {
      return { result: false, messageState: "Nombre de institucion invalido" };
    }
    if (!StringValidations.validateStringMaxLength(parameters.institution, 50)) {
      return { result: false, messageState: "El nombre de la institucion supera el limite de caracteres" };
    }
  }

  if (!isModify || parameters.educationState !== undefined) {
    if (!TypeValidations.validateArrayParameterType([parameters.educationState], "string")) {
      return { result: false, messageState: "El estado de la educacion es requerido" };
    }
    if (!TypeValidations.validateEnum(parameters.educationState, EducationTypes.EducationState)) {
      return { result: false, messageState: "El estado de la educacion es invalido" };
    }
  }

  if (!isModify || parameters.startDate !== undefined) {
    if (!TypeValidations.parameterExists(parameters.startDate) && !DateValidations.validateDate(parameters.startDate)) {
      return { result: false, messageState: "Fecha de inicio o egreso invalida" };
    }
    if (!DateValidations.validateFutureDate(parameters.startDate)) {
      return { result: false, messageState: "Fecha de inicio o egreso no puede ser futura" };
    }
    if (!DateValidations.dateInRangeOver100Years(parameters.startDate)) {
      return { result: false, messageState: "El año de inicio o egreso tiene que estar dentro del rango de hoy y hace 100 años" };
    }
  }

  return { result: true, messageState: "Validación exitosa" };
}

/**
 * Valida la solicitud para agregar un nuevo registro de formación académica.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con los datos de educación.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function manageEducationValidation(tokenParameter: any, parameters: any) {
  if (!TypeValidations.validateTokenPayload(tokenParameter)) {
    return { result: false, messageState: "Nombre de usuario faltante o invalido." };
  }
  if (!ObjectValidations.validateObjectKeys(parameters)) {
    return { result: false, messageState: "Parametros de educacion personal del usuario insuficientes." };
  }
  return commonEducationValidations(parameters, false);
}

/**
 * Valida la solicitud para modificar un registro de formación académica existente.
 * @param {any} parameters - Objeto con los datos actualizados y el ID.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function modifyEducationValidation(parameters: any) {
  if (!TypeValidations.validateId(parameters)) {
    return { result: false, messageState: "Id de education invalido." };
  }
  return commonEducationValidations(parameters, true);
}

/**
 * Valida que el token de usuario sea válido para operaciones de educación.
 * @param {any} parameters - Payload del token decodificado.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function handleEducationValidation(parameters: any) {
  const finalValidation = TypeValidations.validateTokenPayload(parameters);
  const message = (!finalValidation) ? "Nombre de usuario faltante o invalido." : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para ver educación pública.
 * @param {any} parameters - Payload del token decodificado.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function viewPublicEducationValidation(parameters: any) {
  const finalValidation = TypeValidations.validateTokenPayload(parameters);
  const message = (!finalValidation) ? "Nombre de usuario faltante o invalido" : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para ver educación privada.
 * @param {any} parameters - Payload del token decodificado.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function viewPrivateEducationValidation(parameters: any) {
  const finalValidation = TypeValidations.validateTokenPayload(parameters);
  const message = (!finalValidation) ? "Nombre de usuario faltante o invalido" : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para eliminar un registro de educación.
 * @param {any} parameters - Objeto con el ID del registro.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function deleteEducationValidation(parameters: any) {
  const finalValidation = TypeValidations.validateId(parameters);
  const message = (!finalValidation) ? "Id de experiencia laboral invalido" : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para modificar la visibilidad de registros de educación de forma masiva.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Mapa de visibilidades.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function modifyEducationVisibilityValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido" : message;

  const secondValidation = ArrayValidations.validateObjectArray(parameters);
  message = (!secondValidation) ? "Formato de visibilidad inválido. Se esperaba un objeto." : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}
