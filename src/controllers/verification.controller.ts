import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as VerificationValidations from "../validators/verification.validator";
import * as VerificationService from "../services/verification.service";

/**
 * La función `getUserMail` obtiene el correo electrónico del usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP. Utiliza el token del usuario en `req.user`
 * para identificar al solicitante.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio no puede
 * obtener el correo, código 200 con el email del usuario si la operación es exitosa,
 * o código 500 si ocurre un error interno del servidor.
 */
export async function getUserMail(req: Request, res: Response) {
  try {
    const validations = VerificationValidations.getUserMailValidation(req.user as TokenTypes.TokenPayload);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await VerificationService.getUserMail(req.user as TokenTypes.TokenPayload);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: response.messageState, email: response.email });
  } catch (err) {
    return res.status(500).json({
      success: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `sendMailVerification` envía un código de verificación al correo del usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP. Utiliza el token del usuario en `req.user`
 * para identificar a quién se le enviará el código.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio no puede
 * enviar el correo, código 200 con confirmación del envío si la operación es exitosa,
 * o código 500 si ocurre un error interno del servidor.
 */
export async function sendMailVerification(req: Request, res: Response) {
  try {
    const validations = VerificationValidations.sendMailVerificationValidation(
      req.user as TokenTypes.TokenPayload);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await VerificationService.sendMailVerificationCode(
      req.user as TokenTypes.TokenPayload);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({
      success: true,
      message: `Codigo de verificacion enviado correctamente a ${response.email}`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      messageState: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `compareMailCode` verifica que el código ingresado por el usuario coincida
 * con el código de verificación enviado a su correo.
 * @param {Request} req - Objeto de solicitud HTTP. Contiene el usuario autenticado en `req.user`
 * y el código de verificación a comparar en `req.query`.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o los códigos no coinciden,
 * código 200 si la verificación es exitosa,
 * o código 500 si ocurre un error interno del servidor.
 */
export async function compareMailCode(req: Request, res: Response) {
  try {
    const validations = VerificationValidations.compareMailCodeValidation(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await VerificationService.compareVerificationMailCodes(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: response.messageState });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}