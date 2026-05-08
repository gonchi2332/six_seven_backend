import { Request, Response } from "express";
import { getLaboralExpAction } from "../helpers/laboralexperience.helper";
import * as TokenTypes from "../types/token.types";
import * as LaboralExpService from "../services/laboralexperience.service";

async function manageUserLaboralExperience(
  req: Request,
  res: Response,
  action: "register" | "modify",
  id?: number) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const laboralExperienceInfo = req.body;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario faltante o invalido."
      });
    }
    if (!laboralExperienceInfo || Object.keys(laboralExperienceInfo).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Parametros de informacion laboral del usuario insuficientes."
      });
    }

    let ans;
    if (action === "register") {
      ans = await LaboralExpService.registerUserLaboralExperience(username, laboralExperienceInfo);
    } else {
      ans = await LaboralExpService.modifyUserLaboralExperience(username, laboralExperienceInfo, id!);
    }

    const { result, messageState } = ans;
    const laboralExperienceAction = getLaboralExpAction(action);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: `Experiencia laboral ${laboralExperienceAction.singleWord} exitosamente`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function registerUserLaboralExperience(req: Request, res: Response) {
  return await manageUserLaboralExperience(req, res, "register");
}

export async function modifyUserLaboralExperience(req: Request, res: Response) {
  const { id } = req.query;
  const parsedId = id ? parseInt(id as string, 10) : undefined;

  if (!id || isNaN(parsedId!)) {
    return res.status(400).json({
      success: false,
      message: "Id de experiencia laboral invalido."
    });
  }
  return await manageUserLaboralExperience(req, res, "modify", parsedId);
}

async function handleUserLaboralExperience(
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
      const { result, messageState, laboralExperiences } = await LaboralExpService
        .viewUserLaboralExperience(username);
      if (!result) {
        return res.status(400).json({
          success: false,
          message: messageState
        });
      }
      if (!laboralExperiences || laboralExperiences.length === 0) {
        return res.status(200).json({
          success: true,
          message: "El usuario no tiene experiencias laborales registradas."
        });
      }
      return res.status(200).json({
        success: true,
        message: "Las experiencias laborales del usuario se han obtenido correctamente.",
        laboralExperiences: laboralExperiences
      });
    } else {
      const { result, messageState } = await LaboralExpService.
        deleteUserLaboralExperience(username, id!);
      if (!result) {
        return res.status(400).json({
          success: false,
          message: messageState
        });
      }
      return res.status(200).json({
        success: true,
        message: "La experiencias laboral se ha eliminado correctamente.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  } 
}

export async function viewUserLaboralExperience(req: Request, res: Response) {
  return await handleUserLaboralExperience(req, res, "view");
}

export async function deleteUserLaboralExperience(req: Request, res: Response) {
  const { id } = req.query;
  const parsedId = id ? parseInt(id as string, 10) : undefined;

  if (!id || isNaN(parsedId!)) {
    return res.status(400).json({
      success: false,
      message: "Id de experiencia laboral invalido."
    });
  }
  return await handleUserLaboralExperience(req, res, "delete", parsedId);
}