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

export async function viewPublicLaboralExperience(req: Request, res: Response) {
  try {
    const { username } = req.params;
    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario faltante o invalido"
      });
    }
    const { result, messageState, laboralExperiences } = await LaboralExpService.viewPublicLaboralExperience(username);
    if (!result) return res.status(400).json({ success: false, message: messageState });
    if (!laboralExperiences || laboralExperiences.length === 0) {
      return res.status(200).json({
        success: true,
        message: "El usuario no tiene experiencias laborales publicas",
        laboralExperiences: []
      });
    }
    return res.status(200).json({
      success: true,
      message: "Las experiencias laborales se han obtenido correctamente",
      laboralExperiences: laboralExperiences
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function viewPrivateLaboralExperience(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const { result, messageState, laboralExperiences } = await LaboralExpService.viewPrivateLaboralExperience(username);
    if (!result) return res.status(400).json({
      success: false,
      message: messageState
    });
    if (!laboralExperiences || laboralExperiences.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No tienes experiencias laborales registradas.",
        laboralExperiences: []
      });
    }
    return res.status(200).json({
      success: true,
      message: "Tus experiencias laborales se han obtenido correctamente",
      laboralExperiences: laboralExperiences
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function modifyLaboralExperienceVisibility(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const { visibilities } = req.body;

    if (!visibilities || typeof visibilities !== "object" || Array.isArray(visibilities)) {
      return res.status(400).json({
        success: false,
        message: "Formato de visibilidad inválido. Se esperaba un objeto."
      });
    }

    const response = await LaboralExpService.updateLaboralExperienceVisibility(username, visibilities);
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
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function deleteUserLaboralExperience(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const { id } = req.query;
    const parsedId = id ? parseInt(id as string, 10) : undefined; // por si las moscas, para depurar jsjs
    if (!id || isNaN(parsedId!)) {
      return res.status(400).json({
        success: false,
        message: "Id de experiencia laboral invalido"
      });
    }
    const { result, messageState } = await LaboralExpService.deleteUserLaboralExperience(username, parsedId!);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: "La experiencia laboral se ha eliminado correctamente"
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}
