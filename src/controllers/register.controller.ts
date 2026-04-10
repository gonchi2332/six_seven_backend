import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as RegisterService from "../services/register.service";

async function handlePersonalInfoAction(req: Request, res: Response, action: "register" | "update") {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const userPersonalInfo = req.body;

    if (!username) return res.status(400).json({ success: false, message: "Usuario inválido." });
    if (!userPersonalInfo || Object.keys(userPersonalInfo).length === 0) {
      return res.status(400).json({ success: false, message: "Parámetros insuficientes." });
    }

    const serviceMethod = action === "register" 
      ? RegisterService.registerUserPersonalInfo 
      : RegisterService.updateUserPersonalInfo;

    const { result, messageState } = await serviceMethod(username, userPersonalInfo);

    if (!result) {
      return res.status(400).json({ success: false, message: messageState });
    }

    return res.status(200).json({
      success: true,
      message: `La información de ${username} se ha ${action === "register" ? "registrado" : "actualizado"} correctamente.`
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: `Error en el servidor: ${(err as Error).message}` });
  }
}

export const registerPersonalInfo = (req: Request, res: Response) => handlePersonalInfoAction(req, res, "register");
export const updatePersonalInfo = (req: Request, res: Response) => handlePersonalInfoAction(req, res, "update");