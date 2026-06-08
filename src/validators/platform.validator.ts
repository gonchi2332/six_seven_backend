import * as TypeValidations from "./shared/type.validator";
import * as StringValidations from "./shared/string.validator";

export function saveLinkedinProfileValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido" : message;

  const secondValidation = StringValidations.validateTrimedString(parameters);
  message = (!secondValidation) ? "El identificador de LinkedIn es obligatorio." : message;

  const thirdValidation = StringValidations.validateContentString(parameters.linkedinUsername.trim(), "linkedin.com");
  message = (!thirdValidation) ? "Por favor ingresa solo tu nombre de usuario, no la URL completa." : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation;
  return { result: finalValidation, messageState: message };
}

export function saveGithubProfileValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido" : message;

  const secondValidation = StringValidations.validateTrimedString(parameters);
  message = (!secondValidation) ? "El identificador de Github es obligatorio"  : message;

  const thirdValidation = StringValidations.validateContentString(parameters.githubUsername.trim(), "github.com");
  message = (!thirdValidation) ? "Por favor ingresa solo tu nombre de usuario, no la URL completa."  : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation;
  return { result: finalValidation, messageState: message };
}

export function getLinkedinProfileValidation (parameters: any) {
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  const message = (!finalValidation) ? "Nombre de usuario inválido." : "";
  return { result: finalValidation, messageState: message };
}

export function getGithubProfileValidation(parameters: any) {
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  const message = (!finalValidation) ? "Nombre de usuario inválido" : "";
  return { result: finalValidation, messageState: message };
}