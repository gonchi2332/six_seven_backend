import * as TypeValidations from "./shared/type.validator";
import * as ObjectValidations from "./shared/object.validator";
import * as ImageValidations from "./shared/image.validator";
import * as ArrayValidations from "./shared/array.validator";
import * as DateValidations from "./shared/date.validator";
import * as StringValidations from "./shared/string.validator";
import * as RegexValidations from "./shared/regex.validator";

/**
 * Valida la solicitud para agregar un nuevo certificado profesional.
 * Verifica el token, campos obligatorios, formatos de título y área, longitudes, validez de fechas e imagen de portada.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con los datos del certificado.
 * @param {any} imageParameter - Archivo de imagen de portada.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function manageUserCertificateValidation(
  tokenParameter: any,
  parameters: any,
  imageParameter: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido." : message;

  const secondValidation = ObjectValidations.validateObjectKeys(parameters);
  message = (!secondValidation) ? "Información del certificado faltante o invalida." : message;

  let arrayParameter = [parameters.title, parameters.description, parameters.area];
  const thirdValidation = TypeValidations.validateArrayParameterType(arrayParameter, "string");
  message = (!thirdValidation) ? "Datos del certificado incompletos o invalidos" : message;

  arrayParameter = [parameters.title, parameters.area, parameters.description];
  let minArray = [0, 0];
  let maxArray = [100, 100];
  const fourthValidation = StringValidations.validateMultipleStringLenght(arrayParameter, minArray, maxArray);
  message = (!fourthValidation) ? "Titulo o area del certificado fuera del rango de caracteres permitido" : message;

  arrayParameter = [parameters.description];
  minArray = [0];
  maxArray = [200];
  const fifthValidation = StringValidations.validateMultipleStringLenght(arrayParameter, minArray, maxArray);
  message = (!fifthValidation) ? "Descripción del certificado fuera del rango de caracteres permitido" : message;

  const sixthValidation = RegexValidations.validateCertificateTitleFormat(parameters.title) ||
    StringValidations.validateProfanityString(parameters.title) || RegexValidations.isGarbageInput(parameters.title);
  message = (!sixthValidation) ? "Titulo del certificado invalido" : message;

  const seventhValidation = RegexValidations.validateCertificateAreaFormat(parameters.area) ||
    StringValidations.validateProfanityString(parameters.area) || RegexValidations.isGarbageInput(parameters.area);
  message = (!seventhValidation) ? "Area invalida" : message;

  const eighthValidation = TypeValidations.parameterExists(parameters.issueDate) ||
    DateValidations.validateDate(parameters.issueDate);
  message = (!eighthValidation) ? "Fecha de certificacion invalida" : message;

  const ninthValidation = DateValidations.validateFutureDate(parameters.issueDate);
  message = (!ninthValidation) ? "La fecha de certificacion no puede ser futura" : message;

  const tenthValidation = DateValidations.dateInRangeOver100Years(parameters.issueDate);
  message = (!tenthValidation) ? "La fecha de certificacion tiene que estar dentro del rango de hoy y hace 100 años" : message;

  const eleventhValidation = ImageValidations.validateImage(imageParameter);
  message = (!eleventhValidation) ? "Imagen de portada invalida." : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation && fourthValidation &&
    fifthValidation && sixthValidation && seventhValidation && eighthValidation && ninthValidation &&
    tenthValidation && eleventhValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para modificar un certificado existente.
 * Verifica el ID y los tipos de datos de los campos opcionales a actualizar.
 * @param {any} parameters - Objeto con los datos actualizados.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function modifyUserCertificateValidation(parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateId(parameters);
  message = (!firstValidation) ? "Id de certificado invalido." : message;

  const secondValidation = TypeValidations.validateOptionalParameterType(parameters.description, "string");
  message = (!secondValidation) ? "Descripción del certificado invalida" : message;

  let arrayParameter = [parameters.description];
  let minArray = [0];
  let maxArray = [200];
  const thirdValidation = (parameters.description) &&
    StringValidations.validateMultipleStringLenght(arrayParameter, minArray, maxArray);
  message = (!thirdValidation) ? "Descripción del certificado fuera del rango de caracteres permitido" : message;

  const fourthValidation = TypeValidations.validateOptionalParameterType(parameters.area, "string");
  message = (!fourthValidation) ? "Area del certificado invalida" : message;

  arrayParameter = [parameters.area];
  minArray = [0];
  maxArray = [100];
  const fifthValidation = (parameters.area) &&
    StringValidations.validateMultipleStringLenght(arrayParameter, minArray, maxArray);
  message = (!fifthValidation) ? "Area del certificado fuera del rango de caracteres permitido" : message;

  const sixthValidation = (parameters.area) &&
    (RegexValidations.validateCertificateAreaFormat(parameters.area) ||
      StringValidations.validateProfanityString(parameters.area) || RegexValidations.isGarbageInput(parameters.area));
  message = (!sixthValidation) ? "Area del certificado invalida" : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation && fourthValidation &&
    fifthValidation && sixthValidation;
  return { result: finalValidation, messageState: message };
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