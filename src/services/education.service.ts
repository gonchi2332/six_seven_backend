import { getEducationAction } from "../helpers/education.helper";
import { registerDateValidations } from "../helpers/date.helper";
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
    if (educationInfo.endDate) {
      educationInfo.endDate = new Date(educationInfo.endDate);
      if (isNaN((educationInfo.endDate as Date).getTime())) {
        return {
          result: false,
          messageState: "El año de finalización es inválido"
        };
      }
    }

    const { startDate, endDate = null } = educationInfo;

    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    if (action === "modify") {
      const foundEducation = await Selects.getEducation(id!);
      let currentStartDate;
      if (!educationInfo.startDate) {
        currentStartDate = foundEducation[0].start_date;
      } else {
        currentStartDate = educationInfo.startDate;
      }
      if (!foundEducation || foundEducation.length === 0) {
        return {
          result: false,
          messageState: "La educacion educacion consultada no existe"
        };
      }
      const dateValidationResult = registerDateValidations(currentStartDate, endDate);
      if (endDate) {
        if (dateValidationResult && !dateValidationResult.result) {
          return {
            result: false,
            messageState: dateValidationResult.messageState
          };
        }
        if (startDate) {
          if (startDate > endDate) {
            return {
              result: false,
              messageState: "El año de inicio no puede ser luego del año de finalización"
            };
          }
        }
        else {
          if (currentStartDate > endDate) {
            return {
              result: false,
              messageState: "El año de inicio no puede ser luego del año de finalización"
            };
          }
        }
      }
    } else {
      const dateValidationResult = registerDateValidations(startDate, endDate);
      if (endDate) {
        if (dateValidationResult && !dateValidationResult.result) {
          return {
            result: false,
            messageState: dateValidationResult.messageState
          };
        }
      }
    }

    const educationAction = getEducationAction(action);
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
        messageState: "El usuario no existe."
      };
    }

    if (action === "view") {
      const education = await Selects.getAllUserEducation(username);
      if (!education || education.length === 0) {
        return {
          result: true,
          messageState: "El usuario no tiene registros de educacion."
        };
      }
      return {
        result: true,
        messageState: "Los registros de educacion del usuario se han obtenido correctamente.",
        education: education
      };
    } else {
      const educationExperience = await Selects.getEducation(id!);
      if (!educationExperience || educationExperience.length === 0) {
        return {
          result: false,
          messageState: "La educacion consultada no existe."
        };
      }

      const deletedEducation = await Deletes.deleteEducation(id!);
      if (deletedEducation.length === 0) {
        return {
          result: false,
          messageState: "El registro de educacion a eliminar no esta asociada a este usuario o no existe."
        };
      }
      return {
        result: true,
        messageState: "El registro de educacion se ha eliminado correctamente."
      };
    }
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}

export async function viewEducation(username: string) {
  return await handleEducation(username, "view");
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
        messageState: "No se encontro los registros de grado academico."
      };
    }
    return {
      result: true,
      messageState: "Los registros de educacion del usuario se han obtenido correctamente.",
      educationGrade: educationGrade
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}