import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as ProfileValidations from "../validators/profile.validator";
import * as ProfileService from "../services/profile.service";

export async function getOrCreatePublicLink(req: Request, res: Response) {
  try {
    const validations = ProfileValidations.getOrCreatePublicLinkValidation(
      req.user as TokenTypes.TokenPayload || req.query);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await ProfileService.getOrCreatePublicLink(
      req.user as TokenTypes.TokenPayload || req.query);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    const username = (req.user as TokenTypes.TokenPayload || req.query).username;
    return res.status(200).json({
      success: true,
      message: `Se ha obtenido el enlace del perfil publico de ${username} correctamente.`,
      userPublicLink: response.publicProfileLink
    }); 
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

export async function getUsersList(req: Request, res: Response) {
  try {
    const response = await ProfileService.getAllPublicUsersList();
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({
      success: true,
      message: response.messageState,
      users: response.users
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: `Error en el servidor: ${(err as Error).message}` 
    });
  }
}

export async function viewSectionsVisibility(req: Request, res: Response) {
  try {
    const validations = ProfileValidations.viewSectionsVisibilityValidation(req.params);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await ProfileService.getSectionsVisibility(req.params);
    if (!response.result) {
      return res.status(404).json({ success: false, message: response.messageState });
    }
    return res.status(200).json(response.sections);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}