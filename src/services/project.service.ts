import * as ProjectTypes from "../types/project.types";
import * as TokenTypes from "../types/token.types";
import * as CommonRepository from "../repositories/shared/common.repository";
import * as ProjectRepository from "../repositories/project.repository";
import * as AIService from "../services/ai.service";

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
        if (response.reason)
          return { result: false, messageState: response.reason };
        return { result: false, messageState: "La foto de portada del proyecto contiene contenido obseno" };
      }
    }

    await ProjectRepository.createPersonalProject(username, projectInfo);
    return { result: true, messageState: "Proyecto personal registrado exitosamente." };
  } catch (err) {
    return { result: false, messageState: `Error interno del servidor: ${(err as Error).message}` };
  }
}

export async function modifyPersonalProject(
  tokenInfo: TokenTypes.TokenPayload,
  projectIdInfo: any,
  projectInfo: ProjectTypes.ProjectInfo) {
  try {
    const { username } = tokenInfo;
    const { links } = projectInfo;
    const projectId = projectIdInfo.id ? parseInt(projectIdInfo.id as string, 10) : undefined;

    let parsedLinks: ProjectTypes.ProjectLink[] = [];
    if (links) {
      try {
        parsedLinks = Array.isArray(links) ? links : JSON.parse(links);
      } catch {
        parsedLinks = [];
      }
    }
    const formatedProjectInfo: ProjectTypes.ProjectInfo = {
      name: "",
      description: projectInfo.description,
      status: projectInfo.status,
      topic: projectInfo.topic,
      role: projectInfo.role,
      links: parsedLinks,
      imageBuffer: projectInfo.imageBuffer ? projectInfo.imageBuffer : undefined
    };

    const userExists = await CommonRepository.userExists(username);
    if (!userExists) {
      return { result: false, messageState: "El usuario no existe." };
    }
    const projectExists = await ProjectRepository.projectExists(formatedProjectInfo, username);
    if (projectExists) {
      return {
        result: false,
        messageState: "El proyecto que trata de ser modificado ya existe y esta asociado a este usuario."
      };
    }
    const project = await ProjectRepository.getProjectByIdAndUser(username, projectId!);
    if (!project || project.length === 0) {
      return { result: false, messageState: "El proyecto no existe o no tienes permiso para editarlo." };
    }

    if (formatedProjectInfo.imageBuffer) {
      const response = await AIService.NSFWImageValidation(formatedProjectInfo.imageBuffer);
      if (!response.valid) {
        if (response.reason)
          return { result: false, messageState: response.reason };
        return { result: false, messageState: "La foto de portada del proyecto contiene contenido obseno" };
      }
    }

    await ProjectRepository.updatePersonalProject(username, projectId!, projectInfo);
    return { result: true, messageState: "Proyecto personal modificado exitosamente." };
  } catch (err) {
    return { result: false, messageState: `Error interno: ${(err as Error).message}` };
  }
}

export async function deletePersonalProject(tokenInfo:TokenTypes.TokenPayload, projectIdInfo: any) {
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

export async function getPrivatePersonalProjects(tokenInfo: TokenTypes.TokenPayload) {
  try {
    const { username } = tokenInfo;

    const projects = await ProjectRepository.getAllUserProjects(username);
    return { result: true, messageState: "Proyectos obtenidos exitosamente", data: projects };
  } catch (err) {
    return { result: false, messageState: `Error interno: ${(err as Error).message}` };
  }
}

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