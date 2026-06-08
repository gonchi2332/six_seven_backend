import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as ProfileValidations from "../validators/profile.validator";
import * as ProfileService from "../services/profile.service";

/**
 * La función `getOrCreatePublicLink` obtiene o genera el enlace público del perfil de un usuario.
 * @param {Request} req - Objeto de solicitud HTTP. Contiene el usuario autenticado (`req.user`) o
 * parámetros de consulta (`req.query`) para identificar al usuario.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio no puede
 * obtener/crear el enlace, código 200 con el enlace público si la operación es exitosa,
 * o código 500 si ocurre un error interno del servidor.
 */
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

/**
 * La función `getUsersList` obtiene la lista de todos los usuarios con perfil público disponible.
 * @param {Request} req - Objeto de solicitud HTTP. No requiere parámetros adicionales.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si el servicio no puede obtener la lista, código 200 con
 * el listado de usuarios si la operación es exitosa, o código 500 si ocurre un error interno.
 */
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

/**
 * La función `viewSectionsVisibility` consulta la visibilidad de las secciones del perfil de un usuario.
 * @param {Request} req - Objeto de solicitud HTTP. Contiene en `req.params` el identificador del usuario.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan, código 404 si no se encuentra
 * la configuración de visibilidad, código 200 con la información de visibilidad si es exitosa,
 * o código 500 si ocurre un error interno del servidor.
 */
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