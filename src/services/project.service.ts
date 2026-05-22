import * as ProjectTypes from "../types/project.types";
import * as Assertions from "../helpers/assertions.helper";
import * as Inserts from "../helpers/inserts.helper";
import * as Selects from "../helpers/selects.helper";
import * as Updates from "../helpers/updates.helper";
import * as Deletes from "../helpers/deletes.helper";
import { registerProjectValidations } from "../helpers/project.helper";
import { modifyProjectValidations } from "../helpers/project.helper";

export async function registerPersonalProject(username: string, projectInfo: ProjectTypes.ProjectInfo) {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    const projectExists = await Assertions.projectExists(projectInfo, username);
    if (projectExists) {
      return {
        result: false,
        messageState: "El proyecto que trata de ser registrado ya existe y esta asociado a este usuario."
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

export async function modifyPersonalProject(username: string, projectId: number, projectInfo: ProjectTypes.ProjectInfo) {
  try {
    if (!(await Assertions.userExists(username))) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }

    const projectExists = await Assertions.projectExists(projectInfo, username);
    if (projectExists) {
      return {
        result: false,
        messageState: "El proyecto que trata de ser modificado ya existe y esta asociado a este usuario."
      };
    }

    const project = await Selects.getProjectByIdAndUser(username, projectId);
    if (!project || project.length === 0) {
      return {
        result: false,
        messageState: "El proyecto no existe o no tienes permiso para editarlo."
      };
    }
    const validation = await modifyProjectValidations(projectInfo);
    if (!validation.result) {
      return {
        result: false,
        messageState: validation.messageState
      };
    }
    await Updates.updatePersonalProject(username, projectId, projectInfo);
    return {
      result: true,
      messageState: "Proyecto personal modificado exitosamente."
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno: ${(err as Error).message}`
    };
  }
}

export async function deletePersonalProject(username: string, projectId: number) {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe"
      };
    }
    const projectExists = await Selects.getProjectByIdAndUser(username, projectId);
    if (!projectExists || projectExists.length === 0) {
      return {
        result: false,
        messageState: "El proyecto no existe o no tienes permiso para eliminarlo"
      };
    }
    await Deletes.deletePersonalProject(projectId);
    return {
      result: true,
      messageState: "Proyecto personal eliminado exitosamente"
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno: ${(err as Error).message}`
    };
  }
}

export async function getPublicPersonalProjects(username: string) {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe"
      };
    }
    const projects = await Selects.getPublicProjects(username);
    return {
      result: true,
      messageState: "Proyectos obtenidos exitosamente",
      data: projects
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno: ${(err as Error).message}`
    };
  }
}

export async function getPrivatePersonalProjects(username: string) {
  try {
    const projects = await Selects.getAllUserProjects(username); 
    return {
      result: true,
      messageState: "Proyectos obtenidos exitosamente",
      data: projects
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno: ${(err as Error).message}`
    };
  }
}

export async function updateProjectsVisibility(username: string, visibilities: Record<string, boolean>) {
  try {
    const userExists = await Assertions.userExists(username);
    if (!userExists) {
      return {
        result: false,
        messageState: "El usuario no existe."
      };
    }
    await Updates.updateProjectsVisibilityBulk(username, visibilities);
    return {
      result: true,
      messageState: "Visibilidad de proyectos actualizada exitosamente."
    };
  } catch (err) {
    return {
      result: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    };
  }
}
