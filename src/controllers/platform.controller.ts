import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as PlatformValidator from "../validators/platform.validator";
import * as PlatformService from "../services/platform.service";

export async function saveLinkedinProfile(req: Request, res: Response) {
  try {
    const validations = PlatformValidator.saveLinkedinProfileValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await PlatformService.saveUserLinkedin(
      req.user as TokenTypes.TokenPayload, req.body);
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

export async function saveGithubProfile(req: Request, res: Response) {
  try {
    const validations = PlatformValidator.saveGithubProfileValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }
    const response = await PlatformService.saveUserGithub(
      req.user as TokenTypes.TokenPayload, req.body);
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

export async function getLinkedinProfile(req: Request, res: Response) {
  try {
    const validations = PlatformValidator.getLinkedinProfileValidation(req.params);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await PlatformService.getUserLinkedin(req.params);    
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({
      success: true,
      message: response.messageState,
      linkedinUsername: response.linkedinUsername
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, message: `Error en el servidor: ${(err as Error).message}` 
    });
  }
}

export async function getGithubProfile(req: Request, res: Response) {
  try {
    const validations = PlatformValidator.getLinkedinProfileValidation(req.params);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await PlatformService.getUserGithub(req.params);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({
      success: true,
      message: response.messageState,
      githubUsername: response.githubUsername 
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, message: `Error en el servidor: ${(err as Error).message}` 
    });
  }
}
