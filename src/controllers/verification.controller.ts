import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as VerificationService from "../services/verification.service";

export async function getUserMail(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
  
    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario invalido."
      });
    }

    const { result, messageState, email } = await VerificationService.getUserMail(username);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: messageState,
      email: email
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function sendMailVerification(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
  
    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario invalido."
      });
    }

    const { result, messageState, email } = await VerificationService.sendMailVerificationCode(username);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: `Codigo de verificacion enviado correctamente a ${email}`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function compareMailCode(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const { currentCode } = req.query;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario invalido."
      });
    }
    if (!currentCode || typeof currentCode !== "string") {
      return res.status(400).json({
        success: false,
        message: "Codigo de verficiacion invalido, error de campos."
      });
    }
    if (currentCode.length != 8) {
      return res.status(400).json({
        success: false,
        message: "El codigo de verificacion introducido no es de 8 digitos."
      });
    }

    const { result, messageState } = await VerificationService.compareVerificationMailCodes(username, currentCode);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: `Verificacion de ${username} completada con exito`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}