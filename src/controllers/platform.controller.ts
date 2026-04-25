import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as PlatformService from "../services/platform.service";

export async function saveLinkedinProfile(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    let { linkedinUsername } = req.body;

    if (!linkedinUsername || typeof linkedinUsername !== "string" || linkedinUsername.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "El identificador de LinkedIn es obligatorio." 
      });
    }

    linkedinUsername = linkedinUsername.trim();

    if (linkedinUsername.includes("linkedin.com")) {
      return res.status(400).json({ 
        success: false,
        message: "Por favor ingresa solo tu nombre de usuario, no la URL completa." 
      });
    }

    const { result, messageState } = await PlatformService.saveUserLinkedin(username, linkedinUsername);
    
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }

    return res.status(200).json({
      success: true,
      message: messageState
    });

  } catch (err) {
    return res.status(500).json({ 
      success: false,
      message: `Error en el servidor: ${(err as Error).message}` 
    });
  }
}

export async function getLinkedinProfile(req: Request, res: Response) {
  try {
    const { username } = req.params;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario inválido."
      });
    }

    const { result, messageState, linkedinUsername } = await PlatformService.getUserLinkedin(username);
    
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }

    return res.status(200).json({
      success: true,
      message: messageState,
      linkedinUsername: linkedinUsername
    });

  } catch (err) {
    return res.status(500).json({ 
      success: false, message: `Error en el servidor: ${(err as Error).message}` 
    });
  }
}
