import * as TypeValidations from "./shared/type.validator";
import * as StringValidations from "./shared/string.validator";
import * as RegexValidations from "./shared/regex.validator";

export function registerUserValidations(parameters: any) {
  const { password, secondSurname, mainRegistrationEmail } = parameters;

  let message = "";
  const firstValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  message = (!firstValidation) ? "Faltan campos obligatorios." : message;

  const secondValidation = TypeValidations.validateOptionalParameterType(secondSurname, "string");
  message = (!secondValidation) ? "El segundo apellido debe ser un texto válido." : message;

  const thirdValidation = StringValidations.validateStringMinLength(password as string, 8);
  message = (!thirdValidation) ? "La contraseña debe tener al menos 8 caracteres." : message;

  const fourthValidation = RegexValidations.validateEmailFormat(mainRegistrationEmail as string);
  message = (!fourthValidation) ? "Formato de correo electronico invalido." : message;

  const parameterArray = [parameters.username, parameters.password, parameters.names];
  const fifthValidation = TypeValidations.validateArrayParameterType(parameterArray, "string");
  message = (!fifthValidation) ? "Datos de entrada invalidos o incompletos." : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation && fourthValidation &&
    fifthValidation;
  return { result: finalValidation, messageState: message};
}

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

export function resetPasswordValidation(parameters: any) {
  const { password } = parameters;

  let message = "";
  const firstValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  message = (!firstValidation) ? "Faltan campos obligatorios." : message;

  const secondValidation = StringValidations.validateStringMinLength(password as string, 8);
  message = (!firstValidation) ? "La contraseña debe tener al menos 8 caracteres." : message;

  const finalValidation = firstValidation && secondValidation;
  return {
    result: finalValidation,
    messageState: message
  };
}

export function forgotPasswordValidation(parameters: any) {
  let message = "";
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  message = (!finalValidation) ? "El nombre de usuario es obligatorio." : message;
  return {
    result: finalValidation,
    messageState: message
  };
}

export function verifyResetCodeValidation(parameters: any) {
  let message = "";
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  message = (!finalValidation) ? "Usuario y código son obligatorios." : message;
  return {
    result: finalValidation,
    messageState: message
  };
}

export function refreshTokenValidation(parameters: any) {
  let message = "";
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  message = (!finalValidation) ? "El campo refreshToken faltante o invalido" : message;
  return {
    result: finalValidation,
    messageState: message
  };
}

export function logoutValidation(parameters: any) {
  let message = "";
  const finalValidation = TypeValidations.parameterExists(parameters.refreshToken);
  message = (!finalValidation) ? "Refresh token requerido." : message;
  return {
    result: finalValidation,
    messageState: message
  };
}