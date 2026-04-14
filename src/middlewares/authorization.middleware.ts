import "../config/env.config";
import { env } from "../config/env.config";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as TokenTypes from "../types/token.types";

export async function tokenAuthorization(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.query.token;
    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Error, token de autenticacion no proporcionado o invalido."
      });
    }
    jwt.verify(token, env.JWT_SECRET as string, (err, user) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Acceso denegado, token de autenticacion invalido."
        });
      } else {
        req.user = user as TokenTypes.TokenPayload;
        next();
      }
    });

  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(400).json({
        success: false,
        message: "Token de autenticacion expirado.",
        expiredAt: err.expiredAt,
        error: err.message
      });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({
        success: false,
        message: "Token de autenticacion invalido.",
        error: err.message
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error al acceder a los datos a traves del token de autenticacion.",
      error: (err as Error).message
    });
  }
}

export async function onlyVerifiedUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.query.token;
    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Error, token de autenticacion no proporcionado o invalido."
      });
    }
    jwt.verify(token, env.JWT_SECRET as string, (err, user) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Acceso denegado, token de autenticacion invalido."
        });
      } else {
        req.user = user as TokenTypes.TokenPayload;
        next();
      }
      if (req.user.state !== TokenTypes.VerificationState.VERIFIED) {
        return res.status(403).json({
          success: false,
          message: "Acceso denegado al servicio, el usuario no esta verificado."
        });
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error al acceder a la operacion, usuario no verificado.",
      error: (err as Error).message
    });
  }
}