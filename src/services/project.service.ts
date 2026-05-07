import * as ProjectTypes from "../types/project.types";
import * as Assertions from "../helpers/assertions.helper";
import * as Inserts from "../helpers/inserts.helper";
import { registerProjectValidations } from "../helpers/project.helper";

export async function registerPersonalProject(username: string, projectInfo: ProjectTypes.ProjectInfo) {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }
    const validationResult = await registerProjectValidations(projectInfo);
    if (!validationResult.result) {
      return {
        result: false,
        messageState: validationResult.messageState
      };
    }
    await Inserts.createPersonalProject(username, projectInfo);
    return {
      result: true,
      messageState: "Proyecto personal registrado exitosamente."
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}
