import { Request, Response } from "express";
import { getLaboralExpAction } from "../helpers/laboralexperience.helper";
import * as TokenTypes from "../types/token.types";
import * as LaboralExpValidations from "../validators/laboralexperience.validator";
import * as ArrayValidations from "../validators/shared/array.validator";
import * as LaboralExpService from "../services/laboralexperience.service";

async function manageUserLaboralExperience(
  req: Request,
  res: Response,
  action: "register" | "modify",
  idInfo?: any) {
  try {
    const validations = LaboralExpValidations.manageUserLaboralExperienceValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    let ans;
    if (action === "register") {
      ans = await LaboralExpService.registerUserLaboralExperience(
        req.user as TokenTypes.TokenPayload, req.body);
    } else {
      ans = await LaboralExpService.modifyUserLaboralExperience(
        req.user as TokenTypes.TokenPayload, req.body, idInfo!);
    }

    const response = ans;
    const laboralExperienceAction = getLaboralExpAction(action);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
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
  const validations = LaboralExpValidations.modifyUserLaboralExperienceValidation(req.query);
  if (!validations.result) {
    return res.status(400).json({ success: false, message: validations.messageState });
  }
  return await manageUserLaboralExperience(req, res, "modify", req.query);
}

export async function viewPublicLaboralExperience(req: Request, res: Response) {
  try {
    const validations = LaboralExpValidations.viewPublicLaboralExperienceValidation(req.params);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await LaboralExpService.viewPublicLaboralExperience(
      req.user as TokenTypes.TokenPayload);
    if (!response.result) return res.status(400).json({ success: false, message: response.messageState });
    
    const arrayValidation = ArrayValidations.validateEmptyArray(response.laboralExperiences);
    if (!arrayValidation) {
      return res.status(200).json({
        success: true,
        message: "El usuario no tiene experiencias laborales publicas",
        laboralExperiences: []
      });
    }
    return res.status(200).json({
      success: true,
      message: "Las experiencias laborales se han obtenido correctamente",
      laboralExperiences: response.laboralExperiences
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
    const validations = LaboralExpValidations.viewPrivateLaboralExperienceValidation(
      req.user as TokenTypes.TokenPayload);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await LaboralExpService.viewPrivateLaboralExperience(req.user as TokenTypes.TokenPayload);
    if (!response.result) 
      return res.status(400).json({ success: false, message: response.messageState });

    const arrayValidation = ArrayValidations.validateEmptyArray(response.laboralExperiences);
    if (!arrayValidation) {
      return res.status(200).json({
        success: true,
        message: "No tienes experiencias laborales registradas.",
        laboralExperiences: []
      });
    }
    return res.status(200).json({
      success: true,
      message: "Tus experiencias laborales se han obtenido correctamente",
      laboralExperiences: response.laboralExperiences
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
    const validations = LaboralExpValidations.modifyLaboralExperienceVisibilityValidation(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await LaboralExpService.updateLaboralExperienceVisibility(
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

export async function deleteUserLaboralExperience(req: Request, res: Response) {
  try {
    const validations = LaboralExpValidations.deleteUserLaboralExperienceValidation(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await LaboralExpService.deleteUserLaboralExperience(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: "La experiencia laboral se ha eliminado correctamente" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}