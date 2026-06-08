import * as TypeValidations from "./shared/type.validator";
import * as ObjectValidations from "./shared/object.validator";
import * as ImageValidations from "./shared/image.validator";
import * as ArrayValidations from "./shared/array.validator";
import * as RegexValidations from "./shared/regex.validator";

/**
 * Valida la solicitud para registrar o modificar información personal.
 * Verifica el token, la estructura del objeto, formatos de teléfono y correo, y la imagen de perfil.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con los datos personales.
 * @param {any} imageParameter - Archivo de imagen de perfil opcional.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function handlePersonalInfoRequestValidation(
  tokenParameter: any,
  parameters: any,
  imageParameter: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido." : message;

  const secondValidation = ObjectValidations.validateObjectKeys(parameters);
  message = (!secondValidation) ? "Parametros de informacion personal del usuario insuficientes." : message;

  const thirdValidation = (!parameters.phone) || RegexValidations.validatePhoneFormat(parameters.phone);
  message = (!thirdValidation) ? "No se pudo registrar o modificar la informacion, numero de telefono invalido." : message;

  const fourthValidation = TypeValidations.validateOptionalParameterType(parameters.names, "string") ||
    TypeValidations.validateOptionalParameterType(parameters.firstSurname, "string") ||
    TypeValidations.validateOptionalParameterType(parameters.secondSurname, "string");
  message = (!fourthValidation) ? "No se pudo registrar o modificar la informacion, campos invalidos." : message;

  const fifthValidation = (!parameters.contactEmail) || RegexValidations.validateEmailFormat(parameters.contactEmail);
  message = (!fifthValidation) ? "No se pudo registrar o modificar la informacion, correo de contacto invalido." : message;

  const sixthValidation = (!parameters.secondaryRegistrationEmail) || RegexValidations.validateEmailFormat(parameters.secondaryRegistrationEmail);
  message = (!sixthValidation) ? "No se pudo registrar o modificar la informacion, correo de registro secundario invalido." : message;

  const seventhValidation = TypeValidations.validateOptionalParameterType(parameters.residenceCity, "string");
  message = (!seventhValidation) ? "No se pudo registrar o modificar la informacion, ciudad de residencia invalida." : message;

  const eighthValidation = TypeValidations.validateOptionalParameterType(parameters.residenceCountry, "string");
  message = (!eighthValidation) ? "No se pudo registrar o modificar la informacion, pais de residencia invalido." : message;

  const ninthValidation = ImageValidations.validateOptionalImage(imageParameter);
  message = (!ninthValidation) ? "Foto de perfil invalida." : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation && fourthValidation &&
    fifthValidation && sixthValidation && seventhValidation && eighthValidation && ninthValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para ver información personal pública de un usuario.
 * @param {any} parameters - Objeto con el nombre de usuario.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function viewPublicPersonalInfoValidation(parameters: any) {
  const arrayParameter = [parameters.username];
  const finalValidation = TypeValidations.validateArrayParameterType(arrayParameter, "string");
  const message = (!finalValidation) ? "Nombre de usuario inválido" : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para ver información personal privada (perfil propio).
 * @param {any} parameters - Payload del token decodificado.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function viewPrivatePersonalInfoValidation(parameters: any) {
  const finalValidation = TypeValidations.validateTokenPayload(parameters);
  const message = (!finalValidation) ? "Nombre de usuario inválido" : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para modificar la visibilidad de los campos de información personal.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Mapa de visibilidades.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function modifyPersonalInfoVisibilityValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario inválido" : message;

  const secondValidation = ArrayValidations.validateObjectArray(parameters);
  message = (!secondValidation) ? "Formato inválido. Se esperaba un objeto con opciones de visibilidad" : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}