import { profanity, uniqueWords } from "../config/leoprofanity.config";
import { containsBadWord, isGarbageInput } from "../utils/validations";
import * as RegexConstants from "../utils/constants/regex.constants";
import * as EducationTypes from "../types/education.types";
import * as AIService from "../services/ai.service";

export function getEducationAction(type: "register" | "modify") {
  const types = {
    register: {
      singleWord: "registrada",
      pluralWord: "registradas",
      serviceValidations: registerEducationValidations
    },
    modify: {
      singleWord: "modificada",
      pluralWord: "modificadas",
      serviceValidations: modifyEducationValidations,
    }
  };
  return types[type];
}

async function registerEducationValidations(educationInfo: EducationTypes.EducationInfo) {
  const {
    title,
    academyDegreeId,
    institution
  } = educationInfo;
  if (!title || typeof title !== "string") {
    return {
      result: false,
      messageState: "El nombre del titulo es requerido"
    };
  }
  if (!RegexConstants.titleRegex.test(title) || profanity.check(title) ||
    containsBadWord(title, uniqueWords) || isGarbageInput(title)) {
    return {
      result: false,
      messageState: "Nombre del titulo invalido."
    };
  }
  const { valid, reason } = await AIService.academicTitleValidation(title);
  if (!valid) {
    return {
      result: false,
      messageState: reason
    };
  }
  if (title.length > 50) {
    return {
      result: false,
      messageState: "El titulo superan el limite de caracteres"
    };
  }
  if (!institution || typeof institution !== "string") {
    return {
      result: false,
      messageState: "El nombre de la institucion es requerido"
    };
  }
  if (!RegexConstants.institutionRegex.test(institution) || isGarbageInput(institution)) {
    return {
      result: false,
      messageState: "Nombre de institucion invalido"
    };
  }
  if (institution.length > 50) {
    return {
      result: false,
      messageState: "El nombre de la institucion superan el limite de caracteres"
    };
  }

  if (!academyDegreeId || typeof academyDegreeId !== "number") {
    return {
      result: false,
      messageState: "El Id del grado academico es requerido"
    };
  }
}

async function modifyEducationValidations(educationInfo: EducationTypes.EducationInfo) {
  const {
    academyDegreeId,
    institution,
  } = educationInfo;
  if (institution) {
    if (typeof institution !== "string") {
      return {
        result: false,
        messageState: "El nombre de la institucion es invalido"
      };
    }
    if (!RegexConstants.institutionRegex.test(institution) || isGarbageInput(institution)) {
      return {
        result: false,
        messageState: "Nombre de institucion invalido"
      };
    }
    if (institution.length > 50) {
      return {
        result: false,
        messageState: "El nombre de la institucion superan el limite de caracteres"
      };
    }
  }

  if (academyDegreeId)
    if (typeof academyDegreeId !== "number") {
      return {
        result: false,
        messageState: "El Id del grado academico es invalido"
      };
    }
}