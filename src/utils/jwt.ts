import jwt from "jsonwebtoken"

export interface TokenPayload {
  id: number;
  username: string;
  rol_id: number;
  state: string;
}

export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET || 'development_secret_avocado';
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}
