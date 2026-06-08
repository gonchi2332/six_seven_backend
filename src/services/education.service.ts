import { getEducationAction } from "../helpers/education.helper";
import * as TokenTypes from "../types/token.types";
import * as EducationTypes from "../types/education.types";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as EducationReporitory from "../repositories/education.repository";
import * as AIService from "../services/ai.service";

async function manageEducation(
  tokenInfo: TokenTypes.TokenPayload,
  educationInfo: EducationTypes.EducationInfo,
  action: "register" | "modify",
  id?: number) {
  try {
    const { username } = tokenInfo;
    const { title } = educationInfo;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe" };
    }
    const educationAction = getEducationAction(action);
    const educationExists = await EducationReporitory.educationExists(educationInfo, username, action);
    if (educationExists) {
      return { result: false, messageState: "La formación académica ya existe y está asociada a este usuario" };
    }
    if (action === "modify") {
      const foundEducation = await EducationReporitory.getEducation(id!);
      if (!foundEducation || foundEducation.length === 0) {
        return { result: false, messageState: "La educacion educacion consultada no existe" };
      }
    }
    const response = await AIService.academicTitleValidation(title);
    if (!response.valid) {
      return { result: false, messageState: response.reason };
    }

    if (action === "register") {
      await EducationReporitory.createEducation(username, educationInfo);
    } else {
      await EducationReporitory.updateEducation(educationInfo, id!);
    }
    return { result: true, messageState: `Educacion ${educationAction.singleWord} exitosamente` };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}

export async function registerEducation(
  tokenInfo: TokenTypes.TokenPayload,
  educationInfo: EducationTypes.EducationInfo) {
  return await manageEducation(tokenInfo, educationInfo, "register");
}

export async function modifyEducation(
  tokenInfo: TokenTypes.TokenPayload,
  educationInfo: EducationTypes.EducationInfo,
  idInfo: any) {
  const parsedId = idInfo.id ? parseInt(idInfo.id as string, 10) : undefined;
  return await manageEducation(tokenInfo, educationInfo, "modify", parsedId);
}

async function handleEducation(
  tokenInfo: TokenTypes.TokenPayload,
  action: "view" | "delete",
  id?: number) {
  try {
    const { username } = tokenInfo;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe"
      };
    }
    const educationExperience = await EducationReporitory.getEducation(id!);
    if (!educationExperience || educationExperience.length === 0) {
      return { result: false, messageState: "La educacion consultada no existe" };
    }
    const deletedEducation = await EducationReporitory.deleteEducation(id!);
    if (deletedEducation.length === 0) {
      return {
        result: false,
        messageState: "El registro de educacion a eliminar no esta asociada a este usuario o no existe"
      };
    }
    return { result: true, messageState: "El registro de educacion se ha eliminado correctamente" };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}

export async function viewPublicEducation(tokenInfo: TokenTypes.TokenPayload) {
  try {
    const { username } = tokenInfo;

    const interfaceId = 5;
    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe" };
    }

    const education = await EducationReporitory.getAllPublicUserEducation(username);
    await CommonRepository.insertInterfaceView(username, interfaceId);
    return { result: true, messageState: "Educacion obtenida", education: education };
  } catch (err) {
    return { result: false, messageState: `Error interno: ${(err as Error).message}` };
  }
}

export async function viewPrivateEducation(tokenInfo: TokenTypes.TokenPayload) {
  try {
    const { username } = tokenInfo;

    const education = await EducationReporitory.getAllUserEducation(username);
    return { result: true, messageState: "Educacion obtenida", education: education };
  } catch (err) {
    return { result: false, messageState: `Error interno: ${(err as Error).message}` };
  }
}

export async function deleteEducation(tokenInfo: TokenTypes.TokenPayload, idInfo: any) {
  const parsedId = idInfo.id ? parseInt(idInfo.id as string, 10) : undefined;
  return await handleEducation(tokenInfo, "delete", parsedId);
}

export async function viewAcademicGrade() {
  try {
    const educationGrade = await EducationReporitory.getAcademicDegrees();
    if (!educationGrade || educationGrade.length === 0) {
      return { result: false, messageState: "No se encontro los registros de grado academico" };
    }
    return {
      result: true,
      messageState: "Los registros de educacion del usuario se han obtenido correctamente",
      educationGrade: educationGrade
    };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}

export async function updateEducationVisibility(
  tokenInfo: TokenTypes.TokenPayload,
  updateEducationVisibilityInfo: EducationTypes.UpdateEducationVisibilityInfo) {
  try {
    const { username } = tokenInfo;
    const { visibilities } = updateEducationVisibilityInfo;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe." };
    }
    await EducationReporitory.updateEducationVisibilityBulk(username, visibilities);
    return { result: true, messageState: "Cambios guardados exitosamente" };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}