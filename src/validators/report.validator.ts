import * as TypeValidations from "./shared/type.validator";

export function getReportsValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateManyRequiredParamerersType(tokenParameter, "string");
  message = (!firstValidation) ? "Nombre de usuario inválido" : message;

  const secondValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  message = (!secondValidation) ? "El parametro periodo es requerido" : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}