import { getLaboralExpAction } from "../helpers/laboralexperience.helper";
import * as LaboralExpTypes from "../types/laboralexperience.types";
import * as TokenTypes from "../types/token.types";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as LaboralExpRepository from "../repositories/laboralexperience.repository";
import * as AIService from "../services/ai.service";

/**
 * Función interna que centraliza el registro o modificación de una experiencia laboral.
 * Verifica existencia del usuario, duplicados, valida fechas, valida el puesto con IA
 * y crea o actualiza el registro en la base de datos.
 * @param {TokenTypes.TokenPayload} tokeInfo - Token del usuario autenticado.
 * @param {LaboralExpTypes.LaboralExperienceInfo} laboralExperienceInfo - Datos de la experiencia.
 * @param {"register" | "modify"} action - Acción: "register" o "modify".
 * @param {number} [id] - ID del registro (solo para "modify").
 * @returns Objeto con `result` y `messageState`.
 */
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

/**
 * Registra una nueva experiencia laboral. Delega en `manageUserLaboralExperience` con acción "register".
 * @param {TokenTypes.TokenPayload} tokeInfo - Token del usuario autenticado.
 * @param {LaboralExpTypes.LaboralExperienceInfo} laboralExperienceInfo - Datos de la experiencia.
 * @returns Resultado de `manageUserLaboralExperience`.
 */
export async function registerUserLaboralExperience(
  tokeInfo: TokenTypes.TokenPayload,
  laboralExperienceInfo: LaboralExpTypes.LaboralExperienceInfo) {
  return await manageUserLaboralExperience(tokeInfo, laboralExperienceInfo, "register");
}

/**
 * Modifica una experiencia laboral existente. Delega en `manageUserLaboralExperience` con "modify".
 * @param {TokenTypes.TokenPayload} tokeInfo - Token del usuario autenticado.
 * @param {LaboralExpTypes.LaboralExperienceInfo} laboralExperienceInfo - Datos actualizados.
 * @param {any} idInfo - Objeto con el `id` del registro.
 * @returns Resultado de `manageUserLaboralExperience`.
 */
export async function modifyUserLaboralExperience(
  tokeInfo: TokenTypes.TokenPayload,
  laboralExperienceInfo: LaboralExpTypes.LaboralExperienceInfo,
  idInfo: any) {
  const parsedId = idInfo.id ? parseInt(idInfo.id as string, 10) : undefined;
  return await manageUserLaboralExperience(tokeInfo, laboralExperienceInfo, "modify", parsedId);
}

/**
 * Obtiene las experiencias laborales públicas de un usuario y registra una vista analítica.
 * @param {TokenTypes.TokenPayload} tokeInfo - Token con el `username` del usuario.
 * @returns Objeto con `result`, `messageState` y `laboralExperiences`.
 */
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

/**
 * Obtiene todas las experiencias laborales (públicas y privadas) del usuario autenticado.
 * @param {TokenTypes.TokenPayload} tokeInfo - Token del usuario autenticado.
 * @returns Objeto con `result`, `messageState` y `laboralExperiences`.
 */
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

/**
 * Actualiza la visibilidad (público/privado) de múltiples experiencias laborales de forma masiva.
 * @param {TokenTypes.TokenPayload} tokeInfo - Token del usuario autenticado.
 * @param {Record<string, boolean>} visibilities - Mapa de IDs y sus nuevos estados de visibilidad.
 * @returns Objeto con `result` y `messageState`.
 */
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

/**
 * Elimina una experiencia laboral del usuario. Verifica existencia del usuario y del registro.
 * @param {TokenTypes.TokenPayload} tokeInfo - Token del usuario autenticado.
 * @param {any} idInfo - Objeto con el `id` de la experiencia a eliminar.
 * @returns Objeto con `result` y `messageState`.
 */
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