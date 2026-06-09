import { getSkillTypeData } from "../helpers/skill.helper";
import * as TypeValidations from "./shared/type.validator";
import * as StringValidations from "./shared/string.validator";
import * as NumberValidations from "./shared/number.validator";
import * as ArrayValidations from "./shared/array.validator";
import * as RegexValidations from "./shared/regex.validator";

/**
 * Valida la solicitud para registrar una nueva habilidad global (Hard o Soft).
 * Verifica el token, longitud del nombre, lenguaje inapropiado y caracteres permitidos.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con el nombre de la habilidad.
 * @param {"hard" | "soft"} skillType - Tipo de habilidad a registrar.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function registerNewSkillValidation(tokenParameter: any, parameters: any, skillType: "hard" | "soft") {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido." : message;

  const skillTypeData = getSkillTypeData(skillType);
  const formatedSkillName = skillTypeData.formater(parameters.skillName);
  const arrayParameter = [formatedSkillName];
  const secondValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string") ||
    TypeValidations.validateArrayParameterType(arrayParameter, "string") ||
    StringValidations.validateStringMaxLength(formatedSkillName, 50) || (formatedSkillName.length === 0);
  message = (!secondValidation) ? "El nombre de habilidad supera el limite de caracteres o es invalido." : message;

  const thirdValidation = StringValidations.validateProfanityString(formatedSkillName);
  message = (!thirdValidation) ? "El nombre de la habilidad es inapropiado." : message;

  const fourthValidation = (skillType === "soft") && RegexValidations.validateLatinAlphabetFormat(parameters.skillName);
  message = (!fourthValidation) ? "Solo se permite caracteres del alfabeto latino." : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para asociar una habilidad existente a un usuario.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con el nombre de la habilidad.
 * @param {"hard" | "soft"} skillType - Tipo de habilidad.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function registerSkillValidation(tokenParameter: any, parameters: any, skillType: "hard" | "soft") {
  let message = "";
  const { punctuation, ...restParams } = parameters;

  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido." : message;

  const secondValidation = TypeValidations.validateManyRequiredParamerersType(restParams, "string");
  message = (!secondValidation) ? "El nombre de habilidad supera el limite de caracteres o es invalido." : message;

  const thirdValidation = StringValidations.isEmptyString(parameters.skillName);
  message = (!thirdValidation) ? "El nombre de habilidad supera el limite de caracteres o es invalido." : message;

  const fourthValidation = StringValidations.validateStringMaxLength(parameters.skillName, 50);
  message = (!fourthValidation) ? "El nombre de habilidad supera el limite de caracteres o es invalido." : message;

  const fifthValidation = (skillType === "soft" || skillType === "hard") && RegexValidations.validateLatinAlphabetFormat(parameters.skillName);
  message = (!fifthValidation) ? "Solo se permite caracteres del alfabeto latino." : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la puntuación para una nueva Hard Skill.
 * @param {any} parameters - Objeto con la puntuación (1-5).
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function registerNewHardSkillValidation(parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateManyRequiredParamerersType(parameters.punctuation, "number");
  message = (!firstValidation) ? "Puntuacion invalida o fuera de rango." : message;

  const secondValidation = NumberValidations.amountOutOfRange(parameters.punctuation, 1, 5);
  message = (!secondValidation) ? "Puntuacion fuera de rango, la puntuacion debe ser un numero entre 1 y 5." : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la puntuación para asociar una Hard Skill existente.
 * @param {any} parameters - Objeto con la puntuación (1-5).
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function registerHardSkillValidation(parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateManyRequiredParamerersType(parameters.punctuation, "number");
  message = (!firstValidation) ? "Puntuacion invalida o fuera de rango." : message;

  const secondValidation = NumberValidations.amountOutOfRange(parameters.punctuation, 1, 5);
  message = (!secondValidation) ? "Puntuacion fuera de rango, la puntuacion debe ser un numero entre 1 y 5." : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud base para ver habilidades de un usuario.
 * @param {any} parameters - Objeto con el nombre de usuario o token.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function viewSkillsBaseValidation(parameters: any) {
  const arrayParameter = [parameters.username];
  const finalValidation = TypeValidations.validateTokenPayload(parameters) ||
    TypeValidations.validateArrayParameterType(arrayParameter, "string");
  const message = (!finalValidation) ? "Nombre de usuario faltante o invalido" : "";
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para modificar la puntuación de una Hard Skill de usuario.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con el nombre de la habilidad y la nueva puntuación.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function modifyHardSkillValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido." : message;

  const secondValidation = TypeValidations.validateNonObjectParameterType(parameters.skillName, "string");
  message = (!secondValidation) ? "Nombre de usuario o de habilidad incompletos o invalidos." : message;

  const thirdValidation = StringValidations.isEmptyString(parameters.skillName);
  message = (!thirdValidation) ? "El nombre de habilidad supera el limite de caracteres o es invalido." : message;

  const fourthValidation = StringValidations.validateStringMaxLength(parameters.skillName, 50);
  message = (!fourthValidation) ? "El nombre de habilidad supera el limite de caracteres o es invalido." : message;

  const fifthValidation = TypeValidations.validateNonObjectParameterType(parameters.newPunctuation, "number");
  message = (!fifthValidation) ? "Puntuacion invalida." : message;

  const sixthValidation = NumberValidations.amountOutOfRange(parameters.newPunctuation, 1, 5);
  message = (!sixthValidation) ? "Puntuacion fuera de rango, la puntuacion debe ser un numero entre 1 y 5." : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation && fourthValidation &&
    fifthValidation && sixthValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para eliminar una habilidad de usuario.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Objeto con el nombre de la habilidad.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function deleteSkillValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario o de habilidad incompletos o invalidos." : message;

  const secondValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  message = (!secondValidation) ? "Nombre de usuario o de habilidad incompletos o invalidos." : message;

  const thirdValidation = StringValidations.isEmptyString(parameters.skillName);
  message = (!thirdValidation) ? "El nombre de habilidad supera el limite de caracteres o es invalido." : message;

  const fourthValidation = StringValidations.validateStringMaxLength(parameters.skillName, 50);
  message = (!fourthValidation) ? "El nombre de habilidad supera el limite de caracteres o es invalido." : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation && fourthValidation;
  return { result: finalValidation, messageState: message };
}

/**
 * Valida la solicitud para modificar la visibilidad de habilidades de forma masiva.
 * @param {any} tokenParameter - Payload del token decodificado.
 * @param {any} parameters - Mapa de visibilidades.
 * @returns {Object} Resultado de la validación y mensaje de error.
 */
export function modifySkillsVisibilityValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido." : message;

  const secondValidation = ArrayValidations.validateObjectArray(parameters);
  message = (!secondValidation) ? "Formato de visibilidad inválido. Se esperaba un objeto." : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}
