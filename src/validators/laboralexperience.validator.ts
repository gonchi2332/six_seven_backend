import * as TypeValidations from "./shared/type.validator";
import * as ObjectValidations from "./shared/object.validator";
import * as ArrayValidations from "./shared/array.validator";
import * as DateValidations from "./shared/date.validator";
import * as RegexValidations from "./shared/regex.validator";
import * as StringValidations from "./shared/string.validator";

/**
 * Valida la solicitud para agregar un nuevo registro de experiencia laboral.
 * Verifica el token, campos obligatorios, formatos de cargo y empresa, longitudes y validez de fechas.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con los datos de experiencia laboral.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function manageUserLaboralExperienceValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido." : message;

  let arrayParameter = [parameters.position];
  const secondValidation = TypeValidations.validateArrayParameterType(arrayParameter, "string");
  message = (!secondValidation) ? "El nombre del puesto es requerido" : message;

  const thirdValidation = ObjectValidations.validateObjectKeys(parameters);
  message = (!thirdValidation) ? "Parametros de informacion laboral del usuario insuficientes." : message;

  const fourthValidation = DateValidations.validateDate(parameters.startDate);
  message = (!fourthValidation) ? "La fecha de inicio es inválida." : message;

  const fifthValidation = (!parameters.endDate) || DateValidations.validateDate(parameters.endDate);
  message = (!fifthValidation) ? "La fecha de fin es inválida." : message;

  const sixthValidation = RegexValidations.validateWorkPositionFormat(parameters.position) ||
    StringValidations.validateProfanityString(parameters.position) || RegexValidations.isGarbageInput(parameters.position);
  message = (!sixthValidation) ? "Nombre del puesto invalido." : message;

  arrayParameter = [parameters.companyName];
  const seventhValidation = TypeValidations.validateArrayParameterType(arrayParameter, "string");
  message = (!seventhValidation) ? "El nombre de la empresa es requerido" : message;

  const eighthValidation = RegexValidations.validateWorkCompanyFormat(parameters.companyName) ||
    RegexValidations.isGarbageInput(parameters.companyName);
  message = (!eighthValidation) ? "Nombre de empresa invalido" : message;

  arrayParameter = [parameters.position, parameters.companyName];
  let minArray = [0, 0];
  let maxArray = [50, 50];
  const ninthValidation = StringValidations.validateMultipleStringLenght(arrayParameter, minArray, maxArray);
  message = (!ninthValidation) ? "El cargo o nombre de empresa superan el limite de caracteres" : message;

  arrayParameter = [parameters.description];
  const tenthValidation = TypeValidations.validateArrayParameterType(arrayParameter, "string");
  message = (!tenthValidation) ? "La descripción es requerida" : message;

  arrayParameter = [parameters.description];
  minArray = [0];
  maxArray = [200];
  const eleventhValidation = StringValidations.validateMultipleStringLenght(arrayParameter, minArray, maxArray);
  message = (!eleventhValidation) ? "Descripcion invalida" : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation && fourthValidation &&
    fifthValidation && sixthValidation && seventhValidation && eighthValidation && ninthValidation &&
    tenthValidation && eleventhValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para modificar un registro de experiencia laboral existente.
 * Verifica el ID y los tipos de datos de los campos opcionales a actualizar.
 * @param {any} parameters - Objeto con los datos actualizados.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function modifyUserLaboralExperienceValidation(parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateId(parameters);
  message = (!firstValidation) ? "Id de experiencia laboral invalido." : message;

  const secondValidation = (parameters.startDate) && DateValidations.validateDate(parameters.startDate);
  message = (!secondValidation) ? "La fecha de inicio es inválida." : message;

  let arrayParameter = [parameters.position];
  const minArray = [0];
  let maxArray = [50];
  const thirdValidation = (parameters.position) && StringValidations.validateMultipleStringLenght(arrayParameter, minArray, maxArray);
  message = (!thirdValidation) ? "El cargo supera el limite de caracteres" : message;

  const fourthValidation = (parameters.position) && (RegexValidations.validateWorkPositionFormat(parameters.position) ||
    StringValidations.validateProfanityString(parameters.position) || RegexValidations.isGarbageInput(parameters.position));
  message = (!fourthValidation) ? "Nombre del puesto invalido." : message;

  const fifthValidation = TypeValidations.validateOptionalParameterType(parameters.companyName, "string");
  message = (!fifthValidation) ? "El nombre de la empresa es requerido" : message;

  arrayParameter = [parameters.companyName];
  const sixthValidation = (parameters.companyName) && StringValidations.validateMultipleStringLenght(arrayParameter, minArray, maxArray);
  message = (!sixthValidation) ? "El nombre de empresa supera el limite de caracteres" : message;

  const seventhValidation = (parameters.companyName) && (RegexValidations.validateWorkCompanyFormat(parameters.companyName) ||
    RegexValidations.isGarbageInput(parameters.companyName));
  message = (!seventhValidation) ? "Nombre de empresa invalido" : message;

  const eighthValidation = TypeValidations.validateOptionalParameterType(parameters.description, "string");
  message = (!eighthValidation) ? "La descripción es requerida" : message;

  arrayParameter = [parameters.description];
  maxArray = [200];
  const ninthValidation = (parameters.description) && StringValidations.validateMultipleStringLenght(arrayParameter, minArray, maxArray);
  message = (!ninthValidation) ? "Descripcion invalida" : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation && fourthValidation &&
    fifthValidation && sixthValidation && seventhValidation && eighthValidation && ninthValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para ver experiencia laboral pública.
 * @param {any} parameters - Payload del token decodificado.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function viewPublicLaboralExperienceValidation(parameters: any) {
  const finalValidation = TypeValidations.validateTokenPayload(parameters);
  const message = (!finalValidation) ? "Nombre de usuario faltante o invalido" : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para ver experiencia laboral privada.
 * @param {any} parameters - Payload del token decodificado.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function viewPrivateLaboralExperienceValidation(parameters: any) {
  const finalValidation = TypeValidations.validateTokenPayload(parameters);
  const message = (!finalValidation) ? "Nombre de usuario faltante o invalido" : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para modificar la visibilidad de registros de experiencia laboral de forma masiva.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Mapa de visibilidades.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function modifyLaboralExperienceVisibilityValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido." : message;

  const secondValidation = ArrayValidations.validateObjectArray(parameters);
  message = (!secondValidation) ? "Formato de visibilidad inválido. Se esperaba un objeto." : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para eliminar un registro de experiencia laboral.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con el ID del registro.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function deleteUserLaboralExperienceValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido." : message;

  const secondValidation = TypeValidations.validateId(parameters);
  message = (!secondValidation) ? "Id de experiencia laboral invalido" : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}