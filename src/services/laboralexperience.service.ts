import { getLaboralExpAction } from "../helpers/laboralexperience.helper";
import * as LaboralExpTypes from "../types/laboralexperience.types";
import * as Assertions from "../helpers/assertions.helper";
import * as Selects from "../helpers/selects.helper";
import * as Inserts from "../helpers/inserts.helper";
import * as Updates from "../helpers/updates.helper";
import * as Deletes from "../helpers/deletes.helper";

async function manageUserLaboralExperience(
  username: string, 
  laboralExperienceInfo: LaboralExpTypes.LaboralExperienceInfo,
  action: "register" | "modify",
  id?: number) {
  try {
    if (laboralExperienceInfo.startDate) {
      laboralExperienceInfo.startDate = new Date(laboralExperienceInfo.startDate);
      if (isNaN(laboralExperienceInfo.startDate.getTime())) {
        return {
          result: false,
          messageState: "La fecha de inicio es inválida."
        };
      }
    }
    if (laboralExperienceInfo.endDate) {
      laboralExperienceInfo.endDate = new Date(laboralExperienceInfo.endDate);
    }

    if (laboralExperienceInfo.endDate && isNaN((laboralExperienceInfo.endDate as Date).getTime())) {
      return {
        result: false,
        messageState: "La fecha de fin es inválida." 
      };
    }
    
    const { startDate, endDate = null } = laboralExperienceInfo;

    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    if (action === "modify") {
      const foundLaboralExperience = await Selects.getLaboralExperience(username, id!);
      if (!foundLaboralExperience || foundLaboralExperience.length === 0) {
        return {
          result: false,
          messageState: "La experiencia laboral consultada no existe."
        };
      }
      if (endDate) {
        if (!(endDate instanceof Date)) {
          return {
            result: false,
            messageState: "La fecha de fin es invalida"
          };
        }
        const currentStartDate = foundLaboralExperience[0].start_date;
        if (currentStartDate > endDate) {
          return {
            result: false,
            messageState: "La fecha de inicio no puede ser luego de fecha de finalización"
          };
        }
      }
    } else {
      if (endDate) {
        if (!(endDate instanceof Date)) {
          return {
            result: false,
            messageState: "La fecha de fin es invalida"
          };
        }
        if (startDate > endDate) {
          return {
            result: false,
            messageState: "La fecha de inicio no puede ser luego de fecha de finalización"
          };
        }
      }
    }

    const laboralExperienceAction = getLaboralExpAction(action);
    const validationResult = await laboralExperienceAction.serviceValidations(laboralExperienceInfo);
    if (validationResult && !validationResult.result) {
      return {
        result: false,
        messageState: validationResult.messageState
      };
    }

    //if (visible && typeof visible !== "boolean") {
    //  return {
    //    result: false,
    //    messageState: "Parametro de visibilidad invalido."
    //  };
    //}

    if (action === "register") {
      await Inserts.createLaboralExperience(username, laboralExperienceInfo);
    } else {
      await Updates.updateUserLaboralExperience(username, laboralExperienceInfo, id!);
    }
    return {
      result: true,
      messageState: `Experiencia laboral ${laboralExperienceAction.singleWord} exitosamente`
    };   
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}

export async function registerUserLaboralExperience(username: string, laboralExperienceInfo: LaboralExpTypes.LaboralExperienceInfo) {
  return await manageUserLaboralExperience(username, laboralExperienceInfo, "register");
}

export async function modifyUserLaboralExperience(
  username: string, 
  laboralExperienceInfo: LaboralExpTypes.LaboralExperienceInfo,
  id: number) {
  return await manageUserLaboralExperience(username, laboralExperienceInfo, "modify", id);
}

async function handleUserLaboralExperience(
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
      const userLaboralExperiences = await Selects.getAllUserLaboralExperiences(username);
      if (!userLaboralExperiences || userLaboralExperiences.length === 0) {
        return {
          result: true,
          messageState: "El usuario no tiene experiencias laborales registradas."
        };
      }
      return {
        result: true,
        messageState: "Las experiencias laborales del usuario se han obtenido correctamente.",
        laboralExperiences: userLaboralExperiences
      };
    } else {
      const foundLaboralExperience = await Selects.getLaboralExperience(username, id!);
      if (!foundLaboralExperience || foundLaboralExperience.length === 0) {
        return {
          result: false,
          messageState: "La experiencia laboral consultada no existe."
        };
      }

      const deletedLaboralExperience = await Deletes.deleteLaboralExperience(username, id!);
      if (deletedLaboralExperience.length === 0) {
        return {
          result: false,
          messageState: "La experiencia laboral a eliminar no esta asociada a este usuario o no existe." 
        };
      }
      return {
        result: true,
        messageState: "La experiencia laboral se ha eliminado correctamente."
      };
    }
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}

export async function viewUserLaboralExperience(username: string) {
  return await handleUserLaboralExperience(username, "view");
}

export async function deleteUserLaboralExperience(username: string, id: number) {
  return await handleUserLaboralExperience(username, "delete", id);
}