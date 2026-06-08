import { getSkillTypeData } from "../helpers/skill.helper";
import * as MeasureConstants from "../utils/constants/measure.constants";
import * as SkillTypes from "../types/skill.types";
import * as TokenTypes from "../types/token.types";
import * as UserSkillTypes from "../types/userskill.types";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as UserSkillRepository from "../repositories/userskill.repository";
import * as AIService from "./ai.service";

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

export async function registerNewUserHardSkill(
  tokenInfo: TokenTypes.TokenPayload, 
  registerNewUserSkillInfo: UserSkillTypes.RegisterNewUserSkillInfo) {
  const { username } = tokenInfo;
  const { skillName, punctuation } = registerNewUserSkillInfo;
  return await registerNewUserSkill(username, skillName, "hard", punctuation);
}

export async function registerNewUserSoftSkill(
  tokenInfo: TokenTypes.TokenPayload, 
  registerNewUserSkillInfo: UserSkillTypes.RegisterNewUserSkillInfo) {
  const { username } = tokenInfo;
  const { skillName } = registerNewUserSkillInfo;
  return await registerNewUserSkill(username, skillName, "soft");
}

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

export async function registerUserHardSkill(
  tokenInfo: TokenTypes.TokenPayload,
  registerNewSkillInfo: UserSkillTypes.RegisterNewUserSkillInfo) {
  const { username } = tokenInfo; 
  const { skillName, punctuation } = registerNewSkillInfo;
  return await registerUserSkill(username, skillName, "hard", punctuation);
}

export async function registerUserSoftSkill(
  tokenInfo: TokenTypes.TokenPayload,
  registerNewSkillInfo: UserSkillTypes.RegisterNewUserSkillInfo) {
  const { username } = tokenInfo;
  const { skillName } = registerNewSkillInfo;
  return await registerUserSkill(username, skillName, "soft");
}

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

export async function viewPublicUserHardSkills(tokenInfo: TokenTypes.TokenPayload | any) {
  return await viewUserSkillsBase(tokenInfo, "hard", true);
}

export async function viewPrivateUserHardSkills(tokenInfo: TokenTypes.TokenPayload | any) {
  return await viewUserSkillsBase(tokenInfo, "hard", false);
}

export async function viewPublicUserSoftSkills(tokenInfo: TokenTypes.TokenPayload | any) {
  return await viewUserSkillsBase(tokenInfo, "soft", true);
}

export async function viewPrivateUserSoftSkills(tokenInfo: TokenTypes.TokenPayload | any) {
  return await viewUserSkillsBase(tokenInfo, "soft", false);
}

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
      result: true, messageState: `Habilidad tecnica de ${username} modificada correctamente.` };
  } catch (err) {
    return {
      result: false,
      messageState: `Error en el servidor: ${(err as Error).message}`
    };
  }
}

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

export async function deleteUserHardSkill(
  tokenInfo: TokenTypes.TokenPayload,
  deleteUserSkillInfo: UserSkillTypes.DeleteUserSkillInfo) {
  return await deleteUserSkill(tokenInfo, deleteUserSkillInfo, "hard");
}

export async function deleteUserSoftSkill(
  tokenInfo: TokenTypes.TokenPayload,
  deleteUserSkillInfo: UserSkillTypes.DeleteUserSkillInfo) {
  return await deleteUserSkill(tokenInfo, deleteUserSkillInfo, "soft");
}

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