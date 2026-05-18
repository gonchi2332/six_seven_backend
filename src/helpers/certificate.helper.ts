import { profanity, uniqueWords, uniqueTrickyWords } from "../config/leoprofanity.config";
import { containsBadWord, isGarbageInput } from "../utils/validations";
import * as RegexConstants from "../utils/constants/regex.constants";
import * as CertificateTypes from "../types/certificate.types";

export function getCertificateAction(type: "register" | "modify") {
  const types = {
    register: {
      singleWord: "registrado",
      pluralWord: "registrados",
      serviceValidations: registerCertificateValidations
    },
    modify: {
      singleWord: "modificado",
      pluralWord: "modificados",
      serviceValidations: modifyCertificateValidations,
    }
  };
  return types[type];
}

async function registerCertificateValidations(certificateInfo: CertificateTypes.CertificateInfo) {
  const { title, description, area } = certificateInfo;

  if ((!title || typeof title !== "string") ||
    (!description || typeof description !== "string") ||
    (!area || typeof area !== "string")) {
    return {
      result: false,
      messageState: "Datos del certificado incompletos o invalidos."
    };
  }
  if ((title.length < 0 || title.length > 100) || 
    (area.length < 0 || area.length > 100)) {
    return {
      result: false,
      messageState: "Titulo o area del certificado fuera del rango de caracteres permitido."
    };
  }
  if (!RegexConstants.certificateTitleRegex.test(title) || profanity.check(title) || 
    containsBadWord(title, uniqueWords, uniqueTrickyWords) || isGarbageInput(title)) {
    return {
      result: false,
      messageState: "Titulo del certificado invalido."
    };
  }
  if (!RegexConstants.areaRegex.test(area) || profanity.check(area) || 
  containsBadWord(area, uniqueWords, uniqueTrickyWords) || isGarbageInput(area)) {
    return {
      result: false,
      messageState: "Area invalida."
    };
  }
  if (description.length < 0 || description.length > 200) {
    return {
      result: false,
      messageState: "Descripción del certificado fuera del rango de caracteres permitido."
    };
  }
}

async function modifyCertificateValidations(certificateInfo: CertificateTypes.CertificateInfo) {
  const { description, area } = certificateInfo;
  
  if (description) {
    if (typeof description !== "string") {
      return {
        result: false,
        messageState: "Descripción del certificado invalida."
      };
    }
    if (description.length < 0 || description.length > 200) {
      return {
        result: false,
        messageState: "Descripción del certificado fuera del rango de caracteres permitido."
      };
    }
  }
  if (area) {
    if (typeof area !== "string") {
      return {
        result: false,
        messageState: "Area del certificado invalida."
      };
    }
    if ((area.length < 0 || area.length > 100)) {
      return {
        result: false,
        messageState: "Area del certificado fuera del rango de caracteres permitido."
      };
    }
    if (!RegexConstants.areaRegex.test(area) || profanity.check(area) || 
    containsBadWord(area, uniqueWords, uniqueTrickyWords) || isGarbageInput(area)) {
      return {
        result: false,
        messageState: "Area del certificado invalida."
      };
    }
  } 
}