import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as CertificateService from "../services/certificate.service";

export async function registerUserCertificate(req: Request, res: Response) {
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

    const { result, messageState } = await CertificateService.registerUserCertificate(username, 
      certificateInfo, coverImage);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: messageState
      });
    }
    return res.status(201).json({
      success: true,
      message: "Certificado registrado exitosamente."
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}