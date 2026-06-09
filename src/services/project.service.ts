import * as ProjectTypes from "../types/project.types";
import * as TokenTypes from "../types/token.types";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as ProjectRepository from "../repositories/project.repository";
import * as AIService from "../services/ai.service";

/**
 * La función `registerPersonalProject` registra un nuevo proyecto personal para el usuario autenticado.
 * Parsea los enlaces del proyecto, valida la existencia del usuario, verifica si el proyecto ya existe
 * y realiza una validación NSFW de la imagen de portada si se proporciona.
 * @param {TokenTypes.TokenPayload} toknInfo - Información del token del usuario autenticado.
 * @param {ProjectTypes.ProjectInfo} projectInfo - Datos del proyecto a registrar.
 * @returns Objeto con `result` (booleano) y `messageState` indicando el éxito o error de la operación.
 */
export async function registerPersonalProject(
  toknInfo: TokenTypes.TokenPayload,
  projectInfo: ProjectTypes.ProjectInfo) {
  try {
    const { username } = toknInfo;
    const { links } = projectInfo;

    let parsedLinks: ProjectTypes.ProjectLink[] = [];
    if (links) {
      try {
        parsedLinks = Array.isArray(links) ? links : JSON.parse(links);
      } catch {
        parsedLinks = [];
      }
    }
    const formatedProjectInfo: ProjectTypes.ProjectInfo = {
      name: projectInfo.name,
      description: projectInfo.description,
      status: projectInfo.status,
      topic: projectInfo.topic,
      role: projectInfo.role,
      links: parsedLinks
    };
    if (projectInfo.imageBuffer) {
      formatedProjectInfo.imageBuffer = projectInfo.imageBuffer;
    }

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe." };
    }
    const projectExists = await ProjectRepository.projectExists(projectInfo, username);
    if (projectExists) {
      return { result: false, messageState: "El proyecto ya existe y está asociado a este usuario" };
    }
    if (formatedProjectInfo.imageBuffer) {
      const response = await AIService.NSFWImageValidation(projectInfo.imageBuffer!);
      if (!response.valid) {
        if (response.reason) {
          return { result: false, messageState: response.reason };
        }
        return { result: false, messageState: "La foto de portada del proyecto contiene contenido obseno" };
      }
    }

    await ProjectRepository.createPersonalProject(username, formatedProjectInfo);
    return { result: true, messageState: "Proyecto personal registrado exitosamente." };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}

/**
 * La función `modifyPersonalProject` actualiza la información de un proyecto personal existente.
 * Valida la existencia del usuario, comprueba si el proyecto pertenece al usuario y realiza 
 * validación NSFW de la nueva imagen si se proporciona.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {any} projectIdInfo - Objeto que contiene el `id` del proyecto a modificar.
 * @param {Partial<ProjectTypes.ProjectInfo>} projectInfo - Datos actualizados del proyecto.
 * @returns Objeto con `result` (booleano) y `messageState` indicando el éxito o error de la operación.
 */
export async function modifyPersonalProject(
  tokenInfo: TokenTypes.TokenPayload,
  projectIdInfo: any,
  projectInfo: Partial<ProjectTypes.ProjectInfo>) {
  try {
    const { username } = tokenInfo;
    const { links } = projectInfo;
    const projectId = projectIdInfo.id ? parseInt(projectIdInfo.id as string, 10) : undefined;

    const formatedProjectInfo: Partial<ProjectTypes.ProjectInfo> = {};
    if (projectInfo.description !== undefined) formatedProjectInfo.description = projectInfo.description;
    if (projectInfo.status !== undefined) formatedProjectInfo.status = projectInfo.status;
    if (projectInfo.topic !== undefined) formatedProjectInfo.topic = projectInfo.topic;
    if (projectInfo.role !== undefined) formatedProjectInfo.role = projectInfo.role;
    if (projectInfo.imageBuffer !== undefined) formatedProjectInfo.imageBuffer = projectInfo.imageBuffer;

    if (links !== undefined) {
      try {
        formatedProjectInfo.links = Array.isArray(links) ? links : JSON.parse(links as unknown as string);
      } catch {
        formatedProjectInfo.links = [];
      }
    }

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe." };
    }
    const project = await ProjectRepository.getProjectByIdAndUser(username, projectId!);
    if (!project || project.length === 0) {
      return { result: false, messageState: "El proyecto no existe o no tienes permiso para editarlo." };
    }

    if (formatedProjectInfo.imageBuffer) {
      const response = await AIService.NSFWImageValidation(formatedProjectInfo.imageBuffer);
      if (!response.valid) {
        if (response.reason) {
          return { result: false, messageState: response.reason };
        }
        return { result: false, messageState: "La foto de portada del proyecto contiene contenido obseno" };
      }
    }

    await ProjectRepository.updatePersonalProject(username, projectId!, formatedProjectInfo);
    return { result: true, messageState: "Proyecto personal modificado exitosamente." };
  } catch (err) {
    return { result: false, messageState: `Error interno: ${(err as Error).message}` };
  }
}

/**
 * La función `deletePersonalProject` elimina un proyecto personal del usuario autenticado.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {any} projectIdInfo - Objeto que contiene el `id` del proyecto a eliminar.
 * @returns Objeto con `result` (booleano) y `messageState` indicando el éxito o error de la operación.
 */
export async function deletePersonalProject(tokenInfo: TokenTypes.TokenPayload, projectIdInfo: any) {
  try {
    const { username } = tokenInfo;
    const projectId = projectIdInfo.id ? parseInt(projectIdInfo.id as string, 10) : undefined;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe" };
    }
    const projectExists = await ProjectRepository.getProjectByIdAndUser(username, projectId!);
    if (!projectExists || projectExists.length === 0) {
      return { result: false, messageState: "El proyecto no existe o no tienes permiso para eliminarlo" };
    }

    await ProjectRepository.deletePersonalProject(projectId!);
    return { result: true, messageState: "Proyecto personal eliminado exitosamente" };
  } catch (err) {
    return { result: false, messageState: `Error interno: ${(err as Error).message}` };
  }
}

/**
 * La función `getPublicPersonalProjects` recupera todos los proyectos marcados como públicos de un usuario.
 * @param {any} publicPersonProjectsInfo - Objeto que contiene el `username` del usuario a consultar.
 * @returns Objeto con `result`, `messageState` y `data` (lista de proyectos públicos).
 */
export async function getPublicPersonalProjects(publicPersonProjectsInfo: any) {
  try {
    const { username } = publicPersonProjectsInfo;
    const interfaceId = 6;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe" };
    }

    const projects = await ProjectRepository.getPublicProjects(username);
    await CommonRepository.insertInterfaceView(username, interfaceId);
    return { result: true, messageState: "Proyectos obtenidos exitosamente", data: projects };
  } catch (err) {
    return { result: false, messageState: `Error interno: ${(err as Error).message}` };
  }
}

/**
 * La función `getPrivatePersonalProjects` recupera todos los proyectos (públicos y privados) del usuario autenticado.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @returns Objeto con `result`, `messageState` y `data` (lista completa de proyectos del usuario).
 */
export async function getPrivatePersonalProjects(tokenInfo: TokenTypes.TokenPayload) {
  try {
    const { username } = tokenInfo;

    const projects = await ProjectRepository.getAllUserProjects(username);
    return { result: true, messageState: "Proyectos obtenidos exitosamente", data: projects };
  } catch (err) {
    return { result: false, messageState: `Error interno: ${(err as Error).message}` };
  }
}

/**
 * La función `updateProjectsVisibility` actualiza la visibilidad (público/privado) de múltiples proyectos.
 * @param {TokenTypes.TokenPayload} tokenInfo - Información del token del usuario autenticado.
 * @param {ProjectTypes.UpdateProjectsVisibilityInfo} updateProjectsVisibilityInfo - Mapa de IDs y estados.
 * @returns Objeto con `result` (booleano) y `messageState`.
 */
export async function updateProjectsVisibility(
  tokenInfo: TokenTypes.TokenPayload,
  updateProjectsVisibilityInfo: ProjectTypes.UpdateProjectsVisibilityInfo) {
  try {
    const { username } = tokenInfo;
    const { visibilities } = updateProjectsVisibilityInfo;

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe." };
    }

    await ProjectRepository.updateProjectsVisibilityBulk(username, visibilities);
    return { result: true, messageState: "Visibilidad de proyectos actualizada exitosamente." };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}
