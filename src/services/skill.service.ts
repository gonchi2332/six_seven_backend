import { getSkillTypeData } from "../helpers/skill.helper";
import * as SkillTypes from "../types/skill.types";
import * as Selects from "../helpers/selects.helper";
import * as Inserts from "../helpers/inserts.helper";
import * as Updates from "../helpers/updates.helper";
import * as Deletes from "../helpers/deletes.helper";
import * as Assertions from "../helpers/assertions.helper";

async function registerNewUserSkill(
  username: string,
  skillName: string,
  type: "hard" | "soft",
  punctuation?: number) {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    const skillTypeData = getSkillTypeData(type);

    const foundSkill = await Selects.getSkill(skillName, skillTypeData.enum);
    if (!foundSkill || foundSkill.length === 0) {
      
    }

    const skillId = foundSkill[0].id;
    if (type === "hard") {
      await Inserts.createUserSkill(skillId, username, punctuation);
    } else {
      await Inserts.createUserSkill(skillId, username);
    }
    return {
      result: true,
      messageState: `La habilidad ${skillTypeData.singleWord}: ${skillName} existe y se ha registrado correctamente.`
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error en el servidor: ${(err as Error).message}`
    };
  }
}

export async function registerNewUserHardSkill(username: string, skillName: string, punctuation: number) {
  return await registerNewUserSkill(username, skillName, "hard", punctuation);
}

export async function registerNewUserSoftSkill(username: string, skillName: string) {
  return await registerNewUserSkill(username, skillName, "soft");
}

async function registerUserSkill(
  username: string, 
  skillName: string, 
  type: "hard" | "soft", 
  punctuation?: number) {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    const skillTypeData = getSkillTypeData(type);

    const foundSkill = await Selects.getSkill(skillName, skillTypeData.enum);
    if (!foundSkill || foundSkill.length === 0) {
      return {
        result: false,
        messageState: `La habilidad ${skillTypeData.singleWord} que se intenta registrar no existe.`
      };
    }

    const foundUserSkill = await Selects.getUserSkill(username, skillName, skillTypeData.enum);
    if (foundUserSkill.length > 0) {
      return {
        result: false,
        messageState: `El usuario ya tiene registrada esta habilidad ${skillTypeData.singleWord}.`
      };
    }
    
    const skillId = foundSkill[0].id;
    if (type === "hard") {
      await Inserts.createUserSkill(skillId, username, punctuation);
    } else {
      await Inserts.createUserSkill(skillId, username);
    }
    return {
      result: true,
      messageState: `La habilidad ${skillTypeData.singleWord}: ${skillName} se ha registrado correctamente.`
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error en el servidor: ${(err as Error).message}`
    };
  }
}

export async function registerUserHardSkill(username: string, skillName: string, punctuation: number) {
  return await registerUserSkill(username, skillName, "hard", punctuation);
}

export async function registerUserSoftSkill(username: string, skillName: string) {
  return await registerUserSkill(username, skillName, "soft");
}

async function viewUserSkills(username: string, type: "hard" | "soft") {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    const skillTypeData = getSkillTypeData(type);
    const userSkills = await Selects.getAllUserSkills(username, skillTypeData.enum);
    if (userSkills.length === 0) {
      return {
        result: true,
        messageState: `El usuario no tiene habilidades ${skillTypeData.pluralWord} registradas.`,
      };
    }
    return {
      result: true,
      messageState: `Las habilidades ${skillTypeData.pluralWord} se han obtenido correctamente.`,
      skills: userSkills
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error en el servidor: ${(err as Error).message}`
    };
  }
}

export async function viewUserHardSkills(username: string) {
  return await viewUserSkills(username, "hard");
}

export async function viewUserSoftSkills(username: string) {
  return await viewUserSkills(username, "soft");
}

export async function modifyUserHardSkill(username: string, skillName: string, newPunctuation: number) {
  try {
    const userExists = await Assertions.userExists(username); 
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    const foundUserSkill = await Selects.getUserSkill(username, skillName, SkillTypes.SkillType.HARDSKILL);
    if (foundUserSkill.length === 0) {
      return {
        result: false,
        messageState: "La habilidad tecnica a modificar no esta asociada a este usuario."
      };
    }
    if (foundUserSkill[0].punctuation === newPunctuation) {
      return {
        result: false,
        messageState: "No se puede modificar la habilidad tecnica asociada, el valor de puntuacion es el mismo."
      };
    }

    await Updates.updateUserHardSkill(newPunctuation, username, skillName);
    return {
      result: true,
      messageState: `Habilidad tecnica de ${username} modificada correctamente.`
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error en el servidor: ${(err as Error).message}`
    };
  }
}

async function deleteUserSkill(username: string, skillName: string, type: "hard" | "soft") {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    const skillTypeData = getSkillTypeData(type);
    const deletedSkill = await Deletes.deleteUserSkill(username, skillName, skillTypeData.enum);
    if (deletedSkill.length === 0) {
      return {
        result: false,
        messageState: `La habilidad ${skillTypeData.singleWord} a eliminar no esta asociada a este usuario.`
      };
    }
    return {
      result: true,
      messageState: `La habilidad ${skillTypeData.singleWord}: ${skillName} se ha eliminado correctamente.`
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error en el servidor: ${(err as Error).message}`
    };
  }
}

export async function deleteUserHardSkill(username: string, skillName: string) {
  return await deleteUserSkill(username, skillName, "hard");
}

export async function deleteUserSoftSkill(username: string, skillName: string) {
  return await deleteUserSkill(username, skillName, "soft");
}