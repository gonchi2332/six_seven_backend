import { Request, Response } from "express";
import { getCertificateAction } from "../helpers/certificate.helper";
import * as TokenTypes from "../types/token.types";
import * as CertificateValidations from "../validators/certificate.validator";
import * as ArrayValidations from "../validators/shared/array.validator";
import * as CertificateService from "../services/certificate.service";

async function manageUserCertificate(
  req: Request,
  res: Response,
  action: "register" | "modify",
  idInfo?: any) {
  try {
    const validation = await CertificateValidations.manageUserCertificateValidation(
      req.user as TokenTypes.TokenPayload, req.body, req.file as Express.Multer.File);
    if (!validation.result) {
      return res.status(400).json({ success: false, message: validation.messageState });
    }

    let ans;
    if (action === "register") {
      ans = await CertificateService.registerUserCertificate(
        req.user as TokenTypes.TokenPayload, req.body, req.file as Express.Multer.File);
    } else {
      ans = await CertificateService.modifyUserCertificate(
        req.user as TokenTypes.TokenPayload, req.body, req.file as Express.Multer.File, idInfo!);
    }

    const response = ans;
    const certificateAction = getCertificateAction(action);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(201).json({
      success: true,
      message: `Certificado ${certificateAction.singleWord} exitosamente.`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function registerUserCertificate(req: Request, res: Response) {
  return await manageUserCertificate(req, res, "register");
}

export async function modifyUserCertificate(req: Request, res: Response) {
  const validations = CertificateValidations.modifyUserCertificateValidation(req.query);
  if (!validations.result) {
    return res.status(400).json({ success: false, message: validations.messageState });
  }
  return await manageUserCertificate(req, res, "modify", req.query);
}

export async function viewPublicCertificates(req: Request, res: Response) {
  try {
    const validations = CertificateValidations.viewPublicCertificatesValidation(req.params);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await CertificateService.viewPublicCertificates(req.params);
    if (!response.result) {
      return res.status(400).json({
        success: false,
        message: response.messageState
      });
    }
    const arrayValidation = ArrayValidations.validateEmptyArray(response.certificates);
    if (!arrayValidation) {
      return res.status(200).json({
        success: true,
        message: "El usuario no tiene certificados publicos",
        certificates: []
      });
    }
    return res.status(200).json({
      success: true,
      message: "Certificados obtenidos exitosamente",
      certificates: response.certificates
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function viewPrivateCertificates(req: Request, res: Response) {
  try {
    const validations = CertificateValidations.viewPrivateCertificatesValidation(req.user as TokenTypes.TokenPayload);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await CertificateService.viewPrivateCertificates(req.user as TokenTypes.TokenPayload);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    const arrayValidation = ArrayValidations.validateEmptyArray(response.certificates);
    if (!arrayValidation) {
      return res.status(200).json({
        success: true,
        message: "No tienes certificados registrados",
        certificates: []
      });
    }
    return res.status(200).json({
      success: true,
      message: "Tus certificados se han obtenido exitosamente",
      certificates: response.certificates
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function deleteUserCertificate(req: Request, res: Response) {
  try {
    const validations = CertificateValidations.deleteUserCertificateValidation(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await CertificateService.deleteUserCertificate(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: "Certificado eliminado exitosamente" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

export async function modifyCertificatesVisibility(req: Request, res: Response) {
  try {
    const validations = CertificateValidations.modifyCertificatesVisibility(
      req.user as TokenTypes.TokenPayload, req.body);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await CertificateService.updateCertificatesVisibility(
      req.user as TokenTypes.TokenPayload, req.body);
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