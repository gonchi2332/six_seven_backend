import * as TypeValidations from "./shared/type.validator";
import * as ObjectValidations from "./shared/object.validator";
import * as ImageValidations from "./shared/image.validator";
import * as ArrayValidations from "./shared/array.validator";
import * as RegexValidations from "./shared/regex.validator";

export function handlePersonalInfoRequestValidation(
  tokenParameter: any,
  parameters: any,
  imageParameter: any) {
  let message = "";
  const firstValidation = TypeValidations.validateManyRequiredParamerersType(tokenParameter, "string");
  message = (!firstValidation) ? "Nombre de usuario faltante o invalido." : message;

  const secondValidation = ObjectValidations.validateObjectKeys(parameters);
  message = (!secondValidation) ? "Parametros de informacion personal del usuario insuficientes." : message;

  const thirdValidation = (parameters.phone) && RegexValidations.validatePhoneFormat(parameters.phone);
  message = (!thirdValidation) ? "No se pudo registrar o modificar la informacion, numero de telefono invalido." : message;

  const fourthValidation = TypeValidations.validateOptionalParameterType(parameters.names, "string") ||
    TypeValidations.validateOptionalParameterType(parameters.firstSurname, "string") ||
    TypeValidations.validateOptionalParameterType(parameters.secondSurname, "string");
  message = (!fourthValidation) ? "No se pudo registrar o modificar la informacion, campos invalidos." : message;

  const fifthValidation = (parameters.contactEmail) && RegexValidations.validateEmailFormat(parameters.contactEmail);
  message = (!fifthValidation) ? "No se pudo registrar o modificar la informacion, correo de contacto invalido." : message;

  const sixthValidation = (parameters.secondaryRegistrationEmail) && RegexValidations.validateEmailFormat(parameters.secondaryRegistrationEmail);
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

export function viewPublicPersonalInfoValidation(parameters: any) {
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  const message = (!finalValidation) ? "Nombre de usuario inválido" : "";
  return { result: finalValidation, messageState: message };
}

export function viewPrivatePersonalInfoValidation(parameters: any) {
  const finalValidation = TypeValidations.validateManyRequiredParamerersType(parameters, "string");
  const message = (!finalValidation) ? "Nombre de usuario inválido" : "";
  return { result: finalValidation, messageState: message };
}

export function modifyPersonalInfoVisibilityValidation(tokenParameter: any, parameters: any) {
  let message = "";
  const firstValidation = TypeValidations.validateManyRequiredParamerersType(tokenParameter, "string");
  message = (!firstValidation) ? "Nombre de usuario inválido" : message;

  const secondValidation = ArrayValidations.validateObjectArray(parameters);
  message = (!secondValidation) ? "Formato inválido. Se esperaba un objeto con opciones de visibilidad" : message;

  const finalValidation = firstValidation && secondValidation;
  return { result: finalValidation, messageState: message };
}