import { Request, Response } from "express";
import { getRegisterAction } from "../helpers/register.helper";
import * as TokenTypes from "../types/token.types";
import * as RegisterValidations from "../validators/register.validator";
import * as RegisterService from "../services/register.service";

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
    if (action === "register" ) {
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

export async function registerPersonalInfo(req: Request, res: Response) {
  return handlePersonalInfoRequest(req, res, "register");
}

export async function updatePersonalInfo(req: Request, res: Response) {
  return handlePersonalInfoRequest(req, res, "update");
}

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

export async function viewPrivatePersonalInfo(req: Request, res: Response) {
  try {
    const validations = RegisterValidations.viewPrivatePersonalInfoValidation(
      req.user as TokenTypes.TokenPayload);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const { username } = req.user as TokenTypes.TokenPayload;
    const response = await RegisterService.viewUserPersonalInfo(username);
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