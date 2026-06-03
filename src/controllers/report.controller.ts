import { Request, Response } from "express";
import * as TokenTypes from "../types/token.types";
import * as ReportService from "../services/report.service";

export async function getReports(req: Request, res: Response) {
  try {
    const { username } = req.user as TokenTypes.TokenPayload;
    const period = req.query.period as string;
    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Nombre de usuario inválido"
      });
    }

    if (!period || typeof period !== "string") {
      return res.status(400).json({
        success: false,
        message: "El parametro periodo es requerido"
      });
    }

    const ans = await ReportService.getReports(username, period);
    if (!ans.result) {
      return res.status(400).json({
        success: false,
        message: ans.messageState
      });
    }
    return res.status(200).json({
      success: true,
      message: ans.messageState
    });
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