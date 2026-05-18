import { Request, Response } from "express";
import { getCertificateAction } from "../helpers/certificate.helper";
import * as TokenTypes from "../types/token.types";
import * as CertificateService from "../services/certificate.service";

async function manageUserCertificate(
  req: Request,
  res: Response,
  action: "register" | "modify",
  id?: number) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const certificateInfo = req.body;
    const coverImage = req.file as Express.Multer.File;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario faltante o invalido."
      });
    }
    if (!certificateInfo || Object.keys(certificateInfo).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Información del certificado faltante o invalida."
      });
    }
    if (!coverImage || (coverImage && !coverImage.mimetype.startsWith("image/"))) {
      return res.status(400).json({
        success: false,
        message: "Imagen de portada invalida."
      });
    }

    let ans;
    if (action === "register") {
      ans = await CertificateService.registerUserCertificate(username, certificateInfo, coverImage);
    } else {
      ans = await CertificateService.modifyUserCertificate(username, certificateInfo, coverImage, id!);
    }

    const { result, messageState } = ans;
    const certificateAction = getCertificateAction(action);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
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
  const { id } = req.query;
  const parsedId = id ? parseInt(id as string, 10) : undefined;

  if (!id || isNaN(parsedId!)) {
    return res.status(400).json({
      success: false,
      message: "Id de certificado invalido."
    });
  }
  return await manageUserCertificate(req, res, "modify", parsedId);
}

export async function viewUserCertificates(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload || req.query;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario faltante o invalido."
      });
    }

    const {  result, messageState, certificates } = await CertificateService.
      viewUserCertificates(username);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    if (!certificates || certificates.length === 0) {
      return res.status(200).json({
        success: true,
        message: "El usuario no tiene certificados registrados."
      });
    }
    return res.status(200).json({
      success: true,
      message: "Certificados obtenidos exitosamente.",
      certificates: certificates
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}