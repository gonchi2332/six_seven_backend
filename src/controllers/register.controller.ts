import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as RegisterService from "../services/register.service";

async function handlePersonalInfoRequest(
  req: Request, 
  res: Response, 
  action: "register" | "update") {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const userPersonalInfo = req.body;
    const profilePicture = req.file as Express.Multer.File;

    if (!username || typeof username !== "string") {
      return res.status(400).json({ 
        success: false, 
        message: "Nombre de usuario faltante o invalido." 
      });
    }
    if (!userPersonalInfo || Object.keys(userPersonalInfo).length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Parametros de informacion personal del usuario insuficientes." 
      });
    }
    if (profilePicture && !profilePicture.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Foto de perfil invalida."
      });
    }

    const serviceResponse = action === "register" 
      ? await RegisterService.registerUserPersonalInfo(username, userPersonalInfo, profilePicture)
      : await RegisterService.updateUserPersonalInfo(username, userPersonalInfo, profilePicture);

    const { result, messageState } = serviceResponse;

    if (!result) {
      let errorMessage = "No es posible procesar la informacion personal del usuario.";
      
      if (messageState === "Usuario no encontrado.") {
        errorMessage = `No es posible ${action === "register" ? "registrar" : "actualizar"}
         la informacion personal del usuario, usuario no esta registrado.`;
      } else if (messageState === "Existen muchos usuarios con la misma identificacion.") {
        errorMessage = `No es posible 
        ${action === "register" ? "registrar" : "actualizar"} la informacion personal del usuario,
         mas de un usuario registrado con las mismas credenciales.`;
      } else if (messageState === "Existen muchos detallles de usuario asociados a el mismo usuario.") {
        errorMessage = `No es posible ${action === "register" ? "registrar" : "actualizar"}
         la informacion del usuario, se detecto informacion ya registrada.`;
      } else {
        errorMessage = messageState;
      }

      return res.status(400).json({ 
        success: false, 
        message: errorMessage 
      });
    }

    return res.status(200).json({
      success: true,
      message: `La informacion personal de ${username} se ha ${action === "register" ? "registrado" : "actualizado"} correctamente.`
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

export async function registerPersonalInfo(req: Request, res: Response) {
  return handlePersonalInfoRequest(req, res, "register");
}

export async function updatePersonalInfo(req: Request, res: Response) {
  return handlePersonalInfoRequest(req, res, "update");
}

export async function viewPersonalInfo(req: Request, res: Response) {
  try {
    const { username } = req.query;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario invalido."
      });
    }
    const { result, messageState, currentPersonalInfo } = await RegisterService.viewUserPersonalInfo(username);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: `Se ha accedido a la informacion personal de ${username} correctamente.`,
      userPersonalInfo: currentPersonalInfo
    }); 
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}