import { getEducationAction } from "../helpers/education.helper";
import * as EducationTypes from "../types/education.types";
import * as Assertions from "../helpers/assertions.helper";
import * as Selects from "../helpers/selects.helper";
import * as Inserts from "../helpers/inserts.helper";
import * as Updates from "../helpers/updates.helper";
import * as Deletes from "../helpers/deletes.helper";

async function manageEducation(
  username: string,
  educationInfo: EducationTypes.EducationInfo,
  action: "register" | "modify",
  id?: number) {
  try {
    if (educationInfo.startDate) {
      educationInfo.startDate = new Date(educationInfo.startDate);
      if (isNaN(educationInfo.startDate.getTime())) {
        return {
          result: false,
          messageState: "El año de inicio es inválido"
        };
      }
    }

    const { startDate } = educationInfo;

    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe"
      };
    }

    const educationAction = getEducationAction(action);
    const educationExists = await Assertions.educationExists(educationInfo, username, action);
    if (educationExists) {
      return {
        result: false,
        messageState: `La formacion academica que trata de ser ${educationAction.singleWord} ya existe y esta asociada a este usuario`
      };
    }

    if (action === "modify") {
      const foundEducation = await Selects.getEducation(id!);
      if (!foundEducation || foundEducation.length === 0) {
        return {
          result: false,
          messageState: "La educacion educacion consultada no existe"
        };
      }
    }

    if (!startDate) {
      return {
        result: false,
        messageState: "Fecha de inicio o egreso invalida"
      };
    }
    if (startDate) {
      if (isNaN(startDate.getTime())) {
        return {
          result: false,
          messageState: "Fecha de inicio o egreso invalida"
        };
      }
      if (startDate > new Date()) {
        return {
          result: false,
          messageState: "Fecha de inicio o egreso no puede ser futura"
        };
      }
      if (startDate < new Date(new Date().setFullYear(new Date().getFullYear() - 100))) {
        return {
          result: false,
          messageState: "Fecha de inicio o egreso tiene que estar dentro del rango de hoy y hace 100 años"
        };
      }
    }

    const validationResult = await educationAction.serviceValidations(educationInfo);
    if (validationResult && !validationResult.result) {
      return {
        result: false,
        messageState: validationResult.messageState
      };
    }

    if (action === "register") {
      await Inserts.createEducation(username, educationInfo);
    } else {
      await Updates.updateEducation(educationInfo, id!);
    }
    return {
      result: true,
      messageState: `Educacion ${educationAction.singleWord} exitosamente`
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}

export async function registerEducation(username: string, educationInfo: EducationTypes.EducationInfo) {
  return await manageEducation(username, educationInfo, "register");
}

export async function modifyEducation(
  username: string,
  educationInfo: EducationTypes.EducationInfo,
  id: number) {
  return await manageEducation(username, educationInfo, "modify", id);
}

async function handleEducation(
  username: string,
  action: "view" | "delete",
  id?: number) {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe"
      };
    }
    const educationExperience = await Selects.getEducation(id!);
    if (!educationExperience || educationExperience.length === 0) {
      return {
        result: false,
        messageState: "La educacion consultada no existe"
      };
    }
    const deletedEducation = await Deletes.deleteEducation(id!);
    if (deletedEducation.length === 0) {
      return {
        result: false,
        messageState: "El registro de educacion a eliminar no esta asociada a este usuario o no existe"
      };
    }
    return {
      result: true,
      messageState: "El registro de educacion se ha eliminado correctamente"
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}

export async function viewPublicEducation(username: string) {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe"
      };
    }
    const education = await Selects.getAllPublicUserEducation(username);
    return {
      result: true,
      messageState: "Educacion obtenida",
      education: education
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno: ${(err as Error).message}`
    };
  }
}

export async function viewPrivateEducation(username: string) {
  try {
    const education = await Selects.getAllUserEducation(username);
    return {
      result: true,
      messageState: "Educacion obtenida",
      education: education
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno: ${(err as Error).message}`
    };
  }
}

export async function deleteEducation(username: string, id: number) {
  return await handleEducation(username, "delete", id);
}

export async function viewAcademicGrade() {
  try {
    const educationGrade = await Selects.getAcademicDegrees();
    if (!educationGrade || educationGrade.length === 0) {
      return {
        result: false,
        messageState: "No se encontro los registros de grado academico"
      };
    }
    return {
      result: true,
      messageState: "Los registros de educacion del usuario se han obtenido correctamente",
      educationGrade: educationGrade
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}

export async function updateEducationVisibility(username: string, visibilities: Record<string, boolean>) {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }
    await Updates.updateEducationVisibilityBulk(username, visibilities);
    return {
      result: true,
      messageState: "Visibilidad de educación actualizada exitosamente."
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}
