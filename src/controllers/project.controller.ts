import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as ProjectValidations from "../validators/project.validator";
import * as ProjectService from "../services/project.service";

/**
 * La función `registerProject` maneja el registro de un nuevo proyecto personal del usuario autenticado,
 * incluyendo validación de entradas y manejo de archivo adjunto.
 * @param {Request} req - Objeto de solicitud HTTP. Contiene el usuario en `req.user`, los datos
 * del proyecto en `req.body` y un archivo opcional en `req.file`.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio reporta error,
 * código 201 si el proyecto se registró correctamente,
 * o código 500 si ocurre un error interno del servidor.
 */
export async function registerProject(req: Request, res: Response) {
  try {
    const validations = ProjectValidations.registerProjectValidation(
      req.user as TokenTypes.TokenPayload, req.body, req.file);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const projectData: any = { ...req.body };
    if (req.file) {
      projectData.imageBuffer = req.file.buffer;
    }

    const ans = await ProjectService.registerPersonalProject(
      req.user as TokenTypes.TokenPayload, projectData);
    if (!ans.result) {
      return res.status(400).json({
        success: false,
        message: ans.messageState
      });
    }
    return res.status(201).json({
      success: true,
      message: ans.messageState
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `modifyProject` actualiza los datos de un proyecto personal existente del usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP. Contiene el usuario en `req.user`, el identificador
 * del proyecto en `req.query` y los campos a actualizar en `req.body`.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio reporta error,
 * código 200 si el proyecto se modificó correctamente,
 * o código 500 si ocurre un error interno del servidor.
 */
export async function modifyProject(req: Request, res: Response) {
  try {
    const validationData = { ...req.query, ...req.body };

    const validations = ProjectValidations.modifyProjectValidation(
      req.user as TokenTypes.TokenPayload, validationData);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const projectData: any = { ...req.body };
    if (req.file) {
      projectData.imageBuffer = req.file.buffer;
    }

    const response = await ProjectService.modifyPersonalProject(
      req.user as TokenTypes.TokenPayload, req.query, projectData);
    if (!response.result) {
      return res.status(400).json({
        success: false,
        message: response.messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: response.messageState
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `deleteProject` elimina un proyecto personal del usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP. Contiene el usuario en `req.user` y el
 * identificador del proyecto a eliminar en `req.query`.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el proyecto no existe,
 * código 200 si el proyecto se eliminó correctamente,
 * o código 500 si ocurre un error interno del servidor.
 */
export async function deleteProject(req: Request, res: Response) {
  try {
    const validations = ProjectValidations.deleteProjectValidation(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await ProjectService.deletePersonalProject(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: response.messageState });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `getPublicProjects` obtiene los proyectos públicos de un usuario identificado
 * por los parámetros de ruta.
 * @param {Request} req - Objeto de solicitud HTTP. Contiene en `req.params` el identificador del usuario.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio reporta error,
 * código 200 con la lista de proyectos públicos si la operación es exitosa,
 * o código 500 si ocurre un error interno del servidor.
 */
export async function getPublicProjects(req: Request, res: Response) {
  try {
    const validations = ProjectValidations.getPublicProjectsValidation(req.params);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await ProjectService.getPublicPersonalProjects(req.params);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: response.messageState, projects: response.data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `getPrivateProjects` obtiene todos los proyectos (públicos y privados) del usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP. Utiliza el token del usuario en `req.user`
 * para identificar al solicitante.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio reporta error,
 * código 200 con la lista completa de proyectos del usuario,
 * o código 500 si ocurre un error interno del servidor.
 */
export async function getPrivateProjects(req: Request, res: Response) {
  try {
    const validations = ProjectValidations.getPrivateProjectsValidation(req.user as TokenTypes.TokenPayload);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await ProjectService.getPrivatePersonalProjects(req.user as TokenTypes.TokenPayload);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: response.messageState, projects: response.data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error en el servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `modifyProjectsVisibility` actualiza la configuración de visibilidad de los proyectos
 * del usuario autenticado.
 * @param {Request} req - Objeto de solicitud HTTP. Contiene el usuario en `req.user` y la nueva
 * configuración de visibilidad en `req.body`.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o el servicio reporta error,
 * código 200 si la visibilidad se actualizó correctamente,
 * o código 500 si ocurre un error interno del servidor.
 */
export async function modifyProjectsVisibility(req: Request, res: Response) {
  try {
    const validations = ProjectValidations.modifyProjectsVisibilityValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await ProjectService.updateProjectsVisibility(
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
