import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as ProjectService from "../services/project.service";
import * as ProjectTypes from "../types/project.types";

export async function registerProject(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    let parsedLinks: ProjectTypes.ProjectLink[] = [];
    if (req.body.links) {
      try {
        parsedLinks = Array.isArray(req.body.links) ? req.body.links : JSON.parse(req.body.links);
      } catch {
        parsedLinks = []; 
      }
    }
    const projectInfo: ProjectTypes.ProjectInfo = {
      name: req.body.name,
      description: req.body.description,
      status: req.body.status,
      topic: req.body.topic,
      role: req.body.role,
      links: parsedLinks
    };
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "La imagen del proyecto es requerida"
      });
    }
    projectInfo.imageBuffer = req.file.buffer;
    const ans = await ProjectService.registerPersonalProject(username, projectInfo);
    if (!ans.result) {
      return res.status(400).json({
        success: false,
        message: ans.messageState
      });
    }
    return res.status(201).json({
      success: true,
      message: ans.messageState
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function modifyProject(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const { id } = req.query;
    const projectId = id ? parseInt(id as string, 10) : undefined;
    if (!projectId || isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: "ID de proyecto inválido."
      });
    }
    let links: ProjectTypes.ProjectLink[] = [];
    if (req.body.links) {
      try {
        links = Array.isArray(req.body.links) ? req.body.links : JSON.parse(req.body.links);
      } catch {
        links = [];
      }
    }
    const projectInfo: ProjectTypes.ProjectInfo = {
      name: "", // Campo inmutable
      description: req.body.description,
      status: req.body.status,
      topic: req.body.topic,
      role: req.body.role,
      links: links,
      imageBuffer: req.file ? req.file.buffer : undefined
    };
    const response = await ProjectService.modifyPersonalProject(username, projectId, projectInfo);
    if (!response.result) {
      return res.status(400).json({
        success: false,
        message: response.messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: response.messageState
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

export async function deleteProject(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const { id } = req.query;
    const projectId = id ? parseInt(id as string, 10) : undefined;
    if (!projectId || isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: "ID de proyecto inválido."
      });
    }
    const response = await ProjectService.deletePersonalProject(username, projectId);
    if (!response.result) {
      return res.status(400).json({
        success: false,
        message: response.messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: response.messageState
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

export async function getPublicProjects(req: Request, res: Response) {
  try {
    const { username } = req.params;
    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario inválido."
      });
    }
    const response = await ProjectService.getPublicPersonalProjects(username);
    if (!response.result) {
      return res.status(400).json({
        success: false,
        message: response.messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: response.messageState,
      projects: response.data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

export async function modifyProjectsVisibility(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const { visibilities } = req.body; 
    if (!visibilities || typeof visibilities !== "object" || Array.isArray(visibilities)) {
      return res.status(400).json({
        success: false,
        message: "Formato de visibilidad inválido. Se esperaba un objeto."
      });
    }
    const response = await ProjectService.updateProjectsVisibility(username, visibilities);
    if (!response.result) {
      return res.status(400).json({
        success: false,
        message: response.messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: response.messageState
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno: ${(err as Error).message}`
    });
  }
}
