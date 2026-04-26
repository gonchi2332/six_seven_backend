import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as ProfileService from "../services/profile.service";

export async function getOrCreatePublicLink(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload || req.query;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario invalido."
      });
    }
    const { result, messageState, publicProfileLink } = await ProfileService.getOrCreatePublicLink(username);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: `Se ha obtenido el enlace del perfil publico de ${username} correctamente.`,
      userPublicLink: publicProfileLink
    }); 
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}