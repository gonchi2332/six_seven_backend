import jwt from "jsonwebtoken";
import * as TokenTypes from "../types/token.types";

/**
 * Genera un token de acceso JWT con una validez de 45 minutos.
 * @param {TokenTypes.TokenPayload} payload - Datos a incluir en el token.
 * @returns {string} Token de acceso generado.
 */
export function generateAccessToken(payload: TokenTypes.TokenPayload): string {
  const secret = process.env.ACCESS_TOKEN_SECRET || "development_secret_avocado";
  return jwt.sign(payload, secret, { expiresIn: "45m" });
}

/**
 * Genera un token de refresco JWT con una validez de 7 días.
 * Calcula también la fecha exacta de expiración.
 * @param {TokenTypes.TokenPayload} payload - Datos a incluir en el token.
 * @returns {Object} Objeto conteniendo el `token` (string) y la fecha `expiresAt` (Date).
 */
export function generateRefreshToken(payload: TokenTypes.TokenPayload): { token: string; expiresAt: Date } {
  const secret = process.env.REFRESH_TOKEN_SECRET || "development_secret_avocado_refresh";
  const token = jwt.sign(payload, secret, { expiresIn: "7d" });
  const decoded = jwt.decode(token) as { exp: number };
  const expiresAt = new Date(decoded.exp * 1000);
  return { token, expiresAt };
}