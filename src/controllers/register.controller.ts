import { Request, Response } from "express";
import { getRegisterAction } from "../helpers/register.helper";
import * as TokenTypes from "../types/token.types";
import * as RegisterValidations from "../validators/register.validator";
import * as RegisterService from "../services/register.service";

/**
 * Función interna `handlePersonalInfoRequest` que centraliza la lógica para registrar o actualizar
 * la información personal de un usuario, evitando duplicación entre ambas acciones.
 * @param {Request} req - Objeto de solicitud HTTP. Contiene el usuario autenticado en `req.user`,
 * los datos personales en `req.body` y un archivo opcional en `req.file`.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @param {"register" | "update"} action - Indica si se trata de un registro inicial o una actualización.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio reporta error,
 * código 200 si la información personal se procesó correctamente,
 * o código 500 si ocurre un error interno del servidor.
 */
async function handlePersonalInfoRequest(
  req: Request,
  res: Response,
  action: "register" | "update") {
  try {
    const validations = RegisterValidations.handlePersonalInfoRequestValidation(
      req.user as TokenTypes.TokenPayload, req.body, req.file as Express.Multer.File);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    let ans;
    if (action === "register") {
      ans = await RegisterService.registerUserPersonalInfo(
        req.user as TokenTypes.TokenPayload, req.body, req.file as Express.Multer.File);
    } else {
      ans = await RegisterService.updateUserPersonalInfo(
        req.user as TokenTypes.TokenPayload, req.body, req.file as Express.Multer.File);
    }

    const registerAction = getRegisterAction(action);
    const response = ans;
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    const username = (req.user as TokenTypes.TokenPayload).username;
    return res.status(200).json({
      success: true,
      message: `La informacion personal de ${username} se ha ${registerAction.pastWord} correctamente.`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `registerPersonalInfo` registra por primera vez la información personal del usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP con datos personales en `req.body` y archivo en `req.file`.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Delega en `handlePersonalInfoRequest` con acción "register".
 */
export async function registerPersonalInfo(req: Request, res: Response) {
  return handlePersonalInfoRequest(req, res, "register");
}

/**
 * La función `updatePersonalInfo` actualiza la información personal del usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP con datos actualizados en `req.body` y archivo en `req.file`.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Delega en `handlePersonalInfoRequest` con acción "update".
 */
export async function updatePersonalInfo(req: Request, res: Response) {
  return handlePersonalInfoRequest(req, res, "update");
}

/**
 * La función `viewPublicPersonalInfo` obtiene la información personal pública de un usuario
 * identificado por sus parámetros de ruta.
 * @param {Request} req - Objeto de solicitud HTTP. Contiene en `req.params` el identificador del usuario.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio no encuentra datos,
 * código 200 con la información pública del usuario,
 * o código 500 si ocurre un error interno del servidor.
 */
export async function viewPublicPersonalInfo(req: Request, res: Response) {
  try {
    const validations = RegisterValidations.viewPublicPersonalInfoValidation(req.params);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await RegisterService.viewPublicUserPersonalInfo(req.params);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({
      success: true,
      message: response.messageState,
      userPersonalInfo: response.currentPersonalInfo
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `viewPrivatePersonalInfo` obtiene la información personal privada del usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP. Utiliza el token del usuario en `req.user`
 * para identificar al solicitante.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio no encuentra datos,
 * código 200 con la información personal privada del usuario,
 * o código 500 si ocurre un error interno del servidor.
 */
export async function viewPrivatePersonalInfo(req: Request, res: Response) {
  try {
    const validations = RegisterValidations.viewPrivatePersonalInfoValidation(
      req.user as TokenTypes.TokenPayload);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await RegisterService.viewUserPersonalInfo(req.user as TokenTypes.TokenPayload);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({
      success: true,
      message: response.messageState,
      userPersonalInfo: response.currentPersonalInfo
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `modifyPersonalInfoVisibility` actualiza la configuración de visibilidad de la
 * información personal del usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP. Contiene el usuario en `req.user` y la
 * nueva configuración de visibilidad en `req.body`.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio reporta error,
 * código 200 si la visibilidad se actualizó correctamente,
 * o código 500 si ocurre un error interno del servidor.
 */
export async function modifyPersonalInfoVisibility(req: Request, res: Response) {
  try {
    const validations = RegisterValidations.modifyPersonalInfoVisibilityValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await RegisterService.updatePersonalInfoVisibility(
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