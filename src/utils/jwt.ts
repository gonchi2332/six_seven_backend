import jwt from "jsonwebtoken";
import * as TokenTypes from "../types/token.types";

export function generateAccessToken(payload: TokenTypes.TokenPayload): string {
  const secret = process.env.ACCESS_TOKEN_SECRET || "development_secret_avocado";
  return jwt.sign(payload, secret, { expiresIn: "45m" });
}

export function generateRefreshToken(payload: TokenTypes.TokenPayload): { token: string; expiresAt: Date } {
  const secret = process.env.REFRESH_TOKEN_SECRET || "development_secret_avocado_refresh";
  const token = jwt.sign(payload, secret, { expiresIn: "7d" });
  const decoded = jwt.decode(token) as { exp: number };
  const expiresAt = new Date(decoded.exp * 1000); 
  return { token, expiresAt };
}