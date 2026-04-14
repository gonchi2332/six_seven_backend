import jwt from "jsonwebtoken";
import * as TokenTypes from "../types/token.types";

export function generateToken(payload: TokenTypes.TokenPayload): string {
  const secret = process.env.JWT_SECRET || "development_secret_avocado";
  return jwt.sign(payload, secret, { expiresIn: "24h" });
}
