import { Request, Response } from "express";
import { getEducationAction } from "../helpers/education.helper";
import * as TokenTypes from "../types/token.types";
import * as EducationService from "../services/education.service";

async function manageEducation(
  req: Request,
  res: Response,
  action: "register" | "modify",
  id?: number) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const educationInfo = req.body;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario faltante o invalido."
      });
    }
    if (!educationInfo || Object.keys(educationInfo).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Parametros de educacion personal del usuario insuficientes."
      });
    }

    let ans;
    if (action === "register") {
      ans = await EducationService.registerEducation(username, educationInfo);
    } else {
      ans = await EducationService.modifyEducation(username, educationInfo, id!);
    }

    const { result, messageState } = ans;
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: `Experiencia laboral ${getEducationAction(action).singleWord} exitosamente`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function registerEducation(req: Request, res: Response) {
  return await manageEducation(req, res, "register");
}

export async function modifyEducation(req: Request, res: Response) {
  const { id } = req.query;
  const parsedId = id ? parseInt(id as string, 10) : undefined;

  if (!id || isNaN(parsedId!)) {
    return res.status(400).json({
      success: false,
      message: "Id de education invalido."
    });
  }
  return await manageEducation(req, res, "modify", parsedId);
}

async function handleEducation(
  req: Request,
  res: Response,
  action: "view" | "delete",
  id?: number) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload || req.query;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario faltante o invalido."
      });
    }

    if (action === "view") {
      const { result, messageState, education } = await EducationService
        .viewEducation(username);
      if (!result) {
        return res.status(400).json({
          success: false,
          message: messageState
        });
      }
      if (!education || education.length === 0) {
        return res.status(200).json({
          success: true,
          message: "El usuario no tiene registros de educacion registrados."
        });
      }
      return res.status(200).json({
        success: true,
        message: "El registro de educacion del usuario se han obtenido correctamente.",
        education: education
      });
    } else {
      const { result, messageState } = await EducationService.
        deleteEducation(username, id!);
      if (!result) {
        return res.status(400).json({
          success: false,
          message: messageState
        });
      }
      return res.status(200).json({
        success: true,
        message: "El registro de educacion se ha eliminado correctamente.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function viewEducation(req: Request, res: Response) {
  return await handleEducation(req, res, "view");
}

export async function deleteEducation(req: Request, res: Response) {
  const { id } = req.query;
  const parsedId = id ? parseInt(id as string, 10) : undefined;

  if (!id || isNaN(parsedId!)) {
    return res.status(400).json({
      success: false,
      message: "Id de experiencia laboral invalido."
    });
  }
  return await handleEducation(req, res, "delete", parsedId);
}

export async function viewEducationGrade(
  req: Request,
  res: Response) {
  try {

    const { result, messageState, educationGrade } = await EducationService
      .viewAcademicGrade();
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    if (!educationGrade || educationGrade.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron grados academicos."
      });
    }
    return res.status(200).json({
      success: true,
      message: "Los grados academicos se han obtenido correctamente.",
      educationGrade: educationGrade
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}