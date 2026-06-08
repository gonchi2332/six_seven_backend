import * as TypeValidations from "./shared/type.validator";
import * as ObjectValidations from "./shared/object.validator";
import * as ArrayValidations from "./shared/array.validator";
import * as DateValidations from "./shared/date.validator";
import * as RegexValidations from "./shared/regex.validator";
import * as StringValidations from "./shared/string.validator";
import * as EducationTypes from "../types/education.types";

export function manageEducationValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido." : message;

  const secondValidation = ObjectValidations.validateObjectKeys(parameters);
  message = (!secondValidation) ? "Parametros de educacion personal del usuario insuficientes." : message;

  let arrayParameter = [parameters.title];
  const thirdValidation = TypeValidations.validateArrayParameterType(arrayParameter, "string");
  message = (!thirdValidation) ? "El nombre del titulo es requerido" : message;

  const fourthValidation = RegexValidations.validateEducationTitleFormat(parameters.title) ||
    StringValidations.validateProfanityString(parameters.title) || RegexValidations.isGarbageInput(parameters.title);
  message = (!fourthValidation) ? "Nombre del titulo invalido." : message;

  const fifthValidation = StringValidations.validateStringMaxLength(parameters.title, 50);
  message = (!fifthValidation) ? "El titulo supera el limite de caracteres" : message;

  arrayParameter = [parameters.academyDegreeId];
  const sixthValidation = TypeValidations.validateArrayParameterType(arrayParameter, "number");
  message = (!sixthValidation) ? "El Id del grado academico es requerido" : message;

  arrayParameter = [parameters.institution];
  const seventhValidation = TypeValidations.validateArrayParameterType(arrayParameter, "string");
  message = (!seventhValidation) ? "El nombre de la institucion es requerido" : message;

  const eighthValidation = RegexValidations.validateEducationInstitutionFormat(parameters.institution) ||
    RegexValidations.isGarbageInput(parameters.institution);
  message = (!eighthValidation) ? "Nombre de institucion invalido" : message;

  const ninthValidation = StringValidations.validateStringMaxLength(parameters.institution, 50);
  message = (!ninthValidation) ? "El nombre de la institucion supera el limite de caracteres" : message;

  arrayParameter = [parameters.educationState];
  const tenthValidation = TypeValidations.validateArrayParameterType(arrayParameter, "string");
  message = (!tenthValidation) ? "El estado de la educacion es requerido" : message;

  const eleventhValidation = TypeValidations.validateEnum(parameters.educationState, EducationTypes.EducationState);
  message = (!eleventhValidation) ? "El estado de la educacion es invalido" : message;

  const twelfthValidation = TypeValidations.parameterExists(parameters.startDate) ||
    DateValidations.validateDate(parameters.startDate);
  message = (!twelfthValidation) ? "Fecha de inicio o egreso invalida" : message;

  const thirteenthValidation = DateValidations.validateFutureDate(parameters.startDate);
  message = (!thirteenthValidation) ? "Fecha de inicio o egreso no puede ser futura" : message;

  const fourteenthValidation = DateValidations.dateInRangeOver100Years(parameters.startDate);
  message = (!fourteenthValidation) ? "El año de inicio o egreso tiene que estar dentro del rango de hoy y hace 100 años" : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation && fourthValidation &&
    fifthValidation && sixthValidation && seventhValidation && eighthValidation && ninthValidation &&
    tenthValidation && eleventhValidation && twelfthValidation && thirteenthValidation && fourteenthValidation;
  return { result: finalValidation, messageState: message };
}

export function modifyEducationValidation(parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateId(parameters);
  message = (!firstValidation) ? "Id de education invalido." : message;

  const secondValidation = TypeValidations.validateOptionalParameterType(parameters.academyDegreeId, "number");
  message = (!secondValidation) ? "El Id del grado academico es invalido" : message;

  const thirdValidation = TypeValidations.validateOptionalParameterType(parameters.institution, "string");
  message = (!thirdValidation) ? "El nombre de la institucion es invalido" : message;

  const fourthValidation = (parameters.institution) &&
    StringValidations.validateStringMaxLength(parameters.institution, 50);
  message = (!fourthValidation) ? "El nombre de la institucion superan el limite de caracteres" : message;

  const fifthValidation = TypeValidations.validateOptionalParameterType(parameters.educationState, "string");
  message = (!fifthValidation) ? "El estado de la educacion es invalido" : message;

  const sixthValidation = (parameters.educationState) && 
    TypeValidations.validateEnum(parameters.educationState, EducationTypes.EducationState);
  message = (!sixthValidation) ? "El estado de la educacion es invalido" : message;

  const finalValidation = firstValidation && secondValidation && thirdValidation && fourthValidation &&
    fifthValidation && sixthValidation;
  return { result: finalValidation, messageState: message };
}

export function handleEducationValidation(parameters: any) {
  const finalValidation = TypeValidations.validateTokenPayload(parameters);
  const message = (!finalValidation) ? "Nombre de usuario faltante o invalido." : "";
  return { result: finalValidation, messageState: message };
}

export function viewPublicEducationValidation(parameters: any) {
  const finalValidation = TypeValidations.validateTokenPayload(parameters);
  const message = (!finalValidation) ? "Nombre de usuario faltante o invalido" : "";
  return { result: finalValidation, messageState: message };
}

export function viewPrivateEducationValidation(parameters: any) {
  const finalValidation = TypeValidations.validateTokenPayload(parameters);
  const message = (!finalValidation) ? "Nombre de usuario faltante o invalido" : "";
  return { result: finalValidation, messageState: message };
}

export function deleteEducationValidation(parameters: any) {
  const finalValidation = TypeValidations.validateId(parameters);
  const message = (!finalValidation) ? "Id de experiencia laboral invalido" : "";
  return { result: finalValidation, messageState: message };
}

export function modifyEducationVisibilityValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateTokenPayload(tokenParameter);
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido" : message;

  const secondValidation = ArrayValidations.validateObjectArray(parameters);
  message = (!secondValidation) ? "Formato de visibilidad inválido. Se esperaba un objeto." : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}