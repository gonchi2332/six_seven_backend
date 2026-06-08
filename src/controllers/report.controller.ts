import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as ReportValidations from "../validators/report.validator";
import * as ReportService from "../services/report.service";

/**
 * La función `getReports` obtiene reportes filtrados según el usuario autenticado y los parámetros
 * de consulta proporcionados, como el período de tiempo (day, month, year).
 * @param {Request} req - Objeto de solicitud HTTP. Contiene el usuario autenticado en `req.user`
 * y los parámetros de filtro (como el período) en `req.query`.
 * @param {Response} res - Objeto de respuesta HTTP usado para enviar el resultado al cliente.
 * @returns Respuesta JSON con código 400 si las validaciones fallan o si el período es inválido,
 * código 200 con la lista de reportes si la operación es exitosa,
 * o código 500 si ocurre un error interno del servidor.
 */
export async function getReports(req: Request, res: Response) {
  try {
    const validations = ReportValidations.getReportsValidation(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!validations.result) {
      return res.status(400).json({ success: false, message: validations.messageState });
    }

    const response = await ReportService.getReports(
      req.user as TokenTypes.TokenPayload, req.query);
    if (!response.result) {
      return res.status(400).json({ success: false, message: response.messageState });
    }
    return res.status(200).json({ success: true, message: response.messageState, reports: response.reports });
  } catch (err) {
    if ((err as Error).message === "INVALID_PERIOD") {
      return res.status(400).json({
        success: false,
        message: "Periodo inválido. Valores permitidos: day, month, year."
      });
    }
    return res.status(500).json({
      success: false,
      message: `Error interno del servidor: ${(err as Error).message}`
    });
  }
}