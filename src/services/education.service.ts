import { getEducationAction } from "../helpers/education.helper";
import * as TokenTypes from "../types/token.types";
import * as EducationTypes from "../types/education.types";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as EducationReporitory from "../repositories/education.repository";
import * as AIService from "../services/ai.service";

/**
 * Función interna que centraliza el registro o modificación de un registro de educación.
 * Verifica existencia del usuario, duplicados, valida el título con IA y crea/actualiza el registro.
 * @param {TokenTypes.TokenPayload} tokenInfo - Token del usuario autenticado.
 * @param {EducationTypes.EducationInfo} educationInfo - Datos de la formación académica.
 * @param {"register" | "modify"} action - Acción: "register" o "modify".
 * @param {number} [id] - ID del registro (solo para "modify").
 * @returns Objeto con `result` y `messageState`.
 */
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

/**
 * Registra un nuevo registro de formación académica. Delega en `manageEducation` con acción "register".
 * @param {TokenTypes.TokenPayload} tokenInfo - Token del usuario autenticado.
 * @param {EducationTypes.EducationInfo} educationInfo - Datos de la formación a registrar.
 * @returns Resultado de `manageEducation`.
 */
export async function registerEducation(
  tokenInfo: TokenTypes.TokenPayload,
  educationInfo: EducationTypes.EducationInfo) {
  return await manageEducation(tokenInfo, educationInfo, "register");
}

/**
 * Modifica un registro de formación académica existente. Delega en `manageEducation` con acción "modify".
 * @param {TokenTypes.TokenPayload} tokenInfo - Token del usuario autenticado.
 * @param {EducationTypes.EducationInfo} educationInfo - Datos actualizados.
 * @param {any} idInfo - Objeto con el `id` del registro.
 * @returns Resultado de `manageEducation`.
 */
export async function modifyEducation(
  tokenInfo: TokenTypes.TokenPayload,
  educationInfo: EducationTypes.EducationInfo,
  idInfo: any) {
  const parsedId = idInfo.id ? parseInt(idInfo.id as string, 10) : undefined;
  return await manageEducation(tokenInfo, educationInfo, "modify", parsedId);
}

/**
 * Función interna que elimina un registro de educación. Verifica existencia del usuario y registro.
 * @param {TokenTypes.TokenPayload} tokenInfo - Token del usuario autenticado.
 * @param {number} [id] - ID del registro a eliminar.
 * @returns Objeto con `result` y `messageState`.
 */
async function handleEducation(
  tokenInfo: TokenTypes.TokenPayload,
  id?: number) {
  try {
    const { username } = tokenInfo;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe" };
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

/**
 * Obtiene los registros de educación públicos de un usuario y registra una vista analítica.
 * @param {any} tokenInfo - Objeto con el `username` del usuario.
 * @returns Objeto con `result`, `messageState` y `education`.
 */
export async function viewPublicEducation(tokenInfo: any) {
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

/**
 * Obtiene todos los registros de educación (públicos y privados) del usuario autenticado.
 * @param {TokenTypes.TokenPayload} tokenInfo - Token del usuario autenticado.
 * @returns Objeto con `result`, `messageState` y `education`.
 */
export async function viewPrivateEducation(tokenInfo: TokenTypes.TokenPayload) {
  try {
    const { username } = tokenInfo;

    const education = await EducationReporitory.getAllUserEducation(username);
    return { result: true, messageState: "Educacion obtenida", education: education };
  } catch (err) {
    return { result: false, messageState: `Error interno: ${(err as Error).message}` };
  }
}

/**
 * Elimina un registro de formación académica. Parsea el ID y delega en `handleEducation`.
 * @param {TokenTypes.TokenPayload} tokenInfo - Token del usuario autenticado.
 * @param {any} idInfo - Objeto con el `id` del registro.
 * @returns Resultado de `handleEducation`.
 */
export async function deleteEducation(tokenInfo: TokenTypes.TokenPayload, idInfo: any) {
  const parsedId = idInfo.id ? parseInt(idInfo.id as string, 10) : undefined;
  return await handleEducation(tokenInfo, parsedId);
}

/**
 * Obtiene los grados académicos disponibles en el sistema (Licenciatura, Maestría, etc.)
 * para usarlos como opciones en formularios.
 * @returns Objeto con `result`, `messageState` y `educationGrade`.
 */
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

/**
 * Actualiza la visibilidad (público/privado) de múltiples registros de educación de forma masiva.
 * @param {TokenTypes.TokenPayload} tokenInfo - Token del usuario autenticado.
 * @param {EducationTypes.UpdateEducationVisibilityInfo} updateEducationVisibilityInfo - Mapa de
 * IDs y sus nuevos estados de visibilidad.
 * @returns Objeto con `result` y `messageState`.
 */
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