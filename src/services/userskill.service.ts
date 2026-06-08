import { getSkillTypeData } from "../helpers/skill.helper";
import * as MeasureConstants from "../utils/constants/measure.constants";
import * as SkillTypes from "../types/skill.types";
import * as TokenTypes from "../types/token.types";
import * as UserSkillTypes from "../types/userskill.types";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as UserSkillRepository from "../repositories/userskill.repository";
import * as AIService from "./ai.service";

/**
 * Función interna `registerNewUserSkill` que maneja el registro de una habilidad para un usuario,
 * incluyendo la creación de la habilidad en el catálogo global si no existe.
 * Utiliza búsqueda difusa (Fuse.js) para corregir posibles errores tipográficos y validación por IA
 * para asegurar que la habilidad sea legítima.
 * @param {string} username - Nombre de usuario.
 * @param {string} skillName - Nombre de la habilidad a registrar.
 * @param {"hard" | "soft"} type - Tipo de habilidad.
 * @param {number} [punctuation] - Puntuación de la habilidad (solo para hard skills).
 * @returns Objeto con `result` (booleano) y `messageState`.
 */
async function registerNewUserSkill(
  username: string,
  skillName: string,
  type: "hard" | "soft",
  punctuation?: number) {
  try {
    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe." };
    }

    const skillTypeData = getSkillTypeData(type);
    const formatedSkillName = skillTypeData.formater(skillName);

    const resultSkillNames = (await skillTypeData.fuse).search(formatedSkillName);
    let correctedSkillName: string;
    if (!resultSkillNames || resultSkillNames.length === 0 || !resultSkillNames[0].score ||
      resultSkillNames[0].score > MeasureConstants.fuseThreshold) {
      correctedSkillName = formatedSkillName;
    } else {
      correctedSkillName = resultSkillNames[0].item as string;
    }
    const newSkillName = correctedSkillName.replace(/^\w/, (c) => c.toUpperCase());

    const foundUserSkill = await UserSkillRepository.getUserSkill(username, newSkillName, skillTypeData.enum);
    if (foundUserSkill.length > 0) {
      return {
        result: false,
        messageState: `El usuario ya tiene registrada esta habilidad ${skillTypeData.singleWord}.`
      };
    }

    const foundSkill = await UserSkillRepository.getSkill(formatedSkillName, skillTypeData.enum);
    let skillId;
    if (!foundSkill || foundSkill.length === 0) {
      const response = await AIService.skillValidation(formatedSkillName, type);
      if (!response.valid) {
        return { result: false, messageState: response.reason };
      }
      let createdSkill;
      if (!response.name || !response.canonName) {
        createdSkill = await UserSkillRepository.createSkill(newSkillName, formatedSkillName, skillTypeData.enum);
        skillId = createdSkill[0].id;
      } else {
        const checkedFoundSkill = await UserSkillRepository.getUserSkill(
          username, response.name, skillTypeData.enum);
        if (checkedFoundSkill.length > 0) {
          return {
            result: false,
            messageState: `El usuario ya tiene registrada esta habilidad ${skillTypeData.singleWord}.`
          };
        }

        const foundByCanon = await UserSkillRepository.getSkill(response.canonName, skillTypeData.enum);
        if (!foundByCanon || foundByCanon.length === 0) {
          createdSkill = await UserSkillRepository.createSkill(
            newSkillName, formatedSkillName, skillTypeData.enum);
          skillId = createdSkill[0].id;
        } else {
          skillId = foundByCanon[0].id;
        }
      }
    } else {
      skillId = foundSkill[0].id;
    }

    if (type === "hard") {
      await UserSkillRepository.createUserSkill(skillId, username, punctuation);
    } else {
      await UserSkillRepository.createUserSkill(skillId, username);
    }
    return {
      result: true,
      messageState: `La habilidad ${skillTypeData.singleWord}: ${newSkillName} se ha registrado correctamente.`
    };
  } catch (err) {
    return { result: false, messageState: `Error en el servidor: ${(err as Error).message}` };
  }
}

/**
 * La función `registerNewUserHardSkill` registra una nueva habilidad técnica para el usuario autenticado.
 * Delega en `registerNewUserSkill` con el tipo "hard".
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {UserSkillTypes.RegisterNewUserSkillInfo} registerNewUserSkillInfo - Datos de la habilidad (nombre y puntuación).
 * @returns Resultado de `registerNewUserSkill`.
 */
export async function registerNewUserHardSkill(
  tokenInfo: TokenTypes.TokenPayload,
  registerNewUserSkillInfo: UserSkillTypes.RegisterNewUserSkillInfo) {
  const { username } = tokenInfo;
  const { skillName, punctuation } = registerNewUserSkillInfo;
  return await registerNewUserSkill(username, skillName, "hard", punctuation);
}

/**
 * La función `registerNewUserSoftSkill` registra una nueva habilidad blanda para el usuario autenticado.
 * Delega en `registerNewUserSkill` con el tipo "soft".
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {UserSkillTypes.RegisterNewUserSkillInfo} registerNewUserSkillInfo - Datos de la habilidad (nombre).
 * @returns Resultado de `registerNewUserSkill`.
 */
export async function registerNewUserSoftSkill(
  tokenInfo: TokenTypes.TokenPayload,
  registerNewUserSkillInfo: UserSkillTypes.RegisterNewUserSkillInfo) {
  const { username } = tokenInfo;
  const { skillName } = registerNewUserSkillInfo;
  return await registerNewUserSkill(username, skillName, "soft");
}

/**
 * Función interna `registerUserSkill` que asocia una habilidad ya existente en el catálogo global a un usuario.
 * @param {string} username - Nombre de usuario.
 * @param {string} skillName - Nombre de la habilidad.
 * @param {"hard" | "soft"} type - Tipo de habilidad.
 * @param {number} [punctuation] - Puntuación (solo para hard skills).
 * @returns Objeto con `result` (booleano) y `messageState`.
 */
async function registerUserSkill(
  username: string,
  skillName: string,
  type: "hard" | "soft",
  punctuation?: number) {
  try {
    const userExists = await CommonRepository.userExists(username);
    if (!userExists)
      return { result: false, messageState: "El usuario no existe." };

    const skillTypeData = getSkillTypeData(type);
    const foundSkill = await UserSkillRepository.getSkill(skillName, skillTypeData.enum);
    if (!foundSkill || foundSkill.length === 0) {
      return {
        result: false,
        messageState: `La habilidad ${skillTypeData.singleWord} que se intenta registrar no existe.`
      };
    }
    const foundUserSkill = await UserSkillRepository.getUserSkill(username, skillName, skillTypeData.enum);
    if (foundUserSkill.length > 0) {
      return {
        result: false,
        messageState: `El usuario ya tiene registrada esta habilidad ${skillTypeData.singleWord}.`
      };
    }

    const skillId = foundSkill[0].id;
    if (type === "hard") {
      await UserSkillRepository.createUserSkill(skillId, username, punctuation);
    } else {
      await UserSkillRepository.createUserSkill(skillId, username);
    }
    return {
      result: true,
      messageState: `La habilidad ${skillTypeData.singleWord}: ${skillName} se ha registrado correctamente.`
    };
  } catch (err) {
    return { result: false, messageState: `Error en el servidor: ${(err as Error).message}` };
  }
}

/**
 * La función `registerUserHardSkill` asocia una habilidad técnica existente al usuario autenticado.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {UserSkillTypes.RegisterNewUserSkillInfo} registerNewSkillInfo - Datos de la habilidad.
 * @returns Resultado de `registerUserSkill`.
 */
export async function registerUserHardSkill(
  tokenInfo: TokenTypes.TokenPayload,
  registerNewSkillInfo: UserSkillTypes.RegisterNewUserSkillInfo) {
  const { username } = tokenInfo;
  const { skillName, punctuation } = registerNewSkillInfo;
  return await registerUserSkill(username, skillName, "hard", punctuation);
}

/**
 * La función `registerUserSoftSkill` asocia una habilidad blanda existente al usuario autenticado.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {UserSkillTypes.RegisterNewUserSkillInfo} registerNewSkillInfo - Datos de la habilidad.
 * @returns Resultado de `registerUserSkill`.
 */
export async function registerUserSoftSkill(
  tokenInfo: TokenTypes.TokenPayload,
  registerNewSkillInfo: UserSkillTypes.RegisterNewUserSkillInfo) {
  const { username } = tokenInfo;
  const { skillName } = registerNewSkillInfo;
  return await registerUserSkill(username, skillName, "soft");
}

/**
 * Función interna `viewUserSkillsBase` que recupera las habilidades de un usuario (públicas o privadas).
 * @param {TokenTypes.TokenPayload | any} tokenInfo - Información del usuario.
 * @param {"hard" | "soft"} type - Tipo de habilidades.
 * @param {boolean} isPublic - Indica si se deben recuperar solo las habilidades públicas.
 * @returns Objeto con `result`, `messageState` y `skills`.
 */
async function viewUserSkillsBase(
  tokenInfo: TokenTypes.TokenPayload | any,
  type: "hard" | "soft",
  isPublic: boolean) {
  try {
    const { username } = tokenInfo;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe" };
    }
    const skillTypeData = getSkillTypeData(type);
    const userSkills = isPublic
      ? await UserSkillRepository.getAllPublicUserSkills(username, skillTypeData.enum)
      : await UserSkillRepository.getAllUserSkills(username, skillTypeData.enum);
    if (userSkills.length === 0) {
      return {
        result: true,
        messageState: `El usuario no tiene habilidades ${skillTypeData.pluralWord} registradas`,
        skills: []
      };
    }
    return {
      result: true,
      messageState: `Las habilidades ${skillTypeData.pluralWord} se han obtenido correctamente`,
      skills: userSkills
    };
  } catch (err) {
    return { result: false, messageState: `Error en el servidor: ${(err as Error).message}` };
  }
}

/**
 * Recupera las habilidades técnicas públicas de un usuario.
 * @param {TokenTypes.TokenPayload | any} tokenInfo - Información del usuario.
 * @returns Resultado de `viewUserSkillsBase`.
 */
export async function viewPublicUserHardSkills(tokenInfo: TokenTypes.TokenPayload | any) {
  return await viewUserSkillsBase(tokenInfo, "hard", true);
}

/**
 * Recupera todas las habilidades técnicas (públicas y privadas) del usuario autenticado.
 * @param {TokenTypes.TokenPayload | any} tokenInfo - Información del usuario.
 * @returns Resultado de `viewUserSkillsBase`.
 */
export async function viewPrivateUserHardSkills(tokenInfo: TokenTypes.TokenPayload | any) {
  return await viewUserSkillsBase(tokenInfo, "hard", false);
}

/**
 * Recupera las habilidades blandas públicas de un usuario.
 * @param {TokenTypes.TokenPayload | any} tokenInfo - Información del usuario.
 * @returns Resultado de `viewUserSkillsBase`.
 */
export async function viewPublicUserSoftSkills(tokenInfo: TokenTypes.TokenPayload | any) {
  return await viewUserSkillsBase(tokenInfo, "soft", true);
}

/**
 * Recupera todas las habilidades blandas (públicas y privadas) del usuario autenticado.
 * @param {TokenTypes.TokenPayload | any} tokenInfo - Información del usuario.
 * @returns Resultado de `viewUserSkillsBase`.
 */
export async function viewPrivateUserSoftSkills(tokenInfo: TokenTypes.TokenPayload | any) {
  return await viewUserSkillsBase(tokenInfo, "soft", false);
}

/**
 * La función `modifyUserHardSkill` actualiza la puntuación de una habilidad técnica asociada al usuario.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {UserSkillTypes.ModifyUserSkillInfo} modifyUserSkillInfo - Datos de la habilidad y nueva puntuación.
 * @returns Objeto con `result` (booleano) y `messageState`.
 */
export async function modifyUserHardSkill(
  tokenInfo: TokenTypes.TokenPayload,
  modifyUserSkillInfo: UserSkillTypes.ModifyUserSkillInfo) {
  try {
    const { username } = tokenInfo;
    const { skillName, newPunctuation } = modifyUserSkillInfo;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe." };
    }

    const foundUserSkill = await UserSkillRepository.getUserSkill(
      username, skillName, SkillTypes.SkillType.HARDSKILL);
    if (foundUserSkill.length === 0) {
      return { result: false, messageState: "La habilidad tecnica a modificar no esta asociada a este usuario." };
    }
    if (foundUserSkill[0].punctuation === newPunctuation) {
      return {
        result: false,
        messageState: "No se puede modificar la habilidad tecnica asociada, el valor de puntuacion es el mismo."
      };
    }

    await UserSkillRepository.updateUserHardSkill(newPunctuation, username, skillName);
    return {
      result: true, messageState: `Habilidad tecnica de ${username} modificada correctamente.`
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error en el servidor: ${(err as Error).message}`
    };
  }
}

/**
 * Función interna `deleteUserSkill` que desasocia una habilidad de un usuario.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {UserSkillTypes.DeleteUserSkillInfo} deleteUserSkillInfo - Datos de la habilidad a eliminar.
 * @param {"hard" | "soft"} type - Tipo de habilidad.
 * @returns Objeto con `result` (booleano) y `messageState`.
 */
async function deleteUserSkill(
  tokenInfo: TokenTypes.TokenPayload,
  deleteUserSkillInfo: UserSkillTypes.DeleteUserSkillInfo,
  type: "hard" | "soft") {
  try {
    const { username } = tokenInfo;
    let { skillName } = deleteUserSkillInfo;
    skillName = skillName.trim();

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe" };
    }

    const skillTypeData = getSkillTypeData(type);
    const deletedSkill = await UserSkillRepository.deleteUserSkill(username, skillName, skillTypeData.enum);
    if (deletedSkill.length === 0) {
      return {
        result: false,
        messageState: `La habilidad ${skillTypeData.singleWord} a eliminar no esta asociada a este usuario`
      };
    }
    return {
      result: true,
      messageState: `La habilidad ${skillTypeData.singleWord}: ${skillName} se ha eliminado correctamente`
    };
  } catch (err) {
    return { result: false, messageState: `Error en el servidor: ${(err as Error).message}` };
  }
}

/**
 * Desasocia una habilidad técnica del usuario autenticado.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {UserSkillTypes.DeleteUserSkillInfo} deleteUserSkillInfo - Datos de la habilidad.
 * @returns Resultado de `deleteUserSkill`.
 */
export async function deleteUserHardSkill(
  tokenInfo: TokenTypes.TokenPayload,
  deleteUserSkillInfo: UserSkillTypes.DeleteUserSkillInfo) {
  return await deleteUserSkill(tokenInfo, deleteUserSkillInfo, "hard");
}

/**
 * Desasocia una habilidad blanda del usuario autenticado.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {UserSkillTypes.DeleteUserSkillInfo} deleteUserSkillInfo - Datos de la habilidad.
 * @returns Resultado de `deleteUserSkill`.
 */
export async function deleteUserSoftSkill(
  tokenInfo: TokenTypes.TokenPayload,
  deleteUserSkillInfo: UserSkillTypes.DeleteUserSkillInfo) {
  return await deleteUserSkill(tokenInfo, deleteUserSkillInfo, "soft");
}

/**
 * La función `updateSkillsVisibility` actualiza la visibilidad (público/privado) de múltiples habilidades de forma masiva.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {UserSkillTypes.UpdateSkillVisibilityInfo} updateSkillVisibilityInfo - Mapa de nombres de habilidades y estados.
 * @returns Objeto con `result` (booleano) y `messageState`.
 */
export async function updateSkillsVisibility(
  tokenInfo: TokenTypes.TokenPayload,
  updateSkillVisibilityInfo: UserSkillTypes.UpdateSkillVisibilityInfo) {
  try {
    const { username } = tokenInfo;
    const { visibilities } = updateSkillVisibilityInfo;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe." };
    }
    await UserSkillRepository.updateSkillsVisibilityBulk(username, visibilities);
    return { result: true, messageState: "Cambios guardados exitosamente" };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}