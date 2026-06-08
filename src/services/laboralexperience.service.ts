import { getLaboralExpAction } from "../helpers/laboralexperience.helper";
import * as LaboralExpTypes from "../types/laboralexperience.types";
import * as TokenTypes from "../types/token.types";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as LaboralExpRepository from "../repositories/laboralexperience.repository";
import * as AIService from "../services/ai.service";

async function manageUserLaboralExperience(
  tokeInfo: TokenTypes.TokenPayload,
  laboralExperienceInfo: LaboralExpTypes.LaboralExperienceInfo,
  action: "register" | "modify",
  id?: number) {
  try {
    const { username } = tokeInfo;
    const { position, startDate, endDate = null } = laboralExperienceInfo;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe." };
    }
    const laboralExperienceAction = getLaboralExpAction(action);
    const laboralExperienceExits = await LaboralExpRepository.laboralExperienceExists(
      laboralExperienceInfo, username);
    if (laboralExperienceExits) {
      return { result: false, messageState: "La experiencia laboral ya existe y está asociada a este usuario" };
    }

    if (action === "modify") {
      const foundLaboralExperience = await LaboralExpRepository.getLaboralExperience(username, id!);
      if (!foundLaboralExperience || foundLaboralExperience.length === 0) {
        return { result: false, messageState: "La experiencia laboral consultada no existe." };
      }
      if (endDate) {
        let currentStartDate;
        if (!laboralExperienceInfo.startDate) {
          currentStartDate = foundLaboralExperience[0].start_date;
        } else {
          currentStartDate = laboralExperienceInfo.startDate;
        }
        if (currentStartDate > endDate) {
          return {
            result: false,
            messageState: "La fecha de inicio no puede ser luego de fecha de finalización"
          };
        }
      }
    } else {
      if (endDate) {
        if (startDate > endDate) {
          return {
            result: false,
            messageState: "La fecha de inicio no puede ser luego de fecha de finalización"
          };
        }
      }
    }
    const response = await AIService.positionValidation(position);
    if (!response.valid) {
      return { result: false, messageState: response.reason };
    }

    if (action === "register") {
      await LaboralExpRepository.createLaboralExperience(username, laboralExperienceInfo);
    } else {
      await LaboralExpRepository.updateUserLaboralExperience(username, laboralExperienceInfo, id!);
    }
    return { result: true, messageState: `Experiencia laboral ${laboralExperienceAction.singleWord} exitosamente` };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}

export async function registerUserLaboralExperience(
  tokeInfo: TokenTypes.TokenPayload,
  laboralExperienceInfo: LaboralExpTypes.LaboralExperienceInfo) {
  return await manageUserLaboralExperience(tokeInfo, laboralExperienceInfo, "register");
}

export async function modifyUserLaboralExperience(
  tokeInfo: TokenTypes.TokenPayload,
  laboralExperienceInfo: LaboralExpTypes.LaboralExperienceInfo,
  idInfo: any) {
  const parsedId = idInfo.id ? parseInt(idInfo.id as string, 10) : undefined;
  return await manageUserLaboralExperience(tokeInfo, laboralExperienceInfo, "modify", parsedId);
}

export async function viewPublicLaboralExperience(tokeInfo: TokenTypes.TokenPayload) {
  try {
    const { username } = tokeInfo;

    const interfaceId = 4;
    const userExists = await CommonRepository.userExists(username);
    if (!userExists) return { result: false, messageState: "El usuario no existe" };
    const userLaboralExperiences = await LaboralExpRepository.getAllPublicUserLaboralExperiences(username);
    await CommonRepository.insertInterfaceView(username, interfaceId);

    return { result: true, messageState: "Experiencias obtenidas", laboralExperiences: userLaboralExperiences };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}

export async function viewPrivateLaboralExperience(tokeInfo: TokenTypes.TokenPayload) {
  try {
    const { username } = tokeInfo;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) return { result: false, messageState: "El usuario no existe" };
    
    const userLaboralExperiences = await LaboralExpRepository.getAllUserLaboralExperiences(username);
    return { result: true, messageState: "Experiencias obtenidas", laboralExperiences: userLaboralExperiences };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}

export async function updateLaboralExperienceVisibility(
  tokeInfo: TokenTypes.TokenPayload,
  visibilities: Record<string, boolean>) {
  try {
    const { username } = tokeInfo;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) 
      return { result: false, messageState: "El usuario no existe" };
    
    await LaboralExpRepository.updateLaboralExperiencesVisibilityBulk(username, visibilities);
    return { result: true, messageState: "Cambios guardados exitosamente" };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}

export async function deleteUserLaboralExperience(
  tokeInfo: TokenTypes.TokenPayload,
  idInfo: any) {
  try {
    const { username } = tokeInfo;
    const id = idInfo.id ? parseInt(idInfo.id as string, 10) : undefined;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) 
      return { result: false, messageState: "El usuario no existe" };
    
    const foundLaboralExperience = await LaboralExpRepository.getLaboralExperience(username, id!);
    if (!foundLaboralExperience || foundLaboralExperience.length === 0) {
      return { result: false, messageState: "La experiencia laboral consultada no existe" };
    }
    
    const deletedLaboralExperience = await LaboralExpRepository.deleteLaboralExperience(username, id!);
    if (deletedLaboralExperience.length === 0) {
      return {
        result: false,
        messageState: "La experiencia laboral a eliminar no esta asociada a este usuario o no existe"
      };
    }
    return { result: true, messageState: "La experiencia laboral se ha eliminado correctamente" };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}