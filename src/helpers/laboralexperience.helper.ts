import { profanity, uniqueWords } from "../config/leoprofanity.config";
import { containsBadWord, isGarbageInput } from "../utils/validations";
import * as RegexConstants from "../utils/constants/regex.constants";
import * as LaboralExpTypes from "../types/laboralexperience.types";
import * as AIService from "../services/ai.service";

export function getLaboralExpAction(type: "register" | "modify") {
  const types = {
    register: {
      singleWord: "registrada",
      pluralWord: "registradas",
      serviceValidations: registerLaboralExpValidations
    },
    modify: {
      singleWord: "modificada",
      pluralWord: "modificadas",
      serviceValidations: modifyLaboralExpValidations,
    }
  };
  return types[type];
}

async function registerLaboralExpValidations(laboralExperienceInfo: LaboralExpTypes.LaboralExperienceInfo) {
  const {
    position,
    companyName,
    description,
  } = laboralExperienceInfo;
  laboralExperienceInfo.startDate = new Date(laboralExperienceInfo.startDate);
  if (isNaN(laboralExperienceInfo.startDate.getTime())) {
    return { 
      result: false, 
      messageState: "La fecha de inicio es inválida." 
    };
  }
  if (!position || typeof position !== "string") {
    return {
      result: false,
      messageState: "El nombre del puesto es requerido"
    };
  }
  if (!RegexConstants.positionRegex.test(position) || profanity.check(position) ||
    containsBadWord(position, uniqueWords) || isGarbageInput(position)) {
    return {
      result: false,
      messageState: "Nombre del puesto invalido."
    };
  }
  const { valid, reason } = await AIService.positionValidation(position);
  if (!valid) {
    return {
      result: false,
      messageState: reason
    };
  }
  if (!companyName || typeof companyName !== "string") {
    return {
      result: false,
      messageState: "El nombre de la empresa es requerido"
    };
  }
  if (!RegexConstants.companyRegex.test(companyName) || isGarbageInput(companyName)) {
    return {
      result: false,
      messageState: "Nombre de empresa invalido"
    };
  }
  if ((position.length < 0 || position.length > 50) ||
    (companyName.length < 0 || companyName.length > 50)) {
    return {
      result: false,
      messageState: "El cargo o nombre de empresa superan el limite de caracteres"
    };
  }
  if (!description || typeof description !== "string") {
    return {
      result: false,
      messageState: "La descripción es requerida"
    };
  }
  if (description.length < 0 || description.length > 200) {
    return {
      result: false,
      messageState: "Descripcion invalida"
    };
  }
}

async function modifyLaboralExpValidations(laboralExperienceInfo: LaboralExpTypes.LaboralExperienceInfo) {
  const {
    position,
    companyName,
    description,
  } = laboralExperienceInfo;
  if (laboralExperienceInfo.startDate) {
    laboralExperienceInfo.startDate = new Date(laboralExperienceInfo.startDate);
    if (isNaN(laboralExperienceInfo.startDate.getTime())) {
      return { 
        result: false, 
        messageState: "La fecha de inicio es inválida." 
      };
    }
  }
  if (position) {
    if (position.length < 0 || position.length > 50) {
      return {
        result: false,
        messageState: "El cargo supera el limite de caracteres"
      };
    }
    if (!RegexConstants.positionRegex.test(position) || profanity.check(position) ||
      containsBadWord(position, uniqueWords) || isGarbageInput(position)) {
      return {
        result: false,
        messageState: "Nombre del puesto invalido."
      };
    }
    const { valid, reason } = await AIService.positionValidation(position);
    if (!valid) {
      return {
        result: false,
        messageState: reason
      };
    }
  }
  if (companyName) {
    if (typeof companyName !== "string") {
      return {
        result: false,
        messageState: "El nombre de la empresa es requerido"
      };
    }
    if (companyName.length < 0 || companyName.length > 50) {
      return {
        result: false,
        messageState: "El nombre de empresa supera el limite de caracteres"
      };
    }
    if (!RegexConstants.companyRegex.test(companyName) || isGarbageInput(companyName)) {
      return {
        result: false,
        messageState: "Nombre de empresa invalido"
      };
    }
  }
  if (description) {
    if (typeof description !== "string") {
      return {
        result: false,
        messageState: "La descripción es requerida"
      };
    }
    if (description.length < 0 || description.length > 200) {
      return {
        result: false,
        messageState: "Descripcion invalida"
      };
    }
  }
}