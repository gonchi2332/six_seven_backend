import "../config/env.config";
import { env } from "../config/env.config";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as TokenTypes from "../types/token.types";

/**
 * Middleware `tokenAuthorization` que verifica la validez de un token JWT.
 * El token puede ser proporcionado en el encabezado `Authorization` (Bearer) o como un parámetro de consulta `token`.
 * Si el token es válido, decodifica su contenido y lo asigna a `req.user`.
 * Maneja errores específicos como tokens expirados o inválidos, devolviendo respuestas HTTP apropiadas.
 * @param {Request} req - Objeto de solicitud de Express.
 * @param {Response} res - Objeto de respuesta de Express.
 * @param {NextFunction} next - Función para pasar el control al siguiente middleware.
 * @returns Respuesta 401 si el token falta o ha expirado, 403 si es inválido, o continúa al siguiente middleware.
 */
export async function tokenAuthorization(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.query.token;

    if (!token || typeof token !== "string") {
      return res.status(401).json({
        success: false,
        message: "Error, token de autenticacion no proporcionado o invalido."
      });
    }

    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET as string);

    req.user = decoded as TokenTypes.TokenPayload;
    return next();

  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token de autenticacion expirado.",
        expiredAt: err.expiredAt,
        error: "TOKEN_EXPIRED"
      });
    }

    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({
        success: false,
        message: "Token de autenticacion invalido.",
        error: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al acceder a los datos a traves del token.",
      error: (err as Error).message
    });
  }
}