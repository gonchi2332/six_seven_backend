import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as ProjectService from "../services/project.service";
import * as ProjectTypes from "../types/project.types";

export async function registerProject(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    let parsedLinks: string[] = [];
    if (req.body.links) {
      try {
        parsedLinks = Array.isArray(req.body.links) ? req.body.links : JSON.parse(req.body.links);
      } catch (e) {
        parsedLinks = [req.body.links];
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
