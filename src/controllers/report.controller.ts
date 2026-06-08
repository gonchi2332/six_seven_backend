import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as ReportValidations from "../validators/report.validator";
import * as ReportService from "../services/report.service";

export async function getReports(req: Request, res: Response) {
  try {
    const validations = ReportValidations.getReportsValidation(
      req.user as TokenTypes.TokenPayload, req.query.period as string);
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