import * as TypeValidations from "./shared/type.validator";
import * as ImageValidations from "./shared/image.validator";
import * as ArrayValidations from "./shared/array.validator";
import * as StringValidations from "./shared/string.validator";
import * as RegexValidations from "./shared/regex.validator";

function validateLinks(links: any) {
  for (const item of links) {
    if (!item.label || typeof item.label !== "string" || item.label.trim() === "") {
      return { result: false, messageState: "Todos los enlaces deben tener una etiqueta." };
    }
    if (!item.url || !RegexValidations.validateDomainFormat(item.url)) {
      return {
        result: false,
        messageState: `El enlace '${item.url || "vacío"}' no cumple con el formato válido (dominio.extension).`
      };
    }
  }
  return { result: true, messageState: "Validación exitosa" };
}

function commonProjectValidations(parameters: any) {
  let message = "";
  const firstValidation = StringValidations.validateTrimedString(parameters.description);
  message = (!firstValidation) ? "La descripción es requerida" : message;

  const secondValidation = StringValidations.validateStringMaxLength(parameters.description, 200);
  message = (!secondValidation) ? "La descripción supera el límite de 200 caracteres." : message;

  const thirdValidation = StringValidations.validateTrimedString(parameters.topic);
  message = (!thirdValidation) ? "El área es requerida" : message;

  const fourthValidation = StringValidations.validateTrimedString(parameters.role);
  message = (!fourthValidation) ? "El rol es requerido" : message;

  const fifthValidation = StringValidations.validateStringMaxLength(parameters.role, 50);
  message = (!fifthValidation) ? "El rol supera el límite de 50 caracteres." : message;

  const content = ["En proceso", "Finalizado", "Cancelado"];
  const sixthValidation = ArrayValidations.validateArrayContent(parameters.status, content);
  message = (!sixthValidation) ? "Estado del proyecto inválido." : message;

  const seventhValidation = ArrayValidations.validateArray(parameters.links);
  message = (!seventhValidation) ? "Al menos un enlace es requerido" : message;

  const eighthValidation = validateLinks(parameters.links);
  message = (!eighthValidation.result) ? eighthValidation.messageState : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation && fourthValidation &&
    fifthValidation && sixthValidation && seventhValidation && eighthValidation;
  return { result: finalValidation, messageState: message };
}

export function registerProjectValidation(tokenParameter: any, parameters: any, imageParameter: any) {
  let message = "";
  const firstValidation = TypeValidations.validateManyRequiredParamerersType(tokenParameter, "string");
  message = (!firstValidation) ? "Nombre de usuario invalido." : message;

  const secondValidation = ImageValidations.imageExists(imageParameter);
  message = (!secondValidation) ? "La imagen del proyecto es requerida" : message;

  const thirdValidation = commonProjectValidations(parameters);
  message = (!thirdValidation.result) ? thirdValidation.messageState : message;

  const fourthValidation = StringValidations.validateTrimedString(parameters.name);
  message = (!fourthValidation) ? "El nombre del proyecto es requerido" : message;

  const fifthValidation = StringValidations.validateStringMaxLength(parameters.name, 50);
  message = (!fifthValidation) ? "El nombre del proyecto supera el límite de 50 caracteres." : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation && fourthValidation &&
    fifthValidation;
  return { result: finalValidation, messageState: message };
}

export function modifyProjectValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateManyRequiredParamerersType(tokenParameter, "string");
  message = (!firstValidation) ? "Nombre de usuario invalido." : message;

  const secondValidation = TypeValidations.validateId(parameters);
  message = (!secondValidation) ? "ID de proyecto inválido." : message;

  const thirdValidation = commonProjectValidations(parameters);
  message = (!thirdValidation.result) ? thirdValidation.messageState : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation;
  return { result: finalValidation, messageState: message };
}

export function deleteProjectValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateManyRequiredParamerersType(tokenParameter, "string");
  message = (!firstValidation) ? "Nombre de usuario invalido." : message;

  const secondValidation = TypeValidations.validateId(parameters);
  message = (!secondValidation) ? "ID de proyecto inválido." : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}

export function getPublicProjectsValidation(parameters: any) {
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  const message = (!finalValidation) ? "Nombre de usuario inválido" : "";
  return { result: finalValidation, messageState: message };
}

export function getPrivateProjectsValidation(parameters: any) {
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  const message = (!finalValidation) ? "Nombre de usuario inválido" : "";
  return { result: finalValidation, messageState: message };
}

export function modifyProjectsVisibilityValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateManyRequiredParamerersType(tokenParameter, "string");
  message = (!firstValidation) ? "Nombre de usuario invalido." : message;

  const secondValidation = ArrayValidations.validateObjectArray(parameters);
  message = (!secondValidation) ? "Formato de visibilidad inválido. Se esperaba un objeto." : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}