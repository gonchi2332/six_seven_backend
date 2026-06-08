import * as TypeValidations from "./shared/type.validator";
import * as StringValidations from "./shared/string.validator";
import * as RegexValidations from "./shared/regex.validator";

/**
 * Valida los parámetros para el registro de un nuevo usuario.
 * Verifica campos obligatorios, tipos de datos, longitud de contraseña y formato de correo.
 * @param {any} parameters - Objeto con los datos de registro (username, password, names, secondSurname, mainRegistrationEmail).
 * @returns {Object} Resultado de la validación (`result`) y mensaje de error (`messageState`) si aplica.
 */
export function registerUserValidations(parameters: any) {
  const { password, secondSurname, mainRegistrationEmail } = parameters;

  let message = "";
  const parameterArray = [parameters.username, parameters.password, parameters.names];
  const firstValidation = TypeValidations.validateArrayParameterType(parameterArray, "string");
  message = (!firstValidation) ? "Faltan campos obligatorios." : message;

  const secondValidation = TypeValidations.validateOptionalParameterType(secondSurname, "string");
  message = (!secondValidation) ? "El segundo apellido debe ser un texto válido." : message;

  const thirdValidation = StringValidations.validateStringMinLength(password as string, 8);
  message = (!thirdValidation) ? "La contraseña debe tener al menos 8 caracteres." : message;

  const fourthValidation = RegexValidations.validateEmailFormat(mainRegistrationEmail as string);
  message = (!fourthValidation) ? "Formato de correo electronico invalido." : message;

  const fifthValidation = TypeValidations.validateArrayParameterType(parameterArray, "string");
  message = (!fifthValidation) ? "Datos de entrada invalidos o incompletos." : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation && fourthValidation &&
    fifthValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida los parámetros para el inicio de sesión.
 * Verifica que el nombre de usuario y la contraseña sean cadenas de texto válidas.
 * @param {any} parameters - Objeto con las credenciales (username, password).
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function loginUserValidation(parameters: any) {
  let message;
  const firstValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  message = (!firstValidation) ? "Faltan campos obligatorios." : message;

  const parameterArray = [parameters.username, parameters.password];
  const secondValidation = TypeValidations.validateArrayParameterType(parameterArray, "string");
  message = (!secondValidation) ? "Credenciales inválidas." : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida los parámetros para el restablecimiento de contraseña.
 * Verifica campos obligatorios y longitud mínima de la nueva contraseña.
 * @param {any} parameters - Objeto con los datos (username, password, verificationCode).
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function resetPasswordValidation(parameters: any) {
  const { password } = parameters;

  let message = "";
  const firstValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  message = (!firstValidation) ? "Faltan campos obligatorios." : message;

  const secondValidation = StringValidations.validateStringMinLength(password as string, 8);
  message = (!secondValidation) ? "La contraseña debe tener al menos 8 caracteres." : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida los parámetros para solicitar el restablecimiento de contraseña.
 * @param {any} parameters - Objeto con el nombre de usuario.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function forgotPasswordValidation(parameters: any) {
  let message = "";
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  message = (!finalValidation) ? "El nombre de usuario es obligatorio." : message;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida los parámetros para verificar un código de restablecimiento.
 * @param {any} parameters - Objeto con el nombre de usuario y el código.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function verifyResetCodeValidation(parameters: any) {
  let message = "";
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  message = (!finalValidation) ? "Usuario y código son obligatorios." : message;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida los parámetros para la renovación del token de acceso.
 * @param {any} parameters - Objeto con el `refreshToken`.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function refreshTokenValidation(parameters: any) {
  let message = "";
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  message = (!finalValidation) ? "El campo refreshToken faltante o invalido" : message;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida los parámetros para el cierre de sesión.
 * @param {any} parameters - Objeto con el `refreshToken`.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function logoutValidation(parameters: any) {
  let message = "";
  const finalValidation = TypeValidations.parameterExists(parameters.refreshToken);
  message = (!finalValidation) ? "Refresh token requerido." : message;
  return { result: finalValidation, messageState: message };
}