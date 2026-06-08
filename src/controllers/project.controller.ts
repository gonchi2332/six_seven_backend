import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as ProjectValidations from "../validators/project.validator";
import * as ProjectService from "../services/project.service";

export async function registerProject(req: Request, res: Response) {
  try {
    const validations = ProjectValidations.registerProjectValidation(
      req.user as TokenTypes.TokenPayload, req.body, req.file);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const ans = await ProjectService.registerPersonalProject(
      req.user as TokenTypes.TokenPayload, req.body);
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
    const validations = ProjectValidations.modifyProjectValidation(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await ProjectService.modifyPersonalProject(
      req.user as TokenTypes.TokenPayload, req.query, req.body);
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
    const validations = ProjectValidations.deleteProjectValidation(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await ProjectService.deletePersonalProject(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: response.messageState });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

export async function getPublicProjects(req: Request, res: Response) {
  try {
    const validations = ProjectValidations.getPublicProjectsValidation(req.params);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await ProjectService.getPublicPersonalProjects(req.params);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: response.messageState, projects: response.data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

export async function getPrivateProjects(req: Request, res: Response) {
  try {
    const validations = ProjectValidations.getPrivateProjectsValidation(req.user as TokenTypes.TokenPayload);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await ProjectService.getPrivatePersonalProjects(req.user as TokenTypes.TokenPayload);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: response.messageState, projects: response.data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

export async function modifyProjectsVisibility(req: Request, res: Response) {
  try {
    const validations = ProjectValidations.modifyProjectsVisibilityValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await ProjectService.updateProjectsVisibility(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: response.messageState });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno: ${(err as Error).message}`
    });
  }
}
