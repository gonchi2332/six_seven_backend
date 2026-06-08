import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as VerificationValidations from "../validators/verification.validator";
import * as VerificationService from "../services/verification.service";

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