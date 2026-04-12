import { Request, Response } from "express";
import * as VerificationService from "../services/verification.service";

export async function sendMailVerification(req: Request, res: Response) {
  try {
    const { username, targetMail } = req.query;
  
    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario invalido."
      });
    }
    if (!targetMail || typeof targetMail !== "string") {
      return res.status(400).json({
        success: false,
        message: "Error al enviar codigo de verificacion, correo electronico invalido."
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetMail)) {
      return res.status(400).json({
        success: false,
        message: "Formato de correo electronico invalido."
      });
    }

    const { result, messageState } = await VerificationService.sendMailVerificationCode(username, targetMail);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: `Codigo de verificacion enviado correctamente a ${targetMail}`
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
    const { username, currentCode } = req.query;

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