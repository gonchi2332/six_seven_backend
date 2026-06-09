import { Request, Response } from "express";
import { getCertificateAction } from "../helpers/certificate.helper";
import * as TokenTypes from "../types/token.types";
import * as CertificateValidations from "../validators/certificate.validator";
import * as ArrayValidations from "../validators/shared/array.validator";
import * as CertificateService from "../services/certificate.service";

/**
 * La función `manageUserCertificate` maneja el registro y modificación de certificados de usuario,
 * realiza validaciones y devuelve respuestas apropiadas.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @param {"register" | "modify"} action - Acción a realizar.
 * @param {any} [idInfo] - Identificador del registro (solo para modify).
 * @returns Respuesta JSON con el resultado de la operación.
 */
async function manageUserCertificate(
  req: Request,
  res: Response,
  action: "register" | "modify",
  idInfo?: any) {
  try {
    const validations = action === "register"
      ? CertificateValidations.manageUserCertificateValidation(req.user as TokenTypes.TokenPayload, req.body, req.file)
      : CertificateValidations.modifyUserCertificateValidation({ ...req.query, ...req.body });

    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    let ans;
    if (action === "register") {
      ans = await CertificateService.registerUserCertificate(
        req.user as TokenTypes.TokenPayload, req.body, req.file as Express.Multer.File);
    } else {
      ans = await CertificateService.modifyUserCertificate(
        req.user as TokenTypes.TokenPayload, req.body, req.file as Express.Multer.File | undefined, idInfo!);
    }

    if (!ans.result) {
      return res.status(400).json({ success: false, message: ans.messageState });
    }
    return res.status(action === "register" ? 201 : 200).json({
      success: true,
      message: `Certificado ${getCertificateAction(action).singleWord} exitosamente.`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}

/**
 * La función `registerUserCertificate` gestiona de forma asincrónica los certificados de usuario para el registro.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Resultado de la función manageUserCertificate.
 */
export async function registerUserCertificate(req: Request, res: Response) {
  return await manageUserCertificate(req, res, "register");
}

/**
 * La función `modifyUserCertificate` realiza comprobaciones de validación de los parámetros de consulta.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Resultado de la función manageUserCertificate.
 */
export async function modifyUserCertificate(req: Request, res: Response) {
  return await manageUserCertificate(req, res, "modify", req.query);
}

/**
 * Esta función recupera y valida certificados públicos y devuelve un mensaje de éxito.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Respuesta HTTP con la lista de certificados públicos.
 */
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

/**
 * La función `viewPrivateCertificates` recupera certificados privados para un usuario.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Respuesta HTTP con la lista de certificados privados.
 */
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

/**
 * Esta función maneja la eliminación del certificado de un usuario con manejo de errores.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Respuesta HTTP.
 */
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

/**
 * Esta función modifica la visibilidad de los certificados.
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 * @returns Respuesta HTTP.
 */
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
