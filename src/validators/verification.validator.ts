import * as TypeValidations from "./shared/type.validator";
import * as StringValidations from "./shared/string.validator";

export function getUserMailValidation(parameters: any) {
  const finalValidation = TypeValidations.validateTokenPayload(parameters);
  const message = (!finalValidation) ? "Nombre de usuario invalido." : "";
  return { result: finalValidation, messageState: message };
}

export function sendMailVerificationValidation(parameters: any) {
  const finalValidation = TypeValidations.validateTokenPayload(parameters);
  const message = (!finalValidation) ? "Nombre de usuario invalido." : "";
  return { result: finalValidation, messageState: message };
}

export function compareMailCodeValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario invalido." : message;

  const secondValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  message = (!secondValidation) ? "Codigo de verficiacion invalido, error de campos." : message;

  const thirdValidation = StringValidations.stringLenghtNotEqualsTo(parameters.currentCode, 8);
  message = (!thirdValidation) ? "El codigo de verificacion introducido no es de 8 digitos." : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation;
  return { result: finalValidation, messageState: message }; 
}