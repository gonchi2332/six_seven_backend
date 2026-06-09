import { Request, Response } from "express";
import { getEducationAction } from "../helpers/education.helper";
import * as TokenTypes from "../types/token.types";
import * as EducationValidation from "../validators/education.validator";
import * as ArrayValidations from "../validators/shared/array.validator";
import * as EducationService from "../services/education.service";

/**
 * La función `manageEducation` maneja el registro y modificación de la información de educacion del usuario, con
 * manejo de errores y mensajes de respuesta.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @param {"register" | "modify"} action - Acción a realizar.
 * @param {any} [idInfo] - Identificador del registro (solo para modify).
 * @returns Respuesta HTTP con el resultado de la operación.
 */
async function manageEducation(
  req: Request,
  res: Response,
  action: "register" | "modify",
  idInfo?: any) {
  try {
    const validations = action === "register" 
      ? EducationValidation.manageEducationValidation(req.user as TokenTypes.TokenPayload, req.body)
      : EducationValidation.modifyEducationValidation({ ...req.query, ...req.body });

    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    let ans;
    if (action === "register") {
      ans = await EducationService.registerEducation(req.user as TokenTypes.TokenPayload, req.body);
    } else {
      ans = await EducationService.modifyEducation(
        req.user as TokenTypes.TokenPayload, req.body, idInfo!);
    }

    const response = ans;
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({
      success: true,
      message: `Formación académica ${getEducationAction(action).singleWord} exitosamente`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `registerEducation` llama asincrónicamente a `manageEducation` con la acción "register".
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Resultado de la función manageEducation.
 */
export async function registerEducation(req: Request, res: Response) {
  return await manageEducation(req, res, "register");
}

/**
 * La función `modifyEducation` maneja las solicitudes de modificación de informacion de educacion del usuario.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Resultado de la función manageEducation.
 */
export async function modifyEducation(req: Request, res: Response) {
  return await manageEducation(req, res, "modify", req.query);
}

/**
 * La función `handleEducation` maneja la eliminación de un registro de educacion del usuario.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @param {any} [idInfo] - Identificador del registro.
 * @returns Respuesta HTTP.
 */
async function handleEducation(
  req: Request,
  res: Response,
  idInfo?: any) {
  try {
    const validations = EducationValidation.handleEducationValidation(
      req.user as TokenTypes.TokenPayload || req.query);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await EducationService.
      deleteEducation(req.user as TokenTypes.TokenPayload, idInfo!);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({
      success: true,
      message: "El registro de educacion se ha eliminado correctamente.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `viewPublicEducation` recupera y valida registros de informacion de educación pública para un usuario.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Respuesta HTTP con la lista de educación pública.
 */
export async function viewPublicEducation(req: Request, res: Response) {
  try {
    const validations = EducationValidation.viewPublicEducationValidation(req.params);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await EducationService.viewPublicEducation(req.params as any);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    const arrayValidation = ArrayValidations.validateEmptyArray(response.education);
    if (!arrayValidation) {
      return res.status(200).json({
        success: true,
        message: "El usuario no tiene registros de educacion publicos",
        education: []
      });
    }
    return res.status(200).json({
      success: true,
      message: "Los registros de educacion del usuario se han obtenido correctamente",
      education: response.education
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * Esta función maneja la visualización de informacion de la educacion privada del usuario.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Respuesta HTTP con la lista de educación privada.
 */
export async function viewPrivateEducation(req: Request, res: Response) {
  try {
    const validations = EducationValidation.viewPrivateEducationValidation(
      req.user as TokenTypes.TokenPayload);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await EducationService.viewPrivateEducation(req.user as TokenTypes.TokenPayload);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    const arrayValidation = ArrayValidations.validateEmptyArray(response.education);
    if (!arrayValidation) {
      return res.status(200).json({
        success: true,
        message: "No tienes registros de educacion",
        education: []
      });
    }
    return res.status(200).json({
      success: true,
      message: "Tus registros de educacion se han obtenido correctamente",
      education: response.education
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `deleteEducation` realiza comprobaciones de validación y elimina datos de educacion del usuario.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Respuesta de la función handleEducation.
 */
export async function deleteEducation(req: Request, res: Response) {
  const validations = EducationValidation.deleteEducationValidation(req.query);
  if (!validations.result) {
    return res.status(400).json({ success: false, message: validations.messageState });
  }
  return await handleEducation(req, res, req.query);
}

/**
 * Obtiene los grados académicos disponibles.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Respuesta HTTP con la lista de grados.
 */
export async function viewEducationGrade(req: Request, res: Response) {
  try {
    const response = await EducationService.viewAcademicGrade();
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    const arrayValidation = ArrayValidations.validateEmptyArray(response.educationGrade);
    if (!arrayValidation) {
      return res.status(404).json({ success: false, message: "No se encontraron grados academicos." });
    }
    return res.status(200).json({
      success: true,
      message: "Los grados academicos se han obtenido correctamente.",
      educationGrade: response.educationGrade
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * Esta función modifica la visibilidad de la información educativa.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Respuesta HTTP.
 */
export async function modifyEducationVisibility(req: Request, res: Response) {
  try {
    const validations = EducationValidation.modifyEducationVisibilityValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await EducationService.updateEducationVisibility(
      req.user as TokenTypes.TokenPayload, req.body);
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
