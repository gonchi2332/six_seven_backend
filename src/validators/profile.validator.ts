import * as TypeValidations from "./shared/type.validator";

export function getOrCreatePublicLinkValidation(parameters: any) {
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  const message = (!finalValidation) ? "Nombre de usuario invalido." : "";
  return { result: finalValidation, messageState: message };
}

export function viewSectionsVisibilityValidation(parameters: any) {
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  const message = (!finalValidation) ? "Nombre de usuario faltante o inválido" : "";
  return { result: finalValidation, messageState: message };
}